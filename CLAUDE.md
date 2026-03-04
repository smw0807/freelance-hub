# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 구조

두 패키지로 구성된 모노레포이며, 패키지 매니저는 **yarn**:

- `backend/` — NestJS (TypeScript) REST API
- `frontend/` — Nuxt 4 (Vue 3) 애플리케이션

## 명령어

### 백엔드 (`backend/`)

```bash
# 의존성 설치
yarn install

# 개발 서버 실행 (watch 모드)
yarn start:dev

# 빌드
yarn build

# 전체 테스트 실행
yarn test

# 단일 테스트 파일 실행
yarn test -- --testPathPattern=app.controller

# E2E 테스트
yarn test:e2e

# 린트
yarn lint
```

서버는 `PORT` 환경변수를 사용하며 기본값은 `3000`.

### 프론트엔드 (`frontend/`)

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 프로덕션 빌드
yarn build

# 프로덕션 빌드 미리보기
yarn preview
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행.

## 아키텍처

### 백엔드

NestJS는 모듈 기반 아키텍처를 따른다. 각 기능 도메인은 `src/` 하위에 독립된 모듈로 구성:

- `*.module.ts` — 컨트롤러, 프로바이더, 임포트를 묶는 모듈
- `*.controller.ts` — HTTP 라우트 처리
- `*.service.ts` — 비즈니스 로직
- `*.spec.ts` — 소스 파일과 같은 위치에 두는 단위 테스트

`AppModule` (`src/app.module.ts`)이 루트 모듈로 모든 기능 모듈을 임포트한다. `nest-cli.json`에서 소스 루트를 `src/`로, 컴파일러는 SWC로 설정되어 있다.

### 프론트엔드

Nuxt 4 앱으로 `app/` 디렉토리 컨벤션을 사용한다. 페이지, 컴포넌트, 컴포저블, 스토어는 모두 `frontend/app/` 하위에 위치한다.

주요 모듈:

- **@nuxt/ui** — 컴포넌트 라이브러리 (Tailwind CSS 포함)
- **@pinia/nuxt** — 상태 관리
- **@nuxt/image** — 최적화된 이미지 처리
