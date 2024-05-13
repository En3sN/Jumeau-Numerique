import { Module } from '@nestjs/common';
import { UtilisateurController } from './utilisateur.controller';
import { UtilisateurService } from './utilisateur.service';
import { SharedModule } from 'src/shared/shared.module';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';

@Module({
  imports: [SharedModule],
  controllers: [UtilisateurController],
  providers: [UtilisateurService, TransactionManager]
})
export class UtilisateurModule {}
