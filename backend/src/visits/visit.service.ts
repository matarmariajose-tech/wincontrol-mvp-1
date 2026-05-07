import { visitRepository } from './infrastructure/visit.repository';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './domain/visit.entity';
import { sendVisitConfirmation, sendVisitNotificationToComercial } from '../mail/mailer';
import { AppDataSource } from '../config/data-source';
import { Comercial } from '../comerciales/comercial.entity';

const BLOCKING_STATES = new Set(['EN_OFERTA', 'REALIZADA', 'BLOQUEADA', 'CONCERTADA']);

export const visitService = {
  getAll: async (adminId: string): Promise<Visit[]> => {
    return await visitRepository.findAll(adminId);
  },

  getById: async (id: string): Promise<Visit | null> => {
    return await visitRepository.findById(id);
  },

  create: async (data: CreateVisitDto): Promise<{ ok: boolean; error?: string; visit?: Visit }> => {
    if (BLOCKING_STATES.has(data.estado)) {
      const all = await visitRepository.findAll(data.adminId!);
      const conflict = all.some(
        v => v.fecha === data.fecha && v.hora === data.hora && BLOCKING_STATES.has(v.estado)
      );
      if (conflict) {
        return { ok: false, error: 'Slot bloqueado: ya existe una visita en ese horario.' };
      }
    }

    const visit = await visitRepository.create(data);

    if (data.clienteEmail) {
      try {
        await sendVisitConfirmation({
          toEmail:   data.clienteEmail,
          toName:    data.cliente,
          comercial: data.comercial,
          fecha:     data.fecha,
          hora:      data.hora,
          inmueble:  data.inmueble,
          ref:       data.ref,
        });
      } catch (err) {
        console.error('Error enviando mail al cliente:', err);
      }
    }

    try {
      const repo = AppDataSource.getRepository(Comercial);
      const comercialData = await repo.findOneBy({ nombre: data.comercial });
      if (comercialData?.email) {
        await sendVisitNotificationToComercial({
          toEmail:       comercialData.email,
          comercial:     data.comercial,
          clienteNombre: data.cliente,
          fecha:         data.fecha,
          hora:          data.hora,
          inmueble:      data.inmueble,
          ref:           data.ref,
        });
      }
    } catch (err) {
      console.error('Error enviando mail al comercial:', err);
    }

    return { ok: true, visit };
  },

  update: async (id: string, changes: Partial<Visit>): Promise<{ ok: boolean; error?: string; visit?: Visit }> => {
    const current = await visitRepository.findById(id);
    if (!current) return { ok: false, error: 'Visita no encontrada.' };

    if (changes.estado === 'MODIFICADA' && changes.fecha && changes.hora) {
      const all = await visitRepository.findAll(current.adminId!);
      const conflict = all.some(
        v => v.id !== id && v.fecha === changes.fecha && v.hora === changes.hora && BLOCKING_STATES.has(v.estado)
      );
      if (conflict) {
        return { ok: false, error: 'Slot bloqueado: no puedes mover la visita a ese horario.' };
      }
    }

    const visit = await visitRepository.update(id, changes);
    return { ok: true, visit: visit! };
  },

  delete: async (id: string): Promise<boolean> => {
    return await visitRepository.delete(id);
  },
};