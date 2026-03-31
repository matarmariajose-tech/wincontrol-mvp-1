import { Request, Response } from 'express';
import { visitService } from './visit.service';

export const getVisits = (req: Request, res: Response) => {
  res.json(visitService.getAll());
};

export const createVisit = (req: Request, res: Response) => {
  const visit = visitService.create(req.body);
  res.json(visit);
};