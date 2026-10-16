#!/usr/bin/env bash
set -euo pipefail

# Explicit, dedicated destinations: never replace an existing website or the
# distribution's default nginx configuration. Refuse repeat installs for review.
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
site_target=/var/www/4ndras-preview
config_target=/etc/nginx/sites-available/4ndras-preview
enabled_target=/etc/nginx/sites-enabled/4ndras-preview

if [ "${EUID}" -ne 0 ]; then
    printf '%s\n' 'Run this script with sudo after reviewing it.' >&2
    exit 1
fi
for destination in "$site_target" "$config_target" "$enabled_target"; do
    if [ -e "$destination" ] || [ -L "$destination" ]; then
        printf 'Existing destination retained; stop and review: %s\n' "$destination" >&2
        exit 1
    fi
done

test -f "$project_root/deploy/tencent/site/index.html"
test -d "$project_root/deploy/tencent/site/assets"
test -f "$project_root/public/about-working-loop-v2.mp4"
test -f "$project_root/deploy/tencent/portfolio-preview.conf"
command -v nginx >/dev/null
command -v curl >/dev/null

install -d -m 0755 "$site_target"
cp -a "$project_root/public/." "$site_target/"
cp -a "$project_root/deploy/tencent/site/." "$site_target/"
find "$site_target" -type d -exec chmod 0755 {} +
find "$site_target" -type f -exec chmod 0644 {} +
install -m 0644 "$project_root/deploy/tencent/portfolio-preview.conf" "$config_target"
ln -s "$config_target" "$enabled_target"
nginx -t
systemctl reload nginx
curl --fail --silent --show-error --head http://127.0.0.1:8080/
printf '%s\n' 'Internal preview ready at http://127.0.0.1:8080/ on this server only.'
printf '%s\n' 'The public domain, firewall, and original nginx site were not changed.'
