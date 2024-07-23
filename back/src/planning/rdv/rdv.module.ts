import { Module } from '@nestjs/common';
import { RdvService } from './rdv.service';
import { RdvController } from './rdv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Rdv } from './entities/rdv.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rdv])],
  providers: [RdvService, TransactionManager],
  controllers: [RdvController]
})
export class RdvModule {}
