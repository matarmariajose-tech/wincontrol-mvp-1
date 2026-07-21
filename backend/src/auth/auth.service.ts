import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authRepository } from './auth.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'wincontrol_secret';
const SALT_ROUNDS = 10;
const SELF_REGISTER_ROLES = ['comercial'];

export const authService = {
  register: async (data: any) => {
    const { name, email, password, role } = data;
    if (!name || !email || !password || !role) throw new Error('Missing required fields');
    if (!SELF_REGISTER_ROLES.includes(role)) throw new Error('Role not allowed for self-registration');

    const existing = await authRepository.findByEmailAndRole(email, role);
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await authRepository.create({ name, email, password: hashedPassword, role });

    const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } };
  },

  registerAsRole: async (data: any, role: string) => {
    const { name, email, password } = data;
    if (!name || !email || !password) throw new Error('Missing required fields');

    const existing = await authRepository.findByEmailAndRole(email, role);
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await authRepository.create({ name, email, password: hashedPassword, role });

    return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  },

  login: async (email: string, password: string, role: string) => {
    if (!email || !password || !role) throw new Error('Missing credentials');

    const user = await authRepository.findByEmailAndRole(email, role);
    if (!user) throw new Error('Invalid credentials');
    if (user.active === false) throw new Error('Account disabled');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
};
