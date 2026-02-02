import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string | null;

  @ApiProperty()
  lastName!: string | null;

  @ApiProperty({ enum: ['invited', 'active', 'blocked'] })
  status!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  onboarded!: boolean;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
    },
  })
  organization!: {
    id: string;
    name: string;
  };

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false })
  invitedBy?: string | null;

  @ApiProperty({
    required: false,
    // type: 'object',
    // properties: {
    //   id: { type: 'string' },
    //   firstName: { type: 'string' },
    //   lastName: { type: 'string' },
    //   email: { type: 'string' },
    // },
  })
  inviter?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;

  @ApiProperty({
    required: false,
    description: 'Invite link for users in INVITED state (for manual sharing)',
    example: 'https://app.example.com/accept-invite?token=inv_abc123',
  })
  inviteLink?: string | null;

  @ApiProperty({
    required: false,
    description: 'When the invite expires',
    example: '2025-11-07T08:00:00Z',
  })
  inviteExpires?: Date | null;
}
