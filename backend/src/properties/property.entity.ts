import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'empresa_id', type: 'integer' })
  empresaId!: number;

  @Column({ nullable: true })
  title!: string;

  @Column({ nullable: true })
  price!: number;

  @Column({ nullable: true })
  bedrooms!: number;

  @Column({ nullable: true })
  sqm!: number;

  @Column({ nullable: true })
  floor!: string;

  @Column({ nullable: true })
  sourceUrl!: string;

  @Column({ nullable: true })
  source!: string;

  @Column({ nullable: true })
  adminId?: string;

  @Column({ nullable: true })
  comercialId?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  category!: number;
}
