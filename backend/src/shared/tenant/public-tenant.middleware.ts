import { RequestHandler } from 'express';
import { AppDataSource } from '../../config/data-source';
import { Lead } from '../../leads/domain/lead.entity';
import { Property } from '../../properties/property.entity';
import { Comercial } from '../../comerciales/comercial.entity';
import { TenantContext, systemPrincipal } from './tenant-context';

type Fuente = 'lead' | 'property' | 'comercial';

async function empresaDe(fuente: Fuente, id: string): Promise<number | null> {
  if (!id) return null;

  if (fuente === 'lead') {
    const lead = await AppDataSource.getRepository(Lead).findOne({
      where: { id },
      select: { empresaId: true },
    });
    return lead?.empresaId ?? null;
  }

  if (fuente === 'property') {
    const numeric = Number(id);
    if (!Number.isInteger(numeric)) return null;
    const property = await AppDataSource.getRepository(Property).findOne({
      where: { id: numeric },
      select: { empresaId: true },
    });
    return property?.empresaId ?? null;
  }

  const comercial = await AppDataSource.getRepository(Comercial).findOne({
    where: { id },
    select: { empresaId: true },
  });
  return comercial?.empresaId ?? null;
}

export function tenantDesdeParam(fuente: Fuente, param = 'id'): RequestHandler {
  return async (req, res, next) => {
    const empresaId = await empresaDe(fuente, String(req.params[param] ?? ''));

    if (!empresaId) {
      res.status(404).json({ message: 'Recurso no encontrado' });
      return;
    }

    TenantContext.run(systemPrincipal(empresaId), () => next());
  };
}

export function tenantDesdeBody(campos: Partial<Record<Fuente, string>>): RequestHandler {
  return async (req, res, next) => {
    for (const [fuente, campo] of Object.entries(campos) as [Fuente, string][]) {
      const valor = req.body?.[campo];
      if (!valor) continue;

      const empresaId = await empresaDe(fuente, String(valor));
      if (empresaId) {
        TenantContext.run(systemPrincipal(empresaId), () => next());
        return;
      }
    }

    res.status(400).json({ message: 'No se pudo determinar la empresa del recurso' });
  };
}
