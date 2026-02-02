import { IsString, IsNotEmpty } from 'class-validator';

import { BaseAuthenticatedCommand } from '@boilerplate/core';

export class RefreshTokenCommand extends BaseAuthenticatedCommand {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
