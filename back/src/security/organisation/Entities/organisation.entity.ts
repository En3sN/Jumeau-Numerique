import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'security', name: 'organisation' })
export class Organisation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nom: string;

  @Column({ type: 'text' })
  activite: string;

  @Column({ type: 'text', nullable: true })
  tel: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  web: string;

  @Column({ type: 'text', nullable: true })
  siret: string;

  @Column({ type: 'text', nullable: true })
  adresse: string;

  @Column({ type: 'text', nullable: true })
  cp: string;

  @Column({ type: 'text', nullable: true })
  commune: string;

  @Column({ type: 'text', nullable: true })
  descriptif: string;

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  @Column({ type: 'bytea', nullable: true })
  logo: Buffer;

  @Column({ type: 'text', nullable: true })
  template: string;
}
