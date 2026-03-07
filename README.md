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
│   │   ├── common/
│   │   │   └── utils/
│   │   │       └── date.util.ts  # 날짜 ISO 변환 유틸
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

## API 엔드포인트

모든 인증 필요 엔드포인트는 `Authorization: Bearer <accessToken>` 헤더가 필요합니다.

### 인증 `/auth`

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/auth/register` | ✗ | 이메일 회원가입 |
| POST | `/auth/login` | ✗ | 이메일 로그인 |
| POST | `/auth/kakao/code` | ✗ | 카카오 인가코드 → JWT 교환 |
| POST | `/auth/refresh` | ✗ | Access Token 갱신 |
| GET | `/auth/me` | ✓ | 내 정보 조회 |
| POST | `/auth/logout` | ✓ | 로그아웃 (Refresh Token 무효화) |

### 클라이언트 `/clients`

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/clients` | 목록 (페이징, 검색, 블랙리스트 필터) |
| POST | `/clients` | 생성 |
| GET | `/clients/:id` | 단건 조회 |
| PATCH | `/clients/:id` | 수정 |
| DELETE | `/clients/:id` | 삭제 |
| GET | `/clients/:id/projects` | 해당 클라이언트의 프로젝트 목록 |
| GET | `/clients/:id/stats` | 통계 (총 프로젝트 수, 완료 수, 총 수입) |

### 프로젝트 `/projects`

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/projects` | 목록 (상태·날짜 필터, 페이징) |
| POST | `/projects` | 생성 |
| GET | `/projects/:id` | 단건 조회 (체크리스트·타임로그 포함) |
| PATCH | `/projects/:id` | 수정 |
| PATCH | `/projects/:id/status` | 상태만 변경 |
| DELETE | `/projects/:id` | 삭제 |
| GET | `/projects/:id/checklist` | 체크리스트 조회 |
| POST | `/projects/:id/checklist` | 체크리스트 항목 추가 |
| PATCH | `/projects/:id/checklist/:itemId` | 항목 수정 (완료 토글 등) |
| DELETE | `/projects/:id/checklist/:itemId` | 항목 삭제 |
| GET | `/projects/:id/timelogs` | 타임로그 목록 |
| POST | `/projects/:id/timelogs` | 타임로그 시작 |
| PATCH | `/projects/:id/timelogs/:logId/stop` | 타임로그 종료 |

### 견적서 `/quotes`

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/quotes` | ✓ | 목록 |
| POST | `/quotes` | ✓ | 생성 |
| GET | `/quotes/:id` | ✓ | 단건 조회 |
| PATCH | `/quotes/:id` | ✓ | 수정 |
| POST | `/quotes/:id/share` | ✓ | 공유 링크 생성 (만료일 설정 가능) |
| GET | `/quotes/:id/pdf` | ✓ | PDF 다운로드 (Playwright) |
| GET | `/quotes/public/:token` | ✗ | 공개 견적서 조회 |
| POST | `/quotes/public/:token/accept` | ✗ | 공개 링크로 수락 |
| POST | `/quotes/public/:token/reject` | ✗ | 공개 링크로 거절 |

### 수입 `/incomes`

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/incomes` | 목록 (연도·월 필터) |
| POST | `/incomes` | 수입 추가 |
| PATCH | `/incomes/:id` | 수정 |
| DELETE | `/incomes/:id` | 삭제 |
| GET | `/incomes/summary` | 이번달·올해 수입 요약 |
| GET | `/incomes/tax-report` | 연도별 세금 리포트 (원천징수·예상 소득세) |

### 대시보드

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/dashboard` | 수입 요약, 마감 예정 프로젝트, 미수금 현황 |

## 인증 플로우

### 이메일 로그인
```
POST /auth/login → { accessToken, refreshToken }
  └─ accessToken: 15분 만료, 모든 API 요청 헤더에 포함
  └─ refreshToken: 7일 만료, DB에 bcrypt 해시로 저장
       └─ POST /auth/refresh → 새 accessToken 발급
```

### 카카오 로그인
카카오 Redirect URI가 프론트엔드를 가리키므로, 프론트가 `code`를 받아 백엔드에 전달하는 방식을 사용합니다.

```
1. 프론트 → Kakao 인증 페이지로 이동
2. Kakao → 프론트 /auth/kakao/callback?code=... 로 리다이렉트
3. 프론트 → POST /auth/kakao/code { code, redirectUri }
4. 백엔드 → Kakao 토큰 교환 → 유저 조회/생성 → JWT 발급
5. 프론트 → localStorage에 토큰 저장 → 대시보드 이동
```

## Supabase 사용 시 주의사항

Supabase 무료 플랜은 **7일 미사용 시 DB가 자동 일시정지**됩니다.

마이그레이션이나 연결이 실패할 경우:
1. [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트를 깨운 후 재시도
2. **Settings > Database > Connection string** 에서 최신 URL 확인
3. 비밀번호에 특수문자(`@` 등)가 있으면 URL 인코딩 필요 (`@` → `%40`)
4. Session Pooler URL(포트 5432) 사용 권장

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

---

## 구현 화면

### 로그인

이메일/비밀번호 또는 카카오 소셜 로그인.

![로그인](img/login.png)

---

### 대시보드

이번 달·연간 수입 요약, 최근 6개월 바차트, 마감 예정 프로젝트, 미수금 현황.

![대시보드](img/dashboard.png)

---

### 클라이언트 관리

플랫폼별·블랙리스트 필터, 별점, 거래 통계 제공.

![클라이언트](img/clients.png)

---

### 프로젝트 관리

계약 금액·선금·잔금 추적, 체크리스트, 타임로그 기록.

![프로젝트](img/projects.png)

---

### 견적서

항목별 견적 작성, 공유 링크 생성, PDF 다운로드.

![견적서](img/quotes.png)

---

### 정산 / 세금

수입 내역 관리, 월별·플랫폼별 차트, 원천징수 자동 계산, 연간 리포트 PDF.

![정산/세금](img/incomes.png)

---

### 설정

프로필(이름·전화번호·시간당 단가) 수정.

![설정](img/settings.png)
