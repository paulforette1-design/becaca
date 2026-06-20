# BeCaca 💩

Application mobile web (PWA) satirique inspirée de BeReal. Chaque passage aux toilettes devient un événement social géolocalisé entre amis.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + Vite 8 |
| Styles | Tailwind CSS 3 + thème personnalisé |
| Routing | React Router v7 |
| Auth | Firebase Auth (email/password) |
| Base de données | Cloud Firestore |
| Stockage photos | Firebase Storage |
| Géocodage | Nominatim (OpenStreetMap, gratuit, sans clé API) |
| PWA | Manifest manuel + meta tags iOS |

## Architecture

```
src/
├── services/          ← Seule couche qui accède Firebase
│   ├── firebase.js    ← Initialisation (auth, db, storage)
│   ├── authService.js ← createAccount, signIn, logout, subscribeToAuthChanges
│   ├── postService.js ← fetchTodayPosts, fetchUserPosts, createPost
│   └── leaderboardService.js ← fetchLeaderboard
├── api/               ← Proxy re-exports vers services/ (les screens importent ici)
├── context/
│   ├── AuthContext.jsx ← Session utilisateur + isInitializing
│   └── AppContext.jsx  ← Posts, leaderboard, état de chargement
├── hooks/
│   ├── useCamera.js    ← Double caméra (avant + arrière), capture miroir
│   └── useGeolocation.js
├── screens/           ← Un fichier par écran
├── components/        ← Composants UI réutilisables
└── utils/
    └── scoring.js     ← getPostScore(), computeUserScore(), labels
```

## Règles métier

- Accès fermé : email + mot de passe obligatoires
- Adresse domicile géocodée à l'inscription (Nominatim)
- Scoring : < 200 m du domicile = 1 pt (home), > 200 m = 2 pts (outdoor)
- Feed et carte filtrés sur la journée en cours, reset à minuit

## Thème Tailwind

| Token | Valeur |
|-------|--------|
| `caca-bg` | #FBF3E4 |
| `caca-primary` | #7A4B2B |
| `caca-dark` | #4A2510 |
| `caca-accent` | #C4852A |
| `caca-surface` | #F0E6D0 |
| `caca-text` | #3D1F0A |
| `caca-muted` | #9C7A5A |
| `caca-success` | #6B8E23 |

> Ne jamais utiliser les codes hex directement dans les composants — toujours via les tokens Tailwind.

## Variables d'environnement

Créer un fichier `.env` à la racine (déjà dans `.gitignore`) :

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Lancer en développement

```bash
npm install
npm run dev
```

## Builder pour la production

```bash
npm run build
# Le dossier dist/ est prêt à être déployé
```

## Déploiement

**Vercel (recommandé)** — connecter le repo GitHub à Vercel, ajouter les variables d'environnement dans les settings Vercel, chaque `git push` redéploie automatiquement.

**Netlify Drop (fallback)** — glisser le dossier `dist/` sur app.netlify.com/drop.

## Firebase requis

- Authentication → Email/Password activé
- Firestore → créé en mode test (à sécuriser avec les règles ci-dessous)
- Storage → activé

### Règles Firestore (production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```
# app
