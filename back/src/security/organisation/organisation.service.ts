import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Organisation } from './entities/organisation.entity';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Utilisateur } from '../utilisateur/Entities/utilisateur.entity';

@Injectable()
export class OrganisationService {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(createOrganisationDto: CreateOrganisationDto, userId: number): Promise<Organisation> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const newOrganisation = manager.create(Organisation, createOrganisationDto);
      const savedOrganisation = await manager.save(newOrganisation);

      const user = await manager.findOne(Utilisateur, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      user.organisation = savedOrganisation.id;
      await manager.save(user);

      return savedOrganisation;
    });
  }

  async findByUserId(userId: number): Promise<Organisation> {
    const user = await this.organisationRepository.query(
      `SELECT organisation FROM security.users_table WHERE id = $1`, 
      [userId]
    );
    if (!user || user.length === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const organisationId = user[0].organisation;
    const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });
    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }
    return organisation;
  }

  async update(id: number, updateOrganisationDto: UpdateOrganisationDto): Promise<Organisation> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const organisation = await this.organisationRepository.findOne({ where: { id } });
      if (!organisation) {
        throw new NotFoundException('Organisation not found');
      }
      manager.merge(Organisation, organisation, updateOrganisationDto);
      return manager.save(organisation);
    });
  }

  async remove(id: number): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const organisation = await this.organisationRepository.findOne({ where: { id } });
      if (!organisation) {
        throw new NotFoundException('Organisation not found');
      }
      await manager.remove(Organisation, organisation);
    });
  }

  async getLogo(id: number): Promise<Buffer> {
    const organisation = await this.organisationRepository.findOne({ where: { id } });

    if (!organisation || !organisation.logo) {
      throw new NotFoundException('Logo not found');
    }

    return organisation.logo;
  }
}
