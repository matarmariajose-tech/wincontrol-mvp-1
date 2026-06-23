import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead, changeState, getHistory } from './lead.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.patch('/:id/state', changeState);
router.get('/:id/history', getHistory);

export default router;
