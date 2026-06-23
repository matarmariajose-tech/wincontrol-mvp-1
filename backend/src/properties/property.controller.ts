import { Request, Response } from 'express';
import { propertyService } from './property.service';

export const propertyController = {
  getAll: async (req: Request, res: Response) => {
    const adminId = (req as any).user?.id;
    const props = await propertyService.getAll(adminId);
    res.json(props);
  },
  getById: async (req: Request, res: Response) => {
    const prop = await propertyService.getById(Number(req.params.id));
    if (!prop) return res.status(404).json({ message: 'Not found' });
    res.json(prop);
  },
  create: async (req: Request, res: Response) => {
    const adminId = (req as any).user?.id;
    const prop = await propertyService.create({ ...req.body, adminId });
    res.status(201).json(prop);
  },
  update: async (req: Request, res: Response) => {
    const prop = await propertyService.update(Number(req.params.id), req.body);
    res.json(prop);
  },
  remove: async (req: Request, res: Response) => {
    await propertyService.remove(Number(req.params.id));
    res.status(204).send();
  }
};
