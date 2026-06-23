import { AppDataSource } from '../config/data-source';
import { Property } from './property.entity';

const repo = () => AppDataSource.getRepository(Property);

export const propertyService = {
  getAll: async (adminId: string) => {
    return await repo().find({ where: { adminId } });
  },
  getById: async (id: number) => {
    return await repo().findOne({ where: { id } });
  },
  create: async (data: Partial<Property>) => {
    const property = repo().create(data);
    return await repo().save(property);
  },
  update: async (id: number, data: Partial<Property>) => {
    await repo().update(id, data);
    return await repo().findOne({ where: { id } });
  },
  remove: async (id: number) => {
    await repo().delete(id);
  }
};
