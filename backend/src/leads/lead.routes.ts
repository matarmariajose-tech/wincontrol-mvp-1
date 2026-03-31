import { Router } from 'express';
import { getLeads, createLead } from './lead.controller';

const router = Router();

router.get('/', getLeads);
router.post('/', createLead);

export default router;