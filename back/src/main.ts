import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Assure que seules les propriétés définies dans les DTOs sont reçues
    transform: true,  // Transforme les entrées en leur type déclaré dans le DTO
    forbidNonWhitelisted: true, // Rejette les requêtes contenant des propriétés non prévues dans le DTO
    disableErrorMessages: false, // Pour la production, désactive les messages d'erreur
  }));
  await app.listen(3000);
}
bootstrap();
