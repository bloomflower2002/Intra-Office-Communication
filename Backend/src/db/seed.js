import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../config/db.js';

const DEFAULT_PASSWORD = 'Passw0rd!'; // demo password for all seeded users

const departments = [
  { id: 'dept-admin', name: 'Administration' },
  { id: 'dept-finance', name: 'Finance' },
  { id: 'dept-rd', name: 'Research & Development' },
  { id: 'dept-planning', name: 'Planning & Strategy' },
  { id: 'dept-ict', name: 'ICT Bureau' },
];

const users = [
  { id: 'u-admin', fullName: 'Netsanet Fikru', email: 'netsanet.fikru@osta.gov.et', role: 'System Admin', department: 'dept-ict', title: 'System Administrator', avatarColor: '#2B7FB8', phone: '+251 91 234 5678', online: true },
  { id: 'u-head', fullName: 'Ato Girma Wolde', email: 'girma.wolde@osta.gov.et', role: 'Head Office', department: 'dept-admin', title: 'Director General', avatarColor: '#2A4F97', phone: '+251 91 111 2233', online: true },
  { id: 'u-dir-ict', fullName: 'W/ro Hana Tesfaye', email: 'hana.tesfaye@osta.gov.et', role: 'Director', department: 'dept-ict', title: 'Director, ICT Bureau', avatarColor: '#1E9E6F', online: true },
  { id: 'u-dir-fin', fullName: 'Ato Dawit Assefa', email: 'dawit.assefa@osta.gov.et', role: 'Director', department: 'dept-finance', title: 'Director, Finance', avatarColor: '#C9821A', online: false },
  { id: 'u-tl-rd', fullName: 'W/ro Selam Kassa', email: 'selam.kassa@osta.gov.et', role: 'Team Leader', department: 'dept-rd', title: 'Team Leader, R&D', avatarColor: '#7B4FA5', online: true },
  { id: 'u-tl-plan', fullName: 'Ato Yonas Bekele', email: 'yonas.bekele@osta.gov.et', role: 'Team Leader', department: 'dept-planning', title: 'Team Leader, Planning', avatarColor: '#C4432F', online: false },
  { id: 'u-emp-1', fullName: 'Meron Alemu', email: 'meron.alemu@osta.gov.et', role: 'Employee', department: 'dept-ict', title: 'Software Engineer', avatarColor: '#2A4F97', online: true },
  { id: 'u-emp-2', fullName: 'Bereket Girma', email: 'bereket.girma@osta.gov.et', role: 'Employee', department: 'dept-finance', title: 'Accountant', avatarColor: '#1E9E6F', online: false },
  { id: 'u-emp-3', fullName: 'Liya Haile', email: 'liya.haile@osta.gov.et', role: 'Employee', department: 'dept-rd', title: 'Research Officer', avatarColor: '#C9821A', online: true },
  { id: 'u-emp-4', fullName: 'Tesfaye Desta', email: 'tesfaye.desta@osta.gov.et', role: 'Employee', department: 'dept-planning', title: 'Planning Officer', avatarColor: '#2B7FB8', status: 'inactive', online: false },
  { id: 'u-emp-5', fullName: 'Eden Yimer', email: 'eden.yimer@osta.gov.et', role: 'Employee', department: 'dept-admin', title: 'Admin Assistant', avatarColor: '#7B4FA5', online: true },
];

const channels = [
  { id: 'ch-general', name: 'General', description: 'Organization-wide announcements', department: null },
  { id: 'ch-ict', name: 'ICT Bureau', description: 'ICT Bureau internal discussion', department: 'dept-ict' },
  { id: 'ch-admin', name: 'Admin Dept', description: 'Administration department', department: 'dept-admin' },
  { id: 'ch-finance', name: 'Finance', description: 'Finance department channel', department: 'dept-finance' },
  { id: 'ch-rd', name: 'Research & Development', description: 'R&D project coordination', department: 'dept-rd' },
];

const memos = [
  {
    id: 'memo-1', reference: 'OSTA/ICT/2024/017', type: 'Official Memo',
    subject: 'Approval Request: New Server Infrastructure Procurement',
    body: 'This memo requests approval for the procurement of new server infrastructure to support the IOCMS deployment, as outlined in the attached technical specification and budget report.',
    senderId: 'u-dir-ict', recipients: ['u-head'], priority: 'High', status: 'Pending Approval', stage: 'Forwarded',
    createdAt: '2026-08-10T08:30:00',
    attachments: [{ name: 'Q3-Budget-Report.pdf', size: '2.4 MB', type: 'pdf' }],
    approvalChain: [
      { role: 'Director', userId: 'u-dir-ict', action: 'Forwarded', comment: 'Recommended for approval.', actedAt: '2026-08-10T09:00:00' },
      { role: 'Head Office', userId: 'u-head', action: null, comment: null, actedAt: null },
    ],
    readReceipts: [{ userId: 'u-head', status: 'read', updatedAt: '2026-08-10T10:15:00' }],
    stageHistory: ['Issued', 'Received', 'Reviewed', 'Forwarded'].map((s, i) => ({ stage: s, at: `2026-08-10T0${8 + i}:${i === 0 ? '30' : '45'}:00` })),
  },
  {
    id: 'memo-2', reference: 'OSTA/HR/2024/044', type: 'Circular',
    subject: 'Updated Annual Leave Policy — Effective Immediately',
    body: 'All staff are informed that the annual leave policy has been revised. Please review the attached circular for full details and acknowledge receipt.',
    senderId: 'u-head', recipients: ['ch-general'], priority: 'Normal', status: 'Completed', stage: 'Completed',
    createdAt: '2026-08-05T09:00:00',
    attachments: [{ name: 'Leave-Policy-2024.docx', size: '540 KB', type: 'docx' }],
    approvalChain: [],
    readReceipts: [
      { userId: 'u-dir-ict', status: 'read', updatedAt: '2026-08-05T10:00:00' },
      { userId: 'u-dir-fin', status: 'read', updatedAt: '2026-08-05T11:20:00' },
      { userId: 'u-tl-rd', status: 'delivered', updatedAt: null },
      { userId: 'u-emp-1', status: 'pending', updatedAt: null },
    ],
    stageHistory: [
      { stage: 'Issued', at: '2026-08-05T09:00:00' }, { stage: 'Received', at: '2026-08-05T09:10:00' },
      { stage: 'Reviewed', at: '2026-08-05T09:30:00' }, { stage: 'Forwarded', at: '2026-08-05T09:35:00' },
      { stage: 'Acknowledged', at: '2026-08-06T08:00:00' }, { stage: 'Completed', at: '2026-08-06T09:00:00' },
    ],
  },
  {
    id: 'memo-3', reference: 'OSTA/RD/2024/029', type: 'Notice',
    subject: 'Research Proposal Submission Deadline Extended',
    body: 'The submission deadline for Q3 research proposals has been extended to August 30th to accommodate additional review time.',
    senderId: 'u-tl-rd', recipients: ['ch-rd'], priority: 'Low', status: 'Approved', stage: 'Acknowledged',
    createdAt: '2026-08-12T14:00:00',
    attachments: [],
    approvalChain: [{ role: 'Team Leader', userId: 'u-tl-rd', action: 'Approved', comment: null, actedAt: '2026-08-12T14:20:00' }],
    readReceipts: [{ userId: 'u-emp-3', status: 'read', updatedAt: '2026-08-12T15:00:00' }],
    stageHistory: [
      { stage: 'Issued', at: '2026-08-12T14:00:00' }, { stage: 'Received', at: '2026-08-12T14:10:00' },
      { stage: 'Reviewed', at: '2026-08-12T14:20:00' }, { stage: 'Forwarded', at: '2026-08-12T14:25:00' },
      { stage: 'Acknowledged', at: '2026-08-13T09:00:00' },
    ],
  },
  {
    id: 'memo-4', reference: 'OSTA/FIN/2024/012', type: 'Directive',
    subject: 'Mandatory Expense Reporting via New Portal',
    body: 'Effective next month, all departments must submit monthly expense reports exclusively through the new finance portal.',
    senderId: 'u-dir-fin', recipients: ['u-head'], priority: 'Urgent', status: 'Rejected', stage: 'Reviewed',
    createdAt: '2026-08-14T11:00:00',
    attachments: [{ name: 'Portal-Guide.pdf', size: '1.1 MB', type: 'pdf' }],
    approvalChain: [{ role: 'Head Office', userId: 'u-head', action: 'Rejected', comment: 'Please revise the rollout timeline before resubmission.', actedAt: '2026-08-14T16:00:00' }],
    readReceipts: [{ userId: 'u-head', status: 'read', updatedAt: '2026-08-14T15:45:00' }],
    stageHistory: [
      { stage: 'Issued', at: '2026-08-14T11:00:00' }, { stage: 'Received', at: '2026-08-14T11:15:00' },
      { stage: 'Reviewed', at: '2026-08-14T16:00:00' },
    ],
  },
  {
    id: 'memo-5', reference: 'OSTA/PLN/2024/008', type: 'Official Memo',
    subject: 'Strategic Plan 2026–2030 — Draft for Review',
    body: 'Please find attached the draft strategic plan for 2026–2030. Comments are requested from all directors by end of week.',
    senderId: 'u-tl-plan', recipients: ['u-dir-ict', 'u-dir-fin'], priority: 'High', status: 'Pending Approval', stage: 'Received',
    createdAt: '2026-08-15T09:30:00',
    attachments: [{ name: 'Strategic-Plan-Draft.docx', size: '3.2 MB', type: 'docx' }],
    approvalChain: [{ role: 'Director', userId: 'u-dir-ict', action: null, comment: null, actedAt: null }],
    readReceipts: [
      { userId: 'u-dir-ict', status: 'pending', updatedAt: null },
      { userId: 'u-dir-fin', status: 'delivered', updatedAt: null },
    ],
    stageHistory: [{ stage: 'Issued', at: '2026-08-15T09:30:00' }, { stage: 'Received', at: '2026-08-15T10:00:00' }],
  },
];

async function seed() {
  console.log('Seeding database...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await withTransaction(async (client) => {
    // Clean slate (order matters due to FKs)
    await client.query(`TRUNCATE TABLE
      memo_stage_history, memo_read_receipts, memo_approval_chain, memo_attachments,
      memo_recipients, archive_docs, memos, message_reads, messages,
      channel_members, channels, direct_threads, notifications, users, departments
      RESTART IDENTITY CASCADE`);

    for (const d of departments) {
      await client.query('INSERT INTO departments (id, name) VALUES ($1, $2)', [d.id, d.name]);
    }

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, full_name, email, password_hash, role, department_id, title, avatar_color, status, online, phone)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [u.id, u.fullName, u.email, passwordHash, u.role, u.department, u.title, u.avatarColor, u.status ?? 'active', u.online ?? false, u.phone ?? null],
      );
    }

    // Bulk-generate additional employees, same as the frontend mock data does
    const firstNames = ['Abebe', 'Sara', 'Kebede', 'Almaz', 'Dawit', 'Hana', 'Getachew', 'Meron', 'Yonas', 'Selam', 'Tesfaye', 'Rahel', 'Bereket', 'Liya', 'Mulugeta', 'Eden'];
    const lastNames = ['Tadesse', 'Bekele', 'Girma', 'Alemu', 'Haile', 'Wolde', 'Desta', 'Yimer', 'Assefa', 'Kassa'];
    const palette = ['#2A4F97', '#1E9E6F', '#C9821A', '#2B7FB8', '#7B4FA5', '#C4432F'];
    const deptIds = departments.map((d) => d.id);
    for (let i = 0; i < 24; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i + 3) % lastNames.length];
      const dept = deptIds[i % deptIds.length];
      const email = `${fn}.${ln}`.toLowerCase() + '@osta.gov.et';
      await client.query(
        `INSERT INTO users (id, full_name, email, password_hash, role, department_id, title, avatar_color, status, online)
         VALUES ($1,$2,$3,$4,'Employee',$5,$6,$7,$8,$9)
         ON CONFLICT (email) DO NOTHING`,
        [`u-gen-${i}`, `${fn} ${ln}`, email, passwordHash, dept, ['Officer', 'Specialist', 'Analyst', 'Coordinator'][i % 4], palette[i % palette.length], i % 9 === 0 ? 'inactive' : 'active', i % 3 === 0],
      );
    }

    for (const c of channels) {
      await client.query('INSERT INTO channels (id, name, description, department_id) VALUES ($1,$2,$3,$4)', [c.id, c.name, c.description, c.department]);
      // Add all users in that department (or everyone for General) as members
      if (c.department) {
        await client.query(
          `INSERT INTO channel_members (channel_id, user_id) SELECT $1, id FROM users WHERE department_id = $2`,
          [c.id, c.department],
        );
      } else {
        await client.query(`INSERT INTO channel_members (channel_id, user_id) SELECT $1, id FROM users`, [c.id]);
      }
    }

    // Direct thread + a short conversation, mirroring the frontend mock
    await client.query(
      `INSERT INTO direct_threads (id, user_a_id, user_b_id) VALUES ('dt-1','u-emp-1','u-dir-ict')`,
    );
    const dtMessages = [
      { id: 'm1', sender: 'u-dir-ict', body: 'Morning! Can you review the new UI mockups before the 2pm meeting?' },
      { id: 'm2', sender: 'u-emp-1', body: "Sure, I'll take a look right away." },
      { id: 'm3', sender: 'u-dir-ict', body: 'Thanks — focus especially on the memo workflow screens.' },
      { id: 'm4', sender: 'u-emp-1', body: "Will do. I'll send comments by noon." },
    ];
    for (const m of dtMessages) {
      await client.query('INSERT INTO messages (id, thread_id, sender_id, body) VALUES ($1,$2,$3,$4)', [m.id, 'dt-1', m.sender, m.body]);
    }

    const channelMessages = [
      { id: 'cm1', channel: 'ch-general', sender: 'u-head', body: 'Good morning everyone. Quarterly review begins next Monday, please prepare your department summaries.' },
      { id: 'cm2', channel: 'ch-general', sender: 'u-dir-fin', body: 'Noted, Finance report will be ready by Thursday.' },
      { id: 'cm3', channel: 'ch-general', sender: 'u-dir-ict', body: 'ICT dashboard exports will also be attached.' },
    ];
    for (const m of channelMessages) {
      await client.query('INSERT INTO messages (id, channel_id, sender_id, body) VALUES ($1,$2,$3,$4)', [m.id, m.channel, m.sender, m.body]);
    }

    for (const memo of memos) {
      await client.query(
        `INSERT INTO memos (id, reference, type, subject, body, sender_id, priority, status, stage, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [memo.id, memo.reference, memo.type, memo.subject, memo.body, memo.senderId, memo.priority, memo.status, memo.stage, memo.createdAt],
      );
      for (const r of memo.recipients) {
        await client.query('INSERT INTO memo_recipients (memo_id, recipient_id) VALUES ($1,$2)', [memo.id, r]);
      }
      for (const a of memo.attachments) {
        await client.query('INSERT INTO memo_attachments (memo_id, name, size, type) VALUES ($1,$2,$3,$4)', [memo.id, a.name, a.size, a.type]);
      }
      for (let idx = 0; idx < memo.approvalChain.length; idx++) {
        const step = memo.approvalChain[idx];
        await client.query(
          `INSERT INTO memo_approval_chain (memo_id, step_order, role, user_id, action, comment, acted_at) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [memo.id, idx, step.role, step.userId, step.action, step.comment, step.actedAt],
        );
      }
      for (const rr of memo.readReceipts) {
        await client.query(
          `INSERT INTO memo_read_receipts (memo_id, user_id, status, updated_at) VALUES ($1,$2,$3,$4)`,
          [memo.id, rr.userId, rr.status, rr.updatedAt],
        );
      }
      for (const sh of memo.stageHistory) {
        await client.query('INSERT INTO memo_stage_history (memo_id, stage, at_time) VALUES ($1,$2,$3)', [memo.id, sh.stage, sh.at]);
      }
    }

    // Archive: derive from a couple of completed/archived-worthy memos + a couple of standalone docs
    const archiveRows = [
      { id: 'a1', memo: 'memo-2', subject: 'Updated Annual Leave Policy', type: 'Circular', sender: 'u-head', dept: 'dept-admin', date: '2026-08-05', status: 'Completed' },
      { id: 'a3', memo: null, subject: 'ICT Infrastructure Assessment', type: 'Official Memo', sender: 'u-dir-ict', dept: 'dept-ict', date: '2026-07-15', status: 'Archived' },
      { id: 'a5', memo: 'memo-3', subject: 'Research Proposal Deadline Notice', type: 'Notice', sender: 'u-tl-rd', dept: 'dept-rd', date: '2026-08-12', status: 'Approved' },
      { id: 'a6', memo: 'memo-4', subject: 'Mandatory Expense Reporting Directive', type: 'Directive', sender: 'u-dir-fin', dept: 'dept-finance', date: '2026-08-14', status: 'Rejected' },
    ];
    for (const a of archiveRows) {
      await client.query(
        `INSERT INTO archive_docs (id, memo_id, subject, type, sender_id, department_id, doc_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [a.id, a.memo, a.subject, a.type, a.sender, a.dept, a.date, a.status],
      );
    }

    // Notifications for the demo employee account
    const notifs = [
      { id: 'n1', user: 'u-dir-ict', title: 'Memo Approved', description: 'Memo OSTA/RD/2024/029 has been approved.', link: '/memos/memo-3', kind: 'approval', read: false },
      { id: 'n2', user: 'u-emp-1', title: 'New Message', description: 'Hana Tesfaye sent you a message.', link: '/messages', kind: 'message', read: false },
      { id: 'n3', user: 'u-dir-fin', title: 'Memo Rejected', description: 'Memo OSTA/FIN/2024/012 was rejected by Head Office.', link: '/memos/memo-4', kind: 'memo', read: false },
      { id: 'n4', user: 'u-admin', title: 'System Update', description: 'Scheduled maintenance completed successfully.', link: '/settings', kind: 'system', read: true },
      { id: 'n5', user: 'u-dir-ict', title: 'Approval Pending', description: 'A new memo requires your approval.', link: '/approvals', kind: 'approval', read: true },
    ];
    for (const n of notifs) {
      await client.query(
        `INSERT INTO notifications (id, user_id, title, description, link, kind, read) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [n.id, n.user, n.title, n.description, n.link, n.kind, n.read],
      );
    }
    // Audit trail entries for the admin dashboard's audit log table
    const auditRows = [
      { user: 'u-admin', action: 'Created new user account', target: 'Bereket Girma' },
      { user: 'u-head', action: 'Approved memo', target: 'OSTA/RD/2024/029' },
      { user: 'u-admin', action: 'Updated role permissions', target: 'Team Leader' },
      { user: 'u-dir-ict', action: 'Forwarded memo', target: 'OSTA/ICT/2024/017' },
      { user: 'u-admin', action: 'Disabled user account', target: 'Tesfaye Desta' },
    ];
    for (const a of auditRows) {
      await client.query(
        `INSERT INTO audit_log (user_id, action, target) VALUES ($1, $2, $3)`,
        [a.user, a.action, a.target],
      );
    }
  });

  console.log('Seed complete.');
  console.log(`Demo login for any seeded user: password = "${DEFAULT_PASSWORD}"`);
  console.log('e.g. netsanet.fikru@osta.gov.et (System Admin), girma.wolde@osta.gov.et (Head Office),');
  console.log('     hana.tesfaye@osta.gov.et (Director), selam.kassa@osta.gov.et (Team Leader), meron.alemu@osta.gov.et (Employee)');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
