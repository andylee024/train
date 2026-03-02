#!/usr/bin/env bash
set -euo pipefail

# Bootstrap a fresh Ubuntu Droplet for NanoClaw + Train.
#
# Required env vars:
#   NANOCLAW_REPO_URL
#   TRAIN_REPO_URL
#
# Optional env vars:
#   APP_USER=app
#   APP_HOME=/opt
#   NANOCLAW_DIR=/opt/nanoclaw
#   TRAIN_DIR=/opt/train
#   NANOCLAW_BRANCH=main
#   TRAIN_BRANCH=supabase-migration
#   NANOCLAW_ENV_FILE=/etc/nanoclaw/secrets.env
#   TRAIN_ENV_FILE=/etc/train/secrets.env
#   ENABLE_UFW=1
#   SKIP_UPGRADE=0

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/bootstrap-droplet.sh" >&2
  exit 1
fi

APP_USER="${APP_USER:-app}"
APP_HOME="${APP_HOME:-/opt}"
NANOCLAW_DIR="${NANOCLAW_DIR:-$APP_HOME/nanoclaw}"
TRAIN_DIR="${TRAIN_DIR:-$APP_HOME/train}"
NANOCLAW_BRANCH="${NANOCLAW_BRANCH:-main}"
TRAIN_BRANCH="${TRAIN_BRANCH:-supabase-migration}"
NANOCLAW_ENV_FILE="${NANOCLAW_ENV_FILE:-/etc/nanoclaw/secrets.env}"
TRAIN_ENV_FILE="${TRAIN_ENV_FILE:-/etc/train/secrets.env}"
ENABLE_UFW="${ENABLE_UFW:-1}"
SKIP_UPGRADE="${SKIP_UPGRADE:-0}"

if [[ -z "${NANOCLAW_REPO_URL:-}" ]]; then
  echo "Missing NANOCLAW_REPO_URL" >&2
  exit 1
fi

if [[ -z "${TRAIN_REPO_URL:-}" ]]; then
  echo "Missing TRAIN_REPO_URL" >&2
  exit 1
fi

log() {
  echo "[bootstrap] $*"
}

run_as_app() {
  sudo -u "$APP_USER" -H bash -lc "$*"
}

log "Updating apt indexes"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y

if [[ "$SKIP_UPGRADE" != "1" ]]; then
  log "Upgrading packages"
  apt-get upgrade -y
fi

log "Installing base packages"
apt-get install -y git curl ca-certificates gnupg sqlite3 ufw build-essential

if [[ "$ENABLE_UFW" == "1" ]]; then
  log "Configuring firewall"
  ufw allow OpenSSH >/dev/null 2>&1 || true
  ufw --force enable >/dev/null 2>&1 || true
fi

if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker"
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

if ! command -v node >/dev/null 2>&1; then
  log "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
  if [[ "$NODE_MAJOR" -lt 22 ]]; then
    log "Upgrading Node.js to 22"
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  fi
fi

if ! id -u "$APP_USER" >/dev/null 2>&1; then
  log "Creating user $APP_USER"
  adduser --disabled-password --gecos "" "$APP_USER"
fi

usermod -aG docker,sudo "$APP_USER"
mkdir -p "$APP_HOME"
chown "$APP_USER:$APP_USER" "$APP_HOME"

mkdir -p "$(dirname "$NANOCLAW_ENV_FILE")" "$(dirname "$TRAIN_ENV_FILE")"
touch "$NANOCLAW_ENV_FILE" "$TRAIN_ENV_FILE"
chmod 600 "$NANOCLAW_ENV_FILE" "$TRAIN_ENV_FILE"
chown root:root "$NANOCLAW_ENV_FILE" "$TRAIN_ENV_FILE"

log "Cloning/updating train repository"
run_as_app "
  if [[ -d '$TRAIN_DIR/.git' ]]; then
    cd '$TRAIN_DIR'
    git fetch --all --prune
    git checkout '$TRAIN_BRANCH'
    git pull --ff-only origin '$TRAIN_BRANCH'
  else
    git clone '$TRAIN_REPO_URL' '$TRAIN_DIR'
    cd '$TRAIN_DIR'
    git checkout '$TRAIN_BRANCH'
  fi
"

log "Cloning/updating nanoclaw repository"
run_as_app "
  if [[ -d '$NANOCLAW_DIR/.git' ]]; then
    cd '$NANOCLAW_DIR'
    git fetch --all --prune
    git checkout '$NANOCLAW_BRANCH'
    git pull --ff-only origin '$NANOCLAW_BRANCH'
  else
    git clone '$NANOCLAW_REPO_URL' '$NANOCLAW_DIR'
    cd '$NANOCLAW_DIR'
    git checkout '$NANOCLAW_BRANCH'
  fi
"

log "Installing/building Train"
run_as_app "
  cd '$TRAIN_DIR'
  npm ci
  npx tsc
"

log "Installing/building NanoClaw"
run_as_app "
  cd '$NANOCLAW_DIR'
  npm ci
  npm run build
"

if [[ -s "$TRAIN_ENV_FILE" ]]; then
  log "Syncing train env to $TRAIN_DIR/.env"
  cp "$TRAIN_ENV_FILE" "$TRAIN_DIR/.env"
  chown "$APP_USER:$APP_USER" "$TRAIN_DIR/.env"
  chmod 600 "$TRAIN_DIR/.env"
else
  log "WARNING: $TRAIN_ENV_FILE is empty. Fill it before running train Supabase commands."
fi

log "Writing systemd service"
cat >/etc/systemd/system/nanoclaw.service <<EOF
[Unit]
Description=NanoClaw
After=network-online.target docker.service
Wants=network-online.target docker.service

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$NANOCLAW_DIR
EnvironmentFile=$NANOCLAW_ENV_FILE
ExecStart=/usr/bin/node $NANOCLAW_DIR/dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now nanoclaw

if [[ -f "$NANOCLAW_DIR/store/messages.db" ]]; then
  log "Updating NanoClaw mount path for main group -> $TRAIN_DIR"
  mount_json="{\"additionalMounts\":[{\"hostPath\":\"$TRAIN_DIR\",\"containerPath\":\"train\",\"readonly\":false}]}"
  escaped_mount_json="$(printf "%s" "$mount_json" | sed "s/'/''/g")"
  sqlite3 "$NANOCLAW_DIR/store/messages.db" \
    "UPDATE registered_groups SET container_config='${escaped_mount_json}' WHERE folder='main';"
else
  log "NanoClaw DB not found yet; skip mount update for registered_groups."
fi

log "Bootstrap complete."
log "Next steps:"
log "1) Fill $NANOCLAW_ENV_FILE with NanoClaw secrets."
log "2) Fill $TRAIN_ENV_FILE with Supabase/Train secrets."
log "3) Sync train env again: cp $TRAIN_ENV_FILE $TRAIN_DIR/.env && chown $APP_USER:$APP_USER $TRAIN_DIR/.env && chmod 600 $TRAIN_DIR/.env"
log "4) Restart: systemctl restart nanoclaw"
log "5) Verify: systemctl status nanoclaw --no-pager"
