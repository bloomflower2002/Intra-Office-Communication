import { Router } from 'express';
import {
  listUsers, getUser, createUser, updateUser, setUserStatus, deleteUser,
} from '../controllers/usersController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(listUsers));
router.get('/:id', asyncHandler(getUser));

// Admin-only user management (mirrors the frontend's Admin Console)
router.post('/', requireRole('System Admin'), asyncHandler(createUser));
router.patch('/:id', requireRole('System Admin'), asyncHandler(updateUser));
router.patch('/:id/status', requireRole('System Admin'), asyncHandler(setUserStatus));
router.delete('/:id', requireRole('System Admin'), asyncHandler(deleteUser));

export default router;
