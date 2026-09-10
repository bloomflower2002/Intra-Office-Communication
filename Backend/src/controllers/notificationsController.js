import { query } from '../config/db.js';
import { getPagination, buildPaginatedResult, countRows } from '../utils/pagination.js';

function toNotification(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    timestamp: row.created_at,
    read: row.read,
    link: row.link,
    kind: row.kind,
  };
}

export async function listNotifications(req, res) {
  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 20 });

  const total = await countRows(
    query,
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
    [req.user.id],
  );

  const { rows } = await query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [req.user.id, limit, offset],
  );
  res.json(buildPaginatedResult(rows.map(toNotification), total, { page, pageSize }));
}

export async function markNotificationRead(req, res) {
  const { rows } = await query(
    'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, req.user.id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'Notification not found' });
  res.status(204).send();
}

export async function markAllNotificationsRead(req, res) {
  await query('UPDATE notifications SET read = true WHERE user_id = $1', [req.user.id]);
  res.status(204).send();
}
