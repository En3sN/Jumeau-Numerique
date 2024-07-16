import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Document } from 'src/services/files/Entities/document.entity';

@Entity('service', { schema: 'services' })
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activite_id: number;

  @Column({ type: 'text' })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  type: string;

  @Column({ type: 'bytea', nullable: true })
  logo: Buffer;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: false })
  validation: boolean;

  @Column({ type: 'text', nullable: true })
  template: string;

  @Column({ type: 'boolean', default: false })
  is_pack: boolean;

  @OneToMany(() => Document, document => document.service)
  documents: Document[];
}
