# Patrol - Property Monitoring System

NestJS와 React를 기반으로 한 부동산 모니터링 시스템입니다.

## 🚀 주요 기능

- **사용자 등록/로그인**: JWT 기반 인증 시스템
- **주소 검색**: 부동산 주소 검색 및 모니터링 등록
- **스케줄링**: 매일 자동 실행되는 모니터링 작업
- **관리자 패널**: 사용자 관리, 스케줄 관리, 로그 관리

## 🛠 기술 스택

### Backend
- **NestJS**: Node.js 프레임워크
- **TypeORM**: ORM
- **PostgreSQL**: 데이터베이스
- **JWT**: 인증
- **bcrypt**: 비밀번호 암호화

### Frontend
- **React**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Vite**: 빌드 도구
- **CSS Modules**: 스타일링

## 📋 설치 및 실행

### 1. 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 설정하세요:

```bash
# 프록시 설정
PROXY_URL=your_proxy_url_here

# 사이트 인증 정보
SITE_ID=your_site_id
SITE_PASSWORD=your_site_password

# JWT 보안 키 (32자 이상 랜덤 문자열)
JWT_SECRET=your-32-character-long-secret-key-here

# 데이터베이스 설정 (선택사항 - 기본값: PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=patrol

# 관리자 계정 설정 (보안상 중요!)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NICKNAME=admin

# 이메일 설정 (Gmail 사용)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM=your-gmail@gmail.com
```

> ⚠️ **보안 주의사항**: 
> - **JWT_SECRET**: 32자 이상의 강력한 랜덤 문자열을 사용하세요
> - **패스워드**: 실제 운영 환경에서는 강력한 패스워드를 사용하세요
> - **Gmail 앱 패스워드**: 일반 패스워드가 아닌 앱 전용 패스워드를 사용하세요
> - `.env` 파일은 Git에 업로드되지 않으므로 안전합니다
> - `.env.example` 파일을 참고하여 필요한 환경변수를 설정하세요

#### JWT_SECRET 생성 방법:
```bash
# 온라인 생성기 사용 (권장)
# https://www.random.org/passwords/

# 또는 Node.js로 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 의존성 설치

```bash
# 백엔드 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd frontend
npm install
cd ..
```

### 3. 데이터베이스 설정

PostgreSQL이 설치되어 있어야 합니다:
- Host: localhost
- Port: 5432
- Database: postgres
- Username: postgres
- Password: postgres

### 4. 개발 서버 실행

```bash
# 백엔드 개발 서버 (포트 3000)
npm run start:dev

# 프론트엔드 개발 서버 (포트 5173)
cd frontend
npm run dev
```

### 5. 빌드

```bash
# 전체 프로젝트 빌드 (프론트엔드 + 백엔드)
npm run build

# 프론트엔드만 빌드
npm run build:frontend
```

## 🔐 관리자 접근

1. 브라우저에서 `http://localhost:5173/admin/login` 접속
2. `.env` 파일에 설정한 관리자 계정으로 로그인
3. 관리자 대시보드에서 시스템 관리

### 관리자 기능
- **대시보드**: 시스템 통계 및 현황
- **사용자 관리**: 등록된 사용자 조회/삭제
- **스케줄 관리**: 모니터링 스케줄 관리 및 수동 실행
- **로그 관리**: 실행 로그 및 통계 확인

## 📁 프로젝트 구조

```
patrol/
├── src/                    # 백엔드 소스
│   ├── auth/              # 인증 모듈
│   ├── users/             # 사용자 모듈
│   ├── schedule/          # 스케줄링 모듈
│   ├── admin/             # 관리자 모듈
│   ├── crawl/             # 크롤링 모듈
│   └── database/          # 데이터베이스 관련
├── frontend/              # 프론트엔드 소스
│   ├── src/
│   │   ├── components/    # 재사용 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스
│   │   └── types/         # TypeScript 타입
└── public/               # 정적 파일
```

## 🔒 보안 고려사항

1. **환경변수**: 모든 민감한 정보는 환경변수로 관리
2. **JWT 토큰**: 액세스 토큰(5분), 리프레시 토큰(1시간) 만료 시간 설정
3. **비밀번호 암호화**: bcrypt로 해시화
4. **역할 기반 접근**: ADMIN/USER 역할 구분
5. **CORS 설정**: 필요한 도메인만 허용

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request