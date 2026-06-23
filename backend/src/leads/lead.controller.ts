import { Request, Response } from 'express';
import { leadService } from './lead.service';
import { LeadState } from './domain/lead.entity';

export const getLeads = async (req: Request, res: Response) => {
  const adminId = String((req as any).user?.id);
  const leads = await leadService.getAll(adminId);
  res.json(leads);
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const adminId = String((req as any).user?.id);
    const lead = await leadService.create({ ...req.body, adminId });
    res.status(201).json(lead);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const lead = await leadService.update(req.params.id, req.body);
    res.json(lead);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  await leadService.remove(req.params.id);
  res.status(204).send();
};

export const changeState = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user?.id);
    const { state } = req.body;
    if (!Object.values(LeadState).includes(state)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    const lead = await leadService.changeState(req.params.id, state, userId);
    res.json(lead);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  const history = await leadService.getHistory(req.params.id);
  res.json(history);
};
