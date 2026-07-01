import { Router } from 'express';
import { calendarController } from './calendar.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.get('/auth/:comercialId', authMiddleware, calendarController.getAuthUrl);
router.get('/callback', calendarController.callback);
router.get('/slots/:comercialId/:date', calendarController.getSlots);

export default router;
