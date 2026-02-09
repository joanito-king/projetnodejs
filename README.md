# Application de Gestion des Rendez-vous Médicaux

## Vue d'ensemble

Application fullstack pour la gestion des rendez-vous médicaux avec :
- **Backend** : Node.js + Express + MySQL
- **Frontend** : Angular 21 + TypeScript

## Structure du projet

```
projet-gestion/
├── server/                 # Backend Express (port 5002)
│   ├── controllers/       # Logique métier
│   ├── routes/           # API endpoints
│   ├── models/           # Modèles de données
│   └── server.js         # Point d'entrée
│
├── frontend/             # Frontend Angular (port 4200)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # LoginComponent, DashboardComponent, PatientComponent, RendezVousComponent
│   │   │   ├── services/      # ApiService, AuthGuard, AuthInterceptor
│   │   │   └── app.routes.ts  # Routes de l'application
│   │   └── main.ts
│   └── angular.json      # Configuration Angular
│
└── public/               # Ancien frontend (à remplacer)
```

## Installation

### Prérequis
- Node.js 18+ 
- npm 9+
- MySQL 8+

### Backend

```bash
# Dans projet-gestion/
npm install
npm run dev  # ou npm start
# Le serveur démarre sur http://localhost:5002
```

### Frontend

```bash
# Dans projet-gestion/frontend/
npm install
ng serve
# L'app démarre sur http://localhost:4200
```

Note : Le proxy dans `proxy.conf.json` redirige automatiquement les requêtes `/api` vers le backend.

## Fonctionnalités

### 🔐 Authentification
- Login sécurisé avec JWT
- Interceptor ajoute le token aux requêtes
- Guard protège les routes

### 👥 Gestion des Patients
- CRUD complet (Créer, Lire, Mettre à jour, Supprimer)
- Recherche en temps réel
- Édition en ligne

### 📅 Gestion des Rendez-vous
- Création/modification/suppression
- Affichage par patient ou médecin
- État du rendez-vous (programmé, confirmé, annulé, complété)
- Notes jointes

### 👨‍⚕️ Liste des Médecins
- Affichage des médecins disponibles
- Spécialité et coordonnées

## Architecture Angular

### Services
- **ApiService** : Encapsule tous les appels HTTP
  - `login()`, `logout()`
  - CRUD patients, rendez-vous, médecins
  - RxJS Observables avec BehaviorSubject

### Guards & Interceptors
- **AuthGuard** : Protège les routes (vérifie le token)
- **AuthInterceptor** : Ajoute le Bearer token à chaque requête HTTP

### Composants
- **LoginComponent** : Connexion utilisateur
- **DashboardComponent** : Layout principal + statistiques
- **PatientComponent** : Gestion patients
- **RendezVousComponent** : Gestion rendez-vous
- **MedecinComponent** : Liste médecins

## API REST

### Authentication
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register-secretary` - Création secrétaire
- `POST /api/auth/register-doctor` - Création médecin
- `GET /api/auth/verify` - Vérification token

### Patients
- `GET /api/patients/list` - Liste tous
- `POST /api/patients/add` - Créer
- `GET /api/patients/:id` - Détail
- `PUT /api/patients/:id` - Modifier
- `DELETE /api/patients/:id` - Supprimer
- `GET /api/patients/search/:keyword` - Recherche

### Rendez-vous
- `GET /api/rendezVous/list` - Liste tous
- `POST /api/rendezVous/add` - Créer
- `GET /api/rendezVous/:id` - Détail
- `PUT /api/rendezVous/:id` - Modifier
- `DELETE /api/rendezVous/:id` - Supprimer
- `GET /api/rendezVous/doctor/:idMed` - Horaire médecin

### Médecins
- `GET /api/medecins/list` - Liste
- `GET /api/medecins/:id` - Détail

## Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=gestion_rdv
JWT_SECRET=your_jwt_secret_key
PORT=5002
```

## Build & Déploiement

### Production Frontend
```bash
ng build --configuration=production
# Génère dist/ prêt à déployer
```

### Production Backend
```bash
npm start
# Serve static files depuis public/
```

## Technologies utilisées

### Frontend (Angular)
- Angular 21 (framework fullstack moderne)
- TypeScript 5+ 
- RxJS (programmation réactive)
- Standalone components (dernière approche d'Angular)

### Backend
- Express.js
- MySQL2
- JWT (jsonwebtoken)
- Bcrypt (hachage mots de passe)

## Troubleshooting

### Erreur CORS
Assurez-vous que le backend accepte les requêtes du frontend.
Dans `server.js`, le CORS est déjà configuré.

### Port déjà utilisé
- Frontend : changez le port avec `ng serve --port 4300`
- Backend : modifiez la variable `PORT` dans `.env`

### Pas de connexion API
Vérifiez que :
1. Le backend tourne sur le bon port
2. Le proxy.conf.json est correct
3. Les tokens sont bien stockés dans localStorage

## Support
Pour toute question ou bug, consultez la documentation Angular :
- https://angular.dev/
- https://angular.dev/guide/http
- https://angular.dev/guide/routing
