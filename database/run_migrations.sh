#!/usr/bin/env bash
# run_migrations.sh
# Runs all database migrations (001–098) in order using psql.
# Stops on the first failure.
#
# Usage:
#   ./database/run_migrations.sh
#
# Environment variables (all optional — fall back to defaults that match
# the docker-compose.yml service and agents/api config):
#   PGHOST      PostgreSQL host           (default: localhost)
#   PGPORT      PostgreSQL port           (default: 5433)
#   PGUSER      PostgreSQL user           (default: bbi)
#   PGPASSWORD  PostgreSQL password       (default: bbi_dev_password)
#   PGDATABASE  PostgreSQL database name  (default: battlebornintel)

set -euo pipefail

# ── Connection defaults ────────────────────────────────────────────────────────
export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5433}"
export PGUSER="${PGUSER:-bbi}"
export PGPASSWORD="${PGPASSWORD:-bbi_dev_password}"
export PGDATABASE="${PGDATABASE:-battlebornintel}"

# ── Resolve the migrations directory relative to this script ──────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${SCRIPT_DIR}/migrations"

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "ERROR: migrations directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi

# ── Verify psql is available ──────────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  echo "ERROR: psql not found in PATH. Install the PostgreSQL client tools." >&2
  exit 1
fi

# ── Collect migration files in sorted order ───────────────────────────────────
mapfile -t MIGRATIONS < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.sql' | sort)

if [[ ${#MIGRATIONS[@]} -eq 0 ]]; then
  echo "ERROR: No .sql files found in $MIGRATIONS_DIR" >&2
  exit 1
fi

echo "=== BattleBornIntel — database migrations ==="
echo "Host:     $PGHOST:$PGPORT"
echo "Database: $PGDATABASE"
echo "User:     $PGUSER"
echo "Files:    ${#MIGRATIONS[@]} migration(s) found"
echo ""

# ── Run each migration ────────────────────────────────────────────────────────
PASS=0
FAIL=0

for migration in "${MIGRATIONS[@]}"; do
  filename="$(basename "$migration")"
  printf "Running %-60s ... " "$filename"

  if psql \
       --host="$PGHOST" \
       --port="$PGPORT" \
       --username="$PGUSER" \
       --dbname="$PGDATABASE" \
       --single-transaction \
       --set ON_ERROR_STOP=1 \
       --file="$migration" \
       > /dev/null 2>&1; then
    echo "OK"
    PASS=$((PASS + 1))
  else
    echo "FAILED"
    FAIL=$((FAIL + 1))
    echo "" >&2
    echo "ERROR: Migration failed: $filename" >&2
    echo "Re-running with verbose output for diagnostics:" >&2
    psql \
      --host="$PGHOST" \
      --port="$PGPORT" \
      --username="$PGUSER" \
      --dbname="$PGDATABASE" \
      --single-transaction \
      --set ON_ERROR_STOP=1 \
      --file="$migration" >&2 || true
    echo "" >&2
    echo "Stopping. Fix the migration above and re-run." >&2
    exit 1
  fi
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Done: $PASS migration(s) applied successfully ==="
