import { AppDataSource } from '../config/data-source';
import { Property } from './property.entity';

const repo = () => AppDataSource.getRepository(Property);

export const propertyService = {
  getAll: async (): Promise<Property[]> => {
    return await repo().find();
  },

  getById: async (id: number): Promise<Property | null> => {
    return await repo().findOne({ where: { id } });
  },

  getByComercial: async (comercialId: string): Promise<Property[]> => {
    return await repo().find({ where: { comercialId } });
  },

  assignComercial: async (id: number, comercialId: string): Promise<Property | null> => {
    await repo().update(id, { comercialId });
    return await repo().findOne({ where: { id } });
  },
};
