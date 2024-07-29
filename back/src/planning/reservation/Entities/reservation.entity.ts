import { Utilisateur } from 'src/security/utilisateur/Entities/utilisateur.entity';
import { Service } from 'src/services/service/Entities/service.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity({ schema: 'planning', name: 'reservation' })
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  service_id: number;

  @Column({ type: 'timestamp' })
  date_resa: Date;

  @Column({ type: 'enum', enum: ['Demande', 'Accepte', 'Refuse'], default: 'Demande' })
  status: string;

  @ManyToOne(() => Utilisateur)
  @JoinColumn({ name: 'user_id' })
  user: Utilisateur;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
