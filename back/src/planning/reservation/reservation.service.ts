import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

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
}
