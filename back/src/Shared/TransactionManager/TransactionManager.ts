import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionManager {
  constructor(private dataSource: DataSource) { }

  async executeInTransaction<T>(callback: (manager: EntityManager) => Promise<T>, userId: string): Promise<T> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // Récupération et affichage du numéro de la transaction
      const txId = await transactionalEntityManager.query('SELECT txid_current()');
      console.log("Transaction ID:", txId[0].txid_current);

      await transactionalEntityManager.query(`SET LOCAL jumeau.security_code = '${userId}'`);

      try {
        const result = await callback(transactionalEntityManager);
        return result;
      } finally {
        // Réinitialisation de la variable de session après la transaction
        await transactionalEntityManager.query('RESET jumeau.security_code');
      }
    });
  }
}
