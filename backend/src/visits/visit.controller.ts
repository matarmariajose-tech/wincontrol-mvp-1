import { RequestHandler } from 'express';
import { visitService } from './visit.service';

export const getVisits: RequestHandler = (_req, res) => {
  res.json(visitService.getAll());
};

export const getVisitById: RequestHandler = (req, res) => {
  const id = req.params.id as string;

  const visit = visitService.getById(id);
  if (!visit) return res.status(404).json({ error: 'No encontrada' });
  res.json(visit);
};

export const createVisit: RequestHandler = (req, res) => {
  const result = visitService.create(req.body);
  if (!result.ok) return res.status(409).json({ error: result.error });
  res.status(201).json(result.visit);
};

export const updateVisit: RequestHandler = (req, res) => {
  const id = req.params.id as string;

  const result = visitService.update(id, req.body);
  if (!result.ok) {
    return res
      .status(result.error === 'Visita no encontrada.' ? 404 : 409)
      .json({ error: result.error });
  }
  res.json(result.visit);
};

export const deleteVisit: RequestHandler = (req, res) => {
  const id = req.params.id as string;

  const deleted = visitService.delete(id);
  if (!deleted) return res.status(404).json({ error: 'No encontrada' });
  res.status(204).send();
};