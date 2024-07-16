import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './Entities/service.entity';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), 
  FilesModule],
  controllers: [ServicesController],
  providers: [ServicesService, TransactionManager],
})
export class ServicesModule {}
