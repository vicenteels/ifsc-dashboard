import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function parseCorsOrigins(value: string | undefined) {
  const raw = (value || 'http://localhost:3001').trim();
  if (!raw) return ['http://localhost:3001'];
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

  await app.listen(3000);
}
bootstrap();
