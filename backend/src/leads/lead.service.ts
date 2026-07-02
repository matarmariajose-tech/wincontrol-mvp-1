import { AppDataSource } from '../config/data-source';
import { Lead, LeadState } from './domain/lead.entity';
import { LeadStateHistory } from './domain/lead-state-history.entity';
import { Property } from '../properties/property.entity';
import { Comercial } from '../comerciales/comercial.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { sendLeadWelcome, sendOfertaNotification } from '../mail/mailer';

const repo = () => AppDataSource.getRepository(Lead);
const historyRepo = () => AppDataSource.getRepository(LeadStateHistory);
const propertyRepo = () => AppDataSource.getRepository(Property);
const comercialRepo = () => AppDataSource.getRepository(Comercial);

export const leadService = {
  getAll: async (adminId: string): Promise<Lead[]> => {
    return await repo().find({ where: { adminId } });
  },

  getById: async (id: string): Promise<Lead | null> => {
    return await repo().findOne({ where: { id } });
  },

  create: async (data: CreateLeadDto): Promise<Lead> => {
    if (!data.nombre) throw new Error('nombre es requerido');

    const lead = repo().create({
      adminId: data.adminId,
      propertyId: data.propertyId,
      comercialId: data.comercialId,
      nombre: data.nombre,
      email: data.email,
      phone: data.phone,
      source: data.source,
      sourceUrl: data.sourceUrl,
      estado: LeadState.LEAD_NUEVO,
    });

    const saved = await repo().save(lead);

    await historyRepo().save(historyRepo().create({
      leadId: saved.id,
      fromState: undefined,
      toState: LeadState.LEAD_NUEVO,
      changedBy: data.adminId,
    }));

    if (saved.email) {
      let inmueble = 'Tu inmueble de interés';
      let inmuebleUrl: string | undefined;
      let comercialNombre = 'Tu comercial asignado';
      let comercialPhone: string | undefined;

      if (saved.propertyId) {
        const property = await propertyRepo().findOne({ where: { id: saved.propertyId } });
        if (property) {
          inmueble = property.title;
          inmuebleUrl = property.sourceUrl;

          const comercialId = saved.comercialId || property.comercialId;
          if (comercialId) {
            const comercial = await comercialRepo().findOne({ where: { nombre: comercialId } });
            if (comercial) {
              comercialNombre = comercial.nombre;
              comercialPhone = comercial.telefono;
            }
          }
        }
      }

      sendLeadWelcome({
        toEmail: saved.email,
        toName: saved.nombre,
        inmueble,
        inmuebleUrl,
        comercial: comercialNombre,
        comercialPhone,
        agendaUrl: `https://www.winallcontrol.com/prototype/schedule/?leadId=${saved.id}&comercialId=${saved.comercialId || ''}`,
      }).catch(err => console.error('Email error:', err));
    }

    return saved;
  },

  changeState: async (id: string, newState: LeadState, userId: string): Promise<Lead> => {
    const lead = await repo().findOne({ where: { id } });
    if (!lead) throw new Error('Lead no encontrado');
    const fromState = lead.estado;
    lead.estado = newState;
    const updated = await repo().save(lead);
    await historyRepo().save(historyRepo().create({
      leadId: id,
      fromState,
      toState: newState,
      changedBy: userId,
    }));

    if (newState === LeadState.INTENCION_OFERTA) {
      let inmueble = 'Inmueble sin especificar';
      let comercialNombre = lead.comercialId || 'Comercial';
      let comercialEmail: string | undefined;

      if (lead.propertyId) {
        const prop = await propertyRepo().findOne({ where: { id: lead.propertyId } });
        if (prop) inmueble = prop.title;
      }

      if (lead.comercialId) {
        const com = await comercialRepo().findOne({ where: { nombre: lead.comercialId } });
        if (com) {
          comercialNombre = com.nombre;
          comercialEmail = com.email;
        }
      }

      if (comercialEmail) {
        sendOfertaNotification({
          toEmail: comercialEmail,
          toName: comercialNombre,
          clienteNombre: lead.nombre,
          inmueble,
          comercial: comercialNombre,
        }).catch((err: unknown) => console.error('Oferta notif error:', err));
      }
    }

    return updated;
  },

  update: async (id: string, data: Partial<CreateLeadDto>): Promise<Lead | null> => {
    await repo().update(id, data as any);
    return await repo().findOne({ where: { id } });
  },

  remove: async (id: string): Promise<void> => {
    await repo().delete(id);
  },

  getByComercial: async (comercialId: string): Promise<Lead[]> => {
    return await repo().find({ where: { comercialId } });
  },

  getHistory: async (leadId: string): Promise<LeadStateHistory[]> => {
    return await historyRepo().find({ where: { leadId } });
  },
};
