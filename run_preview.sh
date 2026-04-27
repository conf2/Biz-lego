#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8000}"
URL="http://localhost:${PORT}/pages/"

open_browser() {
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 || true
  elif command -v start >/dev/null 2>&1; then
    start "$URL" >/dev/null 2>&1 || true
  fi
}

echo "▶ Запуск локального предпросмотра: ${URL}"
echo "⏹ Остановить сервер: Ctrl+C"

open_browser
python3 -m http.server "$PORT"
