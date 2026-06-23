import { LeadState } from '../domain/lead.entity';

export interface CreateLeadDto {
  adminId: string;
  propertyId?: number;
  comercialId?: string;
  nombre: string;
  email?: string;
  phone?: string;
  source?: string;
  sourceUrl?: string;
  estado?: LeadState;
}
