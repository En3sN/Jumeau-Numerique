import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activite', { schema: 'services' })
export class Activite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ type: 'text', nullable: true })
  reference: string;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text' })
  domaine: string;

  @Column({ type: 'text', array: true, nullable: true })
  documents: string[];

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column()
  organisation: number;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  role: string;

  @Column({ type: 'json', nullable: true })
  infos: any;

  @Column({ type: 'boolean', default: false })
  rdv: boolean;

  @Column({ type: 'text', nullable: true })
  adresse: string;

  @Column({ type: 'text', nullable: true })
  cp: string;

  @Column({ type: 'text', nullable: true })
  commune: string;

  @Column({ type: 'integer', nullable: true })
  contact: number;

  @Column({ type: 'text', nullable: true })
  mail_rdv: string;

  @Column({ type: 'json', nullable: true })
  prerequis: any;

  @Column({ type: 'json', default: { tel: 'false', adresse: 'false', cp: 'false', commune: 'false', organisation_nom: 'false' } })
  user_infos: any;

  @Column({ type: 'real', nullable: true })
  rdv_duree: number;
}
