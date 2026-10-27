#!/bin/sh
# Sauvegarde manuelle immédiate (en plus de la sauvegarde quotidienne de 03:15).
#   docker compose exec worker sh scripts/backup.sh
# Restauration :
#   gunzip -c backups/palmela-AAAA-MM-JJ.sql.gz | docker compose exec -T db psql -U palmela palmela
set -e
npx tsx worker/index.ts --backup-now
