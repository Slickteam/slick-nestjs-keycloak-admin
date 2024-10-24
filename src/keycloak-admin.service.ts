import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeycloakAdminClient, UserRepresentation } from '@s3pweb/keycloak-admin-client-cjs';
import { jwtDecode } from 'jwt-decode';

const logger = new Logger('KeycloakAdminService');

export enum KeycloakActionsEmailEnum {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  CONFIGURE_TOTP = 'CONFIGURE_TOTP',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  TERMS_AND_CONDITIONS = 'TERMS_AND_CONDITIONS',
}

@Injectable()
export class KeycloakAdminService {
  public readonly KEYCLOAK_ADMIN_CLIENT_ID: string;
  private readonly KEYCLOAK_ADMIN_CLIENT_SECRET: string;
  public readonly keycloakAdminClient: KeycloakAdminClient;

  public constructor(private configService: ConfigService) {
    const keycloakUrl = this.configService.getOrThrow<string>('KEYCLOAK_URL');
    const keycloakRealm = this.configService.getOrThrow<string>('KEYCLOAK_REALM');
    this.KEYCLOAK_ADMIN_CLIENT_ID = this.configService.getOrThrow('KEYCLOAK_ADMIN_CLIENT_ID');
    this.KEYCLOAK_ADMIN_CLIENT_SECRET = this.configService.getOrThrow('KEYCLOAK_ADMIN_CLIENT_SECRET');

    this.keycloakAdminClient = new KeycloakAdminClient({
      baseUrl: keycloakUrl,
      realmName: keycloakRealm,
    });
  }

  private async auth(): Promise<void> {
    await this.keycloakAdminClient.auth({
      grantType: 'client_credentials',
      clientId: this.KEYCLOAK_ADMIN_CLIENT_ID,
      clientSecret: this.KEYCLOAK_ADMIN_CLIENT_SECRET,
    });
  }

  public async getAccessToken(): Promise<string> {
    const accessToken = await this.keycloakAdminClient.getAccessToken();
    if (!accessToken) {
      logger.debug('Get an access token');
      await this.auth();
    }
    let newAccessToken = accessToken ?? this.keycloakAdminClient.accessToken;
    if (newAccessToken === undefined) {
      throw new Error(`Can't have access_token on keycloak by client_secret method`);
    }
    const decodedTokenExpTime = jwtDecode(newAccessToken)?.exp ?? 0;
    const nowTmSecond = Math.ceil(Date.now() / 1000) + 2; // add 2 seconds in futur, in case there is other things before call api
    if (decodedTokenExpTime < nowTmSecond) {
      logger.debug('Renew a new access token');
      await this.auth();
      newAccessToken = this.keycloakAdminClient.accessToken!;
    } else {
      logger.verbose(`Remain time for this access token : ${decodedTokenExpTime - nowTmSecond} seconds`);
    }
    return newAccessToken;
  }

  public async findAllUsers(): Promise<UserRepresentation[]> {
    await this.getAccessToken();
    logger.verbose('findAllUsers()');
    return this.keycloakAdminClient.users.find();
  }

  public async findUserByEmail(email: string): Promise<UserRepresentation[]> {
    await this.getAccessToken();
    logger.verbose(`findUserByEmail(email=${email})`);
    return this.keycloakAdminClient.users.find({ email });
  }

  public async findUserByUsername(username: string): Promise<UserRepresentation[]> {
    await this.getAccessToken();
    logger.verbose(`findUserByUsername(username=${username})`);
    return this.keycloakAdminClient.users.find({ username });
  }

  public async findUserById(id: string): Promise<UserRepresentation | undefined> {
    await this.getAccessToken();
    logger.verbose(`findUserById(id=${id})`);
    return this.keycloakAdminClient.users.findOne({ id: id });
  }

  public async createUser(
    email: string,
    firstName: string | undefined = undefined,
    lastName: string | undefined = undefined,
    username: string | undefined = undefined,
    attributes: Record<string, unknown> = {},
  ): Promise<UserRepresentation> {
    await this.getAccessToken();
    logger.verbose(`createUser(email=${email}, firstName=${firstName}, lastName=${lastName}, username=${username})`);
    return this.keycloakAdminClient.users.create({ username, email, firstName, lastName, attributes, enabled: true, emailVerified: true });
  }

  public async updateAttributesOfUser(id: string, user: UserRepresentation, attributes: Record<string, unknown>): Promise<void | never> {
    await this.getAccessToken();
    await this.keycloakAdminClient.users.update(
      { id },
      {
        ...user,
        attributes,
      },
    );
  }

  public async updateUserPassword(userId: string, newPassword: string): Promise<void | never> {
    await this.getAccessToken();
    await this.keycloakAdminClient.users.resetPassword({
      id: userId,
      credential: { type: 'password', value: newPassword, temporary: false },
    });
  }

  public async executeActionsEmail(
    sub: string,
    clientId: string | undefined,
    lifespan: number | undefined,
    redirectUri: string | undefined,
    actions: KeycloakActionsEmailEnum[] | undefined,
  ): Promise<void | never> {
    await this.getAccessToken();
    await this.keycloakAdminClient.users.executeActionsEmail({
      id: sub,
      clientId,
      lifespan,
      redirectUri,
      actions,
    });
  }
}
