#!/bin/bash

# Prikaz opcija korisniku
echo "Odaberite opciju za pokretanje:"
echo "1) Rebuild docker"
echo "2) Popravka CI"
echo "3) Prisma migracija"
echo "4) GIT commit/push"
echo "5) Izlaz"

# Unos odabira
read -p "Unesite broj opcije (1-5): " izbor

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
        echo "Pokrećem: Prisma migracija..."
        cd ~/Documents/GitHub/fkgracanica/backend && npx prisma migrate deploy
        ;;
    4)
        echo "Pokrećem: GIT commit/push..."
        ./scripts/git.sh
        ;;
    5)
        echo "Izlaz iz skripte."
        exit 0
        ;;
    *)
        echo "Pogrešan unos! Molimo odaberite broj od 1 do 5."
        exit 1
        ;;
esac
