import { AppDataSource } from '../config/data-source';
import { Property } from './property.entity';
import { TenantContext } from '../shared/tenant/tenant-context';

const repo = () => AppDataSource.getRepository(Property);
const empresa = () => TenantContext.requireEmpresaId();

export const propertyService = {
  getAll: async (): Promise<Property[]> => {
    return repo().find({ where: { empresaId: empresa() } });
  },

  getById: async (id: number): Promise<Property | null> => {
    return repo().findOne({ where: { id, empresaId: empresa() } });
  },

  getByComercial: async (comercialId: string): Promise<Property[]> => {
    return repo().find({ where: { comercialId, empresaId: empresa() } });
  },

  assignComercial: async (id: number, comercialId: string): Promise<Property | null> => {
    const empresaId = empresa();
    await repo().update({ id, empresaId }, { comercialId });
    return repo().findOne({ where: { id, empresaId } });
  },
};
