import { Router } from 'express';
import {
  getDepartmentVolume, getDocumentStatusBreakdown, getUserGrowth, getKpis,
} from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/kpis', asyncHandler(getKpis));
router.get('/department-volume', asyncHandler(getDepartmentVolume));
router.get('/status-breakdown', asyncHandler(getDocumentStatusBreakdown));
router.get('/user-growth', asyncHandler(getUserGrowth));

export default router;
