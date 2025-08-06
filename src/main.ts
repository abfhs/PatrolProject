import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 글로벌 API prefix 설정
  app.setGlobalPrefix('api');

  // CORS 설정 (개발 환경용)
  app.enableCors({
    origin: 'http://127.0.0.1:3000', // 프론트엔드 주소
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // 쿠키/인증 허용
  });


  // 프로덕션 환경 CORS 설정
  // app.enableCors({
  //   origin: 'https://your-production-domain.com',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   allowedHeaders: 'Content-Type, Authorization',
  //   credentials: true,
  //   maxAge: 86400 // 프리플라이트 캐싱 시간
  // });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
