import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateRdvDto } from './DTO/create-rdv.dto';
import { UpdateRdvDto } from './DTO/update-rdv.dto';
import { Rdv } from './Entities/rdv.entity';
import { Utilisateur } from 'src/security/utilisateur/Entities/utilisateur.entity';

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

  async findAllRdvByActivite(activiteId: number): Promise<any[]> {
    const query = `
      SELECT rdv.*, users_table.nom, users_table.email, users_table.tel AS telephone
      FROM planning.rdv AS rdv
      JOIN security.users_table AS users_table ON rdv.user_id = users_table.id
      WHERE rdv.activite_id = $1
    `;
    const rdvs = await this.rdvRepository.query(query, [activiteId]);
    console.log('Rendezvous with user info retrieved from DB:', rdvs); 
    return rdvs;
  }
  
  async findUtilisateurByRendezvousId(rendezvousId: number): Promise<Utilisateur> {
    const rendezvous = await this.rdvRepository.findOne({ where: { id: rendezvousId }, relations: ['user'] });
    if (!rendezvous) {
      throw new NotFoundException(`Rdv with ID ${rendezvousId} not found`);
    }
    return rendezvous.user;
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

  async getRdvPlages(activiteId: number, semaine: number, year: number, duree: number, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      try {
        const result = await manager.query(
          'SELECT * FROM planning.get_rdv_plages($1, $2, $3, $4)',
          [activiteId, semaine, year, duree]
        );
        return result;
      } catch (error) {
        throw new BadRequestException('Impossible de récupérer les créneaux de RDV pour l\'activité spécifiée');
      }
    }, sessionCode);
  }

  async getJsonRdvCreneaux(activiteId: number, semaine: number | undefined, year: number | undefined, duree: number | undefined, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      try {
        const result = await manager.query(
          'SELECT * FROM planning.get_json_rdv_creneaux($1, $2, $3, $4)',
          [activiteId, semaine, year, duree]
        );
        return result;
      } catch (error) {
        throw new BadRequestException('Impossible de récupérer les créneaux de RDV pour l\'activité spécifiée');
      }
    }, sessionCode);
  }
}
