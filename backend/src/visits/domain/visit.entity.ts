export type VisitStatus =
  | 'PENDIENTE'
  | 'MODIFICADA'
  | 'EN_OFERTA'
  | 'REALIZADA'
  | 'BLOQUEADA'
  | 'CANCELADA'
  | 'NO_SE_PRESENTA';

export interface Visit {
  id: string;
  ref: string;
  cliente: string;
  inmueble: string;
  comercial: string;
  fecha: string;
  hora: string;
  estado: VisitStatus;
}