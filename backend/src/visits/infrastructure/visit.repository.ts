import { Visit } from '../domain/visit.entity';

let visits: Visit[] = [];

export const visitRepository = {
  findAll: (): Visit[] => visits,

  create: (visit: Visit): Visit => {
    visits.push(visit);
    return visit;
  },
};