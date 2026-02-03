import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ImpersonateBodyDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  targetUserId!: string;
}
