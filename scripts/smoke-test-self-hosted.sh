#!/usr/bin/env bash
set -euo pipefail

FRONTEND_URL="${FRONTEND_URL:-https://sarcina.dgazizullin.dev}"
CONVEX_API_URL="${CONVEX_API_URL:-https://backend.sarcina.dgazizullin.dev}"
CONVEX_SITE_URL="${CONVEX_SITE_URL:-https://convex.sarcina.dgazizullin.dev}"
CONVEX_SELF_HOSTED_URL="${CONVEX_SELF_HOSTED_URL:-$CONVEX_API_URL}"
CONVEX_SELF_HOSTED_ADMIN_KEY="${CONVEX_SELF_HOSTED_ADMIN_KEY:-}"

if [ -z "$CONVEX_SELF_HOSTED_ADMIN_KEY" ]; then
  echo "Set CONVEX_SELF_HOSTED_ADMIN_KEY before running this script."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SMOKE_CORRELATION_ID="smoke-$(date +%s)"

check_tls() {
  local host="$1"
  local verify_log="/tmp/${host//./-}-openssl-verify.log"
  local cert_log="/tmp/${host//./-}-openssl-cert.log"

  printf '' | openssl s_client -servername "$host" -connect "${host}:443" >"$cert_log" 2>"$verify_log"
  grep -q "Verify return code: 0 (ok)" "$cert_log"
}

run_convex() {
  bunx convex run \
    --url "$CONVEX_SELF_HOSTED_URL" \
    --admin-key "$CONVEX_SELF_HOSTED_ADMIN_KEY" \
    "$@"
}

cd "$REPO_DIR"

check_tls "sarcina.dgazizullin.dev"
check_tls "backend.sarcina.dgazizullin.dev"
check_tls "convex.sarcina.dgazizullin.dev"

curl --fail --silent --show-error "${CONVEX_API_URL}/version" >/tmp/sarcina-convex-version.txt
curl --fail --silent --show-error "${FRONTEND_URL}/healthcheck" >/tmp/sarcina-frontend-healthcheck.txt

CONVEX_SITE_STATUS="$(curl --silent --show-error --output /tmp/sarcina-convex-site-body.txt --write-out '%{http_code}' "${CONVEX_SITE_URL}/")"
if [ "$CONVEX_SITE_STATUS" -lt 200 ] || [ "$CONVEX_SITE_STATUS" -ge 500 ]; then
  echo "Convex site endpoint returned unexpected status ${CONVEX_SITE_STATUS}."
  exit 1
fi

run_convex cells:ensureSeedData '{}'
run_convex cells:resetDemoData '{}'

INITIAL_OVERVIEW_JSON="$(run_convex cells:getTerminalOverview '{}')"
TOTAL_CELLS="$(printf '%s' "$INITIAL_OVERVIEW_JSON" | jq -r '.totalCells')"

if [ "$TOTAL_CELLS" -le 0 ]; then
  echo "Seeded terminal overview did not report any cells."
  exit 1
fi

BOOKING_JSON="$(run_convex bookings:startBooking "{\"requestedSize\":\"S\",\"correlationId\":\"${SMOKE_CORRELATION_ID}\",\"route\":\"smoke-start\"}")"
BOOKING_ID="$(printf '%s' "$BOOKING_JSON" | jq -r '.bookingId')"

if [ -z "$BOOKING_ID" ] || [ "$BOOKING_ID" = "null" ]; then
  echo "Booking creation failed during smoke test."
  exit 1
fi

run_convex bookings:confirmDeposit "{\"bookingId\":\"${BOOKING_ID}\",\"route\":\"smoke-confirm\"}" >/tmp/sarcina-smoke-confirm.json
CLAIM_HINT_JSON="$(run_convex cells:getClaimableBookingHint '{}')"
CLAIM_HINT_BOOKING_ID="$(printf '%s' "$CLAIM_HINT_JSON" | jq -r '.bookingId')"

if [ "$CLAIM_HINT_BOOKING_ID" != "$BOOKING_ID" ]; then
  echo "Claimable booking hint did not expose the active booking."
  exit 1
fi

run_convex bookings:startClaim "{\"bookingId\":\"${BOOKING_ID}\",\"correlationId\":\"${SMOKE_CORRELATION_ID}\",\"route\":\"smoke-claim\"}" >/tmp/sarcina-smoke-claim.json
ACTIVE_BOOKINGS_JSON="$(run_convex bookings:listActiveBookings '{}')"
ACTIVE_BOOKING_ID="$(printf '%s' "$ACTIVE_BOOKINGS_JSON" | jq -r '.[0].bookingId // empty')"

if [ "$ACTIVE_BOOKING_ID" != "$BOOKING_ID" ]; then
  echo "Active bookings query did not include the booking in progress."
  exit 1
fi

run_convex payments:startPayment "{\"bookingId\":\"${BOOKING_ID}\",\"method\":\"card\",\"correlationId\":\"${SMOKE_CORRELATION_ID}\",\"route\":\"smoke-pay-start\"}" >/tmp/sarcina-smoke-payment-start.json
run_convex payments:completePayment "{\"bookingId\":\"${BOOKING_ID}\",\"route\":\"smoke-pay-complete\"}" >/tmp/sarcina-smoke-payment-complete.json
run_convex bookings:completeBooking "{\"bookingId\":\"${BOOKING_ID}\",\"route\":\"smoke-complete\"}" >/tmp/sarcina-smoke-booking-complete.json
run_convex cells:getTerminalOverview '{}' >/tmp/sarcina-smoke-terminal-overview.json
run_convex telemetry:getDashboardMetrics '{}' >/tmp/sarcina-smoke-dashboard-metrics.json

FINAL_STATUS="$(run_convex bookings:getBooking "{\"bookingId\":\"${BOOKING_ID}\"}" | jq -r '.status')"
SUCCESSFUL_BOOKINGS="$(jq -r '.successfulBookings' /tmp/sarcina-smoke-dashboard-metrics.json)"
ACTIVE_BOOKINGS_COUNT="$(jq -r '.activeBookingsCount' /tmp/sarcina-smoke-dashboard-metrics.json)"

if [ "$FINAL_STATUS" != "completed" ]; then
  echo "Booking did not reach completed state."
  exit 1
fi

if [ "$SUCCESSFUL_BOOKINGS" -lt 1 ]; then
  echo "Dashboard metrics did not register a successful booking."
  exit 1
fi

if [ "$ACTIVE_BOOKINGS_COUNT" -ne 0 ]; then
  echo "Dashboard metrics still report active bookings after completion."
  exit 1
fi
