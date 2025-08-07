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

  // Admin SPA routes - 명시적 경로만 처리
  @Get(['/admin', '/admin/login', '/admin/dashboard', '/admin/users', '/admin/schedules', '/admin/logs'])
  serveAdminSPA(@Res() res: Response): void {
    console.log('🎯 Admin SPA route accessed:', res.req.path);
    const indexPath = join(__dirname, '..', 'public', 'index.html');
    console.log('📁 Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  }

}