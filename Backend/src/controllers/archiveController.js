import { query } from '../config/db.js';
import { getPagination, buildPaginatedResult, countRows } from '../utils/pagination.js';

function toArchiveDoc(row) {
  return {
    id: row.id,
    subject: row.subject,
    type: row.type,
    sender: row.sender_name,
    department: row.department_name,
    date: row.doc_date,
    status: row.status,
  };
}

export async function listArchive(req, res) {
  const { type, department, status, search } = req.query;
  const clauses = [];
  const params = [];

  if (type) { params.push(type); clauses.push(`a.type = $${params.length}`); }
  if (department) { params.push(department); clauses.push(`d.name = $${params.length}`); }
  if (status) { params.push(status); clauses.push(`a.status = $${params.length}`); }
  if (search) { params.push(`%${search}%`); clauses.push(`a.subject ILIKE $${params.length}`); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 25 });

  const total = await countRows(
    query,
    `SELECT COUNT(*) FROM archive_docs a
     JOIN users u ON u.id = a.sender_id
     JOIN departments d ON d.id = a.department_id
     ${where}`,
    params,
  );

  const { rows } = await query(
    `SELECT a.*, u.full_name AS sender_name, d.name AS department_name
     FROM archive_docs a
     JOIN users u ON u.id = a.sender_id
     JOIN departments d ON d.id = a.department_id
     ${where}
     ORDER BY a.doc_date DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );
  res.json(buildPaginatedResult(rows.map(toArchiveDoc), total, { page, pageSize }));
}
