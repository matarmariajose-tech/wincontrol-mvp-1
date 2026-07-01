import { Router } from 'express';
import { propertyController } from './property.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.get('/:id', propertyController.getById);

router.use(authMiddleware);
router.get('/', propertyController.getAll);
router.patch('/:id/comercial', propertyController.assignComercial);

export default router;
