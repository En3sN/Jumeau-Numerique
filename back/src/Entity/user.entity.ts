import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'security', name: 'users_table' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nom' })
  nom: string;

  @Column({ name: 'pseudo' })
  pseudo: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'tel', nullable: true })
  tel: string;

  @Column({ name: 'pwd' })
  pwd: string;

  @Column({ name: 'adresse', nullable: true })
  adresse: string;

  @Column({ name: 'cp', nullable: true })
  cp: string;

  @Column({ name: 'commune', nullable: true })
  commune: string;

  @Column({ name: 'roles', type: 'text', array: true })
  roles: string[];

  @Column({ name: 'activated', default: false })
  activated: boolean;

  @Column({ name: 'statut', default: 'Particulier' })
  statut: string;

  @Column({ name: 'organisation', nullable: true })
  organisation: number;
}
