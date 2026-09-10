import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { query, withTransaction } from '../config/db.js';
import { recordAudit } from './auditController.js';
import { getPagination, buildPaginatedResult, countRows } from '../utils/pagination.js';

async function hydrateMemo(memoRow) {
  const [recipients, attachments, approvalChain, readReceipts, stageHistory] = await Promise.all([
    query('SELECT recipient_id FROM memo_recipients WHERE memo_id = $1', [memoRow.id]),
    query('SELECT name, size, type FROM memo_attachments WHERE memo_id = $1', [memoRow.id]),
    query('SELECT role, user_id, action, comment, acted_at FROM memo_approval_chain WHERE memo_id = $1 ORDER BY step_order ASC', [memoRow.id]),
    query('SELECT user_id, status, updated_at FROM memo_read_receipts WHERE memo_id = $1', [memoRow.id]),
    query('SELECT stage, at_time FROM memo_stage_history WHERE memo_id = $1 ORDER BY at_time ASC', [memoRow.id]),
  ]);

  return {
    id: memoRow.id,
    reference: memoRow.reference,
    type: memoRow.type,
    subject: memoRow.subject,
    body: memoRow.body,
    senderId: memoRow.sender_id,
    recipients: recipients.rows.map((r) => r.recipient_id),
    priority: memoRow.priority,
    status: memoRow.status,
    stage: memoRow.stage,
    createdAt: memoRow.created_at,
    attachments: attachments.rows,
    approvalChain: approvalChain.rows.map((a) => ({
      role: a.role, userId: a.user_id, action: a.action ?? undefined, comment: a.comment ?? undefined, timestamp: a.acted_at ?? undefined,
    })),
    readReceipts: readReceipts.rows.map((r) => ({ userId: r.user_id, status: r.status, timestamp: r.updated_at ?? undefined })),
    stageHistory: stageHistory.rows.map((s) => ({ stage: s.stage, timestamp: s.at_time })),
  };
}

export async function listMemos(req, res) {
  const { status, priority, type, search } = req.query;
  const userId = req.user.id;

  // Visible if: I'm the sender, I'm a listed recipient, or I'm in the approval chain.
  const clauses = [
    `m.sender_id = $1`,
    `EXISTS (SELECT 1 FROM memo_recipients r WHERE r.memo_id = m.id AND r.recipient_id = $1)`,
    `EXISTS (SELECT 1 FROM memo_approval_chain a WHERE a.memo_id = m.id AND a.user_id = $1)`,
    // also visible if addressed to a channel I'm a member of
    `EXISTS (SELECT 1 FROM memo_recipients r JOIN channel_members cm ON cm.channel_id = r.recipient_id WHERE r.memo_id = m.id AND cm.user_id = $1)`,
  ];
  const params = [userId];
  const filters = [`(${clauses.join(' OR ')})`];

  if (status) { params.push(status); filters.push(`m.status = $${params.length}`); }
  if (priority) { params.push(priority); filters.push(`m.priority = $${params.length}`); }
  if (type) { params.push(type); filters.push(`m.type = $${params.length}`); }
  if (search) { params.push(`%${search}%`); filters.push(`(m.subject ILIKE $${params.length} OR m.reference ILIKE $${params.length})`); }

  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 20 });
  const total = await countRows(
    query,
    `SELECT COUNT(*) FROM memos m WHERE ${filters.join(' AND ')}`,
    params,
  );

  const { rows } = await query(
    `SELECT * FROM memos m WHERE ${filters.join(' AND ')}
     ORDER BY m.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );
  const hydrated = await Promise.all(rows.map(hydrateMemo));
  res.json(buildPaginatedResult(hydrated, total, { page, pageSize }));
}

export async function getMemo(req, res) {
  const { rows } = await query('SELECT * FROM memos WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Memo not found' });
  res.json(await hydrateMemo(rows[0]));
}

const createMemoSchema = z.object({
  type: z.enum(['Official Memo', 'Circular', 'Notice', 'Directive']),
  subject: z.string().min(1),
  body: z.string().min(1),
  recipients: z.array(z.string().min(1)).min(1),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).default('Normal'),
  attachments: z.array(z.object({
    name: z.string(), size: z.string(), type: z.enum(['pdf', 'docx', 'image']),
  })).default([]),
  // Optional explicit approval chain (role + userId per step). If omitted, memo is
  // issued directly to recipients with no approval steps required (e.g. Circulars/Notices).
  approvalChain: z.array(z.object({ role: z.string(), userId: z.string() })).default([]),
});

function referenceFor(type, department) {
  const codeMap = { 'Official Memo': 'MEM', Circular: 'CIR', Notice: 'NOT', Directive: 'DIR' };
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `OSTA/${department}/${year}/${codeMap[type] || 'DOC'}${rand}`;
}

export async function createMemo(req, res) {
  const data = createMemoSchema.parse(req.body);
  const id = `memo-${uuid()}`;
  const reference = referenceFor(data.type, req.user.department?.slice(0, 4).toUpperCase() || 'GEN');

  await withTransaction(async (client) => {
    const initialStage = data.approvalChain.length ? 'Issued' : 'Issued';
    const initialStatus = data.approvalChain.length ? 'Pending Approval' : 'Completed';

    await client.query(
      `INSERT INTO memos (id, reference, type, subject, body, sender_id, priority, status, stage)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, reference, data.type, data.subject, data.body, req.user.id, data.priority, initialStatus, initialStage],
    );

    for (const r of data.recipients) {
      await client.query('INSERT INTO memo_recipients (memo_id, recipient_id) VALUES ($1,$2)', [id, r]);
    }
    for (const a of data.attachments) {
      await client.query('INSERT INTO memo_attachments (memo_id, name, size, type) VALUES ($1,$2,$3,$4)', [id, a.name, a.size, a.type]);
    }
    for (let i = 0; i < data.approvalChain.length; i++) {
      const step = data.approvalChain[i];
      await client.query(
        'INSERT INTO memo_approval_chain (memo_id, step_order, role, user_id) VALUES ($1,$2,$3,$4)',
        [id, i, step.role, step.userId],
      );
    }
    // Read receipts start pending for every direct-user recipient
    for (const r of data.recipients) {
      if (r.startsWith('u-')) {
        await client.query(
          'INSERT INTO memo_read_receipts (memo_id, user_id, status) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
          [id, r, 'pending'],
        );
      }
    }
    await client.query('INSERT INTO memo_stage_history (memo_id, stage) VALUES ($1,$2)', [id, 'Issued']);

    // Notify recipients / first approver
    const notifyIds = data.approvalChain.length ? [data.approvalChain[0].userId] : data.recipients.filter((r) => r.startsWith('u-'));
    for (const uid of notifyIds) {
      await client.query(
        `INSERT INTO notifications (id, user_id, title, description, link, kind) VALUES ($1,$2,$3,$4,$5,'memo')`,
        [`n-${uuid()}`, uid, 'New Memo', `${reference}: ${data.subject}`, `/memos/${id}`],
      );
    }
  });

  const { rows } = await query('SELECT * FROM memos WHERE id = $1', [id]);
  res.status(201).json(await hydrateMemo(rows[0]));
}

const actionSchema = z.object({ comment: z.string().optional() });

async function findPendingStep(memoId, userId) {
  const { rows } = await query(
    `SELECT * FROM memo_approval_chain WHERE memo_id = $1 AND user_id = $2 AND action IS NULL ORDER BY step_order ASC LIMIT 1`,
    [memoId, userId],
  );
  return rows[0];
}

async function isCurrentApprover(memoId, userId) {
  // The current approver is whoever holds the earliest step without an action yet.
  const { rows } = await query(
    `SELECT user_id FROM memo_approval_chain WHERE memo_id = $1 AND action IS NULL ORDER BY step_order ASC LIMIT 1`,
    [memoId],
  );
  return rows[0]?.user_id === userId;
}

export async function approveMemo(req, res) {
  const { comment } = actionSchema.parse(req.body);
  const { id } = req.params;

  if (!(await isCurrentApprover(id, req.user.id))) {
    return res.status(403).json({ message: 'You are not the current approver for this memo' });
  }
  const step = await findPendingStep(id, req.user.id);

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE memo_approval_chain SET action = 'Approved', comment = $1, acted_at = now() WHERE memo_id = $2 AND step_order = $3`,
      [comment ?? null, id, step.step_order],
    );

    const remaining = await client.query('SELECT 1 FROM memo_approval_chain WHERE memo_id = $1 AND action IS NULL', [id]);
    if (remaining.rows.length === 0) {
      await client.query(`UPDATE memos SET status = 'Approved', stage = 'Acknowledged' WHERE id = $1`, [id]);
      await client.query('INSERT INTO memo_stage_history (memo_id, stage) VALUES ($1, $2)', [id, 'Acknowledged']);
    } else {
      await client.query(`UPDATE memos SET stage = 'Forwarded' WHERE id = $1`, [id]);
      await client.query('INSERT INTO memo_stage_history (memo_id, stage) VALUES ($1, $2)', [id, 'Forwarded']);
      const next = await client.query('SELECT user_id FROM memo_approval_chain WHERE memo_id = $1 AND action IS NULL ORDER BY step_order ASC LIMIT 1', [id]);
      if (next.rows[0]) {
        const memo = await client.query('SELECT reference, subject FROM memos WHERE id = $1', [id]);
        await client.query(
          `INSERT INTO notifications (id, user_id, title, description, link, kind) VALUES ($1,$2,'Approval Pending',$3,$4,'approval')`,
          [`n-${uuid()}`, next.rows[0].user_id, `${memo.rows[0].reference}: ${memo.rows[0].subject}`, `/memos/${id}`],
        );
      }
    }
  });

  const { rows } = await query('SELECT * FROM memos WHERE id = $1', [id]);
  await recordAudit(req.user.id, 'Approved memo', rows[0].reference);
  res.json(await hydrateMemo(rows[0]));
}

export async function rejectMemo(req, res) {
  const { comment } = actionSchema.parse(req.body);
  const { id } = req.params;

  if (!(await isCurrentApprover(id, req.user.id))) {
    return res.status(403).json({ message: 'You are not the current approver for this memo' });
  }
  const step = await findPendingStep(id, req.user.id);

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE memo_approval_chain SET action = 'Rejected', comment = $1, acted_at = now() WHERE memo_id = $2 AND step_order = $3`,
      [comment ?? null, id, step.step_order],
    );
    await client.query(`UPDATE memos SET status = 'Rejected' WHERE id = $1`, [id]);

    const memo = await client.query('SELECT reference, subject, sender_id FROM memos WHERE id = $1', [id]);
    await client.query(
      `INSERT INTO notifications (id, user_id, title, description, link, kind) VALUES ($1,$2,'Memo Rejected',$3,$4,'memo')`,
      [`n-${uuid()}`, memo.rows[0].sender_id, `${memo.rows[0].reference} was rejected.`, `/memos/${id}`],
    );
  });

  const { rows } = await query('SELECT * FROM memos WHERE id = $1', [id]);
  await recordAudit(req.user.id, 'Rejected memo', rows[0].reference);
  res.json(await hydrateMemo(rows[0]));
}

const forwardSchema = z.object({ toUserId: z.string().min(1), toRole: z.string().min(1), comment: z.string().optional() });

export async function forwardMemo(req, res) {
  const { toUserId, toRole, comment } = forwardSchema.parse(req.body);
  const { id } = req.params;

  if (!(await isCurrentApprover(id, req.user.id))) {
    return res.status(403).json({ message: 'You are not the current approver for this memo' });
  }
  const step = await findPendingStep(id, req.user.id);

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE memo_approval_chain SET action = 'Forwarded', comment = $1, acted_at = now() WHERE memo_id = $2 AND step_order = $3`,
      [comment ?? null, id, step.step_order],
    );
    await client.query(
      `INSERT INTO memo_approval_chain (memo_id, step_order, role, user_id) VALUES ($1,$2,$3,$4)`,
      [id, step.step_order + 1, toRole, toUserId],
    );
    await client.query(`UPDATE memos SET stage = 'Forwarded' WHERE id = $1`, [id]);
    await client.query('INSERT INTO memo_stage_history (memo_id, stage) VALUES ($1, $2)', [id, 'Forwarded']);

    const memo = await client.query('SELECT reference, subject FROM memos WHERE id = $1', [id]);
    await client.query(
      `INSERT INTO notifications (id, user_id, title, description, link, kind) VALUES ($1,$2,'Approval Pending',$3,$4,'approval')`,
      [`n-${uuid()}`, toUserId, `${memo.rows[0].reference}: ${memo.rows[0].subject}`, `/memos/${id}`],
    );
  });

  const { rows } = await query('SELECT * FROM memos WHERE id = $1', [id]);
  await recordAudit(req.user.id, 'Forwarded memo', rows[0].reference);
  res.json(await hydrateMemo(rows[0]));
}

export async function markMemoRead(req, res) {
  const { id } = req.params;
  await query(
    `INSERT INTO memo_read_receipts (memo_id, user_id, status, updated_at) VALUES ($1,$2,'read', now())
     ON CONFLICT (memo_id, user_id) DO UPDATE SET status = 'read', updated_at = now()`,
    [id, req.user.id],
  );
  res.status(204).send();
}

export async function acknowledgeMemo(req, res) {
  const { id } = req.params;
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO memo_read_receipts (memo_id, user_id, status, updated_at) VALUES ($1,$2,'read', now())
       ON CONFLICT (memo_id, user_id) DO UPDATE SET status = 'read', updated_at = now()`,
      [id, req.user.id],
    );
    const pending = await client.query(
      `SELECT 1 FROM memo_read_receipts WHERE memo_id = $1 AND status != 'read'`,
      [id],
    );
    if (pending.rows.length === 0) {
      await client.query(`UPDATE memos SET stage = 'Completed', status = 'Completed' WHERE id = $1`, [id]);
      await client.query('INSERT INTO memo_stage_history (memo_id, stage) VALUES ($1, $2)', [id, 'Completed']);
    }
  });
  const { rows } = await query('SELECT * FROM memos WHERE id = $1', [id]);
  res.json(await hydrateMemo(rows[0]));
}
