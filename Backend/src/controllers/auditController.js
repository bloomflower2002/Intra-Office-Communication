import { query } from '../config/db.js';
import { getPagination, buildPaginatedResult, countRows } from '../utils/pagination.js';

function toAuditEntry(row) {
  return {
    id: String(row.id),
    user: row.full_name,
    role: row.role,
    department: row.department_name,
    action: row.action,
    target: row.target,
    timestamp: row.created_at,
  };
}

/**
 * Record an entry in the audit trail. Call this from other controllers
 * whenever a notable admin/approval action happens (user management,
 * memo approvals, role changes, etc). Never throws — a logging failure
 * should not break the primary action.
 */
export async function recordAudit(userId, action, target = null) {
  try {
    await query(
      'INSERT INTO audit_log (user_id, action, target) VALUES ($1, $2, $3)',
      [userId, action, target],
    );
  } catch (err) {
    console.error('Failed to record audit log entry', err);
  }
}

/**
 * Audit log visibility is role-scoped and read-only (no delete/update route
 * is exposed anywhere in the API, so entries can never be revoked or edited):
 *  - System Admin: every entry in the system, including their own.
 *  - Everyone else: only entries produced by users in their own department
 *    (which naturally includes their own entries, since they belong to
 *    that department too).
 */
export async function listAuditLog(req, res) {
  const isAdmin = req.user.role === 'System Admin';
  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 30, maxPageSize: 200 });

  const where = isAdmin ? '' : 'WHERE d.name = $1';
  const baseParams = isAdmin ? [] : [req.user.department];

  const total = await countRows(
    query,
    `SELECT COUNT(*) FROM audit_log a
     JOIN users u ON u.id = a.user_id
     JOIN departments d ON d.id = u.department_id
     ${where}`,
    baseParams,
  );

  const { rows } = await query(
    `SELECT a.id, a.action, a.target, a.created_at, u.full_name, u.role, d.name AS department_name
     FROM audit_log a
     JOIN users u ON u.id = a.user_id
     JOIN departments d ON d.id = u.department_id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT $${baseParams.length + 1} OFFSET $${baseParams.length + 2}`,
    [...baseParams, limit, offset],
  );
  res.json(buildPaginatedResult(rows.map(toAuditEntry), total, { page, pageSize }));
}
