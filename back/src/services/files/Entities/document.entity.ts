import { Activite } from 'src/services/activite/Entities/activite.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('documents', { schema: 'services' })
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Activite, activite => activite.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activite_id' })
  activite: Activite;

  @Column({ type: 'text' })
  titre: string;

  @Column({ type: 'text' })
  mimetype: string;

  @Column({ type: 'text' })
  iv: string;

  @Column({ type: 'bytea' })
  encrypted_data: Buffer;
}
