import { Utilisateur } from 'src/security/utilisateur/Entities/utilisateur.entity';
import { Activite } from 'src/services/activite/Entities/activite.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity({ schema: 'planning', name: 'rdv' })
export class Rdv {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  activite_id: number;

  @Column({ type: 'timestamp' })
  date_rdv: Date;

  @Column({ type: 'enum', enum: ['rdv_simple', 'rdv_complexe'], default: 'rdv_simple' })
  type_rdv: string;

  @Column({ type: 'enum', enum: ['Demande', 'Confirmé', 'Annulé'], default: 'Demande' })
  status: string;

  @ManyToOne(() => Utilisateur)
  @JoinColumn({ name: 'user_id' })
  user: Utilisateur;

  @ManyToOne(() => Activite)
  @JoinColumn({ name: 'activite_id' })
  activite: Activite;
}
