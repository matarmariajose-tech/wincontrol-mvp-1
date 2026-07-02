import { Request, Response } from 'express';
import { visitService } from './visit.service';

export const visitController = {
  getAllAdmin: async (req: Request, res: Response) => {
    res.json(await visitService.getAllForAdmin());
  },
  getAll: async (req: Request, res: Response) => {
    const adminId = String((req as any).user?.id);
    res.json(await visitService.getAll(adminId));
  },

  getByLead: async (req: Request, res: Response) => {
    res.json(await visitService.getByLead(String(req.params.leadId)));
  },

  create: async (req: Request, res: Response) => {
    try {
      const adminId = String((req as any).user?.id);
      res.status(201).json(await visitService.create({ ...req.body, adminId }));
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      res.json(await visitService.update(String(req.params.id), req.body));
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  cancel: async (req: Request, res: Response) => {
    try {
      const adminId = String((req as any).user?.id);
      res.json(await visitService.cancel(String(req.params.id), adminId));
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  complete: async (req: Request, res: Response) => {
    try {
      const adminId = String((req as any).user?.id);
      res.json(await visitService.complete(String(req.params.id), adminId));
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  remove: async (req: Request, res: Response) => {
    await visitService.remove(String(req.params.id));
    res.status(204).send();
  },
};
