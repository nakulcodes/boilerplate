import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { InviteUser } from './usecases/invite-user/invite-user.usecase';
import { AcceptInvite } from './usecases/accept-invite/accept-invite.usecase';
import { ResendInvite } from './usecases/resend-invite/resend-invite.usecase';
import { BlockUser } from './usecases/block-user/block-user.usecase';
import { UnblockUser } from './usecases/unblock-user/unblock-user.usecase';
import { UpdateUser } from './usecases/update-user/update-user.usecase';
import { GetCurrentUser } from './usecases/get-current-user/get-current-user.usecase';
import { ListUsers } from './usecases/list-users/list-users.usecase';
import { UpdateProfile } from './usecases/update-profile/update-profile.usecase';

const USE_CASES = [
  InviteUser,
  AcceptInvite,
  ResendInvite,
  BlockUser,
  UnblockUser,
  UpdateUser,
  GetCurrentUser,
  ListUsers,
  UpdateProfile,
];

@Module({
  imports: [MailModule, AuthModule],
  controllers: [UserController],
  providers: [...USE_CASES],
  exports: [],
})
export class UserModule {}
