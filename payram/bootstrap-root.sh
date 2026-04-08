#!/bin/sh

set -eu

API_BASE_URL="${PAYRAM_API_BASE_URL:-https://payram:8443}"
ROOT_EMAIL="${PAYRAM_ROOT_EMAIL:-root@local.dev}"
ROOT_PASSWORD="${PAYRAM_ROOT_PASSWORD:-Root@12345}"
MAX_ATTEMPTS="${PAYRAM_BOOTSTRAP_MAX_ATTEMPTS:-60}"
DEFAULT_PROJECT_NAME="${PAYRAM_DEFAULT_PROJECT_NAME:-Default Project}"
SMTP_HOST="${PAYRAM_SMTP_HOST:-mailpit}"
SMTP_PORT="${PAYRAM_SMTP_PORT:-1025}"
SMTP_FROM_EMAIL="${PAYRAM_SMTP_FROM_EMAIL:-noreply@local.dev}"
SMTP_REPLY_TO_EMAIL="${PAYRAM_SMTP_REPLY_TO_EMAIL:-noreply@local.dev}"
SMTP_USERNAME="${PAYRAM_SMTP_USERNAME:-}"
SMTP_PASSWORD="${PAYRAM_SMTP_PASSWORD:-}"
SMTP_USE_TLS="${PAYRAM_SMTP_USE_TLS:-false}"

attempt=1

echo "[payram-bootstrap] Ensuring root account exists at ${API_BASE_URL}"

while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  exists_response="$(curl -k -fsS "${API_BASE_URL}/api/v1/member/root/exist" || true)"

  case "$exists_response" in
    *'"exist":true'*)
      echo "[payram-bootstrap] Root user already exists"
      break
      ;;
    *'"exist":false'*)
      echo "[payram-bootstrap] Root user missing, creating with ${ROOT_EMAIL}"
      signup_payload=$(printf '{"email":"%s","password":"%s"}' "$ROOT_EMAIL" "$ROOT_PASSWORD")

      response_with_code="$(curl -k -sS -w '\n%{http_code}' -H 'Content-Type: application/json' -X POST "${API_BASE_URL}/api/v1/signup" -d "$signup_payload" || true)"
      http_code="$(printf '%s\n' "$response_with_code" | tail -n 1)"
      response_body="$(printf '%s\n' "$response_with_code" | sed '$d')"

      if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "[payram-bootstrap] Root user created successfully"
        break
      fi

      if printf '%s' "$response_body" | grep -qi 'already\|exist'; then
        echo "[payram-bootstrap] Root creation response indicates user already exists"
        break
      fi

      echo "[payram-bootstrap] Signup not ready yet (HTTP ${http_code:-n/a}), retrying..."
      ;;
    *)
      echo "[payram-bootstrap] API not ready yet (attempt ${attempt}/${MAX_ATTEMPTS}), retrying..."
      ;;
  esac

  attempt=$((attempt + 1))
  sleep 2
done

if [ "$attempt" -gt "$MAX_ATTEMPTS" ]; then
  echo "[payram-bootstrap] Failed to ensure root user after ${MAX_ATTEMPTS} attempts"
  exit 1
fi

echo "[payram-bootstrap] Ensuring at least one external platform exists"

signin_payload=$(printf '{"email":"%s","password":"%s"}' "$ROOT_EMAIL" "$ROOT_PASSWORD")
signin_response="$(curl -k -sS -H 'Content-Type: application/json' -X POST "${API_BASE_URL}/api/v1/signin" -d "$signin_payload" || true)"
access_token="$(printf '%s' "$signin_response" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')"

if [ -z "$access_token" ]; then
  echo "[payram-bootstrap] Failed to obtain access token for external platform bootstrap"
  exit 1
fi

echo "[payram-bootstrap] Ensuring SMTP config exists"
smtp_response="$(curl -k -sS -H "Authorization: Bearer ${access_token}" "${API_BASE_URL}/api/v1/config/smtp/" || true)"

if ! printf '%s' "$smtp_response" | grep -q '"host"'; then
  smtp_payload=$(printf '{"host":"%s","port":%s,"from":"%s","replyTo":"%s","username":"%s","password":"%s","useTLS":%s}' \
    "$SMTP_HOST" "$SMTP_PORT" "$SMTP_FROM_EMAIL" "$SMTP_REPLY_TO_EMAIL" "$SMTP_USERNAME" "$SMTP_PASSWORD" "$SMTP_USE_TLS")
  smtp_response_with_code="$(curl -k -sS -w '\n%{http_code}' -H 'Content-Type: application/json' -H "Authorization: Bearer ${access_token}" -X POST "${API_BASE_URL}/api/v1/config/smtp/" -d "$smtp_payload" || true)"
  smtp_http_code="$(printf '%s\n' "$smtp_response_with_code" | tail -n 1)"
  smtp_body="$(printf '%s\n' "$smtp_response_with_code" | sed '$d')"

  if [ "$smtp_http_code" = "200" ] || [ "$smtp_http_code" = "201" ]; then
    echo "[payram-bootstrap] SMTP config created"
  else
    echo "[payram-bootstrap] Failed to create SMTP config (HTTP ${smtp_http_code:-n/a})"
    echo "[payram-bootstrap] SMTP response: ${smtp_body}"
  fi
else
  echo "[payram-bootstrap] SMTP config already exists"
fi

projects_response="$(curl -k -sS -H "Authorization: Bearer ${access_token}" "${API_BASE_URL}/api/v1/external-platform/all" || true)"

case "$projects_response" in
  \[*\])
    if printf '%s' "$projects_response" | grep -q '"id"'; then
      echo "[payram-bootstrap] External platform already exists"
      exit 0
    fi
    ;;
  *'"EXTERNAL_PLATFORM_NOT_FOUND"'*)
    ;;
  *)
    echo "[payram-bootstrap] Unexpected response while checking external platforms: $projects_response"
    ;;
esac

create_payload=$(printf '{"name":"%s"}' "$DEFAULT_PROJECT_NAME")
create_response_with_code="$(curl -k -sS -w '\n%{http_code}' -H 'Content-Type: application/json' -H "Authorization: Bearer ${access_token}" -X POST "${API_BASE_URL}/api/v1/external-platform" -d "$create_payload" || true)"
create_http_code="$(printf '%s\n' "$create_response_with_code" | tail -n 1)"
create_body="$(printf '%s\n' "$create_response_with_code" | sed '$d')"

if [ "$create_http_code" = "200" ] || [ "$create_http_code" = "201" ]; then
  echo "[payram-bootstrap] Default external platform created"
  exit 0
fi

if printf '%s' "$create_body" | grep -qi 'already\|exist'; then
  echo "[payram-bootstrap] External platform create response indicates it already exists"
  exit 0
fi

echo "[payram-bootstrap] Failed to create default external platform (HTTP ${create_http_code:-n/a})"
echo "[payram-bootstrap] Response: ${create_body}"
exit 1
