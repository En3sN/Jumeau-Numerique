import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../JwtStrategy/JwtStrategy';
import { UtilisateurModule } from '../utilisateur/utilisateur.module';
import { JwtAuthGuard } from '../jwt-auth.guard/jwt-auth.guard';
import { SharedModule } from 'src/Shared/shared.module';

@Module({
  imports: [
    SharedModule,
    UtilisateurModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '10h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, TransactionManager, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
