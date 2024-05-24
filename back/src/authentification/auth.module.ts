import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './LocalAuthGuard';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './JwtStrategy';
import { SharedModule } from '../shared/shared.module';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    SharedModule,
  ],
  providers: [AuthService, LocalAuthGuard, JwtStrategy, TransactionManager,JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard],

})
export class AuthModule { }
