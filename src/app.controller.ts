import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // SPA routing: serve index.html for client-side routing
  @Get(['/', '/register', '/main', '/mypage', '/email-verification-success', '/email-verification-error'])
  serveSPA(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }

  // Admin SPA routes
  @Get(['/admin', '/admin/login', '/admin/dashboard', '/admin/users', '/admin/schedules', '/admin/logs'])
  serveAdminSPA(@Res() res: Response): void {
    console.log('🎯 Admin SPA route accessed:', res.req.path);
    const indexPath = join(__dirname, '..', 'public', 'index.html');
    console.log('📁 Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  }

  // Catch-all route for SPA (should be last)
  @Get('*')
  serveFallback(@Res() res: Response): void {
    const path = res.req.path;
    console.log('🔄 Fallback route accessed:', path);
    
    // API 경로는 제외
    if (path.startsWith('/api')) {
      console.log('❌ API path should not reach here:', path);
      return;
    }
    
    console.log('📄 Serving index.html for SPA route:', path);
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}