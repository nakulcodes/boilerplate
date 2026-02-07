import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { RoleEntity } from './role.entity';
import { BaseEntity } from './base.entity';
import { UserStatus } from '../enums';

@Entity('users')
@Index(['email', 'organizationId'], { unique: true })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName!: string | null;

  @Column({ name: 'organization_id', type: 'uuid', nullable: false })
  organizationId!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INVITED,
  })
  status!: UserStatus;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  onboarded!: boolean;

  @Column({
    name: 'password_reset_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordResetToken!: string | null;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires!: Date | null;

  @Column({
    name: 'invite_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  inviteToken!: string | null;

  @Column({ name: 'invite_expires', type: 'timestamp', nullable: true })
  inviteExpires!: Date | null;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  refreshToken!: string | null;

  @Column({
    name: 'refresh_token_expires',
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  refreshTokenExpires!: Date | null;

  @Column({ name: 'invited_by', type: 'uuid', nullable: true })
  invitedBy!: string | null;

  @ManyToOne(() => OrganizationEntity, (org) => org.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId!: string | null;

  @ManyToOne(() => RoleEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  inviter!: UserEntity | null;
}
