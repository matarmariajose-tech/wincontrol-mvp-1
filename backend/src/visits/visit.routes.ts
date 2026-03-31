import { Router } from 'express';
import { getVisits, createVisit } from './visit.controller';

const router = Router();

router.get('/', getVisits);
router.post('/', createVisit);

export default router;