import { visitRepository } from './infrastructure/visit.repository';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './domain/visit.entity';

export const visitService = {
  getAll: (): Visit[] => {
    return visitRepository.findAll();
  },

  create: (data: CreateVisitDto): Visit => {
    if (!data.ref || !data.cliente || !data.comercial) {
      throw new Error('Missing required fields');
    }

    const newVisit: Visit = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };

    console.log('Creating visit:', newVisit);

    return visitRepository.create(newVisit);
  },

  update: (id: string, data: Partial<CreateVisitDto>): Visit => {
    const visits = visitRepository.findAll();
    const index = visits.findIndex(v => v.id === id);

    if (index === -1) {
      throw new Error('Visit not found');
    }

    const updatedVisit: Visit = {
      ...visits[index],
      ...data
    };

    return visitRepository.update(id, updatedVisit);
  },

  remove: (id: string): void => {
    const visits = visitRepository.findAll();
    const index = visits.findIndex(v => v.id === id);

    if (index === -1) {
      throw new Error('Visit not found');
    }

    visitRepository.delete(id);
  }
};