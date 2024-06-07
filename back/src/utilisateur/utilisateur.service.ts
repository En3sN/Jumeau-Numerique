import { ConflictException, Injectable, Logger } from '@nestjs/common';
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
  ) {}

  async findAllUserInfo(sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      return manager.query(`SELECT id, nom, pseudo, email, tel, pwd, adresse, cp, commune, roles, activated FROM security.user_my_infos`);
    }, sessionCode);
  }

  async getUserBySessionCode(sessionCode: string): Promise<Utilisateur> {
    const query = `SELECT * FROM security.user_my_infos WHERE sessionCode = $1`;
    const result = await this.entityManager.query(query, [sessionCode]);
    return result[0]; 
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

    return await this.userRepository.save(newUser);
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
