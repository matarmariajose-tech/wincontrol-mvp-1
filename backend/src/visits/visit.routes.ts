import { Router } from 'express';
import {
  getVisits,
  createVisit,
  updateVisit,
  deleteVisit
} from './visit.controller';

const router = Router();

/**
 * @swagger
 * /api/visits:
 *   get:
 *     summary: Get all visits
 *     responses:
 *       200:
 *         description: List of visits
 */
router.get('/', getVisits);

/**
 * @swagger
 * /api/visits:
 *   post:
 *     summary: Create a new visit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             ref: "WC-123"
 *             cliente: "Juan Pérez"
 *             comercial: "Sara López"
 *             fecha: "2026-04-01"
 *             hora: "10:00"
 *             estado: "PENDIENTE"
 *             inmueble: "Depto Palermo"
 *     responses:
 *       201:
 *         description: Visit created
 */
router.post('/', createVisit);

/**
 * @swagger
 * /api/visits/{id}:
 *   put:
 *     summary: Update a visit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Visit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             estado: "REALIZADA"
 *     responses:
 *       200:
 *         description: Visit updated
 */
router.put('/:id', updateVisit);

/**
 * @swagger
 * /api/visits/{id}:
 *   delete:
 *     summary: Delete a visit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Visit ID
 *     responses:
 *       204:
 *         description: Visit deleted
 */
router.delete('/:id', deleteVisit);

export default router;