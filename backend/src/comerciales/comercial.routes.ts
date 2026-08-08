import { Router } from 'express';
import { comercialController } from './comercial.controller';
import { authMiddleware } from '../auth/auth.middleware';
import { withTenantContext } from '../shared/tenant/tenant.middleware';
import { tenantDesdeParam } from '../shared/tenant/public-tenant.middleware';

const router = Router();

router.get('/:id', tenantDesdeParam('comercial'), comercialController.getById);

router.use(authMiddleware, withTenantContext);

router.get('/', comercialController.getAll);
router.post('/', comercialController.create);
router.put('/:id', comercialController.update);
router.delete('/:id', comercialController.remove);

export default router;
