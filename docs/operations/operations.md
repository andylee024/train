# Operations Runbook

## Proactive Plan Delivery (NanoClaw + WhatsApp)

This runbook configures proactive plan delivery with Train CLI output payloads.

### Command contract

1. Weekly payload:
   - `train plan send-weekly --json`
   - Schedule intent: Sundays at 18:00 (local host time).
2. Daily payload:
   - `train plan send-today --json`
   - Schedule intent: Monday-Friday at 07:00 (local host time).

Both commands are date-stable and idempotent for the same reference day.

### Example cron setup

Use absolute paths in production and run as the `app` user.

```cron
# Weekly overview: Sunday 18:00
0 18 * * 0 cd /opt/train && /usr/bin/node dist/cli.js plan send-weekly --json > /tmp/train-weekly.json && /opt/nanoclaw/scripts/send-train-message.sh /tmp/train-weekly.json

# Daily session card: Monday-Friday 07:00
0 7 * * 1-5 cd /opt/train && /usr/bin/node dist/cli.js plan send-today --json > /tmp/train-today.json && /opt/nanoclaw/scripts/send-train-message.sh /tmp/train-today.json
```

### Delivery bridge expectations

`send-train-message.sh` (or equivalent) should:

1. Parse the JSON payload from Train.
2. Prefer `data.whatsapp.card_html` when rich rendering is available.
3. Fall back to `data.whatsapp.text_fallback` for plain WhatsApp delivery.

### Timezone policy

Cron and Train both use the host timezone unless overridden.

1. Set host timezone explicitly (`timedatectl set-timezone ...`).
2. Keep cron timezone aligned with athlete timezone.
3. If timezone changes, validate both schedules with `--date YYYY-MM-DD`.

### Quick validation

```bash
cd /opt/train
node dist/cli.js plan send-weekly --json --date 2026-03-15
node dist/cli.js plan send-today --json --date 2026-03-11
```
