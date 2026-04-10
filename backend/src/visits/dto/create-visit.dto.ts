import { VisitStatus } from '../domain/visit.entity';

export interface CreateVisitDto {
  ref: string;
  cliente: string;
  inmueble: string;
  comercial: string;
  fecha: string;
  hora: string;
  estado: VisitStatus;

  phone?: string;
  email?: string;
  source?: string;
  questionnaire?: boolean;
  offer?: string | null;
  sourceUrl?: string | null;
  createdAt?: string;
  publicId?: string;
}