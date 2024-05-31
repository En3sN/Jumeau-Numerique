import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../security/JwtStrategy/JwtStrategy';
import { SharedModule } from '../Shared/shared.module';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { JwtAuthGuard } from '../security/jwt-auth.guard/jwt-auth.guard';

@Module({
  imports: [
    SharedModule,
  ],
  providers: [AuthService, JwtStrategy, TransactionManager,JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard],

})
export class AuthModule { }
