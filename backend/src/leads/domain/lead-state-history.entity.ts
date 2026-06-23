import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('lead_state_history')
export class LeadStateHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  leadId!: string;

  @Column({ nullable: true })
  fromState?: string;

  @Column()
  toState!: string;

  @Column()
  changedBy!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
