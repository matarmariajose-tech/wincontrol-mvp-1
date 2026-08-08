import { Router } from 'express';
import { visitController } from './visit.controller';
import { authMiddleware } from '../auth/auth.middleware';
import { withTenantContext } from '../shared/tenant/tenant.middleware';
import { tenantDesdeBody } from '../shared/tenant/public-tenant.middleware';

const router = Router();

router.post('/', tenantDesdeBody({ lead: 'leadId', property: 'propertyId' }), visitController.create);

router.use(authMiddleware, withTenantContext);

router.get('/', visitController.getAll);
router.get('/admin/all', visitController.getAllAdmin);
router.get('/lead/:leadId', visitController.getByLead);
router.put('/:id', visitController.update);
router.patch('/:id/cancel', visitController.cancel);
router.patch('/:id/complete', visitController.complete);
router.delete('/:id', visitController.remove);

export default router;
