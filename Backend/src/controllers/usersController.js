import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { query } from '../config/db.js';
import { recordAudit } from './auditController.js';
import { getPagination, buildPaginatedResult, countRows } from '../utils/pagination.js';

function toUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    department: row.department_name,
    title: row.title,
    avatarColor: row.avatar_color,
    status: row.status,
    online: row.online,
    phone: row.phone,
  };
}

export async function listUsers(req, res) {
  const { department, role, status, search } = req.query;
  const clauses = [];
  const params = [];

  if (department) { params.push(department); clauses.push(`d.name = $${params.length}`); }
  if (role) { params.push(role); clauses.push(`u.role = $${params.length}`); }
  if (status) { params.push(status); clauses.push(`u.status = $${params.length}`); }
  if (search) { params.push(`%${search}%`); clauses.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { page, pageSize, limit, offset } = getPagination(req, { defaultPageSize: 25 });

  const total = await countRows(
    query,
    `SELECT COUNT(*) FROM users u JOIN departments d ON d.id = u.department_id ${where}`,
    params,
  );

  const { rows } = await query(
    `SELECT u.*, d.name AS department_name FROM users u
     JOIN departments d ON d.id = u.department_id
     ${where}
     ORDER BY u.full_name ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );
  res.json(buildPaginatedResult(rows.map(toUser), total, { page, pageSize }));
}

export async function getUser(req, res) {
  const { rows } = await query(
    `SELECT u.*, d.name AS department_name FROM users u
     JOIN departments d ON d.id = u.department_id
     WHERE u.id = $1`,
    [req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  res.json(toUser(rows[0]));
}

const createUserSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['System Admin', 'Head Office', 'Director', 'Team Leader', 'Employee']),
  department: z.string().min(1), // department name
  title: z.string().min(1),
  avatarColor: z.string().optional(),
  phone: z.string().optional(),
});

export async function createUser(req, res) {
  const data = createUserSchema.parse(req.body);

  const dept = await query('SELECT id FROM departments WHERE name = $1', [data.department]);
  if (!dept.rows[0]) return res.status(400).json({ message: 'Unknown department' });

  const existing = await query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existing.rows[0]) return res.status(409).json({ message: 'Email already in use' });

  const id = `u-${uuid()}`;
  const passwordHash = await bcrypt.hash(data.password, 10);
  await query(
    `INSERT INTO users (id, full_name, email, password_hash, role, department_id, title, avatar_color, phone)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, data.fullName, data.email, passwordHash, data.role, dept.rows[0].id, data.title, data.avatarColor || '#2A4F97', data.phone || null],
  );

  const { rows } = await query(
    `SELECT u.*, d.name AS department_name FROM users u JOIN departments d ON d.id = u.department_id WHERE u.id = $1`,
    [id],
  );
  await recordAudit(req.user.id, 'Created new user account', data.fullName);
  res.status(201).json(toUser(rows[0]));
}

const updateUserSchema = createUserSchema.partial().omit({ password: true });

export async function updateUser(req, res) {
  const data = updateUserSchema.parse(req.body);
  const { id } = req.params;

  const sets = [];
  const params = [];

  if (data.fullName) { params.push(data.fullName); sets.push(`full_name = $${params.length}`); }
  if (data.email) { params.push(data.email); sets.push(`email = $${params.length}`); }
  if (data.role) { params.push(data.role); sets.push(`role = $${params.length}`); }
  if (data.title) { params.push(data.title); sets.push(`title = $${params.length}`); }
  if (data.avatarColor) { params.push(data.avatarColor); sets.push(`avatar_color = $${params.length}`); }
  if (data.phone) { params.push(data.phone); sets.push(`phone = $${params.length}`); }
  if (data.department) {
    const dept = await query('SELECT id FROM departments WHERE name = $1', [data.department]);
    if (!dept.rows[0]) return res.status(400).json({ message: 'Unknown department' });
    params.push(dept.rows[0].id);
    sets.push(`department_id = $${params.length}`);
  }

  if (!sets.length) return res.status(400).json({ message: 'No fields to update' });

  params.push(id);
  await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length}`, params);

  const { rows } = await query(
    `SELECT u.*, d.name AS department_name FROM users u JOIN departments d ON d.id = u.department_id WHERE u.id = $1`,
    [id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  if (data.role) {
    await recordAudit(req.user.id, 'Updated role permissions', `${rows[0].full_name} → ${data.role}`);
  }
  res.json(toUser(rows[0]));
}

export async function setUserStatus(req, res) {
  const schema = z.object({ status: z.enum(['active', 'inactive']) });
  const { status } = schema.parse(req.body);
  const { rows } = await query(
    'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, full_name',
    [status, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  await recordAudit(req.user.id, status === 'active' ? 'Enabled user account' : 'Disabled user account', rows[0].full_name);
  res.status(204).send();
}

export async function deleteUser(req, res) {
  const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING id, full_name', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  await recordAudit(req.user.id, 'Deleted user account', rows[0].full_name);
  res.status(204).send();
}
