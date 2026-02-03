import { Global, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  UserEntity,
  OrganizationEntity,
  RoleEntity,
  AuditLogEntity,
  SupportedIntegrationEntity,
  OrganizationIntegrationEntity,
} from './entities';
import {
  UserRepository,
  OrganizationRepository,
  RoleRepository,
  AuditLogRepository,
  SupportedIntegrationRepository,
  OrganizationIntegrationRepository,
} from './repositories';

const entities = [
  UserEntity,
  OrganizationEntity,
  RoleEntity,
  AuditLogEntity,
  SupportedIntegrationEntity,
  OrganizationIntegrationEntity,
];
const repositories = [
  UserRepository,
  OrganizationRepository,
  RoleRepository,
  AuditLogRepository,
  SupportedIntegrationRepository,
  OrganizationIntegrationRepository,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService,
      ): Promise<TypeOrmModuleOptions> => ({
        type: 'postgres',
        url: config.get<string>('DB_URL') ?? '',
        autoLoadEntities: true,
        entities,
        synchronize: true,
        // logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [...repositories],
  exports: [TypeOrmModule, ...repositories],
})
export class DatabaseModule {}
