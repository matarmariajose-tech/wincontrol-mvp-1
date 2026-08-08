import { Router } from 'express';
import { propertyController } from './property.controller';
import { authMiddleware } from '../auth/auth.middleware';
import { withTenantContext } from '../shared/tenant/tenant.middleware';
import { tenantDesdeParam } from '../shared/tenant/public-tenant.middleware';

const router = Router();

router.get('/:id', tenantDesdeParam('property'), propertyController.getById);

router.use(authMiddleware, withTenantContext);

router.get('/', propertyController.getAll);
router.patch('/:id/comercial', propertyController.assignComercial);

export default router;
