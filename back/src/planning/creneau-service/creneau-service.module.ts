import { Module } from '@nestjs/common';
import { CreneauServiceService } from './creneau-service.service';
import { CreneauServiceController } from './creneau-service.controller';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { SharedModule } from 'src/Shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreneauService } from './Entities/creneau-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreneauService])],
  providers: [CreneauServiceService, TransactionManager],
  controllers: [CreneauServiceController]
})
export class CreneauServiceModule {}
