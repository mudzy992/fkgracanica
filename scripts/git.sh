#!/bin/bash
# Commit + push uz pregled i zaštitu od slučajnog dodavanja tajni/artefakata.
#
# BE-09c/P-B09c-10: prije je skripta radila `git add .` + `git push` — `.env`,
# `uploads/` i artefakti su lako završavali u historiji.
set -euo pipefail

if [[ -n "$(git status --porcelain -- . ':(exclude).env*' ':(exclude)uploads')" ]]; then
  echo "Izmjene koje će biti commit-ovane:"
  git status --short -- . ':(exclude).env*' ':(exclude)uploads'
else
  echo "Nema izmjena za commit (izuzev .env*/uploads)."
  exit 0
fi

read -r -p "Poruka commita: " commit_message
if [ -z "$commit_message" ]; then
  echo "Greška: poruka za commit ne smije biti prazna!" >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
echo "Grana: ${branch}"

# .env* i uploads/ su namjerno izostavljeni iz `git add`.
git add -A -- . ':(exclude).env*' ':(exclude)uploads'
git commit -m "$commit_message"

read -r -p "Push na origin/${branch}? [y/N] " answer
if [[ ! "$answer" =~ ^[yY]$ ]]; then
  echo "Commit napravljen, push preskočen."
  exit 0
fi
git push origin "$branch"
echo "Uspješno commitano i pushano."
