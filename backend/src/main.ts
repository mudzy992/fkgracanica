import 'reflect-metadata';
import 'class-validator';
import 'class-transformer';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const config = app.get(ConfigService);

  // BE-01/Q-11(a) (odobreno): Coolify proxy je tačno 1 hop ispred servisa.
  // Bez ove postavke throttler vidi IP proxyja kao klijenta i SVE
  // posjetioce grupiše u JEDAN rate-limit bucket (portal bi pao pod
  // normalnim saobraćajem). Ako se servis ikad izlaže direktno bez
  // proxyja, ukloniti — inače klijent može varati X-Forwarded-For.
  app.set('trust proxy', 1);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // BE-01/P2: čitanja preko tipizirane konfiguracije (config/configuration.ts);
  // defaulti žive tamo, ne ovdje.
  const uploadPath = config.get<string>('uploadPath', './uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/api/v1/uploads/files/',
  });

  const corsOrigins = config.get<string>(
    'corsOrigins',
    'http://localhost:5173',
  );
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
  });

  const publicUrl = config.get<string>('apiPublicUrl');
  const swaggerBuilder = new DocumentBuilder()
    .setTitle('FK Gračanica API')
    .setDescription('Backend API za FK Gračanica')
    .setVersion('1.0')
    .addBearerAuth();
  if (publicUrl) {
    swaggerBuilder.addServer(publicUrl);
  }
  const swaggerConfig = swaggerBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
}

bootstrap();
