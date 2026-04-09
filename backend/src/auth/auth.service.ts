import { authRepository } from './auth.repository';

export const authService = {
  register: async (data: any) => {
    const { name, email, password, role } = data;

    if (!name || !email || !password || !role) {
      throw new Error('Missing required fields');
    }

    const existingUser = await authRepository.findByEmail(email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = await authRepository.create({
      name,
      email,
      password,
      role
    });

    return {
      token: 'fake-jwt-token',
      user: newUser
    };
  },

  login: async (email: string, password: string, role: string) => {
    if (!email || !password || !role) {
      throw new Error('Missing credentials');
    }

    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== password || user.role !== role) {
      throw new Error('Invalid credentials');
    }

    return {
      token: 'fake-jwt-token',
      user
    };
  }
};