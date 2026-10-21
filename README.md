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

Les migrations créent uniquement le schéma. Pour retrouver les six services du catalogue original, exécuter explicitement :

```sh
php artisan db:seed --class=ServiceSeeder
```

`php artisan db:seed` installe également uniquement ce catalogue. Aucun compte, client, rendez-vous ou message de démonstration n'est créé. Le seeder peut être relancé : il ajoute les services manquants sans dupliquer ni modifier ceux déjà présents. Les prix, descriptions et images proviennent du code initial. Les durées d'origine n'étant pas disponibles, les valeurs proposées sont : Relaxing Massage 60 min, Facial Treatment 45 min, Body Care 60 min, Aromatherapy 60 min, Hammam Spa 60 min, Signature Head Massage 30 min. Elles sont modifiables dans la base MySQL. Les images existantes sont servies par React depuis `public/images/`. Sans seeding, la liste reste vide. La page d'accueil garde ses cartes de présentation statiques d'origine.

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

L'inscription publique ne donne jamais de droits administrateur. L'espace React `/admin/appointments` permet de gérer les rendez-vous, `/admin/clients` les clients et `/admin/messages` les messages. Les clients ne peuvent pas accéder aux API d'administration. Une réservation utilise l'email du compte connecté et confirme immédiatement le rendez-vous si le créneau est libre. Le suivi public et les codes de suivi ne sont plus proposés.

## API

| Méthode | URL | Accès |
| --- | --- | --- |
| GET | `/api/services` | Public |
| POST | `/api/inscription`, `/api/login` | Public, limité |
| GET | `/api/user` | Connecté |
| PUT | `/api/profile` | Connecté, nom/prénom/téléphone |
| POST | `/api/logout`, `/api/appointments` | Connecté |
| GET | `/api/availability?service_id={id}&date=YYYY-MM-DD` | Public, horaires disponibles |
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

Les tests créent leurs données uniquement en mémoire et vérifient migrations, authentification, permissions, réservation, disponibilité, administration et contact.

## GitHub et déploiement

Versionner tout le dossier `spa_pro`, y compris `composer.lock`, `package-lock.json`, migrations et `.env.example`. Les `.env`, `vendor`, `node_modules`, logs et build sont ignorés. Aucun identifiant MySQL ou export de données ne doit être publié.

Pour un hébergement, servir le backend depuis `back_spa/public` et le build frontend depuis `fron_spa/dist`, avec réécriture des URLs frontend vers `index.html`. Configurer `APP_URL`, `FRONTEND_URL`, `VITE_API_URL` et les domaines Sanctum. Les deux applications restent distinctes mais l'authentification SPA par cookies nécessite le même domaine principal (par exemple `app.exemple.com` et `api.exemple.com`). Configurer alors `SESSION_DOMAIN=.exemple.com`, `SESSION_SECURE_COOKIE=true`, HTTPS et `APP_DEBUG=false`.

## Réservation selon disponibilité

Le calendrier propose uniquement les créneaux libres via `/api/availability`. Le serveur contrôle à nouveau la disponibilité dans une transaction avant chaque création, déplacement ou réactivation. Les écritures de réservation prennent le même verrou de ligne MySQL : deux demandes simultanées ne peuvent pas confirmer des soins qui se chevauchent.

En l'absence de gestion des employés ou des salles, la capacité est d'un soin à la fois pour tout le spa. Les rendez-vous `pending` et `confirmed` bloquent toute leur durée; les rendez-vous annulés libèrent le temps. Les bornes sont exclusives à la fin : un soin finissant à 11h permet un autre à 11h. Horaires : départs à 09h, 10h, 11h, 12h, 14h, 15h, 16h et 17h, uniquement si la durée tient dans 09h–13h ou 14h–18h. Les heures passées sont exclues selon Africa/Casablanca. Configuration : `back_spa/config/booking.php`.

Le client voit une confirmation avec soin, date, heure, durée et prix, sans code ni page de suivi. L'ancienne URL frontend `/mon-rendez-vous` redirige vers les services. La colonne historique `code_suivi` est conservée en interne pour ne pas détruire les données des installations existantes, mais n'est plus exposée dans les réponses JSON.

## Coordonnées du compte

L’inscription conserve nom, prénom et téléphone dans `users`. Contact et réservation utilisent automatiquement l’identité du compte côté serveur; les champs d’identité envoyés par le navigateur ne peuvent pas la remplacer. Le formulaire contact connecté demande uniquement sujet et message; la réservation demande uniquement date et heure. Les invités gardent les champs nom/email du contact.

Après mise à jour, exécuter `php artisan migrate` pour ajouter les trois colonnes de profil. La migration récupère les informations des anciens comptes depuis le client ayant le même email quand il existe. Le profil reste facultatif : les anciens comptes peuvent réserver directement avec les informations disponibles. Le nom complet est conservé si le nom/prénom séparé manque; les coordonnées déjà connues du client sont préservées, et les informations absentes restent vides. Aucun passage par `/profil` n'est imposé. Aucun compte ni numéro fictif n’est créé.

## Photo de profil

Depuis `/profil`, le compte connecté peut ajouter ou remplacer sa photo (JPG/PNG/WebP, 2 Mo maximum, 4096×4096 pixels maximum). `POST /api/profile/photo` accepte un fichier multipart nommé `photo`. `GET /api/profile/photo` sert uniquement la photo du compte connecté; les fichiers sont stockés sur le disque privé Laravel et exclus de Git. Aucun lien symbolique public n'est nécessaire. La migration ajoute `users.profile_photo_path`; appliquer `php artisan migrate` après la mise à jour. La réponse utilisateur inclut `profile_photo_url`, jamais le chemin du fichier. Une photo remplacée est supprimée après l'enregistrement de la nouvelle.

## Mes réservations

Le compte connecté retrouve ses rendez-vous sur `/mes-reservations`, accessible depuis la navigation, le profil et la confirmation de réservation. `GET /api/my-appointments` retourne uniquement les rendez-vous du client dont l'email correspond au compte connecté, paginés par 12, avec soin, date, heure et statut. Aucun code de suivi ni coordonnées d'autres clients n'est exposé. La page indique le prix actuel du catalogue; aucun historique de paiement n'est créé.
