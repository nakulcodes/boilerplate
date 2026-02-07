import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from './user.entity';
import { CandidateSource } from '../enums';

@Entity('candidates')
@Index(['organizationId', 'email'], { unique: true })
@Index(['organizationId', 'createdAt'])
export class CandidateEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkedinUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  portfolioUrl: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentCompany: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentTitle: string | null;

  @Column({
    type: 'enum',
    enum: CandidateSource,
    default: CandidateSource.DIRECT_APPLY,
  })
  source: CandidateSource;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true })
  addedById: string | null;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, unknown> | null;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'addedById' })
  addedBy: UserEntity | null;
}
