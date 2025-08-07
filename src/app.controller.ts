import { Controller, Get, Res, Next } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, NextFunction } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  // User SPA routing: serve index.html for client-side routing
  @Get(['/', '/register', '/main', '/mypage', '/email-verification-success', '/email-verification-error'])
  root(@Res() res: Response): void {
    console.log('🏠 User SPA route accessed:', res.req.path);
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }

  // Catch-all for any other routes - 가장 나중에 처리  
  @Get('*')
  catchAll(@Res() res: Response, @Next() next: NextFunction): void {
    const path = res.req.path;
    console.log('🔄 Catch-all route accessed:', path);
    
    // 정적 파일 경로는 ServeStaticModule이 처리하도록 next() 호출
    if (path.startsWith('/assets') || path.includes('.')) {
      console.log('🗂️ Static file path, passing to ServeStaticModule:', path);
      next(); // 다음 미들웨어(ServeStaticModule)가 처리하도록 함
      return;
    }
    
    // API 경로가 catch-all에 도달했다면 해당 API가 존재하지 않음을 의미
    const isApiPath = 
      path.startsWith('/auth/') ||
      path.startsWith('/users/') ||
      path.startsWith('/crawl/') || 
      path.startsWith('/schedule/') ||
      path.startsWith('/admin/') ||
      path === '/auth' ||
      path === '/users' ||
      path === '/crawl' ||
      path === '/schedule' ||
      path === '/admin';
    
    if (isApiPath) {
      console.log('❌ API path reached catch-all (API not found):', path);
      res.status(404).json({
        message: `Cannot GET ${path}`,
        error: 'Not Found', 
        statusCode: 404
      });
      return;
    }
    
    // 모든 비API 경로는 SPA로 처리 (admin 페이지 포함)
    console.log('📄 Serving index.html for SPA route:', path);
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }

}