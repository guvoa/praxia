#!/usr/bin/env bash
# Praxia — verificación local: php -l + comprobación HTTP de rutas.
# Uso: bash .agents/skills/local-verify/scripts/verify.sh [--all] [/ruta[:codigo] ...]

set -u

PHP_BIN="${PHP_BIN:-/Applications/XAMPP/xamppfiles/bin/php}"
BASE_URL="${BASE_URL:-http://localhost/praxia}"
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT" || exit 1

all=false
routes=()
for arg in "$@"; do
  case "$arg" in
    --all) all=true ;;
    -h|--help)
      echo "Uso: verify.sh [--all] [/ruta[:codigo] ...]"; exit 0 ;;
    /*) routes+=("$arg") ;;
    *) echo "Argumento no reconocido: $arg" >&2; exit 1 ;;
  esac
done

failures=0

# ------------------------------------------------------------------ lint
if $all; then
  files=$(find app config public database .agents -name '*.php' -not -path '*/assets/*' 2>/dev/null)
else
  files=$( { git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } \
           | grep -E '\.php$' | sort -u )
fi

echo "== Lint PHP =="
if [ -z "$files" ]; then
  echo "  (sin archivos PHP que revisar)"
else
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    if out=$("$PHP_BIN" -l "$f" 2>&1); then
      echo "  ✔ $f"
    else
      echo "  ✖ $f"; echo "$out" | sed 's/^/      /'
      failures=$((failures + 1))
    fi
  done <<< "$files"
fi

# ------------------------------------------------------------------ http
if [ ${#routes[@]} -gt 0 ]; then
  echo "== Rutas ($BASE_URL) =="
  for r in "${routes[@]}"; do
    path="${r%%:*}"
    expected="200"
    [ "$path" != "$r" ] && expected="${r##*:}"
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$BASE_URL$path")
    if [ "$code" = "$expected" ]; then
      printf "  ✔ %-30s %s\n" "$path" "$code"
    else
      printf "  ✖ %-30s %s (esperado %s)\n" "$path" "$code" "$expected"
      failures=$((failures + 1))
    fi
  done
fi

echo
if [ "$failures" -gt 0 ]; then
  echo "Fallos: $failures"; exit 1
fi
echo "Todo correcto."
