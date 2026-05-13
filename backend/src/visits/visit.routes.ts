import { Router } from 'express';
import { getVisits, getVisitById, createVisit, updateVisit, deleteVisit, getAllVisitsAdmin } from './visit.controller';
import { authMiddleware } from '../auth/auth.middleware';
 
const router = Router();

router.use(authMiddleware);
router.get('/',      getVisits);
router.get('/admin/all', getAllVisitsAdmin);
router.get('/:id',   getVisitById);
router.post('/',     createVisit);
router.patch('/:id', updateVisit);
router.delete('/:id',deleteVisit);
 
export default router;