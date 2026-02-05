import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { RoleModule } from '../modules/role/role.module';
import { AuditModule } from '../modules/audit/audit.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { RoleResolver } from './resolvers/role.resolver';
import { AuditResolver } from './resolvers/audit.resolver';

@Module({
  imports: [AuthModule, UserModule, RoleModule, AuditModule],
  providers: [AuthResolver, UserResolver, RoleResolver, AuditResolver],
})
export class ResolversModule {}
