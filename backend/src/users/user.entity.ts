import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';
import { Rol } from '../shared/tenant/tenant-context';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'text', array: true })
  roles!: Rol[];

  @Column({ name: 'empresa_id', type: 'integer', nullable: true })
  empresaId!: number | null;

  @ManyToOne(() => Empresa, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa!: Empresa | null;

  @Column({ default: true })
  active!: boolean;
}
