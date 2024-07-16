import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Activite } from 'src/services/activite/Entities/activite.entity';
import { Service } from 'src/services/service/Entities/service.entity';

@Entity('documents', { schema: 'services' })
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Activite, activite => activite.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activite_id' })
  activite: Activite;

  @ManyToOne(() => Service, service => service.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'text' })
  titre: string;

  @Column({ type: 'text' })
  mimetype: string;

  @Column({ type: 'text' })
  iv: string;

  @Column({ type: 'bytea' })
  encrypted_data: Buffer;
}
