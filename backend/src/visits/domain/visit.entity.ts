import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum VisitStatus {
  PENDIENTE = 'PENDIENTE',
  MODIFICADA = 'MODIFICADA',
  EN_OFERTA = 'EN_OFERTA',
  CONCERTADA = 'CONCERTADA',
  REALIZADA = 'REALIZADA',
  BLOQUEADA = 'BLOQUEADA',
  CANCELADA = 'CANCELADA',
  NO_SE_PRESENTA = 'NO_SE_PRESENTA',
}

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ref!: string;

  @Column()
  inmueble!: string;

  @Column({ nullable: true })
  cliente?: string;

  @Column({ nullable: true })
  clienteEmail?: string;

  @Column()
  comercial!: string;

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
  publicId?: string;

  @Column({ nullable: true })
  adminId?: string;
}