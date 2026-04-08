import { Request, Response } from 'express';
import { visitService } from './visit.service';

export const getVisits = async (req: Request, res: Response) => {
  try {
    const visits = await visitService.getAll();
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visits' });
  }
};

export const createVisit = async (req: Request, res: Response) => {
  try {
    const visit = await visitService.create(req.body);
    res.status(201).json(visit);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVisit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await visitService.update(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVisit = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await visitService.remove(id);
    res.json({ message: 'Visit deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};