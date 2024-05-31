import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './authentification/auth.module';
import typeorm from './typeorm';
import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { JwtModule } from '@nestjs/jwt';
import { CsrfController } from './security/csrf/csrf.controller';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeorm'))
    }),
    JwtModule.register({
      global: true,
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '10h' },
    }),
    AuthModule,
    UtilisateurModule,
  ],
  controllers: [AppController,CsrfController],
  providers: [AppService],
})
export class AppModule {}
