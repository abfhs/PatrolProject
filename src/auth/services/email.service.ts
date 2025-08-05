import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Gmail 서비스 사용
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports (587)
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'), // Gmail 앱 비밀번호 사용
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3', // Gmail SMTP 호환성 개선
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<boolean> {
    try {
      const verificationUrl = `${this.getBaseUrl()}/auth/verify-email/${token}`;
      
      const mailOptions = {
        from: `"Patrol Service" <${this.configService.get<string>('MAIL_FROM')}>`,
        to,
        subject: '[Patrol] 이메일 인증을 완료해주세요',
        html: this.getVerificationEmailTemplate(verificationUrl),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('이메일 발송 성공:', { to, messageId: result.messageId });
      return true;
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      return false;
    }
  }

  async sendScheduleRegistrationEmail(
    to: string, 
    scheduleData: {
      address: string;
      addressPin: string;
      ownerName: string;
    },
    registrationResult: any
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Patrol Service" <${this.configService.get<string>('MAIL_FROM')}>`,
        to,
        subject: '[Patrol] 등기정보 모니터링 스케줄이 등록되었습니다',
        html: this.getScheduleRegistrationEmailTemplate(scheduleData, registrationResult),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('스케줄 등록 알림 이메일 발송 성공:', { to, messageId: result.messageId });
      return true;
    } catch (error) {
      console.error('스케줄 등록 알림 이메일 발송 실패:', error);
      return false;
    }
  }

  private getBaseUrl(): string {
    // 이메일 인증 링크는 백엔드 API로 가야 함
    return process.env.NODE_ENV === 'production' 
      ? 'https://yourproductiondomain.com'
      : 'http://localhost:3000';
  }

  private getVerificationEmailTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>이메일 인증</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e1e2e; color: #ffc107; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { 
            display: inline-block; 
            background: #ffc107; 
            color: #000; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Patrol Service</h1>
            <p>등기정보 모니터링 서비스</p>
          </div>
          <div class="content">
            <h2>이메일 인증을 완료해주세요</h2>
            <p>안녕하세요!</p>
            <p>등기정보 모니터링 서비스를 이용하시려면 이메일 인증이 필요합니다.</p>
            <p>아래 버튼을 클릭하여 인증을 완료해주세요:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✅ 이메일 인증 완료하기</a>
            </div>
            
            <p><strong>주의사항:</strong></p>
            <ul>
              <li>이 링크는 24시간 동안만 유효합니다.</li>
              <li>인증이 완료되면 등기정보 스케줄 등록이 가능합니다.</li>
            </ul>
            
            <p>만약 버튼이 작동하지 않는다면, 아래 링크를 복사하여 브라우저에 직접 입력해주세요:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
          </div>
          <div class="footer">
            <p>본 메일은 시스템에서 자동으로 발송된 메일입니다.</p>
            <p>© 2024 Patrol Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getScheduleRegistrationEmailTemplate(
    scheduleData: {
      address: string;
      addressPin: string;
      ownerName: string;
    },
    registrationResult: any
  ): string {
    // 등기정보에서 중요한 데이터만 추출
    const importantData = [
      { label: '부동산 소재지번', value: registrationResult.a105real_indi_cont },
      { label: '주소번호', value: registrationResult.a105_pin },
      { label: '등기목적', value: registrationResult.e033rgs_sel_name },
      { label: '접수일자', value: this.formatDate(registrationResult.a101recev_date) },
      { label: '접수번호', value: registrationResult.a101recev_no },
      { label: '처리상태', value: registrationResult.e008cd_name },
    ].filter(item => item.value && item.value !== '');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>스케줄 등록 완료</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e1e2e; color: #ffc107; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 3rem; margin-bottom: 1rem; }
          .schedule-info { 
            background: white; 
            border: 2px solid #ffc107; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee; 
          }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: bold; color: #1e1e2e; }
          .info-value { color: #666; }
          .alert-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">🎉</div>
            <h1>🏠 Patrol Service</h1>
            <p>등기정보 모니터링 스케줄 등록 완료</p>
          </div>
          <div class="content">
            <h2>스케줄이 성공적으로 등록되었습니다!</h2>
            <p>안녕하세요!</p>
            <p>요청하신 등기정보에 대한 모니터링 스케줄이 성공적으로 등록되었습니다.</p>
            
            <div class="schedule-info">
              <h3 style="color: #1e1e2e; margin-top: 0;">📋 등록된 스케줄 정보</h3>
              <div class="info-row">
                <span class="info-label">모니터링 주소:</span>
                <span class="info-value">${scheduleData.address}</span>
              </div>
              <div class="info-row">
                <span class="info-label">주소번호:</span>
                <span class="info-value">${scheduleData.addressPin}</span>
              </div>
              <div class="info-row">
                <span class="info-label">소유자명:</span>
                <span class="info-value">${scheduleData.ownerName}</span>
              </div>
            </div>

            <div class="schedule-info">
              <h3 style="color: #1e1e2e; margin-top: 0;">📊 현재 등기정보</h3>
              ${importantData.map(item => `
                <div class="info-row">
                  <span class="info-label">${item.label}:</span>
                  <span class="info-value">${item.value}</span>
                </div>
              `).join('')}
            </div>

            <div class="alert-box">
              <h4 style="margin-top: 0; color: #856404;">🔔 모니터링 안내</h4>
              <ul style="margin-bottom: 0;">
                <li>등기정보 변경사항이 발생하면 이메일로 알림을 받게 됩니다.</li>
                <li>모니터링은 24시간 자동으로 실행됩니다.</li>
                <li>변경사항이 감지되면 즉시 알림 이메일이 발송됩니다.</li>
              </ul>
            </div>
            
            <p><strong>감사합니다!</strong></p>
            <p>Patrol Service를 이용해 주셔서 감사합니다.</p>
          </div>
          <div class="footer">
            <p>본 메일은 시스템에서 자동으로 발송된 메일입니다.</p>
            <p>© 2024 Patrol Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private formatDate(dateString: string): string {
    if (!dateString || dateString.length !== 8) return dateString;
    return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
  }

  // 연결 테스트 메서드
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP 연결 성공');
      return true;
    } catch (error) {
      console.error('❌ SMTP 연결 실패:', error);
      return false;
    }
  }
}