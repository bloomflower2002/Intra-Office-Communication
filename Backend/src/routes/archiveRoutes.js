import { Router } from 'express';
import { listArchive } from '../controllers/archiveController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listArchive));

export default router;
