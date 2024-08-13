import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Activite } from './Entities/activite.entity';
import { CreateActiviteDto } from './DTO/create-activite.dto';
import { UpdateActiviteDto } from './DTO/update-activite.dto';
import { Document } from 'src/services/files/Entities/document.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';


@Injectable()
export class ActiviteService {
  private readonly logger = new Logger(ActiviteService.name);
  private readonly cryptoSecretKey: Buffer;

  constructor(
    private transactionManager: TransactionManager,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService
  ) {
    this.cryptoSecretKey = Buffer.from(this.configService.get<string>('CRYPTO_SECRET_KEY'), 'hex');
    if (this.cryptoSecretKey.length !== 32) {
      throw new Error('Invalid key length. CRYPTO_SECRET_KEY must be a 32-byte key.');
    }
  }

  async create(createActiviteDto: CreateActiviteDto): Promise<Activite> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const activite = new Activite();
      Object.assign(activite, createActiviteDto);

      if (createActiviteDto.logo) {
        activite.logo = createActiviteDto.logo.buffer;
      }

      const savedActivite = await manager.save(activite);

      if (createActiviteDto.documents && createActiviteDto.documents.length > 0) {
        const documents = createActiviteDto.documents.map(file => {
          const iv = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv('aes-256-ctr', this.cryptoSecretKey, iv);
          const encryptedData = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

          const document = new Document();
          document.titre = file.originalname;
          document.mimetype = file.mimetype;
          document.iv = iv.toString('hex');
          document.encrypted_data = encryptedData;
          document.activite = savedActivite;
          return document;
        });
        await manager.save(documents);
      }

      return savedActivite;
    });
  }

  
  async findAllPublic(queryParams: any): Promise<any[]> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      let query = `
        SELECT a.*, o.nom as organisation_nom
        FROM services.activite a
        JOIN security.organisation o ON a.organisation = o.id
        WHERE a.public = true
      `;

      const queryParamsKeys = Object.keys(queryParams);
      const filters = [];
      const values = [];

      if (queryParams.nom) {
        filters.push(`a.nom ILIKE $${filters.length + 1}`);
        values.push(`%${queryParams.nom}%`);
      }
      if (queryParams.type) {
        filters.push(`a.type ILIKE $${filters.length + 1}`);
        values.push(`%${queryParams.type}%`);
      }
      if (queryParams.domaine) {
        filters.push(`a.domaine ILIKE $${filters.length + 1}`);
        values.push(`%${queryParams.domaine}%`);
      }
      if (queryParams.organisation_nom) {
        filters.push(`o.nom ILIKE $${filters.length + 1}`);
        values.push(`%${queryParams.organisation_nom}%`);
      }
      if (queryParams.tag) {
        filters.push(`$${filters.length + 1} = ANY(a.tags)`);
        values.push(queryParams.tag);
      }

      if (filters.length > 0) {
        query += ` AND ${filters.join(' AND ')}`;
      }

      return manager.query(query, values);
    });
  }

  async findUserActivities(sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const query = `
        SELECT a.*, o.id as organisation_id, o.nom as organisation_nom
        FROM services.activite a
        JOIN security.organisation o ON a.organisation = o.id
        JOIN security.users_table u ON a.organisation = u.organisation
        WHERE u.id = (SELECT security.get_user_from_code($1));
      `;
      const result = await manager.query(query, [sessionCode]);
      console.log('Activities from DB:', result); 
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

  async findAllServicesByActiviteId(activiteId: number, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const query = `
        SELECT *
        FROM services.service
        WHERE activite_id = $1;
      `;
      const result = await manager.query(query, [activiteId]);
      if (!result || result.length === 0) {
        throw new NotFoundException(`Services not found for activite ID ${activiteId}`);
      }
      return result;
    }, sessionCode);
  }

  async findServiceById(serviceId: number, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const query = `
        SELECT *
        FROM services.service
        WHERE id = $1;
      `;
      const result = await manager.query(query, [serviceId]);
      if (!result || result.length === 0) {
        throw new NotFoundException(`Service not found for ID ${serviceId}`);
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

  async uploadLogo(id: number, logoBuffer: Buffer): Promise<Activite> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const activite = await this.findOne(id, '');
      if (activite) {
        activite.logo = logoBuffer;
        return manager.save(Activite, activite);
      }
      throw new NotFoundException('Activité non trouvée');
    });
  }

  async deleteLogo(id: number): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const activite = await this.findOne(id, '');
      if (!activite) {
        throw new NotFoundException('Activité non trouvée');
      }
      activite.logo = null;
      await manager.save(Activite, activite);
    });
  }

  async getLogo(id: number): Promise<Buffer> {
    const activite = await this.findOne(id, '');
    if (!activite || !activite.logo) {
      throw new NotFoundException('Logo non trouvé');
    }
    return activite.logo;
  }
}
