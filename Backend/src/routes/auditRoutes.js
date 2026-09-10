import { Router } from 'express';
import { listAuditLog } from '../controllers/auditController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

// Every authenticated user/role can read the audit log — scoping (System Admin
// sees everything, everyone else sees only their own department) happens
// inside the controller. There is intentionally no DELETE/PATCH route here:
// audit entries can never be revoked or altered by anyone, including admins.
router.get('/', asyncHandler(listAuditLog));

export default router;
