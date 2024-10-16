import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateReservationDto } from './DTO/create-reservation.dto';
import { UpdateReservationDto } from './DTO/update-reservation.dto';
import { Reservation } from './Entities/reservation.entity';

@Injectable()
export class ReservationService {

  constructor(
    private transactionManager: TransactionManager,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  async create(createReservationDto: CreateReservationDto, sessionCode: string): Promise<Reservation> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const newReservation = manager.create(Reservation, createReservationDto);
      return await manager.save(newReservation);
    }, sessionCode);
  }

  async findAll(): Promise<Reservation[]> {
    return await this.reservationRepository.find();
  }

  async findAllReservationsByService(serviceId: number): Promise<any[]> {
    const query = `
      SELECT reservation.*, users_table.nom, users_table.email, users_table.tel AS telephone
      FROM planning.reservation AS reservation
      JOIN security.users_table AS users_table ON reservation.user_id = users_table.id
      WHERE reservation.service_id = $1
    `;
    const reservations = await this.reservationRepository.query(query, [serviceId]);
    return reservations;
  }

  async lockCreneauReservation(serviceId: number, startTime: string, endTime: string, userId: number, action: string, sessionCode: string): Promise<string> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      try {
        const result = await manager.query(
          'SELECT planning.lock_creneau_reservation($1, $2, $3, $4, $5)',
          [serviceId, startTime, endTime, userId, action]
        );
        return result[0].lock_creneau_reservation;
      } catch (error) {
        throw new BadRequestException('Unable to lock or release the creneau');
      }
    }, sessionCode);
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async update(id: number, updateReservationDto: UpdateReservationDto, sessionCode: string): Promise<Reservation> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      await manager.update(Reservation, { id }, updateReservationDto);
      const updatedReservation = await manager.findOne(Reservation, { where: { id } });
      if (!updatedReservation) {
        throw new NotFoundException(`Reservation with ID ${id} not found`);
      }
      return updatedReservation;
    }, sessionCode);
  }

  async remove(id: number, sessionCode: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      const reservation = await manager.findOne(Reservation, { where: { id } });
      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${id} not found`);
      }
      await manager.remove(Reservation, reservation);
    }, sessionCode);
  }

  async getServiceCreneaux(serviceId: number, semaine: number | undefined, year: number | undefined, duree: number | undefined, sessionCode: string): Promise<any> {
    return this.transactionManager.executeInTransaction(async (manager: EntityManager) => {
      try {
        const result = await manager.query(
          'SELECT * FROM planning.get_json_service_creneaux($1, $2, $3, $4)',
          [serviceId, semaine, year, duree]
        );
        return result;
      } catch (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL:', error);
        throw new BadRequestException('Impossible de récupérer les créneaux de service pour l\'ID spécifié');
      }
    }, sessionCode);
  }
}
