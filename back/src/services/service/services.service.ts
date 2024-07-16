import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Service } from './Entities/service.entity';
import { CreateServiceDto } from './DTO/create-service.dto';
import { UpdateServiceDto } from './DTO/update-service.dto';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Document } from 'src/services/files/Entities/document.entity';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServicesService {
  private readonly cryptoSecretKey: Buffer;

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly transactionManager: TransactionManager,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService
  ) {
    this.cryptoSecretKey = Buffer.from(this.configService.get<string>('CRYPTO_SECRET_KEY'), 'hex');
    if (this.cryptoSecretKey.length !== 32) {
      throw new Error('Invalid key length. CRYPTO_SECRET_KEY must be a 32-byte key.');
    }
  }

  async findAll(): Promise<Service[]> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.find(Service);
    });
  }

  async findOne(id: number): Promise<Service> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const service = await manager.findOne(Service, { where: { id } });
      if (!service) {
        throw new NotFoundException('Service not found');
      }
      return service;
    });
  }

  async getLogo(id: number): Promise<Buffer> {
    const service = await this.findOne(id);
    if (!service || !service.logo) {
      throw new NotFoundException('Logo not found');
    }
    return service.logo;
  }

 
  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const service = new Service();
      Object.assign(service, createServiceDto);

      if (createServiceDto.logo) {
        service.logo = createServiceDto.logo.buffer;
      }

      const savedService = await manager.save(service);

      if (createServiceDto.documents && createServiceDto.documents.length > 0) {
        const documents = createServiceDto.documents.map(file => {
          const iv = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv('aes-256-ctr', this.cryptoSecretKey, iv);
          const encryptedData = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

          const document = new Document();
          document.titre = file.originalname;
          document.mimetype = file.mimetype;
          document.iv = iv.toString('hex');
          document.encrypted_data = encryptedData;
          document.service = savedService;
          return document;
        });
        await manager.save(documents);
      }

      return savedService;
    });
  }
  

  async update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      await manager.update(Service, id, updateServiceDto);
      return this.findOne(id);
    });
  }

  async remove(id: number): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const service = await this.findOne(id);
      if (!service) {
        throw new NotFoundException('Service not found');
      }
      await manager.delete(Service, id);
    });
  }

  async uploadLogo(id: number, logoBuffer: Buffer): Promise<Service> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const service = await this.findOne(id);
      if (service) {
        service.logo = logoBuffer;
        return manager.save(Service, service);
      }
      throw new NotFoundException('Service not found');
    });
  }

  async deleteLogo(id: number): Promise<Service> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const service = await this.findOne(id);
      if (service) {
        service.logo = null;
        return manager.save(Service, service);
      }
      throw new NotFoundException('Service not found');
    });
  }
}
