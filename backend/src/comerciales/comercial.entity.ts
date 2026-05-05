import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('comerciales')
export class Comercial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;
}