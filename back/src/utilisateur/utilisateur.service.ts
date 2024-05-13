import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';

@Injectable()
export class UtilisateurService {
  constructor(private transactionManager: TransactionManager) {}

  async findAllUserInfo(sessionCode: string): Promise<any> {
    // Passer sessionCode au TransactionManager
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.query(`SELECT id, nom, pseudo, email, tel, pwd, adresse, cp, commune, statut, organisation, infos FROM security.user_all_my_infos`);
    }, sessionCode);
  }
}
