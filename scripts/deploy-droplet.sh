#!/usr/bin/env bash
set -euo pipefail

# Deploy latest Train + NanoClaw changes on an already bootstrapped VM.
#
# Optional env vars:
#   APP_USER=app
#   NANOCLAW_DIR=/opt/nanoclaw
#   TRAIN_DIR=/opt/train
#   NANOCLAW_BRANCH=main
#   TRAIN_BRANCH=supabase-migration
#   NANOCLAW_SERVICE=nanoclaw
#   TRAIN_ENV_FILE=/etc/train/secrets.env
#   SYNC_TRAIN_ENV=1
#   UPDATE_MOUNTS=1

APP_USER="${APP_USER:-app}"
NANOCLAW_DIR="${NANOCLAW_DIR:-/opt/nanoclaw}"
TRAIN_DIR="${TRAIN_DIR:-/opt/train}"
NANOCLAW_BRANCH="${NANOCLAW_BRANCH:-main}"
TRAIN_BRANCH="${TRAIN_BRANCH:-supabase-migration}"
NANOCLAW_SERVICE="${NANOCLAW_SERVICE:-nanoclaw}"
TRAIN_ENV_FILE="${TRAIN_ENV_FILE:-/etc/train/secrets.env}"
SYNC_TRAIN_ENV="${SYNC_TRAIN_ENV:-1}"
UPDATE_MOUNTS="${UPDATE_MOUNTS:-1}"

log() {
  echo "[deploy] $*"
}

if [[ "${EUID}" -eq 0 ]]; then
  SUDO=""
  run_as_app() {
    sudo -u "$APP_USER" -H bash -lc "$*"
  }
else
  SUDO="sudo"
  run_as_app() {
    sudo -u "$APP_USER" -H bash -lc "$*"
  }
fi

if ! id -u "$APP_USER" >/dev/null 2>&1; then
  echo "User '$APP_USER' not found." >&2
  exit 1
fi

if [[ ! -d "$TRAIN_DIR/.git" ]]; then
  echo "Train repo not found at $TRAIN_DIR" >&2
  exit 1
fi

if [[ ! -d "$NANOCLAW_DIR/.git" ]]; then
  echo "NanoClaw repo not found at $NANOCLAW_DIR" >&2
  exit 1
fi

log "Updating Train repo ($TRAIN_BRANCH)"
run_as_app "
  cd '$TRAIN_DIR'
  git fetch --all --prune
  git checkout '$TRAIN_BRANCH'
  git pull --ff-only origin '$TRAIN_BRANCH'
"

log "Building Train"
run_as_app "
  cd '$TRAIN_DIR'
  npm ci
  npx tsc
"

if [[ "$SYNC_TRAIN_ENV" == "1" ]]; then
  if [[ -f "$TRAIN_ENV_FILE" ]]; then
    log "Syncing train env to $TRAIN_DIR/.env"
    $SUDO cp "$TRAIN_ENV_FILE" "$TRAIN_DIR/.env"
    $SUDO chown "$APP_USER:$APP_USER" "$TRAIN_DIR/.env"
    $SUDO chmod 600 "$TRAIN_DIR/.env"
  else
    log "WARNING: $TRAIN_ENV_FILE not found. Skipping .env sync."
  fi
fi

log "Updating NanoClaw repo ($NANOCLAW_BRANCH)"
run_as_app "
  cd '$NANOCLAW_DIR'
  git fetch --all --prune
  git checkout '$NANOCLAW_BRANCH'
  git pull --ff-only origin '$NANOCLAW_BRANCH'
"

log "Building NanoClaw"
run_as_app "
  cd '$NANOCLAW_DIR'
  npm ci
  npm run build
"

if [[ "$UPDATE_MOUNTS" == "1" && -f "$NANOCLAW_DIR/store/messages.db" ]]; then
  log "Ensuring main group mount points to $TRAIN_DIR"
  mount_json="{\"additionalMounts\":[{\"hostPath\":\"$TRAIN_DIR\",\"containerPath\":\"train\",\"readonly\":false}]}"
  escaped_mount_json="$(printf "%s" "$mount_json" | sed "s/'/''/g")"
  $SUDO sqlite3 "$NANOCLAW_DIR/store/messages.db" \
    "UPDATE registered_groups SET container_config='${escaped_mount_json}' WHERE folder='main';"
fi

log "Restarting service: $NANOCLAW_SERVICE"
$SUDO systemctl restart "$NANOCLAW_SERVICE"
$SUDO systemctl status "$NANOCLAW_SERVICE" --no-pager --lines=30

log "Deploy complete."
