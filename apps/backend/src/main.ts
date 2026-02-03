import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './modules/shared/framework/response.interceptor';
import { LoggingInterceptor } from './modules/shared/framework/logging.interceptor';
import { AuditInterceptor } from './modules/shared/framework/audit.interceptor';
import { GlobalExceptionFilter } from './modules/shared/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Organization-ID',
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Register global interceptors and filters
  const auditInterceptor = app.get(AuditInterceptor);
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
    auditInterceptor,
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Boilerplate API')
    .setDescription('NestJS Boilerplate API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const isSmokeTest = process.env.API_SMOKE_TEST === '1';
  const port = Number(process.env.PORT || 4000);

  // Listen on 0.0.0.0 to accept connections from outside the container
  await app.listen(port, '0.0.0.0');

  console.log(`API listening on http://0.0.0.0:${port} (Swagger: /api/docs)`);

  if (isSmokeTest) {
    console.log(
      'API smoke test mode enabled – shutting down after successful boot.',
    );
    await app.close();
    return;
  }
}
bootstrap();
