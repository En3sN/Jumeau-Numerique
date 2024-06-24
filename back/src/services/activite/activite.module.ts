import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiviteService } from './activite.service';
import { ActiviteController } from './activite.controller';
import { Activite } from './Entities/activite.entity';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';

@Module({
  imports: [TypeOrmModule.forFeature([Activite])],
  controllers: [ActiviteController],
  providers: [ActiviteService, TransactionManager],
})
export class ActiviteModule {}
