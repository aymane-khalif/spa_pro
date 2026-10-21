# Lunéa Spa

Application séparée : `back_spa` (API Laravel 12 / MySQL) et `fron_spa` (React / Vite). Les deux applications communiquent par API avec une session Sanctum.

## Prérequis

- PHP 8.2+ et Composer 2 ; extensions PHP usuelles Laravel, `pdo_mysql`, `fileinfo`. `pdo_sqlite` pour les tests.
- Node.js 22.12+ (ou 20.19+) et npm.
- MySQL 8+ ou MariaDB 10.4+ (XAMPP convient). Démarrer MySQL ; Apache n'est pas nécessaire avec `artisan serve`.

## Installation après le clone

### 1. Backend

```sh
git clone https://github.com/aymane-khalif/spa_pro.git
cd spa_pro
```

Depuis le dossier cloné :

```sh
cd back_spa
composer install
```

L'installation crée `.env` et une clé d'application si elles sont absentes. Une configuration existante est conservée. Créer une base MySQL vide, par exemple `spa_pro`, puis renseigner dans **`back_spa/.env`** :

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spa_pro
DB_USERNAME=root
DB_PASSWORD=
```

Utiliser les identifiants de votre installation MySQL. Ne pas modifier `.env.example` avec des secrets.

```sh
php artisan migrate --seed
php artisan serve
```

L'API démarre sur `http://localhost:8000`. Les migrations créent le schéma ; le seeder ajoute uniquement les six soins nécessaires au catalogue. Aucun compte, message ou rendez-vous de démonstration. Pour un schéma entièrement vide, utiliser `php artisan migrate` sans `--seed` (le catalogue sera vide).

### 2. Frontend — deuxième terminal

Depuis le dossier cloné :

```sh
cd fron_spa
npm ci
npm run dev
```

L'installation crée automatiquement `fron_spa/.env` si absent. Ouvrir **http://localhost:5173**. Utiliser `localhost` pour les deux applications afin de partager correctement les cookies de session.

La commande est `npm run dev`. Après la première installation, seuls MySQL, `php artisan serve` et `npm run dev` doivent être démarrés.

## Configuration

- Frontend : `VITE_API_URL=http://localhost:8000` dans `fron_spa/.env`.
- Backend : `APP_URL`, `SERVER_HOST`, `SERVER_PORT`, `FRONTEND_URL` et `SANCTUM_STATEFUL_DOMAINS` dans `back_spa/.env` doivent correspondre aux adresses utilisées si les ports changent. Redémarrer les serveurs après modification ; `php artisan config:clear` si la configuration Laravel avait été mise en cache.
- Les inscriptions enregistrent nom, prénom et téléphone. Le profil permet de les modifier et d'ajouter une photo privée. Les réservations et contacts connectés réutilisent les informations du compte.
- Les disponibilités tiennent compte de la durée du soin et des rendez-vous existants, dans le fuseau `Africa/Casablanca`. Les horaires sont définis dans `back_spa/config/booking.php`.
- Contact : les messages sont conservés en base. Avec `MAIL_MAILER=log`, aucun email réel n'est envoyé. L'adresse de destination prévue est `khadim.hiba07@gmail.com`. Aucun mot de passe Gmail n'est nécessaire pour utiliser l'application dans cette configuration.
- Les photos restent dans le stockage privé Laravel et sont servies par une route authentifiée ; `storage:link` n'est pas nécessaire.

## Administrateur

Créer un compte dans l'interface, puis depuis `back_spa` :

```sh
php artisan spa:admin votre-email@example.com
```

L'administration permet de gérer les clients, rendez-vous et messages. Aucun administrateur par défaut.

## Vérification

```sh
# Depuis back_spa : tests isolés en SQLite mémoire, sans toucher à MySQL.
php artisan test

# Depuis fron_spa : compilation de production.
npm run build
```

## Partage sur GitHub

Versionner les sources, migrations, seeders, `.env.example`, `composer.lock` et `package-lock.json`. Le `.gitignore` exclut les environnements locaux, dépendances, compilations, journaux et fichiers SQLite. Ne pas partager la base locale, les photos des utilisateurs ou des identifiants privés. Chaque installation utilise sa propre base et sa propre clé.

Ne jamais lancer `migrate:fresh` sur une base contenant des données à conserver. Une nouvelle installation n'a besoin d'aucun export SQL.
