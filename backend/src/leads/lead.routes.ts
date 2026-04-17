import { Router } from 'express';
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead
} from './lead.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/', getLeads);

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
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
 *         description: Lead created
 */
router.post('/', createLead);

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Update a lead
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             estado: "REALIZADA"
 *     responses:
 *       200:
 *         description: Lead updated
 */
router.put('/:id', updateLead);

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Delete a lead
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Lead ID
 *     responses:
 *       204:
 *         description: Lead deleted
 */
router.delete('/:id', deleteLead);

export default router;