# Slick Nestjs Keycloak Admin

Available on npmjs.org : [@slickteam/nestjs-keycloak-admin](https://www.npmjs.com/package/@slickteam/nestjs-keycloak-admin)

## Usage

- Install dependency

```bash
npm i -S @slickteam/nestjs-keycloak-admin
```

- In your environment file, add these lines :

```conf
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=
KEYCLOAK_ADMIN_CLIENT_ID=
KEYCLOAK_ADMIN_CLIENT_SECRET=5000
```

- In module where you want use this module, add this :

```ts
import { KeycloakModule } from '@slickteam/nestjs-keycloak-admin';

@Module({
  imports: [KeycloakModule],
  controllers: [],
  providers: [],
  exports: [],
})
class ExempleModule {}
```

## Dependencies version

Nestjs

- `@nestjs/common`: `^10.4.7`
- `@nestjs/config`: `^3.3.0`
- `@nestjs/core`: `^10.4.7`

Keycloak

- `@s3pweb/keycloak-admin-client-cjs`: `^26.0.5`
