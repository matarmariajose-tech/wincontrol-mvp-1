import { AppDataSource } from '../config/data-source';
import { Comercial } from './comercial.entity';
import { authService } from '../auth/auth.service';
import { Rol, TenantContext } from '../shared/tenant/tenant-context';

const repo = () => AppDataSource.getRepository(Comercial);

const PUBLIC_FIELDS: (keyof Comercial)[] = [
  'id',
  'nombre',
  'email',
  'telefono',
  'adminId',
  'userId',
];

export const comercialService = {
  getAll: async (): Promise<Comercial[]> => {
    return repo().find({
      where: { empresaId: TenantContext.requireEmpresaId() },
      select: PUBLIC_FIELDS,
    });
  },

  getById: async (id: string): Promise<Comercial | null> => {
    return repo().findOne({
      where: { id, empresaId: TenantContext.requireEmpresaId() },
      select: PUBLIC_FIELDS,
    });
  },

  create: async (data: Partial<Comercial> & { password?: string }): Promise<Comercial> => {
    if (!data.nombre) throw new Error('nombre es requerido');

    const empresaId = TenantContext.requireEmpresaId();
    let userId: number | undefined;

    if (data.email && data.password) {
      const newUser = await authService.crearUsuario({
        name: data.nombre,
        email: data.email,
        password: data.password,
        roles: [Rol.Comercial],
        empresaId,
      });
      userId = newUser.id;
    }

    const { password, ...comercialData } = data;
    return repo().save(repo().create({ ...comercialData, userId, empresaId }));
  },

  update: async (id: string, data: Partial<Comercial>): Promise<Comercial | null> => {
    const empresaId = TenantContext.requireEmpresaId();
    const { empresaId: _ignorado, ...cambios } = data;
    await repo().update({ id, empresaId }, cambios);
    return repo().findOne({ where: { id, empresaId }, select: PUBLIC_FIELDS });
  },

  remove: async (id: string): Promise<void> => {
    await repo().delete({ id, empresaId: TenantContext.requireEmpresaId() });
  },
};
