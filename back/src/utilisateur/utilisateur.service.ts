import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateUtilisateurDto } from './DTO/create-utilisateur.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UpdateUtilisateurDto } from './DTO/update-utilisateur-infos.dto';
import * as bcrypt from 'bcrypt';
import { Utilisateur } from './Entities/utilisateur.entity';

@Injectable()
export class UtilisateurService {
  constructor(
    private transactionManager: TransactionManager,
    @InjectRepository(Utilisateur)
    private userRepository: Repository<Utilisateur>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async findAllUserInfo(sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.query(`SELECT id, nom, pseudo, email, tel, pwd, adresse, cp, commune, roles, activated FROM security.user_my_infos`);
    }, sessionCode);
  }

  async createUser(createUtilisateurDto: CreateUtilisateurDto): Promise<any> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUtilisateurDto.pwd, saltRounds);

    const query = `
      INSERT INTO security.user_my_infos (
        nom, pseudo, email, tel, pwd, adresse, cp, commune, roles, activated, statut, organisation
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *;
    `;

    const values = [
      createUtilisateurDto.nom,
      createUtilisateurDto.pseudo,
      createUtilisateurDto.email,
      createUtilisateurDto.tel || null,
      hashedPassword, 
      createUtilisateurDto.adresse || null,
      createUtilisateurDto.cp || null,
      createUtilisateurDto.commune || null,
      createUtilisateurDto.roles || null,
      createUtilisateurDto.activated ?? false,
      createUtilisateurDto.statut || 'Particulier',
      createUtilisateurDto.organisation || null
    ];

    const result = await this.entityManager.query(query, values);
    return result[0]; 
  }

  async updateUser(id: number, updateUtilisateurDto: UpdateUtilisateurDto, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const setClause = Object.entries(updateUtilisateurDto)
        .map(([key, value], index) => `${key} = $${index + 1}`)
        .join(', ');

      const values = Object.values(updateUtilisateurDto);

      const query = `
        UPDATE security.user_my_infos
        SET ${setClause}
        WHERE id = ${id}
        RETURNING *;
      `;

      const result = await manager.query(query, values);
      return result[0]; 
    }, sessionCode);
  }
}
