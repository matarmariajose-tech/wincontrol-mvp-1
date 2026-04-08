import { visitRepository } from './infrastructure/visit.repository';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './domain/visit.entity';

export const visitService = {
  getAll: async (): Promise<Visit[]> => {
    return await visitRepository.findAll();
  },

  create: async (data: CreateVisitDto): Promise<Visit> => {
    if (!data.ref || !data.cliente || !data.comercial) {
      throw new Error('Missing required fields');
    }

    const newVisit: Visit = {
      id: Date.now().toString(),
      ref: data.ref,
      cliente: data.cliente,
      inmueble: data.inmueble,
      comercial: data.comercial,
      fecha: data.fecha,
      hora: data.hora,
      estado: data.estado,

      source: data.source,
      phone: data.phone,
      email: data.email,

      questionnaire: data.questionnaire ?? false,
      offer: data.offer ?? false,
      publicId: data.publicId,

      createdAt: new Date().toISOString()
    };

    return await visitRepository.create(newVisit);
  },

  update: async (id: string, data: Partial<CreateVisitDto>): Promise<Visit> => {
    return await visitRepository.update(id, data);
  },

  remove: async (id: string): Promise<void> => {
    return await visitRepository.delete(id);
  }
};