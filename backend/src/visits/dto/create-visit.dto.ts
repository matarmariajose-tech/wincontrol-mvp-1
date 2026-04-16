// dto/create-visit.dto.ts
import { VisitStatus } from '../domain/visit.entity';
 
export interface CreateVisitDto {
  ref: string;
  inmueble: string;
  clienteId: string;
  comercial: string;
  fecha: string;
  hora: string;
  estado: VisitStatus;
  publicId?: string;
}