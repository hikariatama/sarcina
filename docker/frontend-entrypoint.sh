#!/bin/sh
set -eu

escape_json() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

APP_CONVEX_URL_ESCAPED=$(escape_json "${APP_CONVEX_URL:-}")
APP_BASE_PATH_ESCAPED=$(escape_json "${APP_BASE_PATH:-}")
APP_TERMINAL_NAME_ESCAPED=$(escape_json "${APP_TERMINAL_NAME:-}")
APP_SUPPORT_PHONE_ESCAPED=$(escape_json "${APP_SUPPORT_PHONE:-}")
APP_SUPPORT_CHAT_ESCAPED=$(escape_json "${APP_SUPPORT_CHAT:-}")

printf '%s\n' \
  "window.__APP_CONFIG__ = {" \
  "  convexUrl: \"${APP_CONVEX_URL_ESCAPED}\"," \
  "  basePath: \"${APP_BASE_PATH_ESCAPED}\"," \
  "  terminalName: \"${APP_TERMINAL_NAME_ESCAPED}\"," \
  "  supportPhone: \"${APP_SUPPORT_PHONE_ESCAPED}\"," \
  "  supportChat: \"${APP_SUPPORT_CHAT_ESCAPED}\"," \
  "};" \
  > /usr/share/nginx/html/env-config.js

exec nginx -g 'daemon off;'
