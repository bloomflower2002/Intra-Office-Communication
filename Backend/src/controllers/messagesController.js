import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { query } from '../config/db.js';
import { getPagination, buildPaginatedResult, countRows } from '../utils/pagination.js';

function toMessage(row) {
  return {
    id: row.id,
    threadId: row.thread_id ?? row.channel_id,
    senderId: row.sender_id,
    body: row.body,
    timestamp: row.created_at,
    attachment: row.attachment ?? undefined,
  };
}

// ---------- Direct threads ----------

export async function listDirectThreads(req, res) {
  const userId = req.user.id;
  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 20 });

  const total = await countRows(
    query,
    `SELECT COUNT(*) FROM direct_threads t WHERE t.user_a_id = $1 OR t.user_b_id = $1`,
    [userId],
  );

  const { rows } = await query(
    `SELECT t.id,
            CASE WHEN t.user_a_id = $1 THEN t.user_b_id ELSE t.user_a_id END AS participant_id,
            m.body AS last_message,
            m.created_at AS last_timestamp,
            COUNT(mr.message_id) FILTER (WHERE mr.message_id IS NULL) AS unread
     FROM direct_threads t
     LEFT JOIN LATERAL (
       SELECT * FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1
     ) m ON true
     LEFT JOIN messages msg ON msg.thread_id = t.id AND msg.sender_id != $1
     LEFT JOIN message_reads mr ON mr.message_id = msg.id AND mr.user_id = $1
     WHERE t.user_a_id = $1 OR t.user_b_id = $1
     GROUP BY t.id, participant_id, m.body, m.created_at
     ORDER BY m.created_at DESC NULLS LAST
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  const data = rows.map((r) => ({
    id: r.id,
    participantId: r.participant_id,
    lastMessage: r.last_message ?? '',
    lastTimestamp: r.last_timestamp,
    unread: Number(r.unread) || 0,
  }));
  res.json(buildPaginatedResult(data, total, { page, pageSize }));
}

export async function getOrCreateDirectThread(req, res) {
  const schema = z.object({ participantId: z.string().min(1) });
  const { participantId } = schema.parse(req.body);
  const userId = req.user.id;
  if (participantId === userId) return res.status(400).json({ message: 'Cannot message yourself' });

  const existing = await query(
    `SELECT id FROM direct_threads WHERE (user_a_id = $1 AND user_b_id = $2) OR (user_a_id = $2 AND user_b_id = $1)`,
    [userId, participantId],
  );
  if (existing.rows[0]) return res.json({ id: existing.rows[0].id });

  const id = `dt-${uuid()}`;
  await query('INSERT INTO direct_threads (id, user_a_id, user_b_id) VALUES ($1,$2,$3)', [id, userId, participantId]);
  res.status(201).json({ id });
}

export async function listThreadMessages(req, res) {
  const { threadId } = req.params;
  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 30 });

  const total = await countRows(query, `SELECT COUNT(*) FROM messages WHERE thread_id = $1`, [threadId]);

  const { rows } = await query(
    `SELECT * FROM messages WHERE thread_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
    [threadId, limit, offset],
  );
  // mark delivered messages as read by the requesting user
  await query(
    `INSERT INTO message_reads (message_id, user_id)
     SELECT id, $2 FROM messages WHERE thread_id = $1 AND sender_id != $2
     ON CONFLICT DO NOTHING`,
    [threadId, req.user.id],
  );
  res.json(buildPaginatedResult(rows.map(toMessage), total, { page, pageSize }));
}

// ---------- Channels ----------

export async function listChannels(req, res) {
  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 20 });

  const total = await countRows(
    query,
    `SELECT COUNT(*) FROM channels c JOIN channel_members me ON me.channel_id = c.id AND me.user_id = $1`,
    [req.user.id],
  );

  const { rows } = await query(
    `SELECT c.id, c.name, c.description,
            (SELECT COUNT(*) FROM channel_members cm WHERE cm.channel_id = c.id) AS member_count,
            m.body AS last_message, m.created_at AS last_timestamp
     FROM channels c
     JOIN channel_members me ON me.channel_id = c.id AND me.user_id = $1
     LEFT JOIN LATERAL (
       SELECT * FROM messages WHERE channel_id = c.id ORDER BY created_at DESC LIMIT 1
     ) m ON true
     ORDER BY m.created_at DESC NULLS LAST
     LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset],
  );
  const data = rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    memberCount: Number(r.member_count),
    lastMessage: r.last_message ?? '',
    lastTimestamp: r.last_timestamp,
    unread: 0, // simplified; wire up per-user channel read cursors if needed later
  }));
  res.json(buildPaginatedResult(data, total, { page, pageSize }));
}

export async function listChannelMessages(req, res) {
  const { channelId } = req.params;
  const member = await query('SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2', [channelId, req.user.id]);
  if (!member.rows[0]) return res.status(403).json({ message: 'Not a member of this channel' });

  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 30 });
  const total = await countRows(query, `SELECT COUNT(*) FROM messages WHERE channel_id = $1`, [channelId]);

  const { rows } = await query(
    'SELECT * FROM messages WHERE channel_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
    [channelId, limit, offset],
  );
  res.json(buildPaginatedResult(rows.map(toMessage), total, { page, pageSize }));
}

// ---------- Sending (shared by thread + channel) ----------

const sendSchema = z.object({ body: z.string().min(1), attachment: z.string().optional() });

export async function sendThreadMessage(req, res) {
  const { threadId } = req.params;
  const { body, attachment } = sendSchema.parse(req.body);
  const id = `m-${uuid()}`;
  const { rows } = await query(
    'INSERT INTO messages (id, thread_id, sender_id, body, attachment) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id, threadId, req.user.id, body, attachment ?? null],
  );
  res.status(201).json(toMessage(rows[0]));
}

export async function sendChannelMessage(req, res) {
  const { channelId } = req.params;
  const { body, attachment } = sendSchema.parse(req.body);
  const member = await query('SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2', [channelId, req.user.id]);
  if (!member.rows[0]) return res.status(403).json({ message: 'Not a member of this channel' });

  const id = `cm-${uuid()}`;
  const { rows } = await query(
    'INSERT INTO messages (id, channel_id, sender_id, body, attachment) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [id, channelId, req.user.id, body, attachment ?? null],
  );
  res.status(201).json(toMessage(rows[0]));
}
