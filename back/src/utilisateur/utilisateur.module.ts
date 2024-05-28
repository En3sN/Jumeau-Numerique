import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilisateurController } from './utilisateur.controller';
import { UtilisateurService } from './utilisateur.service';
import { SharedModule } from 'src/Shared/shared.module';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { Utilisateur } from './Entities/utilisateur.entity';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Utilisateur]) 
  ],
  controllers: [UtilisateurController],
  providers: [UtilisateurService, TransactionManager]
})
export class UtilisateurModule {}
