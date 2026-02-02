import { Entity, Column, OneToMany, Index } from 'typeorm';

import { OrganizationStatus } from '../enums';

import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('organizations')
@Index(['slug'], { unique: true })
@Index(['domain'], { unique: true })
export class OrganizationEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  slug!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  domain!: string;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status!: OrganizationStatus;

  @Column({ type: 'boolean', default: false })
  careersPageEnabled!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  careersPageSettings!: Record<string, any> | null;

  @OneToMany(() => UserEntity, (user) => user.organization, {
    cascade: false,
  })
  users!: UserEntity[];
}
