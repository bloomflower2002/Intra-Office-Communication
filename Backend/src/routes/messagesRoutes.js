import { Router } from 'express';
import {
  listDirectThreads, getOrCreateDirectThread, listThreadMessages, sendThreadMessage,
  listChannels, listChannelMessages, sendChannelMessage,
} from '../controllers/messagesController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

// Direct messages
router.get('/threads', asyncHandler(listDirectThreads));
router.post('/threads', asyncHandler(getOrCreateDirectThread));
router.get('/threads/:threadId/messages', asyncHandler(listThreadMessages));
router.post('/threads/:threadId/messages', asyncHandler(sendThreadMessage));

// Channels
router.get('/channels', asyncHandler(listChannels));
router.get('/channels/:channelId/messages', asyncHandler(listChannelMessages));
router.post('/channels/:channelId/messages', asyncHandler(sendChannelMessage));

export default router;
