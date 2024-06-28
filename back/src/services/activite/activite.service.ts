import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Activite } from './Entities/activite.entity';
import { CreateActiviteDto } from './DTO/create-activite.dto';
import { UpdateActiviteDto } from './DTO/update-activite.dto';

@Injectable()
export class ActiviteService {
  private readonly logger = new Logger(ActiviteService.name);

  constructor(
    private transactionManager: TransactionManager,
    private readonly entityManager: EntityManager
  ) {}

  async create(createActiviteDto: CreateActiviteDto): Promise<Activite> {
    const activite = this.entityManager.create(Activite, createActiviteDto);
    return this.entityManager.save(activite);
  }

  async findAll(sessionCode: string): Promise<any[]> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const query = `
        SELECT a.*, o.nom as organisation_nom
        FROM services.activite a
        JOIN security.organisation o ON a.organisation = o.id;
      `;
      return manager.query(query);
    }, sessionCode);
  }

  async findUserActivities(sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const query = `
        SELECT a.*, o.nom as organisation_nom
        FROM services.activite a
        JOIN security.organisation o ON a.organisation = o.id
        JOIN security.users_table u ON a.organisation = u.organisation
        WHERE u.id = (SELECT security.get_user_from_code($1));
      `;
      const result = await manager.query(query, [sessionCode]);
      return result;
    }, sessionCode);
  }

  async findOne(id: number, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const query = `
        SELECT a.*, o.nom as organisation_nom
        FROM services.activite a
        JOIN security.organisation o ON a.organisation = o.id
        WHERE a.id = $1;
      `;
      const result = await manager.query(query, [id]);
      if (!result || result.length === 0) {
        throw new NotFoundException(`Activité avec l'ID ${id} non trouvée`);
      }
      return result[0];
    }, sessionCode);
  }

  async update(id: number, updateActiviteDto: UpdateActiviteDto, sessionCode: string): Promise<Activite> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const setClause = Object.entries(updateActiviteDto)
        .map(([key, value], index) => `${key} = $${index + 1}`)
        .join(', ');

      const values = Object.values(updateActiviteDto);

      const query = `
        UPDATE services.activite
        SET ${setClause}
        WHERE id = ${id}
        RETURNING *;
      `;

      const result = await manager.query(query, values);
      return result[0];
    }, sessionCode);
  }

  async remove(id: number, sessionCode: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const result = await manager.delete(Activite, id);
      if (result.affected === 0) {
        throw new NotFoundException(`Activité avec l'ID ${id} non trouvée`);
      }
    }, sessionCode);
  }
}
