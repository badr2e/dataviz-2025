# DPE Corse - Data Viz' 2025

Dashboard interactif de visualisation des **70 590 diagnostics de performance énergétique (DPE)** géolocalisés en Corse.

Projet réalisé dans le cadre du challenge **Data Viz' 2025** de l'Università di Corsica.

**Auteurs** : Badre El Mourabit & Tiago Reis Lima

---

## Aperçu

Le dashboard permet d'explorer les données DPE de la Corse à travers 4 vues :

1. **Distribution** - Répartition des classes énergétiques (A à G) avec statistiques clés
2. **Carte** - Carte interactive avec 70k+ markers clusterisés et recherche par commune/adresse
3. **Comparaison** - Analyse comparative entre logements existants, neufs et tertiaire
4. **Synthèse** - Vue d'ensemble récapitulant les informations clés

---

## Technologies

- **React 18** + **Vite** - Framework et bundler
- **Tailwind CSS** - Styling avec support dark mode
- **Recharts** - Graphiques et visualisations
- **Leaflet** + **MarkerCluster** - Carte interactive avec clustering
- **Framer Motion** - Animations fluides

---

## Installation

```bash
# Cloner le repo
git clone https://github.com/badr2e/dataviz-2025.git
cd dataviz-2025/dpe-corse

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

---

## Structure du projet

```
dpe-corse/
├── public/
│   └── data/
│       ├── logements_dpe.json      # 70 590 DPE géolocalisés
│       └── communes_dpe.json       # Stats agrégées par commune
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── DPEDistribution.jsx # Page distribution
│   │   │   ├── CorsicaMap.jsx      # Page carte (Leaflet)
│   │   │   ├── ComparisonChart.jsx # Page comparaison
│   │   │   └── OverviewChart.jsx   # Page synthèse
│   │   ├── ui/
│   │   │   └── Card.jsx            # Composants UI réutilisables
│   │   ├── Header.jsx              # Navigation + dark mode
│   │   └── Footer.jsx
│   ├── hooks/
│   │   └── useData.js              # Hook avec données pré-calculées
│   ├── utils/
│   │   └── colors.js               # Couleurs DPE (A-G)
│   ├── App.jsx
│   └── main.jsx
└── index.html
```

---

## Fonctionnalités

- **Dark mode** - Toggle jour/nuit avec switch animé
- **Carte interactive** - Clustering performant de 70k markers
- **Recherche** - Par commune ou adresse de logement
- **Responsive** - Adapté mobile et desktop
- **Animations** - Transitions fluides avec Framer Motion

---

## Licence

MIT

---

_Projet Data Viz' 2025 - Università di Corsica_
