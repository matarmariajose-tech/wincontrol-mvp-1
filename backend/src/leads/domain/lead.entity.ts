export type LeadStatus =
  | 'PENDIENTE'
  | 'MODIFICADA'
  | 'EN_OFERTA'
  | 'CONCERTADA'
  | 'REALIZADA'
  | 'BLOQUEADA'
  | 'CANCELADA'
  | 'NO_SE_PRESENTA';

import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Lead {
  @PrimaryColumn()
  id!: string;

  @Column()
  ref!: string;

  @Column()
  cliente!: string;

  @Column()
  inmueble!: string;

  @Column()
  comercial!: string;

  @Column()
  fecha!: string;

  @Column()
  hora!: string;

  @Column()
  estado!: LeadStatus;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ default: false })
  questionnaire!: boolean;

  @Column({ type: "text", nullable: true, default: null })
  offer?: string | null;

  @Column({ type: "text", nullable: true, default: null })
  sourceUrl?: string | null;

  @Column({ nullable: true })
  publicId?: string;

  @Column()
  createdAt!: string;

  @Column({ nullable: false })
  adminId!: string;
}