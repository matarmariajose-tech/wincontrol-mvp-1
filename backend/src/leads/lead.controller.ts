import { Request, Response } from 'express';
import { leadService } from './lead.service';

export const getLeads = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const leads = await leadService.getAll(adminId);
    res.json(leads);
  } catch (error) {
    console.error('ERROR REAL:', error);
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const lead = await leadService.create({ ...req.body, adminId });
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await leadService.update(id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await leadService.remove(id);
    res.json({ message: 'Lead deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};