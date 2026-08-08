import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 60 })
  slug!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'email_remitente', type: 'varchar', length: 160, nullable: true })
  emailRemitente!: string | null;

  @Column({ name: 'color_primario', type: 'varchar', length: 9, default: '#2563eb' })
  colorPrimario!: string;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
