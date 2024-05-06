import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './LocalAuthGuard';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './JwtStrategy';
import { SharedModule } from '../shared/shared.module';  
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '60s' },
    }),
    SharedModule,
  ],
  providers: [AuthService, LocalAuthGuard, JwtStrategy, TransactionManager],
  controllers: [AuthController]
})
export class AuthModule {}
