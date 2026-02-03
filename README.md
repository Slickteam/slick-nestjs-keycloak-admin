# Slick NestJS Keycloak Admin

[![npm version](https://img.shields.io/npm/v/@slickteam/nestjs-keycloak-admin.svg)](https://www.npmjs.com/package/@slickteam/nestjs-keycloak-admin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Module NestJS pour l'administration de Keycloak via le client admin.

## Installation

```bash
npm install @slickteam/nestjs-keycloak-admin
```

## Configuration

Ajoutez les variables d'environnement suivantes :

```env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_ADMIN_REALM=master
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_CLIENT_SECRET=your-client-secret
```

| Variable                       | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `KEYCLOAK_URL`                 | URL de votre serveur Keycloak               |
| `KEYCLOAK_ADMIN_REALM`         | Realm utilisé pour l'authentification admin |
| `KEYCLOAK_ADMIN_CLIENT_ID`     | Client ID avec les droits d'administration  |
| `KEYCLOAK_ADMIN_CLIENT_SECRET` | Secret du client                            |

## Utilisation

### Import du module

```ts
import { KeycloakAdminModule } from '@slickteam/nestjs-keycloak-admin';

@Module({
  imports: [KeycloakAdminModule],
})
class AppModule {}
```

### Injection du service

```ts
import { KeycloakAdminService } from '@slickteam/nestjs-keycloak-admin';

@Injectable()
class UserService {
  constructor(private readonly keycloakAdmin: KeycloakAdminService) {}

  async getUsers() {
    return this.keycloakAdmin.findAllUsers();
  }
}
```

## API

### Méthodes du service

#### Utilisateurs - Lecture

| Méthode                        | Description                     |
| ------------------------------ | ------------------------------- |
| `findAllUsers()`               | Récupère tous les utilisateurs  |
| `findUserByEmail(email)`       | Recherche par email             |
| `findUserByUsername(username)` | Recherche par nom d'utilisateur |
| `findUserById(id)`             | Recherche par ID                |

#### Utilisateurs - Création et modification

| Méthode                                                            | Description              |
| ------------------------------------------------------------------ | ------------------------ |
| `createUser(email, firstName?, lastName?, username?, attributes?)` | Crée un utilisateur      |
| `updateAttributesOfUser(id, user, attributes)`                     | Met à jour les attributs |
| `updateUserPassword(userId, newPassword)`                          | Change le mot de passe   |

#### Actions email

| Méthode                                                                  | Description              |
| ------------------------------------------------------------------------ | ------------------------ |
| `executeActionsEmail(sub, clientId?, lifespan?, redirectUri?, actions?)` | Envoie un email d'action |

Actions disponibles (`KeycloakActionsEmailEnum`) :

- `VERIFY_EMAIL` - Vérification de l'email
- `UPDATE_PROFILE` - Mise à jour du profil
- `CONFIGURE_TOTP` - Configuration 2FA
- `UPDATE_PASSWORD` - Changement de mot de passe
- `TERMS_AND_CONDITIONS` - Acceptation des CGU

#### Authentification

| Méthode            | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `getAccessToken()` | Récupère un token d'accès (avec renouvellement automatique) |

### Fonctions utilitaires

```ts
import { checkIfExistRealmRoleOfUser } from '@slickteam/nestjs-keycloak-admin';

// Vérifie si un utilisateur possède un rôle au niveau du realm
const hasRole = checkIfExistRealmRoleOfUser(decodedToken, 'admin');
```

### Accès au client natif

Pour des opérations avancées non couvertes par le service :

```ts
const client = this.keycloakAdmin._client;
// Accès direct à @s3pweb/keycloak-admin-client-cjs
```

## Exports

```ts
import {
  // Service injectable
  KeycloakActionsEmailEnum,
  KeycloakAdminModule,
  // Module NestJS
  KeycloakAdminService,
  // Enum des actions email
  UserRepresentation,
  // Type utilisateur Keycloak
  checkIfExistRealmRoleOfUser, // Fonction utilitaire
} from '@slickteam/nestjs-keycloak-admin';
```

## Dépendances

| Package                             | Version |
| ----------------------------------- | ------- |
| `@nestjs/common`                    | `^11.1` |
| `@nestjs/config`                    | `^4.0`  |
| `@s3pweb/keycloak-admin-client-cjs` | `^26.5` |

## Licence

MIT
