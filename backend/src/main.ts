import 'reflect-metadata';
import 'class-validator';
import 'class-transformer';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

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

  const uploadPath = config.get<string>('UPLOAD_PATH', './uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/api/v1/uploads/files/',
  });

  const corsOrigins = config.get<string>(
    'CORS_ORIGINS',
    'http://localhost:5173',
  );
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
  });

  const publicUrl = config.get<string>('API_PUBLIC_URL');
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

  const port = Number(config.get<string>('PORT', '3000'));
  await app.listen(port);
}

bootstrap();
