import { Module } from '@nestjs/common';
import { CreneauAdminService } from './creneau-admin.service';
import { CreneauAdminController } from './creneau-admin.controller';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { SharedModule } from 'src/Shared/shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreneauAdmin } from './Entities/creneau-admin.entity';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([CreneauAdmin]) 
  ],
  providers: [CreneauAdminService, TransactionManager],
  controllers: [CreneauAdminController]
})
export class CreneauAdminModule {}
