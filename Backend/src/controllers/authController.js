import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toAuthUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    department: row.department_name,
    title: row.title,
    avatarColor: row.avatar_color,
  };
}

function signToken(row) {
  return jwt.sign(
    { id: row.id, role: row.role, department: row.department_name, email: row.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
  );
}

export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);

  const { rows } = await query(
    `SELECT u.*, d.name AS department_name FROM users u
     JOIN departments d ON d.id = u.department_id
     WHERE u.email = $1`,
    [email],
  );
  const row = rows[0];
  if (!row || row.status !== 'active') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  await query('UPDATE users SET online = true WHERE id = $1', [row.id]);

  const token = signToken(row);
  res.json({ user: toAuthUser(row), token });
}

export async function me(req, res) {
  const { rows } = await query(
    `SELECT u.*, d.name AS department_name FROM users u
     JOIN departments d ON d.id = u.department_id
     WHERE u.id = $1`,
    [req.user.id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  res.json(toAuthUser(rows[0]));
}

export async function logout(req, res) {
  await query('UPDATE users SET online = false WHERE id = $1', [req.user.id]);
  res.status(204).send();
}
