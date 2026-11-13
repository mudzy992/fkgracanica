#!/bin/bash

# Prikaz opcija korisniku
echo "Odaberite opciju za pokretanje:"
echo "1) Rebuild docker"
echo "2) Regeneracija Docker lock fajlova (sync-docker-locks)"
echo "3) Prisma migracija"
echo "4) GIT commit/push"
echo "5) Mobile EAS build (development, lokalno)"
echo "6) Mobile EAS build (production, lokalno)"
echo "7) Izlaz"

# Unos odabira
read -p "Unesite broj opcije (1-7): " izbor

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Izvršavanje naredbe ovisno o odabiru
case $izbor in
    1)
        echo "Pokrećem: Rebuild docker..."
        ./scripts/docker-prod-build.sh && docker compose up -d
        ;;
    2)
        echo "Pokrećem: Popravka CI..."
        ./scripts/sync-docker-locks.sh
        ;;
    3)
        echo "Pokrećem: Prisma migracija (migrate deploy)..."
        read -r -p "Baza iz backend/.env — potvrdi [y/N]: " potvrda
        if [[ ! "$potvrda" =~ ^[yY]$ ]]; then
          echo "Otkazano."
          exit 1
        fi
        cd "$ROOT_DIR/backend" && (npx prisma migrate deploy || npx prisma db migrate)
        ;;
    4)
        echo "Pokrećem: GIT commit/push..."
        ./scripts/git.sh
        ;;
    5)
        echo "Pokrećem: Mobile EAS development build (lokalno)..."
        cd "$ROOT_DIR/mobile" && npx eas-cli@latest build --platform android --profile development --local
        ;;
    6)
        echo "Pokrećem: Mobile EAS production build (lokalno)..."
        cd "$ROOT_DIR/mobile" && npx eas-cli@latest build --platform android --profile production --local
        ;;
    7)
        echo "Izlaz iz skripte."
        exit 0
        ;;
    *)
        echo "Pogrešan unos! Molimo odaberite broj od 1 do 7."
        exit 1
        ;;
esac
