import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum LeadState {
  LEAD_NUEVO = 'LEAD_NUEVO',
  VISITA_AGENDADA = 'VISITA_AGENDADA',
  VISITA_CANCELADA = 'VISITA_CANCELADA',
  VISITA_MODIFICADA = 'VISITA_MODIFICADA',
  PENDIENTE = 'PENDIENTE',
  SEGUIMIENTO = 'SEGUIMIENTO',
  INTENCION_OFERTA = 'INTENCION_OFERTA',
  OFERTA_REALIZADA = 'OFERTA_REALIZADA',
  VENDIDO = 'VENDIDO',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  adminId!: string;

  @Column({ nullable: true })
  propertyId?: number;

  @Column({ nullable: true })
  comercialId?: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  sourceUrl?: string;

  @Column({
    type: 'enum',
    enum: LeadState,
    default: LeadState.LEAD_NUEVO,
  })
  estado!: LeadState;

  @CreateDateColumn()
  createdAt!: Date;
}
