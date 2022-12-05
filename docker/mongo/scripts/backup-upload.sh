#!/bin/bash

## Usage
## DB=financialAdvisorDB sh backup-upload.sh

set -e
BACKUP_PREFIX=$DB-$(date +%y%m%d)

date

echo "Uploading backup for $DB database"
/usr/local/bin/dbxcli put /root/backup/$BACKUP_PREFIX*.gz backups/financial-advisor/$DB/$BACKUP_PREFIX.gz
