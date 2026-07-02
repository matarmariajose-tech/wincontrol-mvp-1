import { AppDataSource } from '../config/data-source';
import { Visit, VisitStatus } from './domain/visit.entity';
import { Lead, LeadState } from '../leads/domain/lead.entity';
import { LeadStateHistory } from '../leads/domain/lead-state-history.entity';

const repo = () => AppDataSource.getRepository(Visit);
const leadRepo = () => AppDataSource.getRepository(Lead);
const historyRepo = () => AppDataSource.getRepository(LeadStateHistory);

const updateLeadState = async (leadId: string, toState: LeadState, changedBy: string) => {
  const lead = await leadRepo().findOne({ where: { id: leadId } });
  if (!lead) return;
  const fromState = lead.estado;
  lead.estado = toState;
  await leadRepo().save(lead);
  await historyRepo().save(historyRepo().create({ leadId, fromState, toState, changedBy }));
};

export const visitService = {
  getAll: async (adminId: string) => repo().find({ where: { adminId } }),
  getAllForAdmin: async () => repo().find({ order: { createdAt: 'DESC' } }),

  getByLead: async (leadId: string) => repo().find({ where: { leadId } }),

  create: async (data: Partial<Visit> & { adminId: string; leadId?: string }) => {
    if (!data.fecha || !data.hora) throw new Error('fecha y hora son requeridas');
    const saved = await repo().save(repo().create({ ...data, estado: VisitStatus.PENDIENTE }));
    if (saved.leadId) await updateLeadState(saved.leadId, LeadState.VISITA_AGENDADA, data.adminId);
    return saved;
  },

  update: async (id: string, data: Partial<Visit>) => {
    await repo().update(id, data);
    return repo().findOne({ where: { id } });
  },

  cancel: async (id: string, adminId: string) => {
    const visit = await repo().findOne({ where: { id } });
    if (!visit) throw new Error('Visita no encontrada');
    visit.estado = VisitStatus.CANCELADA;
    const saved = await repo().save(visit);
    if (visit.leadId) await updateLeadState(visit.leadId, LeadState.VISITA_CANCELADA, adminId);
    return saved;
  },

  complete: async (id: string, adminId: string) => {
    const visit = await repo().findOne({ where: { id } });
    if (!visit) throw new Error('Visita no encontrada');
    visit.estado = VisitStatus.REALIZADA;
    const saved = await repo().save(visit);
    if (visit.leadId) await updateLeadState(visit.leadId, LeadState.PENDIENTE, adminId);
    return saved;
  },

  remove: async (id: string) => repo().delete(id),
};
