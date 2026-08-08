import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Rol, TenantContext, principalFor } from './tenant-context';

interface AuthenticatedUser {
  id: number;
  roles?: Rol[];
  empresaId?: number | null;
}

export const withTenantContext: RequestHandler = (req, res, next) => {
  const user = (req as Request & { user?: AuthenticatedUser }).user;

  if (!user) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }

  const roles = user.roles ?? [];
  if (roles.length === 0) {
    res.status(403).json({ message: 'Usuario sin rol asignado' });
    return;
  }

  const isMaster = roles.includes(Rol.Master);
  if (!isMaster && !user.empresaId) {
    res.status(403).json({ message: 'Usuario sin empresa asignada' });
    return;
  }

  TenantContext.run(principalFor(user.id, roles, user.empresaId ?? null), () => next());
};

export function requireRoles(...allowed: Rol[]): RequestHandler {
  return (_req: Request, res: Response, next: NextFunction) => {
    const principal = TenantContext.current();
    if (!principal) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const granted =
      principal.roles.includes(Rol.Master) ||
      principal.roles.some((rol) => allowed.includes(rol));
    if (!granted) {
      res.status(403).json({ message: 'Permisos insuficientes' });
      return;
    }
    next();
  };
}

export const requireMaster = requireRoles(Rol.Master);
export const requireAdmin = requireRoles(Rol.Admin);
