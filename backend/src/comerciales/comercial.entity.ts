import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('comerciales')
export class Comercial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  telefono?: string;
}