import { AppDataSource } from '../../config/data-source';
import { Visit } from '../domain/visit.entity';

const repo = AppDataSource.getRepository(Visit);

export const visitRepository = {
  findAll: async (): Promise<Visit[]> => {
    return await repo.find();
  },

  create: async (visit: Visit): Promise<Visit> => {
    return await repo.save(visit);
  },

  update: async (id: string, data: Partial<Visit>): Promise<Visit> => {
    await repo.update(id, data);
    const updated = await repo.findOneBy({ id });

    if (!updated) {
      throw new Error('Visit not found after update');
    }

    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await repo.delete(id);
  }
};