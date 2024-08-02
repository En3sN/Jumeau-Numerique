import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateCreneauServiceDto } from './DTO/create-creneau-service.dto';
import { UpdateCreneauServiceDto } from './DTO/update-creneau-service.dto';
import { CreneauService } from './Entities/creneau-service.entity';

@Injectable()
export class CreneauServiceService {

  constructor(
    private transactionManager: TransactionManager,
    @InjectRepository(CreneauService)
    private creneauServiceRepository: Repository<CreneauService>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(createCreneauServiceDto: CreateCreneauServiceDto, sessionCode: string): Promise<CreneauService> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const newCreneauService = manager.create(CreneauService, createCreneauServiceDto);
      return await manager.save(newCreneauService);
    }, sessionCode);
  }

  async findOne(id: number): Promise<CreneauService> {
    const creneauService = await this.creneauServiceRepository.findOne({ where: { id } });
    if (!creneauService) {
      throw new NotFoundException(`CreneauService with ID ${id} not found`);
    }
    return creneauService;
  }

  async update(id: number, updateCreneauServiceDto: UpdateCreneauServiceDto, sessionCode: string): Promise<CreneauService> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      await manager.update(CreneauService, { id }, updateCreneauServiceDto);
      const updatedCreneauService = await manager.findOne(CreneauService, { where: { id } });
      if (!updatedCreneauService) {
        throw new NotFoundException(`CreneauService with ID ${id} not found`);
      }
      return updatedCreneauService;
    }, sessionCode);
  }

  async getCreneauxService(serviceId: number): Promise<any> {
    const result = await this.entityManager.query(
      'SELECT * FROM planning.creneau_service WHERE service_id = $1',
      [serviceId]
    );
    return result;
  }

  async remove(id: number, sessionCode: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const creneauService = await manager.findOne(CreneauService, { where: { id } });
      if (!creneauService) {
        throw new NotFoundException(`CreneauService with ID ${id} not found`);
      }
      await manager.remove(CreneauService, creneauService);
    }, sessionCode);
  }
}
