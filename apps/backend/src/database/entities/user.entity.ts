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

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName!: string | null;

  @Column({ type: 'uuid', nullable: false })
  organizationId!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INVITED,
  })
  status!: UserStatus;

  @Column({ type: 'boolean', default: false })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  onboarded!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  inviteToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  inviteExpires!: Date | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken!: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  refreshTokenExpires!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  invitedBy!: string | null;

  @ManyToOne(() => OrganizationEntity, (org) => org.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization!: OrganizationEntity;

  @Column({ type: 'uuid', nullable: true })
  roleId!: string | null;

  @ManyToOne(() => RoleEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'roleId' })
  role!: RoleEntity | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'invitedBy' })
  inviter!: UserEntity | null;
}
