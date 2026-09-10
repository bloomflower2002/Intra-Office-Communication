import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';
import memosRoutes from './routes/memosRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import archiveRoutes from './routes/archiveRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import departmentsRoutes from './routes/departmentsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/memos', memosRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/audit', auditRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
