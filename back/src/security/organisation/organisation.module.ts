import { Module } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { OrganisationController } from './organisation.controller';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/Shared/shared.module';
import { Organisation } from './Entities/organisation.entity';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Organisation]) 
  ],
  controllers: [OrganisationController],
  providers: [OrganisationService, TransactionManager],
})
export class OrganisationModule {}
