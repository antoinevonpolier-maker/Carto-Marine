# Carto Marine — cartographie marché naval / opportunités

Application web React + TypeScript destinée à visualiser une cartographie relationnelle interactive de type **pieuvre / graphe hiérarchique** autour du marché naval, de la Marine nationale, des marines étrangères / export et des opportunités actuelles ou futures.

L’application est pensée pour une lecture stratégique : compréhension du marché, analyse des segments, identification des programmes en service, en transition ou futurs, et repérage des opportunités de MCO, modernisation, soutien, construction, formation, sûreté maritime et benchmark export.

## Fonctionnalités principales

- Dashboard KPI cliquable avec détails contextuels.
- Cartographie interactive zoomable, pannable, filtrable et extensible.
- Zoom automatique sur le nœud sélectionné.
- Recherche globale incluant aussi les éléments retirés, désarmés, doublonnés ou exclus du graphe principal.
- Tableau analytique filtrable, triable, paginé et exportable en CSV.
- Vue opportunités clarifiée avec score de priorité, lecture métier et distinction des horizons.
- Vue sources, corrections et qualité des données.
- Déploiement simple sur GitHub Pages ou Netlify.

## Stack technique

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Cytoscape.js pour la cartographie relationnelle
- TanStack Table pour le tableau analytique
- Zustand pour l’état global
- Lucide React pour les icônes

## Structure du projet

```txt
marine-pieuvre-app/
├── public/
│   └── data/
│       └── marine-data.json
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── filters/
│   │   ├── graph/
│   │   ├── layout/
│   │   ├── opportunities/
│   │   ├── quality/
│   │   ├── search/
│   │   ├── table/
│   │   └── ui/
│   ├── constants/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
├── .github/workflows/deploy.yml
├── netlify.toml
├── package.json
├── vite.config.ts
└── README.md
```

## Installation locale

```bash
npm install
npm run dev
```

Le site local s’ouvre généralement ici :

```txt
http://localhost:5173
```

## Build production

```bash
npm run build
```

Le dossier généré est :

```txt
dist
```

## Preview locale du build

```bash
npm run preview
```

## Déploiement GitHub Pages

Le fichier de workflow est déjà inclus :

```txt
.github/workflows/deploy.yml
```

Étapes :

1. Pousser le projet sur GitHub.
2. Aller dans `Settings → Pages`.
3. Mettre `Source → GitHub Actions`.
4. Aller dans l’onglet `Actions`.
5. Lancer ou attendre le workflow `Deploy to GitHub Pages`.
6. Quand le workflow est vert, récupérer l’URL dans `Settings → Pages`.

## Déploiement Netlify

Le fichier `netlify.toml` est inclus.

Réglages Netlify :

```txt
Build command: npm install --no-package-lock --no-audit --no-fund && npm run build
Publish directory: dist
```

Netlify peut aussi détecter automatiquement ces paramètres grâce à `netlify.toml`.

## Modèle de données intégré

Le site charge un fichier JSON statique :

```txt
public/data/marine-data.json
```

Il contient les sections suivantes :

| Section | Rôle |
|---|---|
| `synthesis` | Chiffres clés et indicateurs du dashboard |
| `inventory` | Base principale détaillée des bâtiments, programmes et opportunités |
| `mapView` | Vue simplifiée destinée à l’affichage |
| `relations` | Liens parent-enfant pour enrichir le graphe |
| `exclusions` | Éléments retirés, désarmés, doublonnés ou hors périmètre |
| `corrections` | Nettoyages, corrections et décisions de périmètre |
| `sources` | Liens et références de traçabilité |
| `guide` | Logique métier interne de structuration |

## Logique de cartographie

La cartographie suit cette hiérarchie :

```txt
Centre
→ Segment cartographie
→ Horizon programme
→ Fonction
→ Catégorie
→ Type de bâtiment
→ Nom du bâtiment
```

Centre principal :

```txt
Marché naval / opportunités
```

Segments principaux :

```txt
Marine nationale
Marines étrangères / export
```

Horizons principaux :

```txt
En service
Transition
Futur
À vérifier
```

## Filtres disponibles

- Segment cartographie
- Horizon programme
- Fonction
- Catégorie
- Type de bâtiment
- Pays / marine
- Opportunité marché
- Port de rattachement
- Zone
- Statut cartographie
- Fiabilité source

## Recherche globale

La recherche en haut de l’interface interroge :

- les bâtiments visibles dans la cartographie et le tableau ;
- les éléments retirés, désarmés, doublonnés ou exclus du graphe principal.

Lorsqu’un résultat est exclu de la cartographie principale, l’application affiche :

- son nom ou son code ;
- la raison de l’exclusion ;
- le commentaire de périmètre ;
- un lien source cliquable lorsque disponible.

## Vue opportunités

La vue opportunités classe les familles de marché selon un score simple :

- Futur = poids fort ;
- Transition = poids intermédiaire ;
- En service = potentiel récurrent ;
- À vérifier = signal à qualifier.

Chaque carte d’opportunité affiche :

- le volume total ;
- la répartition par horizon ;
- les segments concernés ;
- les fonctions concernées ;
- une lecture métier ;
- des exemples de bâtiments ;
- des liens source cliquables quand disponibles.

## Limites connues

- Les éléments exclus ne sont volontairement pas intégrés au graphe principal pour éviter de fausser les volumes actifs.
- Les sources incomplètes ou à vérifier sont affichées comme telles.
- Le scoring d’opportunité est indicatif : il sert à orienter l’analyse, pas à remplacer une qualification commerciale détaillée.

## Pistes d’amélioration

- Ajouter une pondération personnalisable des opportunités.
- Ajouter un export PDF de la cartographie et des fiches opportunités.
- Ajouter des vues comparatives entre segments ou pays.
- Ajouter un mode présentation pour comité stratégique.
