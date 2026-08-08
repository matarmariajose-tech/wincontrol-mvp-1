import { AppDataSource } from '../config/data-source';
import { User } from '../users/user.entity';
import { Rol } from '../shared/tenant/tenant-context';

export interface NuevoUsuario {
  name: string;
  email: string;
  password: string;
  roles: Rol[];
  empresaId: number | null;
}

const repository = () => AppDataSource.getRepository(User);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const authRepository = {
  findByEmail(email: string): Promise<User | null> {
    return repository().findOne({ where: { email: normalizeEmail(email) } });
  },

  findById(id: number): Promise<User | null> {
    return repository().findOne({ where: { id } });
  },

  create(data: NuevoUsuario): Promise<User> {
    const user = repository().create({ ...data, email: normalizeEmail(data.email) });
    return repository().save(user);
  },

  updatePassword(id: number, passwordHash: string): Promise<unknown> {
    return repository().update({ id }, { password: passwordHash });
  },

  listByEmpresa(empresaId: number): Promise<User[]> {
    return repository().find({ where: { empresaId }, order: { id: 'ASC' } });
  },
};
