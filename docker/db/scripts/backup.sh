#!/bin/bash

## Usage:
## DB=financialAdvisorDB DB_USER=myAdminUser DB_PASSWORD=myAdminPassword sh backup.sh
## Optionals: DB_HOST, DB_PORT, CONTAINER_NAME

set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
CONTAINER_NAME=${CONTAINER_NAME:-financial-advisor-postgres-1}
LOCAL_BACKUP_DIR="/root/backup"

BACKUP_NAME="$DB-$(date +%y%m%d_%H%M%S).sql.gz"
LOCAL_PATH="$LOCAL_BACKUP_DIR/$BACKUP_NAME"

echo "========== BACKUP STARTED =========="
date
echo "Database: $DB"
echo "Backup file: $LOCAL_PATH"
echo "Container: $CONTAINER_NAME"

echo "Dumping PostgreSQL database '$DB'..."

docker exec \
  -e PGPASSWORD=$DB_PASSWORD \
  $CONTAINER_NAME \
  pg_dump -U $DB_USER -d $DB --clean --if-exists \
  | gzip > "$LOCAL_PATH"

echo "Backup generated: $LOCAL_PATH"

echo "Uploading backup to Dropbox..."

REMOTE_PATH="backups/financial-advisor/$DB/$BACKUP_NAME"

/usr/local/bin/dbxcli put "$LOCAL_PATH" "$REMOTE_PATH"

echo "Uploaded to: $REMOTE_PATH"

echo "========== BACKUP COMPLETED =========="
date