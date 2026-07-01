import { Router } from 'express';
import { comercialController } from './comercial.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.get('/:id', comercialController.getById);

router.use(authMiddleware);
router.get('/', comercialController.getAll);
router.post('/', comercialController.create);
router.put('/:id', comercialController.update);
router.delete('/:id', comercialController.remove);

export default router;
