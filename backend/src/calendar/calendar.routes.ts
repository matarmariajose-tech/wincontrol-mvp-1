import { Router } from 'express';
import { calendarController } from './calendar.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.get('/callback', calendarController.callback);
router.get('/slots/:comercialId/:date', calendarController.getSlots);

router.use(authMiddleware);
router.get('/auth/:comercialId', calendarController.getAuthUrl);

export default router;
