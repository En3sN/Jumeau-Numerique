import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './Entities/document.entity';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { AuthModule } from 'src/security/authentification/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]),
  AuthModule,
],
  controllers: [FilesController],
  providers: [FilesService, TransactionManager],
  exports: [FilesService],
})
export class FilesModule {}
