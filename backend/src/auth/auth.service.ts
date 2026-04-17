import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'wincontrol_secret';

export const authService = {
  register: async (data: any) => {
    const { name, email, password, role } = data;

    if (!name || !email || !password || !role) {
      throw new Error('Missing required fields');
    }

    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) throw new Error('User already exists');

    const newUser = await authRepository.create({ name, email, password, role });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user: newUser };
  },

  login: async (email: string, password: string, role: string) => {
    if (!email || !password || !role) throw new Error('Missing credentials');

    const user = await authRepository.findByEmail(email);
    if (!user) throw new Error('User not found');
    if (user.password !== password || user.role !== role) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user };
  }
};