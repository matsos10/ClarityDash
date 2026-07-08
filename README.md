# ClarityDash

Application web (mobile-first) de recherche immobilière : renseignez vos critères
(pays, ville, budget, type de bien, chambres, surface, critères avancés...), l'app
va chercher les annonces correspondantes en direct sur des sites publics et génère
un rapport (statistiques + liste des biens + export CSV).

Pour maximiser le nombre de biens trouvés, chaque recherche interroge **toutes
les sources disponibles pour le pays choisi, en parallèle** :

- 🇵🇹 Portugal — [idealista.pt](https://www.idealista.pt), [casa.sapo.pt](https://casa.sapo.pt), [olx.pt](https://www.olx.pt)
- 🇪🇸 Espagne — [idealista.es](https://www.idealista.es), [fotocasa.es](https://www.fotocasa.es), [pisos.com](https://www.pisos.com)

Les résultats de toutes les sources sont fusionnés dans un seul rapport ; si
une source échoue ou est bloquée, les autres continuent et l'erreur associée
est affichée séparément (voir "Limites importantes" ci-dessous).

L'architecture est pluggable (`src/lib/providers`) : ajouter un nouveau pays ou
une nouvelle source revient à implémenter l'interface `RealEstateProvider`
(`src/lib/types.ts`) et à l'enregistrer dans `src/lib/providers/index.ts`. Le
provider Idealista utilise des sélecteurs CSS dédiés ; les 4 autres utilisent
un moteur générique par heuristique de texte (`src/lib/providers/genericProvider.ts`)
plus tolérant aux changements de balisage, au prix d'une précision légèrement
inférieure.

## Démarrer en local

```bash
npm install
# Playwright a besoin d'un binaire Chromium compatible :
npx playwright install chromium
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Si vous utilisez un Chromium déjà installé ailleurs sur votre machine, indiquez
son chemin via la variable d'environnement `CHROMIUM_PATH`.

## Comment ça marche

1. Le formulaire (`src/components/SearchForm.tsx`) envoie les critères en `POST`
   vers `/api/search` (`src/app/api/search/route.ts`).
2. La route interroge les providers compatibles avec le pays choisi
   (`src/lib/providers`). Le provider Idealista (`src/lib/providers/idealista.ts`)
   pilote un navigateur headless (Playwright) pour parcourir les pages de
   résultats et en extraire les annonces.
3. Les annonces sont normalisées, filtrées selon les critères, puis renvoyées
   avec des statistiques agrégées (prix médian, min/max, prix moyen au m²...).
4. Le rapport est affiché (`src/components/Report.tsx`) et exportable en CSV.

## Limites importantes

- **Protection anti-robot** : les sites immobiliers ciblés déploient des
  protections (Datadome, etc.) qui peuvent bloquer ou ralentir le scraping.
  En cas de blocage, l'erreur est affichée clairement dans le rapport plutôt
  que de renvoyer des résultats faux.
- **Structure des pages** : les sélecteurs HTML utilisés peuvent devenir
  obsolètes si le site change son balisage ; dans ce cas aucune annonce n'est
  trouvée (plutôt que des données incorrectes).
- **Sources "génériques" (Casa Sapo, OLX, Fotocasa, pisos.com)** : construites
  par heuristique (plusieurs schémas d'URL de recherche testés, extraction de
  cartes d'annonces par motif de texte plutôt que par classes CSS exactes).
  Elles sont donc moins fiables qu'Idealista — si le schéma d'URL réel du
  site diffère de celui deviné, la source retourne simplement zéro résultat
  pour cette recherche plutôt que de planter. À valider/ajuster avec de
  vraies recherches en conditions réelles.
- **Performance** : chaque source lance sa propre instance de navigateur headless
  en parallèle (jusqu'à 3 par recherche selon le pays) ; prévoyez des ressources
  suffisantes en production et limitez le nombre de pages par recherche si besoin.
- **Usage** : cet outil est prévu pour un usage personnel/recherche ponctuelle.
  Respectez les conditions d'utilisation des sites sources et évitez les
  volumes de requêtes élevés (le nombre de pages par recherche est limité à 5).

## Scripts

```bash
npm run dev      # serveur de développement
npm run build    # build de production
npm run start    # lance le build de production
npm run lint     # eslint
```
