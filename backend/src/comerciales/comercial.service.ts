import { AppDataSource } from '../config/data-source';
import { Comercial } from './comercial.entity';
import { authService } from '../auth/auth.service';

const repo = () => AppDataSource.getRepository(Comercial);

const PUBLIC_FIELDS: (keyof Comercial)[] = ['id', 'nombre', 'email', 'telefono', 'adminId', 'userId'];

export const comercialService = {
  getAll: async (): Promise<Comercial[]> => {
    return await repo().find({ select: PUBLIC_FIELDS });
  },

  getById: async (id: string): Promise<Comercial | null> => {
    return await repo().findOne({ where: { id }, select: PUBLIC_FIELDS });
  },

  create: async (data: Partial<Comercial> & { password?: string }): Promise<Comercial> => {
    if (!data.nombre) throw new Error('nombre es requerido');

    let userId: number | undefined;
    if (data.email && data.password) {
      const newUser = await authService.registerAsRole(
        { name: data.nombre, email: data.email, password: data.password },
        'comercial'
      );
      userId = newUser.id;
    }

    const { password, ...comercialData } = data;
    return await repo().save(repo().create({ ...comercialData, userId }));
  },

  update: async (id: string, data: Partial<Comercial>): Promise<Comercial | null> => {
    await repo().update(id, data);
    return await repo().findOne({ where: { id }, select: PUBLIC_FIELDS });
  },

  remove: async (id: string): Promise<void> => {
    await repo().delete(id);
  },
};
