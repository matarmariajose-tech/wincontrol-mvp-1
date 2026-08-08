import { Router } from 'express';
import { cambiarPassword, crearUsuario, login } from './auth.controller';
import { authMiddleware } from './auth.middleware';
import { requireAdmin, withTenantContext } from '../shared/tenant/tenant.middleware';

const router = Router();

router.post('/login', login);
router.post('/usuarios', authMiddleware, withTenantContext, requireAdmin, crearUsuario);
router.post('/password', authMiddleware, cambiarPassword);

export default router;