import { Router } from 'express';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationsController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listNotifications));
router.patch('/:id/read', asyncHandler(markNotificationRead));
router.patch('/read-all', asyncHandler(markAllNotificationsRead));

export default router;
