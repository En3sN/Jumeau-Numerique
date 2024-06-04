import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../security/JwtStrategy/JwtStrategy';
import { SharedModule } from '../Shared/shared.module';
import { TransactionManager } from 'src/Shared/TransactionManager/TransactionManager';
import { JwtAuthGuard } from '../security/jwt-auth.guard/jwt-auth.guard';
import { UtilisateurModule } from 'src/utilisateur/utilisateur.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
