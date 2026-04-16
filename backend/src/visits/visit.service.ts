import { visitRepository } from './infrastructure/visit.repository';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './domain/visit.entity';
 
const BLOCKING_STATES = new Set(['EN_OFERTA', 'REALIZADA', 'BLOQUEADA', 'CONCERTADA']);
 
export const visitService = {
  getAll: (): Visit[] => {
    return visitRepository.findAll();
  },
 
  getById: (id: string): Visit | null => {
    return visitRepository.findById(id) ?? null;
  },
 
  create: (data: CreateVisitDto): { ok: boolean; error?: string; visit?: Visit } => {
    // Validar conflicto de slot si el estado bloquea
    if (BLOCKING_STATES.has(data.estado)) {
      const conflict = visitRepository.findAll().some(
        v =>
          v.fecha === data.fecha &&
          v.hora === data.hora &&
          BLOCKING_STATES.has(v.estado)
      );
      if (conflict) {
        return { ok: false, error: 'Slot bloqueado: ya existe una visita en ese horario con estado bloqueante.' };
      }
    }
 
    const newVisit: Visit = {
      id: Date.now().toString(),
      ...data,
    };
 
    return { ok: true, visit: visitRepository.create(newVisit) };
  },
 
  update: (id: string, changes: Partial<Visit>): { ok: boolean; error?: string; visit?: Visit } => {
    const current = visitRepository.findById(id);
    if (!current) return { ok: false, error: 'Visita no encontrada.' };
 
    // Si cambia a MODIFICADA con nueva fecha/hora, validar slot
    if (changes.estado === 'MODIFICADA' && changes.fecha && changes.hora) {
      const conflict = visitRepository.findAll().some(
        v =>
          v.id !== id &&
          v.fecha === changes.fecha &&
          v.hora === changes.hora &&
          BLOCKING_STATES.has(v.estado)
      );
      if (conflict) {
        return { ok: false, error: 'Slot bloqueado: no puedes mover la visita a ese horario.' };
      }
    }
 
    const updated = visitRepository.update(id, changes);
    return { ok: true, visit: updated! };
  },
 
  delete: (id: string): boolean => {
    return visitRepository.delete(id);
  },
};