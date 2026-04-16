import { Router } from 'express';
import { getVisits, getVisitById, createVisit, updateVisit, deleteVisit } from './visit.controller';
 
const router = Router();
 
router.get('/',      getVisits);
router.get('/:id',   getVisitById);
router.post('/',     createVisit);
router.patch('/:id', updateVisit);
router.delete('/:id',deleteVisit);
 
export default router;