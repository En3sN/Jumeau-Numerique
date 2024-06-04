import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'security', name: 'users_table' })
export class Utilisateur {
  @PrimaryGeneratedColumn()
  id:number;

  @Column({ name: 'nom', type: 'text' })
  nom:string;

  @Column({ name: 'pseudo', type: 'text' })
  pseudo:string;

  @Column({ name: 'email', type: 'text' })
  email:string;

  @Column({ name: 'pwd', type: 'text' })
  pwd:string;

  @Column({ name: 'tel', type: 'text' , nullable: true , default: null})
  tel:string | null;

  @Column({ name: 'adresse', type: 'text' , nullable: true , default: null})
  adresse:string | null;

  @Column({ name: 'cp', type: 'text' , nullable: true , default: null})
  cp:string | null;

  @Column({ name: 'commune', type: 'text' , nullable: true , default: null})
  commune:string| null;
  
  @Column({name: 'roles', type: 'text', array: true, default: []})
  roles:string[];

  @Column({ name: 'statut', default: 'Particulier' })
  statut:string;

  @Column({ name: 'organisation', nullable: true, default: null })
  organisation: string;

  @Column({ name: 'activated', default: false, type: 'boolean' })
  activated:boolean;

  @Column({name: 'salt',type: 'text'})
  salt: string; 
}
