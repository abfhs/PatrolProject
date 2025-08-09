import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 (환경에 따라 동적 설정)
  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: true, // 모든 origin 허용 (배포 후 도메인으로 제한 권장)
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
      credentials: true,
      maxAge: 86400 // 프리플라이트 캐싱 시간
    });
  } else {
    app.enableCors({
      origin: [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5173'
      ], // 개발 환경용 - 다양한 localhost 형태 허용
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
      credentials: true,
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
