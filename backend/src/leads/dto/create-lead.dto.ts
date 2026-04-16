import { LeadStatus } from '../domain/lead.entity';

export interface CreateLeadDto {
  ref: string;
  cliente: string;
  inmueble: string;
  comercial: string;
  fecha: string;
  hora: string;
  estado: LeadStatus;

  phone?: string;
  email?: string;
  source?: string;
  questionnaire?: boolean;
  offer?: string | null;
  sourceUrl?: string | null;
  createdAt?: string;
  publicId?: string;
}