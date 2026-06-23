import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id!: number;

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

  @Column()
  source!: string;
}