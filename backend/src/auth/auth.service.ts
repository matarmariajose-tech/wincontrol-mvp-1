import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository, normalizeEmail } from './auth.repository';
import { User } from '../users/user.entity';
import { EmpresaId, Rol, TenantContext } from '../shared/tenant/tenant-context';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 12;
const TOKEN_TTL = '7d';
const MIN_PASSWORD_LENGTH = 8;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido');
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface TokenPayload {
  id: number;
  name: string;
  roles: Rol[];
  empresaId: EmpresaId | null;
}

export interface SesionCreada {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles: Rol[];
    empresaId: EmpresaId | null;
  };
}

export interface AltaUsuario {
  name: string;
  email: string;
  password: string;
  roles: Rol[];
  empresaId?: EmpresaId;
}

const ROLES_VALIDOS = new Set<string>(Object.values(Rol));

function firmarToken(user: User): string {
  const payload: TokenPayload = {
    id: user.id,
    name: user.name,
    roles: user.roles,
    empresaId: user.empresaId,
  };
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: TOKEN_TTL });
}

function serializar(user: User): SesionCreada['user'] {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    empresaId: user.empresaId,
  };
}

function validarRoles(roles: Rol[]): void {
  if (!roles?.length) throw new AuthError('Debe indicar al menos un rol', 400);
  const invalido = roles.find((rol) => !ROLES_VALIDOS.has(rol));
  if (invalido) throw new AuthError(`Rol inválido: ${invalido}`, 400);
}

function resolverEmpresaDestino(roles: Rol[], solicitada?: EmpresaId): EmpresaId | null {
  const principal = TenantContext.require();

  if (roles.includes(Rol.Master)) {
    if (!principal.roles.includes(Rol.Master)) {
      throw new AuthError('Solo un MASTER puede crear otro MASTER', 403);
    }
    return null;
  }

  if (principal.roles.includes(Rol.Master)) {
    if (!solicitada) throw new AuthError('Debe indicar la empresa destino', 400);
    return solicitada;
  }

  if (solicitada && solicitada !== principal.empresaId) {
    throw new AuthError('No puede crear usuarios en otra empresa', 403);
  }

  return TenantContext.requireEmpresaId();
}

export const authService = {
  async login(email: string, password: string): Promise<SesionCreada> {
    if (!email || !password) throw new AuthError('Faltan credenciales', 400);

    const user = await authRepository.findByEmail(email);
    const hash = user?.password ?? '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const valido = await bcrypt.compare(password, hash);

    if (!user || !valido) throw new AuthError('Credenciales inválidas', 401);
    if (!user.active) throw new AuthError('Cuenta deshabilitada', 403);

    return { token: firmarToken(user), user: serializar(user) };
  },

  async crearUsuario(data: AltaUsuario): Promise<SesionCreada['user']> {
    const { name, email, password, roles } = data;

    if (!name?.trim()) throw new AuthError('El nombre es obligatorio', 400);
    if (!email?.trim()) throw new AuthError('El email es obligatorio', 400);
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`, 400);
    }

    validarRoles(roles);
    const empresaId = resolverEmpresaDestino(roles, data.empresaId);

    const existente = await authRepository.findByEmail(email);
    if (existente) throw new AuthError('Ya existe un usuario con ese email', 409);

    const user = await authRepository.create({
      name: name.trim(),
      email: normalizeEmail(email),
      password: await bcrypt.hash(password, SALT_ROUNDS),
      roles,
      empresaId,
    });

    return serializar(user);
  },

  async cambiarPassword(userId: number, actual: string, nueva: string): Promise<void> {
    if (nueva.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`, 400);
    }

    const user = await authRepository.findById(userId);
    if (!user) throw new AuthError('Usuario inexistente', 404);

    const valido = await bcrypt.compare(actual, user.password);
    if (!valido) throw new AuthError('La contraseña actual no coincide', 401);

    await authRepository.updatePassword(userId, await bcrypt.hash(nueva, SALT_ROUNDS));
  },
};
