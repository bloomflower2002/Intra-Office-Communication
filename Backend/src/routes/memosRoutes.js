import { Router } from 'express';
import {
  listMemos, getMemo, createMemo, approveMemo, rejectMemo, forwardMemo, markMemoRead, acknowledgeMemo,
} from '../controllers/memosController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listMemos));
router.post('/', asyncHandler(createMemo));
router.get('/:id', asyncHandler(getMemo));

router.post('/:id/approve', asyncHandler(approveMemo));
router.post('/:id/reject', asyncHandler(rejectMemo));
router.post('/:id/forward', asyncHandler(forwardMemo));
router.post('/:id/read', asyncHandler(markMemoRead));
router.post('/:id/acknowledge', asyncHandler(acknowledgeMemo));

export default router;
