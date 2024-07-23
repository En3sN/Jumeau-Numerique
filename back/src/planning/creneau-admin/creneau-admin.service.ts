import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateCreneauAdminDto } from './dto/create-creneau-admin.dto';
import { UpdateCreneauAdminDto } from './dto/update-creneau-admin.dto';
import { CreneauAdmin } from './entities/creneau-admin.entity';

@Injectable()
export class CreneauAdminService {

  constructor(
    private transactionManager: TransactionManager,
    @InjectRepository(CreneauAdmin)
    private creneauAdminRepository: Repository<CreneauAdmin>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(createCreneauAdminDto: CreateCreneauAdminDto, sessionCode: string): Promise<CreneauAdmin> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const newCreneauAdmin = manager.create(CreneauAdmin, createCreneauAdminDto);
      return await manager.save(newCreneauAdmin);
    }, sessionCode);
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

  async update(id: number, updateCreneauAdminDto: UpdateCreneauAdminDto, sessionCode: string): Promise<CreneauAdmin> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      await manager.update(CreneauAdmin, { id }, updateCreneauAdminDto);
      const updatedCreneauAdmin = await manager.findOne(CreneauAdmin, { where: { id } });
      if (!updatedCreneauAdmin) {
        throw new NotFoundException(`CreneauAdmin with ID ${id} not found`);
      }
      return updatedCreneauAdmin;
    }, sessionCode);
  }

  async remove(id: number, sessionCode: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const creneauAdmin = await manager.findOne(CreneauAdmin, { where: { id } });
      if (!creneauAdmin) {
        throw new NotFoundException(`CreneauAdmin with ID ${id} not found`);
      }
      await manager.remove(CreneauAdmin, creneauAdmin);
    }, sessionCode);
  }

  async getRdvCreneauxByActivite(activiteId: number, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      try {

        const result = await manager.query(
          'SELECT * FROM planning.rdv WHERE activite_id = $1',
          [activiteId]
        );
        return result;
      } catch (error) {
        throw new BadRequestException('Impossible de récupérer les créneaux de RDV pour l\'activité spécifiée');
      }
    }, sessionCode);
  }
}
