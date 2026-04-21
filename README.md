# Train

Train is a chat-first workout logging/querying layer used by NanoClaw.

This repo is focused on:
- Logging workouts/sets to Supabase
- Querying history and lift stats from chat/CLI
- Keeping workout plans in markdown (`plans/`)

## Cloud Setup (DigitalOcean, after bootstrap)

If you already ran:
- `scripts/bootstrap-droplet.sh`

Use this checklist to finish setup.

### 1) Put secrets in place

On droplet:

```bash
cat >/etc/train/secrets.env <<'EOF'
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_KEY=...
TRAIN_USER_ID=...
EOF

cat >/etc/nanoclaw/secrets.env <<'EOF'
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
CLAUDE_CODE_OAUTH_TOKEN=...
EOF
```

### 2) Sync Train env into app directory

```bash
cp /etc/train/secrets.env /opt/train/.env
chown app:app /opt/train/.env
chmod 600 /opt/train/.env
```

### 3) Authenticate NanoClaw to WhatsApp

Run as `app` user and scan QR from your phone:

```bash
sudo -u app -H bash -lc 'cd /opt/nanoclaw && npm run auth'
```

Notes:
- In WhatsApp: `Linked devices` -> `Link a device`
- After successful auth, session state is saved under `/opt/nanoclaw/store/auth/`

### 4) Start/restart service

```bash
systemctl restart nanoclaw
systemctl status nanoclaw --no-pager
journalctl -u nanoclaw -n 100 --no-pager
```

### 5) Verify Train can query Supabase

```bash
sudo -u app -H bash -lc 'cd /opt/train && set -a && source .env && set +a && node dist/cli.js history --last 14d'
sudo -u app -H bash -lc 'cd /opt/train && set -a && source .env && set +a && node dist/cli.js query e1rm "Back Squat" --days 365'
```

### 6) Confirm NanoClaw can access Train mount

Bootstrap/deploy scripts set the main group mount to:
- Host: `/opt/train`
- Container path: `train`

If needed, rerun deploy script:

```bash
cd /opt/train
TRAIN_BRANCH=main NANOCLAW_BRANCH=main bash scripts/deploy-droplet.sh
```

## Daily Operations

Update both repos and restart:

```bash
cd /opt/train
TRAIN_BRANCH=main NANOCLAW_BRANCH=main bash scripts/deploy-droplet.sh
```

Check service health:

```bash
systemctl status nanoclaw --no-pager
journalctl -u nanoclaw -n 100 --no-pager
```

## CLI Commands (Train)

```bash
node dist/cli.js history --last 7d
node dist/cli.js query e1rm "Back Squat" --days 365
node dist/cli.js query best-set "Back Squat" --reps 8 --days 365
```

## Related Docs

- `docs/prd.md` — product requirements (v0)
- `docs/schema.md` — Supabase schema contract
- `docs/roadmap.md` — direction past v0
