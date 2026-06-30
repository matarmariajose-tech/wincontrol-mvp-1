import { Request, Response } from 'express';
import { propertyService } from './property.service';

export const propertyController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const properties = await propertyService.getAll();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching properties' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const property = await propertyService.getById(Number(req.params.id));
      if (!property) return res.status(404).json({ error: 'Not found' });
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching property' });
    }
  },

  assignComercial: async (req: Request, res: Response) => {
    try {
      const { comercialId } = req.body;
      const property = await propertyService.assignComercial(Number(req.params.id), comercialId);
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: 'Error assigning comercial' });
    }
  },
};
