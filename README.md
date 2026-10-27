# Base Palmela

Système de pilotage de vie : **Vision 2029 → OKR trimestriels → projets → semaine → 3 priorités du jour.**
Application Android (PWA Next.js packagée en APK via TWA), auto-hébergée sur le VPS.

## Phase 1 (MVP) — contenu

| Module | Écrans |
| --- | --- |
| Aujourd'hui | 3 priorités max (depuis la semaine / le backlog), objectif servi affiché, tâches orphelines signalées, routine cochable avec séries, rappel trading, revue du soir |
| Semaine | Charge par domaine, 5 résultats de la semaine, rappels famille, planification par jour, revue hebdo guidée |
| OKR | Objectifs de couple, KR chiffrés, score 0–1, check-in hebdo, alerte « aucune action depuis 14 j », revue trimestrielle |
| Vision 2029 | Texte FR/PT au futur accompli, compte à rebours, jalons sur une frise |
| Projets | Statut en cours / attente / bloqué, **prochaine action obligatoire**, alerte de surcharge |
| Capture | Bouton central, texte ou dictée, hors ligne, partage Android → inbox → tâche / journal |
| Trading | Check-list pré-session **bloquante**, journal par compte et par trade (setup, R, émotion, capture), MLL, consistance 40 %, payouts et cycle, statistiques (win rate, espérance, créneaux), scaling du fonds perso, analyse macro en 6 sections, **verrou après 2 pertes** |
| Transverse | Comptes Matias / Ana, espaces privés + couple / famille avec partage par module, mode clair / sombre, export CSV, notifications push, sauvegarde quotidienne |

## Phase 2 — Google Agenda, Telegram, brief du matin

| Fonction | Détail |
| --- | --- |
| Google Agenda | Agenda du jour (Aujourd'hui) et de la semaine. Une tâche avec timebox (début + durée) peut créer ou mettre à jour un bloc dans Google Agenda, en cochant la case ; supprimer la tâche supprime le bloc |
| Brief du matin (07:00) | Notification push + message Telegram + page `/brief`. Contenu : agenda, 3 priorités proposées et justifiées (échéances, KR du trimestre, objectifs sans action depuis 14 j, prochaines actions de projet), échéances famille / maison / admin, rappel trading (macro, check-list, MLL, payouts, P&L de la veille), résultats de la semaine. La vision est relue le lundi. Bouton « Prendre ces priorités » |
| Bot Telegram | Texte ou note vocale → inbox → suggestion de Claude (tâche ou journal, domaine, projet / KR, échéance) → boutons Appliquer / Laisser / Archiver. `/brief` à la demande |
| Tri IA de l'inbox | Toute capture (app, partage Android, Telegram) reçoit une suggestion ; rien n'est créé sans un tap de validation |
| Notes vocales | Service `stt` (faster-whisper sur CPU, français / portugais), interne au docker-compose |

Le schéma Prisma couvre déjà toutes les phases (finances, maison, famille, admin, coach IA) : aucune migration lourde n'est à prévoir plus tard.

## Développement local

```bash
cp .env.example .env            # DATABASE_URL local, MATIAS_EMAIL, ANA_EMAIL, DEV_LOGIN=1
npm install
npx prisma migrate deploy
npm run db:seed                 # comptes, espaces, vision, 5 objectifs, projets, routine, check-list
npm run dev                     # http://localhost:3000 (connexion « dev » avec un e-mail autorisé)
npm test                        # tests des calculs (consistance, MLL, payout, OKR, séries…)
```

Le service worker n'est actif qu'en build de production (`npm run build && npm start`).

## Déploiement sur le VPS (Docker + Nginx Proxy Manager)

1. **Google OAuth** : dans Google Cloud Console, créer un identifiant OAuth « Application Web » avec l'URI de redirection `https://<domaine>/api/auth/callback/google`.
2. **Clés push** : `npx web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`.
3. Sur le VPS :
   ```bash
   git clone … && cd ClarityDash
   cp .env.example .env    # renseigner domaine, secrets, e-mails, NPM_NETWORK ; DEV_LOGIN=0
   docker network ls       # nom du réseau de Nginx Proxy Manager → NPM_NETWORK
   docker compose up -d --build
   docker compose exec worker npx tsx prisma/seed.ts
   ```
4. **Telegram** : créer le bot avec @BotFather → `TELEGRAM_BOT_TOKEN` et `TELEGRAM_BOT_USERNAME`. Le worker interroge Telegram en *long polling* : aucun webhook à exposer. Ensuite, dans l'app : Réglages → Telegram → « Lier ce compte » (à faire pour Matias et pour Ana).
5. **IA** : `ANTHROPIC_API_KEY` (le modèle par défaut est `claude-opus-5-5` ; effort `low` pour le tri ; repli serveur activé en cas de refus).
6. **Google Agenda** : à l'écran de consentement OAuth, ajouter le scope `…/auth/calendar.events`. Si un compte était déjà connecté avant la phase 2 : Réglages → « Connecter Google Agenda ».
7. Dans **Nginx Proxy Manager**, créer un Proxy Host `<domaine>` → `palmela-app` port `3000`, avec Websockets et SSL Let's Encrypt (Force SSL).

Services :
- `app` : Next.js en mode standalone. Les captures de trades sont stockées dans le volume `uploads`.
- `worker` : applique les migrations au démarrage, puis lance les tâches planifiées (heure de Lisbonne) :
  - sauvegarde `pg_dump` quotidienne à 03:15 dans `./backups`, conservée 30 jours ;
  - rappel trading à 08:45 en semaine ;
  - revue du soir à 21:00 ;
  - revue hebdo le dimanche à 18:00 ;
  - brief du matin à 07:00 (`docker compose exec worker npx tsx worker/index.ts --brief-now` pour le forcer) ;
  - tri IA des captures toutes les minutes ;
  - bot Telegram.
- `stt` : transcription des vocaux. Le modèle `WHISPER_MODEL` (par défaut `small`) est téléchargé au premier vocal dans le volume `whisper`.
- `db` : PostgreSQL 16.

Sauvegarde immédiate : `docker compose exec worker sh scripts/backup.sh`.
Restauration : `gunzip -c backups/palmela-AAAA-MM-JJ.sql.gz | docker compose exec -T db psql -U palmela palmela`.

## Application Android (APK TWA)

```bash
cd android
./build.sh palmela.mondomaine.pt   # JDK 17 requis ; Bubblewrap installe le SDK Android au 1er lancement
```

1. Copier l'empreinte SHA-256 affichée dans `TWA_SHA256_FINGERPRINTS` (fichier `.env` du serveur), puis exécuter `docker compose up -d app`. Elle est servie sur `/.well-known/assetlinks.json` et permet le plein écran sans barre d'adresse.
2. Installer `android/app/app-release-signed.apk` sur les téléphones (`adb install` ou envoi du fichier).
3. **Garder `android/android.keystore` en lieu sûr** : il faut la même clé pour toutes les mises à jour de l'APK.

L'APK inclut :
- les raccourcis Android (appui long sur l'icône) : Capture, Nouveau trade, Revue du soir ;
- le partage Android « Envoyer vers Palmela », qui crée une entrée dans l'inbox ;
- les notifications push.

## Règles de trading

Les règles se règlent par compte (fiche du compte → « Règles du compte »), aucune n'est codée en dur :
- **Maximum Loss Limit** : il suit le plus haut solde de fin de journée (*trailing EOD*), en mode intraday ou en mode statique. Il peut se figer à un solde donné, par exemple le solde de départ chez Topstep. La journée en cours ne fait pas remonter le MLL.
- **Consistance** : la meilleure journée doit rester ≤ X % du profit de la période, calculée depuis le dernier payout. L'app affiche le profit manquant et le plafond conseillé pour la prochaine journée.
- **Payout** : il faut N jours qualifiants depuis le dernier payout. Une journée qualifie si elle atteint le profit minimum ; sans minimum, toute journée tradée compte. Il faut aussi un profit positif et la consistance respectée. L'app projette la date au plus tôt en sautant les week-ends.
- **Journée de trading** : 17:00 heure de Chicago (CME) pour Topstep, minuit à Lisbonne pour les autres comptes.
- **Stop après 2 pertes** : le décompte se fait par session quotidienne. Un trade copié sur plusieurs comptes compte pour une seule perte. Une fois verrouillé, on ne peut enregistrer un trade qu'en le marquant comme violation du plan.
- **R multiple** : `P&L / (|entrée − stop| × quantité × valeur du point)`, avec MGC 10 $/pt, GC 100 $/pt et XAUUSD 100 $/pt par lot.

## Arborescence

```
prisma/          schéma complet (toutes phases), migration initiale, seed
src/app/         pages (App Router), API (auth, sync hors ligne, push, export CSV, partage, fichiers), service worker
src/lib/calc/    calculs purs testés (consistance, MLL, payout, stats, verrou, scaling, OKR, séries, charge)
src/lib/offline/ file de mutations IndexedDB rejouée au retour du réseau
src/server/      accès / espaces, server actions, logique trading, push
src/server/telegram/  bot Telegram (capture, brief, boutons)
src/server/ai/   tri de l'inbox par Claude (sortie structurée)
stt/             service Python FastAPI de transcription (faster-whisper)
worker/          tâches planifiées (brief, rappels, tri IA, sauvegarde) + long polling Telegram
android/         configuration TWA + script de build de l'APK
tests/           tests Vitest des calculs
```

## Phases suivantes

3. Finances, maison & chantiers, famille, véhicule & admin.
4. Coach IA multi-agents (Chef de cabinet + sous-agents) et revues automatiques.
