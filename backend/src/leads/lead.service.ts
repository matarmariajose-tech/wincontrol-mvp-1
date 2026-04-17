import { leadRepository } from './infrastructure/lead.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead } from './domain/lead.entity';

export const leadService = {
  getAll: async (adminId: string): Promise<Lead[]> => {
    return await leadRepository.findAll(adminId);
  },

  create: async (data: CreateLeadDto): Promise<Lead> => {
    if (!data.ref || !data.cliente || !data.comercial) {
      throw new Error('Missing required fields');
    }

    const newLead: Lead = {
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
      offer: data.offer ?? null,
      sourceUrl: data.sourceUrl ?? null,
      publicId: data.publicId,

      createdAt: new Date().toISOString(),

      adminId: data.adminId
    };

    return await leadRepository.create(newLead);
  },

  update: async (id: string, data: Partial<CreateLeadDto>): Promise<Lead> => {
    return await leadRepository.update(id, data);
  },

  remove: async (id: string): Promise<void> => {
    return await leadRepository.delete(id);
  }
};