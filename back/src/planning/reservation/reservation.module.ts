import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Reservation } from './Entities/reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation])],
  providers: [ReservationService, TransactionManager],
  controllers: [ReservationController]
})
export class ReservationModule {}
