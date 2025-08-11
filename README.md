# 🏠 Patrol - 부동산 등기정보 모니터링 시스템

NestJS와 React로 개발된 부동산 등기정보 변경사항을 자동으로 추적하는 모니터링 시스템입니다.

## 🚀 주요 기능

- **사용자 인증**: 이메일 인증이 포함된 JWT 기반 인증 시스템
- **등기정보 모니터링**: 매일 자동으로 부동산 등기정보 변경사항 추적
- **실시간 알림**: 등기정보 변경 시 이메일 알림 발송
- **관리자 패널**: 사용자 관리, 스케줄 관리, 시스템 모니터링
- **다중 역할 지원**: 관리자(ADMIN)와 서브 관리자(ADMIN_SUB) 권한 구분

## 🛠 기술 스택

### 백엔드
- **NestJS**: Node.js 프레임워크
- **TypeORM**: 객체 관계 매핑
- **PostgreSQL**: 데이터베이스
- **JWT**: 인증
- **bcrypt**: 비밀번호 암호화
- **Nodemailer**: 이메일 서비스

### 프론트엔드
- **React**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Vite**: 빌드 도구
- **CSS Modules**: 스타일링

### DevOps
- **Docker**: 컨테이너화
- **GitHub Actions**: CI/CD
- **AWS EC2**: 배포

## 📋 설치 및 실행

### 필수 요구사항

- Node.js (v18 이상)
- PostgreSQL
- npm 또는 yarn

### 1. 저장소 클론

```bash
git clone <repository-url>
cd patrol
```

### 2. 환경변수 설정

`.env.example` 파일을 `.env`로 복사하고 다음 변수들을 설정하세요:

```bash
# 프록시 설정 (선택사항)
PROXY_URL=http://proxy.example.com:8080

# 사이트 접속 정보 (인터넷등기소 접속용 - 필수)
SITE_ID=your_site_id_here
SITE_PASSWORD=your_site_password_here

# JWT 설정 (필수)
JWT_SECRET=your-32-character-long-secret-key-here

# 데이터베이스 설정
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=patrol
DATABASE_SSL=false

# 관리자 계정 설정 (필수)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_NICKNAME=Admin

# 이메일 설정 (알림 기능 사용시 필수)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM=your-gmail@gmail.com

# 기본 URL 설정
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **보안 주의사항**: 
> - JWT_SECRET은 32자 이상의 강력한 문자열을 사용하세요
> - MAIL_PASS는 Gmail 앱 비밀번호를 사용하세요 (일반 비밀번호 X)
> - `.env` 파일은 절대 Git에 커밋하지 마세요
> - 모든 설정 옵션은 `.env.example` 파일을 참고하세요

### JWT_SECRET 생성하기:
```bash
# Node.js로 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. 의존성 설치

```bash
# 백엔드 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd frontend
npm install
cd ..
```

### 4. 데이터베이스 설정

`.env` 파일에 설정한 정보에 따라 PostgreSQL이 설치되고 실행 중인지 확인하세요.

### 5. 개발 서버 실행

```bash
# 백엔드 개발 서버 실행 (포트 3000)
npm run start:dev

# 새 터미널에서 프론트엔드 개발 서버 실행 (포트 5173)
cd frontend
npm run dev
```

### 6. 빌드

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
- **대시보드**: 시스템 통계 및 현황 조회
- **사용자 관리**: 등록된 사용자 조회 및 관리
- **스케줄 관리**: 등기정보 모니터링 작업 관리 및 수동 실행
- **로그 관리**: 실행 로그 및 통계 확인

### 관리자 역할
- **ADMIN**: 사용자 삭제, 스케줄러 수동 실행 등 모든 기능 접근 가능
- **ADMIN_SUB**: 제한된 접근 권한 - 사용자 삭제, 스케줄러 수동 실행 불가

## 📁 프로젝트 구조

```
patrol/
├── src/                    # 백엔드 소스코드
│   ├── auth/              # 인증 모듈
│   ├── users/             # 사용자 관리 모듈
│   ├── schedule/          # 스케줄링 모듈
│   ├── admin/             # 관리자 패널 모듈
│   ├── crawl/             # 등기정보 크롤링 모듈
│   └── database/          # 데이터베이스 설정
├── frontend/              # 프론트엔드 소스코드
│   ├── src/
│   │   ├── components/    # 재사용 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스
│   │   └── types/         # TypeScript 타입 정의
├── public/               # 정적 파일
├── .github/workflows/    # GitHub Actions CI/CD
└── docker-compose.yaml   # Docker 설정
```

## 🚀 배포

### Docker 사용

```bash
# Docker Compose로 빌드 및 실행
docker-compose up -d
```

### 수동 배포

프로젝트에는 AWS EC2로 자동 배포를 위한 GitHub Actions 워크플로우가 포함되어 있습니다.

## 🔒 보안 기능

1. **환경변수 관리**: 모든 민감한 데이터는 환경변수로 관리
2. **JWT 인증**: 리프레시 토큰을 포함한 안전한 토큰 기반 인증
3. **비밀번호 암호화**: bcrypt 해싱을 통한 비밀번호 보안
4. **역할 기반 접근제어**: ADMIN/ADMIN_SUB/USER 역할 분리
5. **CORS 설정**: 제어된 교차 출처 리소스 공유
6. **이메일 인증**: 신규 사용자 이메일 인증 필수

## 📄 라이선스

MIT License

## 🤝 기여하기

1. 프로젝트를 Fork 하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성하세요

## 📞 지원

지원이 필요하시면 GitHub 저장소에 이슈를 등록해 주세요.