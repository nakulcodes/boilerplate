import { registerEnumType } from '@nestjs/graphql';
import { UserStatus, OrganizationStatus } from '../../database/enums';

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account status',
});

registerEnumType(OrganizationStatus, {
  name: 'OrganizationStatus',
  description: 'Organization status',
});

export { UserStatus, OrganizationStatus };
