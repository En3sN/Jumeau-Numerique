import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CsrfController } from './security/csrf/csrf.controller';
import { UtilisateurModule } from './security/utilisateur/utilisateur.module';
import { AuthModule } from './security/authentification/auth.module';
import { ActiviteController } from './services/activite/activite.controller';
import { ActiviteModule } from './services/activite/activite.module';
import { FilesModule } from './services/files/files.module';
import { ServicesModule } from './services/service/services.module';
import { OrganisationModule } from './security/organisation/organisation.module';
import { CreneauAdminModule } from './planning/creneau-admin/creneau-admin.module';
import { CreneauServiceModule } from './planning/creneau-service/creneau-service.module';
import { RdvModule } from './planning/rdv/rdv.module';
import { ReservationModule } from './planning/reservation/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('typeorm'),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '10h' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UtilisateurModule,
    ActiviteModule,
    FilesModule,
    ServicesModule,
    OrganisationModule,
    CreneauAdminModule,
    CreneauServiceModule,
    RdvModule,
    ReservationModule,
  ],
  controllers: [AppController, CsrfController],
  providers: [AppService],
})
export class AppModule {}
