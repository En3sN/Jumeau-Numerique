import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './LocalAuthGuard';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './JwtStrategy';
import { SharedModule } from '../shared/shared.module';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';

@Module({
  imports: [
    SharedModule,
  ],
  providers: [AuthService, LocalAuthGuard, JwtStrategy, TransactionManager],
  controllers: [AuthController]
})
export class AuthModule { }
