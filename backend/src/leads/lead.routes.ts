import { Router } from 'express';
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  changeState,
  getHistory,
  getById,
} from './lead.controller';
import { authMiddleware } from '../auth/auth.middleware';
import { withTenantContext } from '../shared/tenant/tenant.middleware';
import { tenantDesdeParam } from '../shared/tenant/public-tenant.middleware';

const router = Router();

router.get('/:id', tenantDesdeParam('lead'), getById);
router.patch('/:id/state', tenantDesdeParam('lead'), changeState);

router.use(authMiddleware, withTenantContext);

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.get('/:id/history', getHistory);

export default router;
