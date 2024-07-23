import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateCreneauServiceDto } from './dto/create-creneau-service.dto';
import { UpdateCreneauServiceDto } from './dto/update-creneau-service.dto';
import { CreneauService } from './entities/creneau-service.entity';

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

  async findAll(): Promise<CreneauService[]> {
    return await this.creneauServiceRepository.find();
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

  async remove(id: number, sessionCode: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const creneauService = await manager.findOne(CreneauService, { where: { id } });
      if (!creneauService) {
        throw new NotFoundException(`CreneauService with ID ${id} not found`);
      }
      await manager.remove(CreneauService, creneauService);
    }, sessionCode);
  }

  async getServiceCreneaux(serviceId: number, semaine?: number, year?: number, duree?: number, sessionCode?: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      try {
        const result = await manager.query(
          'SELECT * FROM planning.get_json_service_creneaux($1, $2, $3, $4)',
          [serviceId, semaine || null, year || null, duree || null]
        );
        return result;
      } catch (error) {
        throw new BadRequestException('Impossible de récupérer les créneaux de service pour l\'ID spécifié');
      }
    }, sessionCode);
  }
}
