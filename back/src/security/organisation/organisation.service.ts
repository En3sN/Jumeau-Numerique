import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Organisation } from './entities/organisation.entity';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(createOrganisationDto: CreateOrganisationDto): Promise<Organisation> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const organisation = manager.create(Organisation, createOrganisationDto);
      return manager.save(organisation);
    });
  }

  async findAll(): Promise<Organisation[]> {
    return this.organisationRepository.find();
  }

  async findOne(id: number): Promise<Organisation> {
    const organisation = await this.organisationRepository.findOne({ where: { id } });
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }
    return organisation;
  }

  async update(id: number, updateOrganisationDto: UpdateOrganisationDto): Promise<Organisation> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const organisation = await this.findOne(id);
      manager.merge(Organisation, organisation, updateOrganisationDto);
      return manager.save(organisation);
    });
  }

  async remove(id: number): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const organisation = await this.findOne(id);
      await manager.remove(Organisation, organisation);
    });
  }
}
