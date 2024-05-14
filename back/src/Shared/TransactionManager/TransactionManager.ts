import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionManager {
  constructor(private dataSource: DataSource) {}

  async executeInTransaction<T>(
    callback: (manager: EntityManager) => Promise<T>,
    sessionCode?: string 
  ): Promise<T> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      try {
        // Si un code de session est fourni, définir la variable de session correspondante
        if (sessionCode) {
          const txId = await transactionalEntityManager.query('SELECT txid_current()');
          console.log("Transaction ID for session code", sessionCode, ":", txId[0].txid_current);
          await transactionalEntityManager.query(`SET LOCAL jumeau.security_code = '${sessionCode}'`);
        }

        // Exécute la fonction de rappel qui réalise les opérations de la transaction
        const result = await callback(transactionalEntityManager);
        return result;
      } catch (error) {
        // En cas d'erreur, logger l'erreur et effectuer un rollback explicitement
        console.error('Transaction failed with error:', error);
        await transactionalEntityManager.query('ROLLBACK'); 
        throw error; 
      } finally {
        // Réinitialiser la variable de session après la transaction pour nettoyer l'état
        await transactionalEntityManager.query('RESET jumeau.security_code');
        console.log("Security code reset successfully.");
      }
    });
  }
}
