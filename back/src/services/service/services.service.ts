import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Service } from './Entities/service.entity';
import { CreateServiceDto } from './DTO/create-service.dto';
import { UpdateServiceDto } from './DTO/update-service.dto';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly transactionManager: TransactionManager,
    private readonly entityManager: EntityManager
  ) {}

  async create(createServiceDto: CreateServiceDto, logo: Express.Multer.File): Promise<Service> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const service = this.serviceRepository.create(createServiceDto);
      if (logo) {
        service.logo = logo.buffer;
      }
      return manager.save(Service, service);
    });
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
