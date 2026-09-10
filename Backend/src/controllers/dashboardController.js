import { query } from '../config/db.js';

export async function getDepartmentVolume(req, res) {
  const { rows } = await query(
    `SELECT d.name AS department, COUNT(m.id) AS value
     FROM departments d
     LEFT JOIN users u ON u.department_id = d.id
     LEFT JOIN memos m ON m.sender_id = u.id
     GROUP BY d.name
     ORDER BY d.name`,
  );
  res.json(rows.map((r) => ({ department: r.department, value: Number(r.value) })));
}

const STATUS_COLORS = {
  Completed: '#1E9E6F',
  'Pending Approval': '#C9821A',
  Approved: '#2B7FB8',
  Rejected: '#C4432F',
  Draft: '#7B4FA5',
};

export async function getDocumentStatusBreakdown(req, res) {
  const { rows } = await query(
    `SELECT status AS name, COUNT(*) AS value FROM memos GROUP BY status`,
  );
  res.json(rows.map((r) => ({ name: r.name, value: Number(r.value), color: STATUS_COLORS[r.name] || '#999999' })));
}

export async function getUserGrowth(req, res) {
  const { rows } = await query(
    `SELECT to_char(date_trunc('month', created_at), 'Mon') AS month,
            date_trunc('month', created_at) AS month_start,
            COUNT(*) AS users
     FROM users
     GROUP BY month, month_start
     ORDER BY month_start ASC`,
  );
  res.json(rows.map((r) => ({ month: r.month, users: Number(r.users) })));
}

export async function getKpis(req, res) {
  const userId = req.user.id;
  const [totalMemos, pendingApprovals, unreadNotifications, totalUsers] = await Promise.all([
    query(`SELECT COUNT(*) FROM memos WHERE sender_id = $1
           OR EXISTS (SELECT 1 FROM memo_recipients r WHERE r.memo_id = memos.id AND r.recipient_id = $1)`, [userId]),
    query(`SELECT COUNT(*) FROM memo_approval_chain a WHERE a.user_id = $1 AND a.action IS NULL
           AND a.step_order = (SELECT MIN(step_order) FROM memo_approval_chain WHERE memo_id = a.memo_id AND action IS NULL)`, [userId]),
    query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false', [userId]),
    query('SELECT COUNT(*) FROM users WHERE status = $1', ['active']),
  ]);
  res.json({
    totalMemos: Number(totalMemos.rows[0].count),
    pendingApprovals: Number(pendingApprovals.rows[0].count),
    unreadNotifications: Number(unreadNotifications.rows[0].count),
    activeUsers: Number(totalUsers.rows[0].count),
  });
}
