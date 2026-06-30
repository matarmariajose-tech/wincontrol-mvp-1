import { Router } from 'express';
import { propertyController } from './property.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.get('/', authMiddleware, propertyController.getAll);
router.get('/:id', authMiddleware, propertyController.getById);
router.patch('/:id/comercial', authMiddleware, propertyController.assignComercial);

export default router;
