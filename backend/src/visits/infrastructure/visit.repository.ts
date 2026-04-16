// infrastructure/visit.repository.ts
import { Visit } from '../domain/visit.entity';
 
let visits: Visit[] = [];
 
export const visitRepository = {
  findAll: (): Visit[] => visits,
 
  findById: (id: string): Visit | undefined =>
    visits.find(v => v.id === id),
 
  create: (visit: Visit): Visit => {
    visits.push(visit);
    return visit;
  },
 
  update: (id: string, changes: Partial<Visit>): Visit | null => {
    const idx = visits.findIndex(v => v.id === id);
    if (idx === -1) return null;
    visits[idx] = { ...visits[idx], ...changes };
    return visits[idx];
  },
 
  delete: (id: string): boolean => {
    const before = visits.length;
    visits = visits.filter(v => v.id !== id);
    return visits.length < before;
  },
};