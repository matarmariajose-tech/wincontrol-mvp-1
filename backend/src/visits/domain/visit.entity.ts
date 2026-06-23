import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum VisitStatus {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  REALIZADA = 'REALIZADA',
  CANCELADA = 'CANCELADA',
  NO_SE_PRESENTA = 'NO_SE_PRESENTA',
  MODIFICADA = 'MODIFICADA',
}

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  leadId?: string;

  @Column({ nullable: true })
  adminId?: string;

  @Column({ nullable: true })
  comercialId?: string;

  @Column({ nullable: true })
  propertyId?: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'time' })
  hora!: string;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.PENDIENTE,
  })
  estado!: VisitStatus;

  @Column({ nullable: true })
  notas?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
