import { Visit } from '../domain/visit.entity';

let visits: Visit[] = [];

export const visitRepository = {
  findAll: (): Visit[] => visits,

  create: (visit: Visit): Visit => {
    visits.push(visit);
    return visit;
  },

  update: (id: string, updatedVisit: Visit): Visit => {
    const index = visits.findIndex(v => v.id === id);
    visits[index] = updatedVisit;
    return updatedVisit;
  },

  delete: (id: string): void => {
    visits = visits.filter(v => v.id !== id);
  }
};