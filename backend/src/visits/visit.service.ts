import { visitRepository } from './infrastructure/visit.repository';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './domain/visit.entity';

export const visitService = {
  getAll: (): Visit[] => {
    return visitRepository.findAll();
  },

  create: (data: CreateVisitDto): Visit => {
    const newVisit: Visit = {
      id: Date.now().toString(),
      ...data,
    };

    return visitRepository.create(newVisit);
  },
};