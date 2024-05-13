import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateUtilisateurDto } from './DTO/Create-utilisateur.dto';

@Injectable()
export class UtilisateurService {
  constructor(private transactionManager: TransactionManager) {}

  async findAllUserInfo(sessionCode: string): Promise<any> {
    // Passer sessionCode au TransactionManager
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.query(`SELECT id, nom, pseudo, email, tel, pwd, adresse, cp, commune, roles, activated FROM security.user_my_infos`);
    }, sessionCode);
  }

  async createUser(createUtilisateurDto: CreateUtilisateurDto, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const { nom, pseudo, email, tel, pwd, adresse, cp, commune, roles, activated, statut, organisation } = createUtilisateurDto;
      const query = `
        INSERT INTO security.users_table (nom, pseudo, email, tel, pwd, adresse, cp, commune, roles, activated, statut, organisation)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, nom, pseudo, email, tel, adresse, cp, commune, roles, activated, statut, organisation;
      `;
      const params = [nom, pseudo, email, tel, pwd, adresse, cp, commune, roles, activated, statut, organisation];
      const result = await manager.query(query, params);
      return result.rows[0];
    }, sessionCode);
  }
}