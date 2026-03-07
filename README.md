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

| 영역          | 기술                                                   |
| ------------- | ------------------------------------------------------ |
| 백엔드        | NestJS (TypeScript), Prisma ORM, PostgreSQL (Supabase) |
| 프론트엔드    | Nuxt 4 (Vue 3), Nuxt UI, Pinia, Tailwind CSS           |
| 인증          | JWT (Access/Refresh), Kakao OAuth 2.0                  |
| PDF           | Playwright/Chromium                                    |
| 패키지 매니저 | Yarn                                                   |

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

| 메서드 | 경로               | 인증 | 설명                            |
| ------ | ------------------ | ---- | ------------------------------- |
| POST   | `/auth/register`   | ✗    | 이메일 회원가입                 |
| POST   | `/auth/login`      | ✗    | 이메일 로그인                   |
| POST   | `/auth/kakao/code` | ✗    | 카카오 인가코드 → JWT 교환      |
| POST   | `/auth/refresh`    | ✗    | Access Token 갱신               |
| GET    | `/auth/me`         | ✓    | 내 정보 조회                    |
| POST   | `/auth/logout`     | ✓    | 로그아웃 (Refresh Token 무효화) |

### 클라이언트 `/clients`

| 메서드 | 경로                    | 설명                                    |
| ------ | ----------------------- | --------------------------------------- |
| GET    | `/clients`              | 목록 (페이징, 검색, 블랙리스트 필터)    |
| POST   | `/clients`              | 생성                                    |
| GET    | `/clients/:id`          | 단건 조회                               |
| PATCH  | `/clients/:id`          | 수정                                    |
| DELETE | `/clients/:id`          | 삭제                                    |
| GET    | `/clients/:id/projects` | 해당 클라이언트의 프로젝트 목록         |
| GET    | `/clients/:id/stats`    | 통계 (총 프로젝트 수, 완료 수, 총 수입) |

### 프로젝트 `/projects`

| 메서드 | 경로                                 | 설명                                 |
| ------ | ------------------------------------ | ------------------------------------ |
| GET    | `/projects`                          | 목록 (상태·날짜 필터, 페이징)        |
| POST   | `/projects`                          | 생성                                 |
| GET    | `/projects/:id`                      | 단건 조회 (체크리스트·타임로그 포함) |
| PATCH  | `/projects/:id`                      | 수정                                 |
| PATCH  | `/projects/:id/status`               | 상태만 변경                          |
| DELETE | `/projects/:id`                      | 삭제                                 |
| GET    | `/projects/:id/checklist`            | 체크리스트 조회                      |
| POST   | `/projects/:id/checklist`            | 체크리스트 항목 추가                 |
| PATCH  | `/projects/:id/checklist/:itemId`    | 항목 수정 (완료 토글 등)             |
| DELETE | `/projects/:id/checklist/:itemId`    | 항목 삭제                            |
| GET    | `/projects/:id/timelogs`             | 타임로그 목록                        |
| POST   | `/projects/:id/timelogs`             | 타임로그 시작                        |
| PATCH  | `/projects/:id/timelogs/:logId/stop` | 타임로그 종료                        |

### 견적서 `/quotes`

| 메서드 | 경로                           | 인증 | 설명                              |
| ------ | ------------------------------ | ---- | --------------------------------- |
| GET    | `/quotes`                      | ✓    | 목록                              |
| POST   | `/quotes`                      | ✓    | 생성                              |
| GET    | `/quotes/:id`                  | ✓    | 단건 조회                         |
| PATCH  | `/quotes/:id`                  | ✓    | 수정                              |
| POST   | `/quotes/:id/share`            | ✓    | 공유 링크 생성 (만료일 설정 가능) |
| GET    | `/quotes/:id/pdf`              | ✓    | PDF 다운로드 (Playwright)         |
| GET    | `/quotes/public/:token`        | ✗    | 공개 견적서 조회                  |
| POST   | `/quotes/public/:token/accept` | ✗    | 공개 링크로 수락                  |
| POST   | `/quotes/public/:token/reject` | ✗    | 공개 링크로 거절                  |

### 수입 `/incomes`

| 메서드 | 경로                  | 설명                                      |
| ------ | --------------------- | ----------------------------------------- |
| GET    | `/incomes`            | 목록 (연도·월 필터)                       |
| POST   | `/incomes`            | 수입 추가                                 |
| PATCH  | `/incomes/:id`        | 수정                                      |
| DELETE | `/incomes/:id`        | 삭제                                      |
| GET    | `/incomes/summary`    | 이번달·올해 수입 요약                     |
| GET    | `/incomes/tax-report` | 연도별 세금 리포트 (원천징수·예상 소득세) |

### 대시보드

| 메서드 | 경로         | 설명                                       |
| ------ | ------------ | ------------------------------------------ |
| GET    | `/dashboard` | 수입 요약, 마감 예정 프로젝트, 미수금 현황 |

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

이메일/비밀번호 입력 또는 카카오 소셜 로그인. 계정이 없으면 회원가입 페이지로 이동.

![로그인](img/1.png)

---

### 대시보드

이번 달 수입·연간 누적 수입·미수금 합계·잔월 수입을 상단 카드로 요약. 최근 6개월 수입 바차트, 마감이 임박한 프로젝트 목록(D-Day 표시), 미수금 현황을 한눈에 확인.

![대시보드](img/2.png)

---

### 클라이언트 관리

이름·담당자·연락처·플랫폼·블랙리스트 여부를 테이블로 관리. 플랫폼 뱃지(직접 계약, 크몽, 숨고, 이랜서, 원티드 긱스 등)와 이름/이메일 검색 지원.

![클라이언트 목록](img/3.png)

클라이언트 상세 페이지에서 총 프로젝트 수·완료 수·총 수입 통계, 연락처·플랫폼·평점·메모를 확인하고 연결된 프로젝트 히스토리도 조회 가능.

![클라이언트 상세](img/5.png)

업체명·담당자·이메일·전화번호·플랫폼·사업자번호·평점·메모를 입력해 신규 클라이언트 등록.

![클라이언트 등록](img/4.png)

---

### 프로젝트 관리

상태 탭(전체·문의·협의중·진행중·납품·완료)으로 필터링하며 계약금액·마감일을 테이블로 조회.

![프로젝트 목록](img/6.png)

프로젝트 상세에서 계약금액·선금(수령 완료 여부)·잔금(수령 완료 버튼)·마감일을 카드로 표시. 체크리스트로 작업 항목을 관리하고, 타임트래킹으로 작업별 소요 시간을 기록·합산.

![프로젝트 상세](img/8.png)

신규 프로젝트 등록 시 클라이언트·상태·계약금액·플랫폼·시작일·마감일·선금·잔금·메모를 한 번에 입력.

![프로젝트 등록](img/7.png)

---

### 견적서

견적번호·프로젝트·금액·상태(초안/발송/수락)·발행일을 목록으로 관리.

![견적서 목록](img/9.png)

프로젝트 선택 → 항목(이름·수량·단가) 입력 → 부가세 10% 포함 여부·할인 적용 → 합계 자동 계산.

![견적서 작성](img/10.png)

견적서 상세에서 항목별 금액·공급가액·부가세·합계를 확인하고 수락 처리, 공유 링크 생성, PDF 다운로드 가능.

![견적서 상세](img/11.png)

공유 링크 생성 시 만료일이 설정된 URL이 발급되며 복사 버튼으로 즉시 전달 가능.

![공유 링크](img/12.png)

클라이언트는 로그인 없이 공개 링크에서 견적 내용을 확인하고 수락 또는 거절.

![공개 견적서](img/13.png)

PDF 다운로드 시 견적번호·발행일·항목 테이블·합계가 인쇄용 레이아웃으로 출력.

![견적서 PDF](img/14.png)

---

### 정산 / 세금

이번 달 수입·올해 누계·원천징수 납부액·예상 소득세를 상단에 요약. 월별 수입 바차트와 플랫폼별 수입 도넛 차트를 동시에 제공. 하단 목록에서 프로젝트별 유형(선금/잔금/추가)·금액·실수령액·원천징수·지급일을 관리.

![정산/세금](img/15.png)

수입 추가 모달에서 프로젝트·유형·금액·지급일·원천징수 적용 여부(3.3%)·메모를 입력.

![수입 추가](img/16.png)

연간 리포트 PDF에는 총 수입·원천징수 납부액·실수령액·예상 소득세 요약, 월별 수입 표, 전체 수입 내역이 포함.

![연간 리포트 PDF](img/17.png)
