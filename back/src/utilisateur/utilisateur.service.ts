import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateUtilisateurDto } from './DTO/create-utilisateur.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UpdateUtilisateurDto } from './DTO/update-utilisateur-infos.dto';
import * as bcrypt from 'bcrypt';
import { Utilisateur } from './Entities/utilisateur.entity';

@Injectable()
export class UtilisateurService {
  private readonly logger = new Logger(UtilisateurService.name);

  constructor(
    private transactionManager: TransactionManager,
    @InjectRepository(Utilisateur)
    private userRepository: Repository<Utilisateur>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) { }


  async findAllUserInfo(sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.query(`SELECT id, nom, pseudo, email, tel, pwd, adresse, cp, commune, statut, organisation, organisation_nom, roles, activated FROM security.user_my_infos`);
    }, sessionCode);
  }

  async getUserBySessionCode(sessionCode: string): Promise<Utilisateur> {
    const query = `SELECT * FROM security.user_my_infos WHERE sessionCode = $1`;
    const result = await this.entityManager.query(query, [sessionCode]);
    return result[0];
  }


  async getUserRolesBySessionCode(sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.query(`SELECT roles FROM security.user_my_infos`);
    }, sessionCode);
  }

  async activateUser(userId: number, activate: boolean): Promise<string> {
    await this.entityManager.query('SELECT security.set_user_activated($1, $2)', [userId, activate]);
    return activate ? 'User activated successfully' : 'User deactivated successfully';
  }

  async getStatuts(): Promise<string[]> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const result = await manager.query('SELECT unnest(enum_range(NULL::security.typ_user_statut)) AS statut');
      return result.map((row: { statut: string }) => row.statut);
    });
  }

  async createUser(createUtilisateurDto: CreateUtilisateurDto): Promise<any> {
    const existingUser = await this.userRepository.findOne({ where: { email: createUtilisateurDto.email } });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(createUtilisateurDto.pwd, salt);

    const newUser = this.userRepository.create({
      ...createUtilisateurDto,
      pwd: hashedPassword,
      salt: salt,
    });

    const savedUser = await this.userRepository.save(newUser);

    await this.activateUser(savedUser.id, true); 

    return savedUser;
  }
  
  async addRoleToUser(userId: number, roles: string[], sessionCode: string): Promise<Utilisateur> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const currentRoles = user.roles.filter(role => role && role.trim());
    const newRoles = roles.filter(role => role && role.trim());
    const updatedRoles = Array.from(new Set([...currentRoles, ...newRoles]));

    const updateUtilisateurDto: UpdateUtilisateurDto = { roles: updatedRoles };

    return this.updateUser(userId, updateUtilisateurDto, sessionCode);
  }

  async updateUser(id: number, updateUtilisateurDto: UpdateUtilisateurDto, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const setClause = Object.entries(updateUtilisateurDto)
        .map(([key, value], index) => `${key} = $${index + 1}`)
        .join(', ');

      const values = Object.values(updateUtilisateurDto);

      const query = `
        UPDATE security.user_my_infos
        SET ${setClause}
        WHERE id = ${id}
        RETURNING *;
      `;

      const result = await manager.query(query, values);
      return result[0];
    }, sessionCode);
  }
}