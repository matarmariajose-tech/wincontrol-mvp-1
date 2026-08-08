import { AsyncLocalStorage } from 'node:async_hooks';

export type EmpresaId = number;
export type UserId = number;

export enum Rol {
  Master = 'MASTER',
  Admin = 'ADMIN',
  Comercial = 'COMERCIAL',
}

export enum TenantScope {
  Global = 'GLOBAL',
  Empresa = 'EMPRESA',
}

export interface TenantPrincipal {
  readonly userId: UserId;
  readonly roles: readonly Rol[];
  readonly empresaId: EmpresaId | null;
  readonly scope: TenantScope;
}

export class TenantContextMissingError extends Error {
  constructor() {
    super('Operación fuera de un contexto de tenant');
    this.name = 'TenantContextMissingError';
  }
}

const storage = new AsyncLocalStorage<TenantPrincipal>();

export const TenantContext = {
  run<T>(principal: TenantPrincipal, fn: () => T): T {
    return storage.run(principal, fn);
  },

  current(): TenantPrincipal | undefined {
    return storage.getStore();
  },

  require(): TenantPrincipal {
    const principal = storage.getStore();
    if (!principal) throw new TenantContextMissingError();
    return principal;
  },

  requireEmpresaId(): EmpresaId {
    const { empresaId } = TenantContext.require();
    if (empresaId === null) throw new TenantContextMissingError();
    return empresaId;
  },

  hasRole(rol: Rol): boolean {
    return TenantContext.current()?.roles.includes(rol) ?? false;
  },
};

export function principalFor(
  userId: UserId,
  roles: readonly Rol[],
  empresaId: EmpresaId | null,
): TenantPrincipal {
  const isMaster = roles.includes(Rol.Master);
  return {
    userId,
    roles,
    empresaId: isMaster ? null : empresaId,
    scope: isMaster ? TenantScope.Global : TenantScope.Empresa,
  };
}

export function systemPrincipal(empresaId: EmpresaId): TenantPrincipal {
  return {
    userId: 0,
    roles: [Rol.Admin],
    empresaId,
    scope: TenantScope.Empresa,
  };
}
