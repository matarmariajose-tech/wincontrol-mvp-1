import { Request, Response } from 'express';
import { leadService } from './lead.service';

export const getLeads = (req: Request, res: Response) => {
  res.json(leadService.getAll());
};

export const createLead = (req: Request, res: Response) => {
  const lead = leadService.create(req.body);
  res.json(lead);
};