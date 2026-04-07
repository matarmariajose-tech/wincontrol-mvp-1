import { Request, Response } from 'express';
import { visitService } from './visit.service';

export const getVisits = (req: Request, res: Response) => {
  try {
    const visits = visitService.getAll();
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visits' });
  }
};

export const createVisit = (req: Request, res: Response) => {
  try {
    const visit = visitService.create(req.body);
    res.status(201).json(visit);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVisit = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = visitService.update(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVisit = (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    visitService.remove(id);

    res.json({ message: 'Visit deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};