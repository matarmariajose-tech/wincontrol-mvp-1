import { leadRepository } from './infrastructure/lead.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead } from './domain/lead.entity';

export const leadService = {
  getAll: (): Lead[] => {
    return leadRepository.findAll();
  },

  create: (data: CreateLeadDto): Lead => {
    const newLead: Lead = {
      id: Date.now().toString(),
      ...data,
    };

    return leadRepository.create(newLead);
  },
};