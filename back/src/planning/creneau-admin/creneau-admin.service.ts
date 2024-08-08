import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateCreneauAdminDto } from './DTO/create-creneau-admin.dto';
import { UpdateCreneauAdminDto } from './DTO/update-creneau-admin.dto';
import { CreneauAdmin } from './Entities/creneau-admin.entity';

@Injectable()
export class CreneauAdminService {
  private readonly logger = new Logger(CreneauAdminService.name);

  constructor(
    private transactionManager: TransactionManager,
    @InjectRepository(CreneauAdmin)
    private creneauAdminRepository: Repository<CreneauAdmin>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) { }

  async create(createCreneauAdminDto: CreateCreneauAdminDto, userId: number): Promise<CreneauAdmin> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const newCreneauAdmin = manager.create(CreneauAdmin, { ...createCreneauAdminDto, user_id: userId });
      return await manager.save(newCreneauAdmin);
    }, userId.toString());
  }

  async update(id: number, updateCreneauAdminDto: UpdateCreneauAdminDto, userId: number): Promise<CreneauAdmin> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      await manager.update(CreneauAdmin, { id, user_id: userId }, updateCreneauAdminDto);
      const updatedCreneauAdmin = await manager.findOne(CreneauAdmin, { where: { id } });
      if (!updatedCreneauAdmin) {
        throw new NotFoundException(`CreneauAdmin with ID ${id} not found`);
      }
      return updatedCreneauAdmin;
    }, userId.toString());
  }

  async remove(id: number, userId: number): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const creneauAdmin = await manager.findOne(CreneauAdmin, { where: { id, user_id: userId } });
      if (!creneauAdmin) {
        throw new NotFoundException(`CreneauAdmin with ID ${id} not found`);
      }
      await manager.remove(CreneauAdmin, creneauAdmin);
    }, userId.toString());
  }

  async findAll(): Promise<CreneauAdmin[]> {
    return await this.creneauAdminRepository.find();
  }

  async findOne(id: number): Promise<CreneauAdmin> {
    if (isNaN(id)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    const creneauAdmin = await this.creneauAdminRepository.findOne({ where: { id } });
    if (!creneauAdmin) {
      throw new NotFoundException(`CreneauAdmin with ID ${id} not found`);
    }
    return creneauAdmin;
  }

  async getRdvRecurent(activiteId: number, semaine: number, year: number): Promise<any[]> {
    this.logger.log(`Fetching recurrent RDVs for activiteId=${activiteId}, semaine=${semaine}, year=${year}`);
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      try {
        const result = await manager.query(
          'SELECT * FROM planning.get_rdv_recurent($1, $2, $3)',
          [activiteId, semaine, year]
        );
        this.logger.log(`Recurrent RDVs fetched successfully: ${JSON.stringify(result)}`);
        return result;
      } catch (error) {
        this.logger.error('Error fetching recurrent RDVs:', error);
        throw new BadRequestException('Impossible de récupérer les RDV récurrents pour l\'activité spécifiée');
      }
    });
  }
  

  async getCreneauxAdmin(activiteId: number, userId: number): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const result = await manager.query(
        'SELECT * FROM planning.creneau_admin WHERE activite_id = $1 AND user_id = $2 AND type_creneau != \'recurrent\'',
        [activiteId, userId]
      );
      return result;
    }, userId.toString());
  }  
}
