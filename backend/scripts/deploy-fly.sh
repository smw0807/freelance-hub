#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FLY_TOML="${BACKEND_DIR}/fly.toml"
ENV_FILE="${BACKEND_DIR}/.env.production"

cd "${BACKEND_DIR}"

if ! command -v fly >/dev/null 2>&1; then
  echo "flyctl이 설치되어 있지 않습니다. 먼저 설치하세요: brew install flyctl"
  exit 1
fi

if [[ ! -f "${FLY_TOML}" ]]; then
  echo "fly.toml 파일을 찾을 수 없습니다: ${FLY_TOML}"
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo ".env 파일을 찾을 수 없습니다: ${ENV_FILE}"
  exit 1
fi

APP_NAME="$(awk -F'=' '/^app[[:space:]]*=/ {gsub(/["[:space:]]/, "", $2); print $2; exit}' "${FLY_TOML}")"
if [[ -z "${APP_NAME}" ]]; then
  echo "fly.toml에서 app 이름을 찾을 수 없습니다."
  exit 1
fi

if ! fly auth whoami >/dev/null 2>&1; then
  echo "Fly 인증이 필요합니다. 로그인 절차를 시작합니다."
  fly auth login
fi

set -a
# shellcheck source=/dev/null
source "${ENV_FILE}"
set +a

required_vars=(
  NODE_ENV
  APP_NAME
  APP_PORT
  DATABASE_URL
  FRONTEND_URL
  CORS_ORIGINS
  JWT_SECRET
  JWT_REFRESH_SECRET
  KAKAO_CLIENT_ID
  KAKAO_REDIRECT_URI
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "필수 환경변수가 비어 있습니다: ${var}"
    exit 1
  fi
done

if ! fly apps list | awk '{print $1}' | grep -qx "${APP_NAME}"; then
  echo "Fly 앱(${APP_NAME})이 없어 생성합니다."
  fly launch --config "${FLY_TOML}" --no-deploy
fi

echo "Fly secrets 업데이트 중..."
fly secrets set --app "${APP_NAME}" \
  NODE_ENV="${NODE_ENV}" \
  APP_NAME="${APP_NAME}" \
  APP_PORT="${APP_PORT}" \
  DATABASE_URL="${DATABASE_URL}" \
  JWT_SECRET="${JWT_SECRET}" \
  JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}" \
  FRONTEND_URL="${FRONTEND_URL}" \
  CORS_ORIGINS="${CORS_ORIGINS}" \
  KAKAO_CLIENT_ID="${KAKAO_CLIENT_ID}" \
  KAKAO_REDIRECT_URI="${KAKAO_REDIRECT_URI}"

echo "배포 시작..."
fly deploy --config "${FLY_TOML}"

echo "배포 완료: https://${APP_NAME}.fly.dev"
