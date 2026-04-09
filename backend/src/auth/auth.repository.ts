import { AppDataSource } from '../config/data-source';
import { User } from '../users/user.entity';

const repo = AppDataSource.getRepository(User);

export const authRepository = {
  create: (data: Partial<User>) => repo.save(data),

  findByEmail: (email: string) => repo.findOneBy({ email })
};