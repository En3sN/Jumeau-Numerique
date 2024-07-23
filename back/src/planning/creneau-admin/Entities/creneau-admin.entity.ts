import { Utilisateur } from 'src/security/utilisateur/Entities/utilisateur.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('creneau_admin', { schema: 'planning' })
export class CreneauAdmin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'timestamp' })
  date_debut: Date;

  @Column({ type: 'timestamp' })
  date_fin: Date;

  @Column({ type: 'varchar' })
  type_creneau: string;

  @Column()
  activite_id: number;

  @ManyToOne(() => Utilisateur)
  @JoinColumn({ name: 'user_id' })
  user: Utilisateur;
}
