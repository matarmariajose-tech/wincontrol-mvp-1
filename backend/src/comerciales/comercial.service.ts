import { AppDataSource } from '../config/data-source';
import { Comercial } from './comercial.entity';

const repo = () => AppDataSource.getRepository(Comercial);

export const comercialService = {
  getAll: async (): Promise<Comercial[]> => {
    return await repo().find();
  },

  getById: async (id: string): Promise<Comercial | null> => {
    return await repo().findOne({ where: { id } });
  },

  create: async (data: Partial<Comercial>): Promise<Comercial> => {
    if (!data.nombre) throw new Error('nombre es requerido');
    return await repo().save(repo().create(data));
  },

  update: async (id: string, data: Partial<Comercial>): Promise<Comercial | null> => {
    await repo().update(id, data);
    return await repo().findOne({ where: { id } });
  },

  remove: async (id: string): Promise<void> => {
    await repo().delete(id);
  },
};
