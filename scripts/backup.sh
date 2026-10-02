#!/bin/bash
set -euo pipefail

# 1. configuration
BACKUP_DIR="/var/backups/heat"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/heat_${TIMESTAMP}.sql.gz"
TMP_FILE="${BACKUP_FILE}.tmp"

# 2. declare failure alert function 
send_failure_alert() {
  RESEND_KEY=$(grep '^RESEND_API_KEY=' /var/www/heat/server/.env | cut -d '=' -f2-)

  curl -s -X POST 'https://api.resend.com/emails' \
    -H "Authorization: Bearer ${RESEND_KEY}" \
    -H 'Content-Type: application/json' \
    -d '{
      "from": "HEAT Alerts <onboarding@metesirin.dev>",
      "to": ["metesirin.dev@gmail.com"],
      "subject": "CRITICAL: HEAT Database Backup Failed!",
      "text": "The automated nightly database backup on your Hetzner server failed at '"$(date)"'. Please inspect /var/log/heat-backup.log immediately."
    }' > /dev/null 2>&1
}

# 3. register traps
# if an error happens (ERR), send alert and remove the broken .tmp file
trap 'send_failure_alert; rm -f "${TMP_FILE}"' ERR
# if script exits cleanly or normally, ensure no leftover .tmp file
trap 'rm -f "${TMP_FILE}"' EXIT

# 4. main execution
mysqldump --single-transaction --quick --routines --triggers heat | gzip -9 > "${TMP_FILE}"
chmod 600 "${TMP_FILE}"
mv "${TMP_FILE}" "${BACKUP_FILE}"

# 5. retention policy
find "${BACKUP_DIR}" -type f -name "heat_*.sql.gz" -mtime +14 -delete
