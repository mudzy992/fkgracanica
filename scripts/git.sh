#!/bin/bash

# Traži unos poruke od korisnika
echo "Unesite poruku za commit:"
read commit_message

# Provjera je li poruka prazna
if [ -z "$commit_message" ]; then
    echo "Greška: Poruka za commit ne smije biti prazna!"
    exit 1
fi

# Izvršavanje Git naredbi
git add .
git commit -m "$commit_message"
git push

echo "Uspješno dodano, commitano i pushano!"
