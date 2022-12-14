#!/bin/bash

## Usage
## DB=financialAdvisorDB DB_USER=myAdminUser DB_PASSWORD=myAdminPassword sh backup.sh

set -e
BACKUP_NAME=$DB-$(date +%y%m%d_%H%M%S).gz

date

echo "Dumping MongoDB $DB database to compressed archive"
docker exec financial-advisor-nestjs-fa-mongo-1 mongodump --db $DB --archive=$HOME/$BACKUP_NAME --gzip -u $DB_USER --authenticationDatabase=$DB -p $DB_PASSWORD 
docker cp financial-advisor-nestjs-fa-mongo-1:/$HOME/$BACKUP_NAME /root/backup/

