import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserRepresentation } from '@s3pweb/keycloak-admin-client-cjs';

import { KeycloakActionsEmailEnum, KeycloakAdminService } from './keycloak-admin.service';

function checkIfExistRealmRoleOfUser(user: { realm_access: { roles: string[] } | undefined }, roleName: string): boolean {
  return user.realm_access?.roles.includes(roleName) ?? false;
}

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [KeycloakAdminService],
  exports: [KeycloakAdminService],
})
class KeycloakAdminModule {}

export {
  KeycloakAdminModule,
  KeycloakAdminService,
  // Models
  KeycloakActionsEmailEnum,
  UserRepresentation,
  // Functions
  checkIfExistRealmRoleOfUser,
};
