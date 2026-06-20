# ETAT.md — BeCaca

## Stack
React 19 + Vite 8 + Tailwind 3 + Firebase 12 (Auth email/password + Firestore + Storage) + React Router v7 + Lucide React

## Firebase
- Project ID : `appli-71f7d`
- Auth : Email/Password (actif)
- Firestore : mode test (à sécuriser avant mise en production partagée)
- Storage : actif

## Déploiement actuel
Netlify Drop (drag & drop manuel du dossier `dist/`). À migrer vers Vercel + GitHub pour auto-deploy.

## Instructions setup GitHub + Vercel (à faire une seule fois)

### 1. Créer le repo GitHub
```bash
cd becaca/
git init
git add .
git commit -m "feat: BeCaca v1 — auth email, camera BeReal, scoring GPS, PWA"
```
Puis sur github.com/new → créer le repo → copier l'URL et :
```bash
git remote add origin https://github.com/TON_USER/becaca.git
git push -u origin main
```

### 2. Connecter à Vercel
1. Aller sur vercel.com → "Add New Project"
2. Importer le repo GitHub `becaca`
3. Laisser tous les paramètres par défaut (Vercel détecte Vite automatiquement)
4. Settings → Environment Variables → ajouter les 6 variables VITE_FIREBASE_*
5. Cliquer Deploy → l'URL publique est prête en ~30s

Après ça, chaque `git push` redéploie automatiquement.

## Phases
- [x] Phase 0 — Setup Firebase + Vite + Tailwind
- [x] Phase 1 — UI complète (tous les écrans)
- [x] Phase 2 — Services mock
- [x] Phase 3 — Firebase réel (Auth email/password + Firestore + Storage)
- [x] Phase 3b — Refactoring : suppression stubs OTP, nettoyage code mort
- [ ] Phase 4 — GitHub + Vercel auto-deploy
- [ ] Phase 5 — Sécurisation règles Firestore + Storage

## Ce qui est fonctionnel

### Auth email/password Firebase (`src/services/authService.js`)
- `createAccount()` : géocode l'adresse domicile via Nominatim, crée le compte Firebase Auth + Firestore
- `signIn()` : récupère les données Firestore (dont homeCoords)
- `logout()` : déconnexion Firebase
- `subscribeToAuthChanges()` : restaure la session au démarrage
- `homeCoords` et `homeAddress` exposés via `useAuth()` dans toute l'app
- Si géocodage échoue : erreur `ADDRESS_NOT_FOUND` → "Adresse introuvable. Vérifie et réessaie."

### CameraScreen style BeReal (`src/screens/CameraScreen.jsx`)
- Route `/camera` hors AppLayout (plein écran, pas de BottomNav)
- Caméra arrière (`environment`) en fond plein écran
- Caméra frontale (`user`) en incrustation haut-droite (30% largeur, ratio 3/4, miroir CSS)
- Ouverture des streams via callback refs (pas de timeout fragile)
- Bouton capture : grand cercle blanc centré en bas
- Après capture : géolocalise → calcule locationType → crée le post → redirige `/feed` avec flash message

### Hook caméra (`src/hooks/useCamera.js`)
- `openStreams(backVideoEl, frontVideoEl)` : deux streams en parallèle
- `capture()` : snapshot canvas, photo frontale en miroir (flip horizontal), stoppe les streams
- `stopStreams()` : cleanup au démontage

### Scoring géolocalisation (`src/api/locationService.js`)
- Formule Haversine pour la distance en mètres
- < 200 m du domicile → `home` (1 pt)
- > 200 m du domicile → `outdoor` (2 pts)

### Navigation
- Feed, Carte, Classement, Profil avec BottomNav
- `BeCacaButton` → navigate vers `/camera`
- Flash message 2,5s au retour du feed

### PWA
- `public/manifest.json` + meta tags iOS dans `index.html`
- Installable sur iOS et Android

## Problèmes connus
- `src/utils/mockData.js` : fichier orphelin (non importé) — peut être supprimé manuellement depuis Finder
- Firestore en mode test : à sécuriser avec les règles dans README.md avant d'inviter des amis
- Déploiement encore manuel (Netlify Drop) — à migrer vers Vercel + GitHub

## Décisions techniques prises
- Auth email/password (Phone Auth abandonné : bloque reCAPTCHA sur localhost)
- Nominatim pour géocodage (gratuit, sans clé API)
- PWA manuelle (pas vite-plugin-pwa) : manifest.json dans public/ + meta tags iOS dans index.html
- Proxy src/api/ → src/services/ : les screens importent depuis api/, l'implémentation Firebase est dans services/

## Prochaine session
1. Créer le repo GitHub + connecter Vercel (voir instructions ci-dessus)
2. Tester le flux complet sur mobile : inscription → post caméra → classement
3. Sécuriser les règles Firestore (copier depuis README.md)
4. [Optionnel] Corriger le seuil scoring si besoin (actuellement > 200m = outdoor)
