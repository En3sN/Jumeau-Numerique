import { Service } from 'src/services/service/Entities/service.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('planning.creneau_service')
export class CreneauService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  service_id: number;

  @Column({ type: 'timestamp' })
  date_debut: Date;

  @Column({ type: 'timestamp' })
  date_fin: Date;

  @Column({ type: 'varchar', length: 50 })
  type_creneau: string;

  @ManyToOne(() => Service, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
