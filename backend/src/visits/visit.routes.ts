import { Router } from 'express';
import { visitController } from './visit.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', visitController.getAll);
router.get('/lead/:leadId', visitController.getByLead);
router.post('/', visitController.create);
router.put('/:id', visitController.update);
router.patch('/:id/cancel', visitController.cancel);
router.patch('/:id/complete', visitController.complete);
router.delete('/:id', visitController.remove);

export default router;
