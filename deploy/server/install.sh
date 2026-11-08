#!/usr/bin/env bash
set -euo pipefail
if [[ $EUID != 0 || $# != 2 ]]; then
  echo 'Usage (root): bash deploy/server/install.sh https://preview.example.com /usr/bin/node' >&2
  exit 1
fi
origin=$1
node_path=$2
source_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
[[ "$node_path" =~ ^/[a-zA-Z0-9/_+.-]+$ && -x "$node_path" ]] || { echo 'Node executable must be a plain absolute path' >&2; exit 1; }
for command_name in systemctl nginx visudo tar install getent useradd; do command -v "$command_name" >/dev/null; done
"$node_path" --input-type=module - "$origin" <<'NODE'
const origin = new URL(process.argv[2]);
if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== process.argv[2] || !/^[a-z0-9.-]+$/.test(origin.hostname) || origin.username || origin.password || origin.port) throw new Error('Use a DNS hostname or IPv4 HTTP/HTTPS origin without a path or port');
const [major, minor] = process.versions.node.split('.').map(Number);
if (major !== 24 || minor < 13) throw new Error('Node 24.13.0 or newer 24.x is required');
NODE
for name in deploy supervisor backup; do [[ -f "$source_root/output/tools/$name.mjs" ]] || { echo 'Run npm run build:runtime before installation' >&2; exit 1; }; done
[[ ! -e /etc/preview/deploy.json && ! -e /etc/systemd/system/preview.service && ! -e /etc/nginx/conf.d/preview.conf && ! -e /etc/sudoers.d/preview ]] || { echo 'Installation already exists; preserve configuration and upgrade deliberately' >&2; exit 1; }
getent passwd preview >/dev/null || useradd --system --create-home --home-dir /var/lib/preview --shell /bin/bash preview
install -d -m 755 /opt/preview /opt/preview/scripts /opt/preview/state /etc/preview
install -d -o preview -g preview -m 700 /opt/preview/releases /var/lib/preview/data /var/lib/preview/backups
install -d -o preview -g preview -m 755 /var/lib/preview /var/lib/preview/incoming
chown preview:preview /opt/preview/state
for name in deploy supervisor backup; do install -m 644 "$source_root/output/tools/$name.mjs" "/opt/preview/scripts/$name.mjs"; done
"$node_path" --input-type=module - "$origin" "$node_path" <<'NODE'
import { writeFileSync } from 'node:fs';
writeFileSync('/etc/preview/deploy.json', JSON.stringify({ schemaVersion: 1, installRoot: '/opt/preview', storageRoot: '/var/lib/preview', publicOrigin: process.argv[2], port: 5190, service: 'preview.service', node: process.argv[3] }, null, 2) + '\n', { mode: 0o644 });
NODE
sed "s|@NODE@|$node_path|g" "$source_root/deploy/server/preview.service" > /etc/systemd/system/preview.service
sed "s|@NODE@|$node_path|g" "$source_root/deploy/server/preview-recovery.service" > /etc/systemd/system/preview-recovery.service
systemctl_path=$(command -v systemctl)
printf 'preview ALL=(root) NOPASSWD: %s start preview.service, %s stop preview.service\n' "$systemctl_path" "$systemctl_path" > /etc/sudoers.d/preview
chmod 440 /etc/sudoers.d/preview
visudo -cf /etc/sudoers.d/preview
hostname=${origin#*://}
sed "s|@HOST@|$hostname|g" "$source_root/deploy/server/nginx.conf" > /etc/nginx/conf.d/preview.conf
nginx -t
systemctl daemon-reload
systemctl enable preview.service preview-recovery.service
systemctl reload nginx
echo 'Server skeleton ready. Configure HTTPS and the deploy SSH key; then deploy the first full release.'
echo 'The API binds loopback only. No administrator or database was pre-created.'
