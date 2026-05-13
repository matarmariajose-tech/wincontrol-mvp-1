import { RequestHandler } from 'express';
import { visitService } from './visit.service';

export const getVisits: RequestHandler = async (req, res) => {
  try {
    const adminId = (req as any).user.id;
    res.json(await visitService.getAll(adminId));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching visits' });
  }
};

export const getVisitById: RequestHandler = async (req, res) => {
  try {
    const visit = await visitService.getById(String(req.params.id));
    if (!visit) return res.status(404).json({ error: 'No encontrada' });
    res.json(visit);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching visit' });
  }
};

export const createVisit: RequestHandler = async (req, res) => {
  try {
    const adminId = (req as any).user.id;
    const result = await visitService.create({ ...req.body, adminId });
    if (!result.ok) return res.status(409).json({ error: result.error });
    res.status(201).json(result.visit);
  } catch (error) {
    res.status(500).json({ error: 'Error creating visit' });
  }
};

export const updateVisit: RequestHandler = async (req, res) => {
  try {
    const result = await visitService.update(String(req.params.id), req.body);
    if (!result.ok) {
      return res
        .status(result.error === 'Visita no encontrada.' ? 404 : 409)
        .json({ error: result.error });
    }
    res.json(result.visit);
  } catch (error) {
    res.status(500).json({ error: 'Error updating visit' });
  }
};

export const deleteVisit: RequestHandler = async (req, res) => {
  try {
    const deleted = await visitService.delete(String(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'No encontrada' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting visit' });
  };
};

export const getAllVisitsAdmin: RequestHandler = async (req, res) => {
  try {
    res.json(await visitService.getAllAdmin());
  } catch (error) {
    res.status(500).json({ error: 'Error fetching admin visits' });
  }
};