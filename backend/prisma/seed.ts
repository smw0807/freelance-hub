import 'dotenv/config';
import { Platform, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // ── 기존 사용자 조회 ────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({ where: { email: 'test1@gmail.com' } });
  if (!user) {
    throw new Error('test1@gmail.com 사용자를 찾을 수 없습니다. 먼저 회원가입 후 실행하세요.');
  }
  console.log(`✅ 사용자 확인: ${user.email}`);

  // ── 기존 시드 데이터 초기화 (해당 유저 데이터만) ─────────────────────────
  await prisma.income.deleteMany({ where: { userId: user.id } });
  await prisma.timeLog.deleteMany({ where: { project: { userId: user.id } } });
  await prisma.checklistItem.deleteMany({ where: { project: { userId: user.id } } });
  await prisma.quote.deleteMany({ where: { project: { userId: user.id } } });
  await prisma.contract.deleteMany({ where: { userId: user.id } });
  await prisma.project.deleteMany({ where: { userId: user.id } });
  await prisma.client.deleteMany({ where: { userId: user.id } });

  // ── 클라이언트 ────────────────────────────────────────────────────────────
  const [clientA, clientB, clientC, clientD, clientE] = await Promise.all([
    prisma.client.create({
      data: {
        userId: user.id,
        name: '(주)그린소프트',
        contactName: '이수현',
        phone: '02-1234-5678',
        email: 'contact@greensoft.co.kr',
        platform: 'KMONG',
        rating: 5,
        memo: '빠른 피드백, 결제도 빠름. 재계약 가능성 높음.',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: '마케팅웍스',
        contactName: '박지은',
        phone: '010-9876-5432',
        email: 'jieun@mktworks.kr',
        platform: 'SOOMGO',
        rating: 4,
        memo: '수정 요청이 많지만 단가가 괜찮음.',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: '원티드랩 파트너',
        contactName: '최재원',
        phone: '02-3456-7890',
        email: 'jaewon@wantedlab.io',
        platform: 'WANTEDGIGS' as Platform,
        rating: 5,
        memo: '스타트업, 기술 이해도 높음. 장기 파트너십 희망.',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: '패션몰 스타일링크',
        contactName: '강민서',
        phone: '010-5555-3333',
        email: 'minseo@stylelink.shop',
        platform: 'ELANCER' as Platform,
        rating: 3,
        memo: '요구사항 변경 잦음. 계약서 꼭 작성할 것.',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: '데이터랩 (개인)',
        contactName: '윤성호',
        phone: '010-7777-2222',
        email: 'sungho.yoon@gmail.com',
        platform: 'DIRECT',
        rating: 4,
        memo: '지인 소개. 단가 협상 여지 있음.',
      },
    }),
  ]);
  console.log('✅ 클라이언트 5명 생성');

  // ── 프로젝트 ────────────────────────────────────────────────────────────────
  const now = new Date('2026-03-07');

  const projectShopping = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: clientD.id,
      title: '패션몰 쇼핑몰 리뉴얼',
      status: 'COMPLETED',
      platform: 'ELANCER' as Platform,
      platformFeeRate: 10,
      contractAmount: 3500000,
      depositAmount: 1750000,
      depositPaidAt: new Date('2025-09-10'),
      balanceAmount: 1750000,
      balancePaidAt: new Date('2025-10-25'),
      startedAt: new Date('2025-09-10'),
      deadlineAt: new Date('2025-10-20'),
      deliveredAt: new Date('2025-10-18'),
      tags: ['쇼핑몰', '리뉴얼', 'UI/UX'],
      memo: '모바일 반응형 필수. 결제 모듈 연동 포함.',
    },
  });

  const projectLogo = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: clientB.id,
      title: '마케팅웍스 브랜드 로고 디자인',
      status: 'COMPLETED',
      platform: 'SOOMGO',
      platformFeeRate: 15,
      contractAmount: 900000,
      depositAmount: 0,
      balanceAmount: 0,
      startedAt: new Date('2025-10-15'),
      deadlineAt: new Date('2025-11-10'),
      deliveredAt: new Date('2025-11-08'),
      tags: ['로고', '브랜딩', '디자인'],
      memo: '심볼 + 워드마크 2종. 컬러/흑백 버전 모두 납품.',
    },
  });

  const projectApp = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: clientA.id,
      title: '그린소프트 모바일 앱 UI 개발',
      status: 'IN_PROGRESS',
      platform: 'KMONG',
      platformFeeRate: 20,
      contractAmount: 6000000,
      depositAmount: 2000000,
      depositPaidAt: new Date('2025-12-01'),
      balanceAmount: 4000000,
      startedAt: new Date('2025-12-01'),
      deadlineAt: new Date('2026-03-21'),
      tags: ['모바일', 'React Native', 'UI개발'],
      memo: '안드로이드/iOS 동시 개발. 피그마 시안 먼저 확정 후 진행.',
    },
  });

  const projectHomepage = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: clientC.id,
      title: '원티드랩 파트너 기업 홈페이지 제작',
      status: 'IN_PROGRESS',
      platform: 'WANTEDGIGS' as Platform,
      platformFeeRate: 10,
      contractAmount: 4500000,
      depositAmount: 2000000,
      depositPaidAt: new Date('2026-01-15'),
      balanceAmount: 2500000,
      startedAt: new Date('2026-01-15'),
      deadlineAt: new Date('2026-03-14'),
      tags: ['홈페이지', 'Next.js', 'Figma'],
      memo: 'CMS 연동 필요. 다국어(한/영) 지원.',
    },
  });

  const projectSns = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: clientB.id,
      title: 'SNS 콘텐츠 기획 및 제작 (월정액)',
      status: 'DELIVERED',
      platform: 'SOOMGO',
      platformFeeRate: 15,
      contractAmount: 1500000,
      depositAmount: 750000,
      depositPaidAt: new Date('2026-01-05'),
      balanceAmount: 750000,
      startedAt: new Date('2026-01-05'),
      deadlineAt: new Date('2026-02-28'),
      deliveredAt: new Date('2026-02-27'),
      tags: ['SNS', '콘텐츠', '인스타그램'],
      memo: '인스타그램·블로그 월 20건. 피드 디자인 포함.',
    },
  });

  const projectDashboard = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: clientE.id,
      title: '영업 데이터 분석 대시보드 개발',
      status: 'NEGOTIATING',
      platform: 'DIRECT',
      platformFeeRate: 0,
      contractAmount: 5000000,
      depositAmount: 0,
      balanceAmount: 5000000,
      deadlineAt: new Date('2026-05-31'),
      tags: ['데이터분석', 'Python', '대시보드'],
      memo: 'Metabase 또는 커스텀 개발 선택 중. 견적서 발송 대기.',
    },
  });

  const projectLanding = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: clientA.id,
      title: '신규 서비스 런칭 랜딩페이지',
      status: 'INQUIRY',
      platform: 'KMONG',
      platformFeeRate: 20,
      contractAmount: 1800000,
      depositAmount: 0,
      balanceAmount: 1800000,
      deadlineAt: new Date('2026-04-15'),
      tags: ['랜딩페이지', '마케팅', 'Webflow'],
      memo: '전환율 최적화 중점. A/B테스트 지원 요청.',
    },
  });

  console.log('✅ 프로젝트 7개 생성');

  // ── 체크리스트 ─────────────────────────────────────────────────────────────
  await prisma.checklistItem.createMany({
    data: [
      { projectId: projectApp.id, title: '피그마 와이어프레임 확정', isDone: true, order: 0 },
      { projectId: projectApp.id, title: '디자인 시스템 구성', isDone: true, order: 1 },
      { projectId: projectApp.id, title: '로그인/회원가입 화면 개발', isDone: true, order: 2 },
      { projectId: projectApp.id, title: '메인 피드 화면 개발', isDone: false, order: 3 },
      { projectId: projectApp.id, title: '알림 기능 구현', isDone: false, order: 4 },
      { projectId: projectApp.id, title: '최종 QA 및 납품', isDone: false, order: 5 },
      { projectId: projectHomepage.id, title: '기획서 및 사이트맵 확정', isDone: true, order: 0 },
      { projectId: projectHomepage.id, title: 'Figma 디자인 시안 완료', isDone: true, order: 1 },
      { projectId: projectHomepage.id, title: '메인 페이지 개발', isDone: true, order: 2 },
      { projectId: projectHomepage.id, title: '서브 페이지 개발', isDone: false, order: 3 },
      { projectId: projectHomepage.id, title: 'CMS 연동', isDone: false, order: 4 },
      { projectId: projectHomepage.id, title: '다국어 적용 및 최종 검수', isDone: false, order: 5 },
    ],
  });
  console.log('✅ 체크리스트 생성');

  // ── 타임로그 ─────────────────────────────────────────────────────────────
  await prisma.timeLog.createMany({
    data: [
      {
        projectId: projectApp.id,
        description: '디자인 시스템 컴포넌트 작업',
        startedAt: new Date('2026-01-20T09:00:00'),
        endedAt: new Date('2026-01-20T13:30:00'),
        durationMinutes: 270,
      },
      {
        projectId: projectApp.id,
        description: '로그인 화면 개발 및 API 연동',
        startedAt: new Date('2026-02-03T10:00:00'),
        endedAt: new Date('2026-02-03T17:00:00'),
        durationMinutes: 420,
      },
      {
        projectId: projectApp.id,
        description: '회원가입 플로우 구현',
        startedAt: new Date('2026-02-10T09:30:00'),
        endedAt: new Date('2026-02-10T14:00:00'),
        durationMinutes: 270,
      },
      {
        projectId: projectHomepage.id,
        description: '메인 페이지 히어로 섹션 개발',
        startedAt: new Date('2026-02-01T10:00:00'),
        endedAt: new Date('2026-02-01T15:00:00'),
        durationMinutes: 300,
      },
      {
        projectId: projectHomepage.id,
        description: '서비스 소개 섹션 + 애니메이션',
        startedAt: new Date('2026-02-12T09:00:00'),
        endedAt: new Date('2026-02-12T12:30:00'),
        durationMinutes: 210,
      },
    ],
  });
  console.log('✅ 타임로그 생성');

  // ── 견적서 ────────────────────────────────────────────────────────────────
  await prisma.quote.create({
    data: {
      projectId: projectDashboard.id,
      quoteNo: 'QT-2026-001',
      status: 'SENT',
      items: [
        { description: '요구사항 분석 및 설계', quantity: 1, unitPrice: 500000, amount: 500000 },
        { description: '데이터 파이프라인 구축', quantity: 1, unitPrice: 1500000, amount: 1500000 },
        { description: '대시보드 화면 개발 (10페이지)', quantity: 10, unitPrice: 200000, amount: 2000000 },
        { description: '배포 및 유지보수 (1개월)', quantity: 1, unitPrice: 500000, amount: 500000 },
      ],
      subtotal: 4500000,
      vatAmount: 450000,
      discountAmount: 0,
      totalAmount: 4950000,
      shareToken: 'share-demo-token-dashboard',
      expiresAt: new Date('2026-04-07'),
      memo: '견적 유효기간: 발행일로부터 30일\n계약금 50% 선납 후 착수',
    },
  });

  await prisma.quote.create({
    data: {
      projectId: projectLanding.id,
      quoteNo: 'QT-2026-002',
      status: 'DRAFT',
      items: [
        { description: '기획 및 UX 설계', quantity: 1, unitPrice: 300000, amount: 300000 },
        { description: '랜딩페이지 디자인 (Figma)', quantity: 1, unitPrice: 500000, amount: 500000 },
        { description: '퍼블리싱 및 개발 (Webflow)', quantity: 1, unitPrice: 800000, amount: 800000 },
        { description: 'A/B테스트 설정', quantity: 1, unitPrice: 200000, amount: 200000 },
      ],
      subtotal: 1800000,
      vatAmount: 0,
      discountAmount: 0,
      totalAmount: 1800000,
      memo: '초안 작성 중',
    },
  });

  await prisma.quote.create({
    data: {
      projectId: projectShopping.id,
      quoteNo: 'QT-2025-001',
      status: 'ACCEPTED',
      items: [
        { description: 'UI/UX 기획 및 디자인', quantity: 1, unitPrice: 1000000, amount: 1000000 },
        { description: '프론트엔드 개발', quantity: 1, unitPrice: 1500000, amount: 1500000 },
        { description: '결제 모듈 연동', quantity: 1, unitPrice: 500000, amount: 500000 },
        { description: '모바일 반응형 작업', quantity: 1, unitPrice: 300000, amount: 300000 },
        { description: '상품 관리 기능 개발', quantity: 1, unitPrice: 200000, amount: 200000 },
      ],
      subtotal: 3500000,
      vatAmount: 0,
      discountAmount: 0,
      totalAmount: 3500000,
    },
  });

  await prisma.quote.create({
    data: {
      projectId: projectApp.id,
      quoteNo: 'QT-2025-002',
      status: 'ACCEPTED',
      items: [
        { description: '앱 기획 및 와이어프레임', quantity: 1, unitPrice: 500000, amount: 500000 },
        { description: 'UI 디자인 시스템 구축', quantity: 1, unitPrice: 800000, amount: 800000 },
        { description: '화면 개발 (20개 스크린)', quantity: 20, unitPrice: 150000, amount: 3000000 },
        { description: 'API 연동 및 테스트', quantity: 1, unitPrice: 700000, amount: 700000 },
      ],
      subtotal: 5000000,
      vatAmount: 1000000,
      discountAmount: 0,
      totalAmount: 6000000,
    },
  });
  console.log('✅ 견적서 4건 생성');

  // ── 계약서 ────────────────────────────────────────────────────────────────
  await prisma.contract.create({
    data: {
      userId: user.id,
      projectId: projectShopping.id,
      contractNo: 'CT-2025-001',
      type: 'DESIGN',
      status: 'COMPLETED',
      title: '패션몰 쇼핑몰 리뉴얼 디자인 계약서',
      content: `제1조 (목적)
본 계약은 패션몰 스타일링크(이하 "갑")과 디자이너(이하 "을") 사이에 패션몰 쇼핑몰 리뉴얼 디자인 용역에 관한 권리와 의무를 규정함을 목적으로 한다.

제2조 (용역 내용)
"을"은 다음과 같은 디자인 용역을 제공한다.
- 프로젝트명: 패션몰 쇼핑몰 리뉴얼
- 계약 금액: 3,500,000원
- 작업 기간: 2025-09-10 ~ 2025-10-20

제3조 (수정 및 검수)
1. 기본 수정 횟수는 3회로 한정한다.
2. 추가 수정 시 별도 협의하여 추가 비용이 발생할 수 있다.
3. "갑"은 시안 수령 후 5일 이내에 피드백을 제공하여야 한다.

제4조 (대금 지급)
1. 계약금: 계약 체결 시 총 계약금액의 50%를 지급한다.
2. 잔금: 최종 결과물 납품 후 잔금을 지급한다.

제5조 (저작권)
1. 납품된 디자인 결과물의 저작권은 대금 완납 후 "갑"에게 귀속된다.
2. "을"은 포트폴리오 목적으로 해당 작업물을 사용할 수 있다. 단, "갑"이 별도 비밀 유지를 요청한 경우 제외한다.

제6조 (계약 해제)
일방 당사자가 본 계약을 위반하거나 이행 불능 상태에 빠진 경우, 상대방은 7일 이상의 서면 통지 후 본 계약을 해제할 수 있다.`,
      totalAmount: 3500000,
      startDate: new Date('2025-09-10'),
      endDate: new Date('2025-10-20'),
      signedAt: new Date('2025-09-10'),
      signerName: '강민서',
      memo: '모바일 반응형 필수. 결제 모듈 연동 포함.',
    },
  });

  await prisma.contract.create({
    data: {
      userId: user.id,
      projectId: projectLogo.id,
      contractNo: 'CT-2025-002',
      type: 'DESIGN',
      status: 'SIGNED',
      title: '마케팅웍스 브랜드 로고 디자인 계약서',
      content: `제1조 (목적)
본 계약은 마케팅웍스(이하 "갑")과 디자이너(이하 "을") 사이에 마케팅웍스 브랜드 로고 디자인 디자인 용역에 관한 권리와 의무를 규정함을 목적으로 한다.

제2조 (용역 내용)
"을"은 다음과 같은 디자인 용역을 제공한다.
- 프로젝트명: 마케팅웍스 브랜드 로고 디자인
- 계약 금액: 900,000원
- 작업 기간: 2025-10-15 ~ 2025-11-10

제3조 (수정 및 검수)
1. 기본 수정 횟수는 3회로 한정한다.
2. 추가 수정 시 별도 협의하여 추가 비용이 발생할 수 있다.
3. "갑"은 시안 수령 후 5일 이내에 피드백을 제공하여야 한다.

제4조 (대금 지급)
1. 계약금: 계약 체결 시 총 계약금액의 50%를 지급한다.
2. 잔금: 최종 결과물 납품 후 잔금을 지급한다.

제5조 (저작권)
1. 납품된 디자인 결과물의 저작권은 대금 완납 후 "갑"에게 귀속된다.
2. "을"은 포트폴리오 목적으로 해당 작업물을 사용할 수 있다. 단, "갑"이 별도 비밀 유지를 요청한 경우 제외한다.

제6조 (계약 해제)
일방 당사자가 본 계약을 위반하거나 이행 불능 상태에 빠진 경우, 상대방은 7일 이상의 서면 통지 후 본 계약을 해제할 수 있다.`,
      totalAmount: 900000,
      startDate: new Date('2025-10-15'),
      endDate: new Date('2025-11-10'),
      signedAt: new Date('2025-10-16'),
      signerName: '박지은',
      memo: '심볼 + 워드마크 2종. 컬러/흑백 버전 모두 납품.',
    },
  });

  await prisma.contract.create({
    data: {
      userId: user.id,
      projectId: projectApp.id,
      contractNo: 'CT-2025-003',
      type: 'DEVELOPMENT',
      status: 'SIGNED',
      title: '그린소프트 모바일 앱 UI 개발 계약서',
      content: `제1조 (목적)
본 계약은 (주)그린소프트(이하 "갑")과 수급인(이하 "을") 사이에 그린소프트 모바일 앱 UI 개발 개발 용역에 관한 권리와 의무를 규정함을 목적으로 한다.

제2조 (용역 내용)
"을"은 다음과 같은 소프트웨어 개발 용역을 제공한다.
- 프로젝트명: 그린소프트 모바일 앱 UI 개발
- 계약 금액: 6,000,000원
- 개발 기간: 2025-12-01 ~ 2026-03-21

제3조 (납품 및 검수)
1. "을"은 계약 기간 내에 개발 결과물을 "갑"에게 납품한다.
2. "갑"은 납품일로부터 7일 이내에 검수를 완료하여야 한다.
3. 검수 기간 내에 "갑"의 이의 제기가 없을 경우 검수 완료로 간주한다.

제4조 (대금 지급)
1. 계약금: 계약 체결 시 총 계약금액의 50%를 지급한다.
2. 잔금: 최종 납품 및 검수 완료 후 잔금을 지급한다.

제5조 (지식재산권)
1. 본 계약에 의해 개발된 결과물의 저작권 및 지식재산권은 대금 완납 후 "갑"에게 귀속된다.
2. "을"은 개발 과정에서 알게 된 "갑"의 영업 비밀 및 기술 정보를 제3자에게 누설하지 아니한다.

제6조 (하자 보수)
"을"은 납품일로부터 3개월간 하자 보수 의무를 부담한다.

제7조 (계약 해제)
일방 당사자가 본 계약을 위반하거나 이행 불능 상태에 빠진 경우, 상대방은 14일 이상의 서면 통지 후 본 계약을 해제할 수 있다.`,
      totalAmount: 6000000,
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-03-21'),
      shareToken: 'share-contract-token-app',
      signedAt: new Date('2025-12-01'),
      signerName: '이수현',
      memo: '안드로이드/iOS 동시 개발. 피그마 시안 먼저 확정 후 진행.',
    },
  });

  await prisma.contract.create({
    data: {
      userId: user.id,
      projectId: projectHomepage.id,
      contractNo: 'CT-2026-001',
      type: 'DEVELOPMENT',
      status: 'SENT',
      title: '원티드랩 파트너 기업 홈페이지 제작 계약서',
      content: `제1조 (목적)
본 계약은 원티드랩 파트너(이하 "갑")과 수급인(이하 "을") 사이에 원티드랩 파트너 기업 홈페이지 제작 개발 용역에 관한 권리와 의무를 규정함을 목적으로 한다.

제2조 (용역 내용)
"을"은 다음과 같은 소프트웨어 개발 용역을 제공한다.
- 프로젝트명: 원티드랩 파트너 기업 홈페이지 제작
- 계약 금액: 4,500,000원
- 개발 기간: 2026-01-15 ~ 2026-03-14

제3조 (납품 및 검수)
1. "을"은 계약 기간 내에 개발 결과물을 "갑"에게 납품한다.
2. "갑"은 납품일로부터 7일 이내에 검수를 완료하여야 한다.
3. 검수 기간 내에 "갑"의 이의 제기가 없을 경우 검수 완료로 간주한다.

제4조 (대금 지급)
1. 계약금: 계약 체결 시 총 계약금액의 50%를 지급한다.
2. 잔금: 최종 납품 및 검수 완료 후 잔금을 지급한다.

제5조 (지식재산권)
1. 본 계약에 의해 개발된 결과물의 저작권 및 지식재산권은 대금 완납 후 "갑"에게 귀속된다.
2. "을"은 개발 과정에서 알게 된 "갑"의 영업 비밀 및 기술 정보를 제3자에게 누설하지 아니한다.

제6조 (하자 보수)
"을"은 납품일로부터 3개월간 하자 보수 의무를 부담한다.

제7조 (계약 해제)
일방 당사자가 본 계약을 위반하거나 이행 불능 상태에 빠진 경우, 상대방은 14일 이상의 서면 통지 후 본 계약을 해제할 수 있다.`,
      totalAmount: 4500000,
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-03-14'),
      shareToken: 'share-contract-token-homepage',
      expiresAt: new Date('2026-04-14'),
      memo: 'CMS 연동 필요. 다국어(한/영) 지원.',
    },
  });

  await prisma.contract.create({
    data: {
      userId: user.id,
      projectId: projectDashboard.id,
      contractNo: 'CT-2026-002',
      type: 'DEVELOPMENT',
      status: 'DRAFT',
      title: '영업 데이터 분석 대시보드 개발 계약서',
      content: `제1조 (목적)
본 계약은 데이터랩 (개인)(이하 "갑")과 수급인(이하 "을") 사이에 영업 데이터 분석 대시보드 개발 개발 용역에 관한 권리와 의무를 규정함을 목적으로 한다.

제2조 (용역 내용)
"을"은 다음과 같은 소프트웨어 개발 용역을 제공한다.
- 프로젝트명: 영업 데이터 분석 대시보드 개발
- 계약 금액: 5,000,000원
- 개발 기간: 2026-04-01 ~ 2026-05-31

제3조 (납품 및 검수)
1. "을"은 계약 기간 내에 개발 결과물을 "갑"에게 납품한다.
2. "갑"은 납품일로부터 7일 이내에 검수를 완료하여야 한다.
3. 검수 기간 내에 "갑"의 이의 제기가 없을 경우 검수 완료로 간주한다.

제4조 (대금 지급)
1. 계약금: 계약 체결 시 총 계약금액의 50%를 지급한다.
2. 잔금: 최종 납품 및 검수 완료 후 잔금을 지급한다.

제5조 (지식재산권)
1. 본 계약에 의해 개발된 결과물의 저작권 및 지식재산권은 대금 완납 후 "갑"에게 귀속된다.
2. "을"은 개발 과정에서 알게 된 "갑"의 영업 비밀 및 기술 정보를 제3자에게 누설하지 아니한다.

제6조 (하자 보수)
"을"은 납품일로부터 3개월간 하자 보수 의무를 부담한다.

제7조 (계약 해제)
일방 당사자가 본 계약을 위반하거나 이행 불능 상태에 빠진 경우, 상대방은 14일 이상의 서면 통지 후 본 계약을 해제할 수 있다.`,
      totalAmount: 5000000,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-05-31'),
      memo: 'Metabase 또는 커스텀 개발 선택 중. 견적서 발송 대기.',
    },
  });

  console.log('✅ 계약서 5건 생성');

  // ── 수입 ────────────────────────────────────────────────────────────────
  const incomes = [
    // 2025년 9월 - 쇼핑몰 선금
    {
      projectId: projectShopping.id,
      userId: user.id,
      incomeType: 'DEPOSIT' as const,
      amount: 1750000,
      isWithholdingTax: true,
      netAmount: Math.round(1750000 * 0.967),
      paidAt: new Date('2025-09-10'),
      memo: '계약금 50%',
    },
    // 2025년 10월 - 쇼핑몰 잔금
    {
      projectId: projectShopping.id,
      userId: user.id,
      incomeType: 'BALANCE' as const,
      amount: 1750000,
      isWithholdingTax: true,
      netAmount: Math.round(1750000 * 0.967),
      paidAt: new Date('2025-10-25'),
      memo: '잔금 - 납품 완료',
    },
    // 2025년 11월 - 로고 디자인 전액
    {
      projectId: projectLogo.id,
      userId: user.id,
      incomeType: 'FULL' as const,
      amount: 900000,
      isWithholdingTax: false,
      netAmount: 900000,
      paidAt: new Date('2025-11-10'),
      memo: '로고 납품 완료 - 전액',
    },
    // 2025년 12월 - 모바일 앱 선금
    {
      projectId: projectApp.id,
      userId: user.id,
      incomeType: 'DEPOSIT' as const,
      amount: 2000000,
      isWithholdingTax: true,
      netAmount: Math.round(2000000 * 0.967),
      paidAt: new Date('2025-12-01'),
      memo: '계약금 - 착수',
    },
    // 2026년 1월 - 홈페이지 선금
    {
      projectId: projectHomepage.id,
      userId: user.id,
      incomeType: 'DEPOSIT' as const,
      amount: 2000000,
      isWithholdingTax: true,
      netAmount: Math.round(2000000 * 0.967),
      paidAt: new Date('2026-01-15'),
      memo: '계약금 50%',
    },
    // 2026년 1월 - SNS 선금
    {
      projectId: projectSns.id,
      userId: user.id,
      incomeType: 'DEPOSIT' as const,
      amount: 750000,
      isWithholdingTax: false,
      netAmount: 750000,
      paidAt: new Date('2026-01-05'),
      memo: 'SNS 콘텐츠 1월분',
    },
    // 2026년 2월 - 모바일 앱 중도금
    {
      projectId: projectApp.id,
      userId: user.id,
      incomeType: 'EXTRA' as const,
      amount: 1500000,
      isWithholdingTax: true,
      netAmount: Math.round(1500000 * 0.967),
      paidAt: new Date('2026-02-01'),
      memo: '중도금 - 디자인 완료',
    },
    // 2026년 2월 - SNS 잔금 (미수)
    {
      projectId: projectSns.id,
      userId: user.id,
      incomeType: 'BALANCE' as const,
      amount: 750000,
      isWithholdingTax: false,
      netAmount: 750000,
      paidAt: new Date('2026-03-01'),
      memo: 'SNS 콘텐츠 2월분 - 납품 후 수령',
    },
    // 2026년 3월 - 홈페이지 중도금
    {
      projectId: projectHomepage.id,
      userId: user.id,
      incomeType: 'EXTRA' as const,
      amount: 1000000,
      isWithholdingTax: true,
      netAmount: Math.round(1000000 * 0.967),
      paidAt: new Date('2026-03-05'),
      memo: '중도금 - 메인 페이지 개발 완료',
    },
  ];

  await prisma.income.createMany({ data: incomes });
  console.log('✅ 수입 9건 생성');

  console.log('\n🎉 시드 완료!');
  console.log('──────────────────────────────');
  console.log(`📧 이메일: ${user.email}`);
  console.log('──────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
