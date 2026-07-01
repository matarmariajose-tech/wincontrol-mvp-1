import { Request, Response } from 'express';
import { comercialService } from './comercial.service';

export const comercialController = {
  getAll: async (req: Request, res: Response) => {
    try {
      res.json(await comercialService.getAll());
    } catch (e) {
      res.status(500).json({ error: 'Error fetching comerciales' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const comercial = await comercialService.getById(req.params.id);
      if (!comercial) return res.status(404).json({ error: 'Not found' });
      res.json(comercial);
    } catch (e) {
      res.status(500).json({ error: 'Error fetching comercial' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      res.status(201).json(await comercialService.create(req.body));
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const comercial = await comercialService.update(req.params.id, req.body);
      if (!comercial) return res.status(404).json({ error: 'Not found' });
      res.json(comercial);
    } catch (e) {
      res.status(500).json({ error: 'Error updating comercial' });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      await comercialService.remove(req.params.id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: 'Error deleting comercial' });
    }
  },
};
