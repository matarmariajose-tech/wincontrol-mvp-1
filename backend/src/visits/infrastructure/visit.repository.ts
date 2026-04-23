import { AppDataSource } from '../../config/data-source';
import { Visit } from '../domain/visit.entity';

const repo = AppDataSource.getRepository(Visit);

export const visitRepository = {
  findAll: async (adminId: string): Promise<Visit[]> => {
    return await repo.find({ where: { adminId } });
  },

  findById: async (id: string): Promise<Visit | null> => {
    return await repo.findOneBy({ id });
  },

  create: async (visit: Partial<Visit>): Promise<Visit> => {
    const newVisit = repo.create(visit);
    return await repo.save(newVisit);
  },

  update: async (id: string, changes: Partial<Visit>): Promise<Visit | null> => {
    await repo.update(id, changes);
    return await repo.findOneBy({ id });
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  },
};