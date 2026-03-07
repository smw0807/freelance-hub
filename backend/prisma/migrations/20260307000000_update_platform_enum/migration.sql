-- Platform enum: FREELANCERKOREA, CREMON 제거 → ELANCER, WANTEDGIGS 추가

-- 1. DEFAULT 제약 먼저 제거 (enum 타입에 의존하므로 DROP TYPE 전에 필수)
ALTER TABLE "Client" ALTER COLUMN "platform" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "platform" DROP DEFAULT;

-- 2. 컬럼을 TEXT로 변환
ALTER TABLE "Client" ALTER COLUMN "platform" TYPE TEXT;
ALTER TABLE "Project" ALTER COLUMN "platform" TYPE TEXT;

-- 3. 기존 enum 삭제
DROP TYPE "Platform";

-- 4. 새 enum 생성
CREATE TYPE "Platform" AS ENUM ('KMONG', 'SOOMGO', 'ELANCER', 'WANTEDGIGS', 'DIRECT', 'OTHER');

-- 5. 구 값이 남아있는 경우 OTHER로 대체
UPDATE "Client" SET "platform" = 'OTHER' WHERE "platform" IN ('FREELANCERKOREA', 'CREMON');
UPDATE "Project" SET "platform" = 'OTHER' WHERE "platform" IN ('FREELANCERKOREA', 'CREMON');

-- 6. 컬럼을 새 enum 타입으로 복원 + DEFAULT 재설정
ALTER TABLE "Client" ALTER COLUMN "platform" TYPE "Platform" USING "platform"::"Platform";
ALTER TABLE "Client" ALTER COLUMN "platform" SET DEFAULT 'DIRECT';

ALTER TABLE "Project" ALTER COLUMN "platform" TYPE "Platform" USING "platform"::"Platform";
ALTER TABLE "Project" ALTER COLUMN "platform" SET DEFAULT 'DIRECT';
