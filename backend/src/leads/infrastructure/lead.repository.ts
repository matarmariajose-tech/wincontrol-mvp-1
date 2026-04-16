import { AppDataSource } from '../../config/data-source';
import { Lead } from '../domain/lead.entity';

const repo = AppDataSource.getRepository(Lead);

export const leadRepository = {
  findAll: async (): Promise<Lead[]> => {
    return await repo.find();
  },

  create: async (lead: Lead): Promise<Lead> => {
    return await repo.save(lead);
  },

  update: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    await repo.update(id, data);
    const updated = await repo.findOneBy({ id });

    if (!updated) {
      throw new Error('Lead not found after update');
    }

    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await repo.delete(id);
  }
};