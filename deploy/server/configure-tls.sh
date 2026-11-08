#!/usr/bin/env bash
set -euo pipefail
if [[ $EUID != 0 || $# != 1 ]]; then
  echo 'Usage (root): bash deploy/server/configure-tls.sh certificate-contact@example.com' >&2
  exit 1
fi
command -v certbot >/dev/null
command -v nginx >/dev/null
hostname=$(node --input-type=module - <<'NODE'
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('/etc/preview/deploy.json', 'utf8'));
const origin = new URL(config.publicOrigin);
if (origin.protocol !== 'https:' || !/^[a-z0-9.-]+$/.test(origin.hostname)) throw new Error('Configure a DNS HTTPS origin first');
console.log(origin.hostname);
NODE
)
certbot --nginx --non-interactive --agree-tos --redirect --email "$1" --domains "$hostname"
nginx -t
systemctl reload nginx
systemctl enable --now certbot.timer
certbot renew --dry-run
echo 'HTTPS configured; automatic certificate renewal enabled.'
