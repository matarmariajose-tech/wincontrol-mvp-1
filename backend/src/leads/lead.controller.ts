import { Request, Response } from 'express';
import { leadService } from './lead.service';
import { LeadState } from './domain/lead.entity';

export const getLeads = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user?.role === 'comercial') {
    res.json(await leadService.getByComercial(String(user.name)));
  } else {
    res.json(await leadService.getAll(String(user?.id)));
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const adminId = String((req as any).user?.id);
    res.status(201).json(await leadService.create({ ...req.body, adminId }));
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    res.json(await leadService.update(String(req.params.id), req.body));
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  await leadService.remove(String(req.params.id));
  res.status(204).send();
};

export const changeState = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user?.id);
    const { state } = req.body;
    if (!Object.values(LeadState).includes(state)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    res.json(await leadService.changeState(String(req.params.id), state, userId));
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  res.json(await leadService.getHistory(String(req.params.id)));
};

export const getById = async (req: Request, res: Response) => {
  const lead = await leadService.getById(String(req.params.id));
  if (!lead) return res.status(404).json({ message: 'Lead no encontrado' });
  res.json(lead);
};
