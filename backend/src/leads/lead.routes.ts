import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead, changeState, getHistory, getById } from './lead.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.get('/:id', getById);
router.patch('/:id/state', changeState);

router.use(authMiddleware);
router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.get('/:id/history', getHistory);

export default router;
