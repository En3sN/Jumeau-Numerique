import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { TypeCreneau } from './entities/type-creneau.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeCreneau])],
  providers: [TypesService],
  controllers: [TypesController],
  exports: [TypeOrmModule],
})
export class TypesModule {}
