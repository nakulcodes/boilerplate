import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { OrganizationCommand } from '@shared/commands/organization.command';
import { ApplicationStatus } from '@db/enums';

export class UpdateApplicationStatusCommand extends OrganizationCommand {
  @IsUUID()
  @IsNotEmpty()
  readonly applicationId: string;

  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  readonly status: ApplicationStatus;

  @IsString()
  @ValidateIf((o) => o.status === ApplicationStatus.REJECTED)
  @IsNotEmpty({
    message: 'Rejection reason is required when status is rejected',
  })
  @IsOptional()
  readonly rejectionReason?: string;
}
