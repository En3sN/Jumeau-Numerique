import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'planning', name: 'type_creneau' })
export class TypeCreneau {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enumName: 'type_creneau', 
    enum: ['recurrent', 'ponctuel', 'exception'],
  })
  type_creneau: string;
}
