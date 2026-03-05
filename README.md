# FreelanceHub

프리랜서를 위한 올인원 업무 관리 플랫폼. 클라이언트·프로젝트·견적·수입을 한 곳에서 관리합니다.

## 주요 기능

- **대시보드** — 수입 현황, 진행 중인 프로젝트, 최근 활동 요약
- **클라이언트 관리** — 거래처 등록·수정·소프트 삭제, 블랙리스트, 플랫폼별 분류
- **프로젝트 관리** — 상태 추적(문의→협의→진행→납품→완료), 체크리스트, 타임로그
- **견적서** — 항목별 견적 작성, 공유 링크 발송, PDF 다운로드
- **수입 관리** — 입금 내역 기록, 세금 리포트, 원천징수 처리
- **인증** — 이메일/비밀번호 로그인, 카카오 소셜 로그인, JWT Refresh Token

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | NestJS (TypeScript), Prisma ORM, PostgreSQL (Supabase) |
| 프론트엔드 | Nuxt 4 (Vue 3), Nuxt UI, Pinia, Tailwind CSS |
| 인증 | JWT (Access/Refresh), Kakao OAuth 2.0 |
| PDF | Playwright/Chromium |
| 패키지 매니저 | Yarn |

## 프로젝트 구조

```
freelance-hub/
├── backend/          # NestJS REST API (포트 3002)
│   ├── src/
│   │   ├── auth/     # 인증 (JWT, Kakao OAuth)
│   │   ├── clients/  # 클라이언트 CRUD
│   │   ├── projects/ # 프로젝트 CRUD + 체크리스트 + 타임로그
│   │   ├── quotes/   # 견적서 + PDF
│   │   ├── incomes/  # 수입 + 세금 리포트
│   │   ├── dashboard/
│   │   └── prisma/
│   └── prisma/
│       └── schema.prisma
└── frontend/         # Nuxt 4 앱 (포트 3000)
    └── app/
        ├── pages/
        ├── stores/
        ├── plugins/
        └── middleware/
```

## 시작하기

### 필수 환경변수

`backend/.env` 파일 생성:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
APP_PORT=3002
```

`frontend/.env` 파일 생성:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3002
```

### 설치 및 실행

```bash
# 백엔드
cd backend
yarn install
yarn start:dev

# 프론트엔드 (별도 터미널)
cd frontend
yarn install
yarn dev
```

### DB 마이그레이션

```bash
cd backend
yarn prisma migrate dev
```

## 카카오 로그인 설정

[Kakao Developers](https://developers.kakao.com)에서 앱 생성 후:

1. **플랫폼 > Web** — 사이트 도메인에 `http://localhost:3000` 추가
2. **카카오 로그인 > Redirect URI** — `http://localhost:3000/auth/kakao/callback` 등록
3. **동의항목** — 닉네임, 이메일(선택) 활성화

## 개발 명령어

### 백엔드

```bash
yarn start:dev   # 개발 서버 (watch 모드)
yarn build       # 프로덕션 빌드
yarn test        # 단위 테스트
yarn test:e2e    # E2E 테스트
yarn lint        # 린트
```

### 프론트엔드

```bash
yarn dev         # 개발 서버
yarn build       # 프로덕션 빌드
yarn preview     # 빌드 미리보기
```
