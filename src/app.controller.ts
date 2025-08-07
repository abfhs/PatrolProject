import { Controller, Get, Res, Next } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, NextFunction } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Admin SPA routes - 가장 먼저 처리 (우선순위 최상)
  @Get(['/admin', '/admin/login', '/admin/users', '/admin/schedules', '/admin/logs'])
  serveAdminSPA(@Res() res: Response): void {
    console.log('🎯 Admin SPA route accessed:', res.req.path);
    const indexPath = join(__dirname, '..', 'public', 'index.html');
    console.log('📁 Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  }

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
    
    // API 경로들 - 이 경로들은 실제 컨트롤러가 처리해야 하므로 catch-all이 가로채면 안됨
    const isApiPath = 
      path.startsWith('/auth/') ||
      path.startsWith('/users/') ||
      path.startsWith('/crawl/') || 
      path.startsWith('/schedule/') ||
      path.startsWith('/admin/dashboard') ||
      path.startsWith('/admin/users') ||
      path.startsWith('/admin/schedules') ||
      path.startsWith('/admin/scheduler') ||
      path === '/auth' ||
      path === '/users' ||
      path === '/crawl' ||
      path === '/schedule';
    
    if (isApiPath) {
      console.log('❌ API path reached catch-all, returning 404:', path);
      res.status(404).json({
        message: `Cannot GET ${path}`,
        error: 'Not Found', 
        statusCode: 404
      });
      return;
    }
    
    console.log('📄 Serving index.html for unknown SPA route:', path);
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }

}