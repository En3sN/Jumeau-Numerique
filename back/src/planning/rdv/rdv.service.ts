import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateRdvDto } from './dto/create-rdv.dto';
import { UpdateRdvDto } from './dto/update-rdv.dto';
import { Rdv } from './entities/rdv.entity';

@Injectable()
export class RdvService {

  constructor(
    private transactionManager: TransactionManager,
    @InjectRepository(Rdv)
    private rdvRepository: Repository<Rdv>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(createRdvDto: CreateRdvDto, sessionCode: string): Promise<Rdv> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const newRdv = manager.create(Rdv, createRdvDto);
      return await manager.save(newRdv);
    }, sessionCode);
  }

  async findAll(): Promise<Rdv[]> {
    return await this.rdvRepository.find();
  }

  async findOne(id: number): Promise<Rdv> {
    const rdv = await this.rdvRepository.findOne({ where: { id } });
    if (!rdv) {
      throw new NotFoundException(`Rdv with ID ${id} not found`);
    }
    return rdv;
  }

  async update(id: number, updateRdvDto: UpdateRdvDto, sessionCode: string): Promise<Rdv> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      await manager.update(Rdv, { id }, updateRdvDto);
      const updatedRdv = await manager.findOne(Rdv, { where: { id } });
      if (!updatedRdv) {
        throw new NotFoundException(`Rdv with ID ${id} not found`);
      }
      return updatedRdv;
    }, sessionCode);
  }

  async remove(id: number, sessionCode: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const rdv = await manager.findOne(Rdv, { where: { id } });
      if (!rdv) {
        throw new NotFoundException(`Rdv with ID ${id} not found`);
      }
      await manager.remove(Rdv, rdv);
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
