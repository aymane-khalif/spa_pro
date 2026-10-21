# Lunéa Spa

Deux applications indépendantes, reliées exclusivement par une API JSON :

- `back_spa/` : Laravel 12, Sanctum, MySQL, validation et logique métier.
- `fron_spa/` : React, React Router, Vite, CSS et images.

Laravel ne sert aucune page React et React ne dépend pas d'Inertia. Les ports de développement sont 8000 (API) et 5173 (frontend).

## Prérequis

PHP 8.2+ avec PDO MySQL, Composer 2, Node.js 22.12+ et npm, MySQL 8+. Pour les tests uniquement : PDO SQLite. Git.

## Installation après clone

### Backend

Dans `back_spa` :

```sh
composer install
```

Copier `.env.example` vers `.env` (`Copy-Item .env.example .env` dans PowerShell, `cp .env.example .env` sous macOS/Linux).

Créer vous-même une base MySQL vide, puis configurer :

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spa_pro
DB_USERNAME=root
DB_PASSWORD=
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

Puis, lorsque la connexion MySQL est prête :

```sh
php artisan key:generate
php artisan migrate
php artisan serve --host=localhost --port=8000
```

Les migrations créent uniquement le schéma. Aucun service, compte, client ou rendez-vous n'est inséré. Le seeder est vide. Les services sont donc absents de la liste tant que vous n'ajoutez pas vos propres données. La page d'accueil garde ses cartes de présentation statiques d'origine.

Cette histoire de migrations est prévue pour une NOUVELLE base vide. Ne pas la lancer sur une ancienne base contenant déjà les migrations du projet original. Aucun `migrate:fresh` n'est nécessaire.

### Frontend (deuxième terminal)

Dans `fron_spa` :

```sh
npm ci
```

Copier `.env.example` vers `.env`, puis :

```dotenv
VITE_API_URL=http://localhost:8000
```

```sh
npm run dev
```

Ouvrir `http://localhost:5173`. Utiliser `localhost` pour les deux applications (ne pas mélanger avec `127.0.0.1`). Redémarrer Vite après modification de son `.env`; exécuter `php artisan config:clear` après modification de la configuration Laravel.

## Connexion et administration

L'authentification utilise les sessions Sanctum, un cookie HttpOnly, et la protection CSRF. Avant les requêtes POST/PUT/PATCH/DELETE, React appelle `/sanctum/csrf-cookie`; Axios transmet les cookies et le jeton XSRF. Aucun token n'est stocké dans localStorage. Les requêtes métier passent par `/api/*`.

Inscrire un compte depuis `/connexion`. Pour lui attribuer les droits administrateur, exécuter explicitement côté backend :

```sh
php artisan spa:admin votre-email@example.com
```

L'inscription publique ne donne jamais de droits administrateur. L'espace React `/admin/appointments` permet de gérer les rendez-vous, `/admin/clients` les clients et `/admin/messages` les messages. Les clients ne peuvent pas accéder aux API d'administration. Une réservation utilise l'email du compte connecté et retourne un code de suivi. Le suivi public par code affiche le service et le statut, sans les coordonnées du client.

## API

| Méthode | URL | Accès |
| --- | --- | --- |
| GET | `/api/services` | Public |
| POST | `/api/inscription`, `/api/login` | Public, limité |
| GET | `/api/user` | Connecté |
| POST | `/api/logout`, `/api/appointments` | Connecté |
| POST | `/api/appointments/suivi` | Public, code de suivi |
| POST | `/api/contact` | Public, limité |
| GET, POST | `/api/admin/clients` | Admin |
| GET, PUT, DELETE | `/api/admin/clients/{id}` | Admin |
| GET, POST | `/api/admin/appointments` | Admin |
| GET, PUT, DELETE | `/api/admin/appointments/{id}` | Admin |
| PATCH | `/api/admin/appointments/{id}/status` | Admin, `confirmed` ou `cancelled` |
| GET | `/api/admin/messages` | Admin |

Erreurs : 401 non connecté, 403 sans permission, 404 introuvable, 422 validation, 429 limite de requêtes. Le client demande `Accept: application/json`.

## Vérification

```sh
# back_spa : base SQLite éphémère en mémoire, aucune connexion MySQL
php artisan test
php artisan route:list --path=api

# fron_spa
npm run build
```

Les tests créent leurs données uniquement en mémoire et vérifient migrations, authentification, permissions, réservation, suivi, administration et contact.

## GitHub et déploiement

Versionner tout le dossier `spa_pro`, y compris `composer.lock`, `package-lock.json`, migrations et `.env.example`. Les `.env`, `vendor`, `node_modules`, logs et build sont ignorés. Aucun identifiant MySQL ou export de données ne doit être publié.

Pour un hébergement, servir le backend depuis `back_spa/public` et le build frontend depuis `fron_spa/dist`, avec réécriture des URLs frontend vers `index.html`. Configurer `APP_URL`, `FRONTEND_URL`, `VITE_API_URL` et les domaines Sanctum. Les deux applications restent distinctes mais l'authentification SPA par cookies nécessite le même domaine principal (par exemple `app.exemple.com` et `api.exemple.com`). Configurer alors `SESSION_DOMAIN=.exemple.com`, `SESSION_SECURE_COOKIE=true`, HTTPS et `APP_DEBUG=false`.

La séparation ne crée pas de règles de disponibilité ou de capacité supplémentaires : plusieurs demandes pour un même créneau restent possibles, comme dans la logique métier initiale.
