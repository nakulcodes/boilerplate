import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserRepository, OrganizationRepository, RoleRepository } from '../src/database/repositories';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { UserStatus, OrganizationStatus } from '../src/database/enums';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Create a standalone NestJS application
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get repositories and services
    const organizationRepo = app.get(OrganizationRepository);
    const roleRepo = app.get(RoleRepository);
    const userRepo = app.get(UserRepository);
    const authService = app.get(AuthService);

    // 1. Create Organization
    console.log('📦 Creating organization...');
    const existingOrg = await organizationRepo.findOne({
      where: { slug: 'acme-corp' },
    });

    let organization = existingOrg;
    if (!existingOrg) {
      organization = organizationRepo.create({
        name: 'Acme Corporation',
        slug: 'acme-corp',
        domain: 'acme-corp.local',
        status: OrganizationStatus.ACTIVE,
      });
      organization = await organizationRepo.save(organization);
      console.log(`   ✓ Created organization: ${organization.name} (ID: ${organization.id})`);
    } else {
      console.log(`   ℹ Organization already exists: ${existingOrg.name}`);
    }

    if (!organization) {
      throw new Error('Failed to create or find organization');
    }

    // 2. Create Roles
    console.log('\n🎭 Creating roles...');
    const rolesToCreate = [
      {
        name: 'Admin',
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles'],
        isDefault: false,
      },
      {
        name: 'Manager',
        permissions: ['read', 'write', 'manage_users'],
        isDefault: false,
      },
      {
        name: 'User',
        permissions: ['read', 'write'],
        isDefault: true,
      },
    ];

    const roles: any[] = [];
    for (const roleData of rolesToCreate) {
      const existingRole = await roleRepo.findOne({
        where: {
          name: roleData.name,
          organizationId: organization.id,
        },
      });

      if (!existingRole) {
        const role = roleRepo.create({
          ...roleData,
          organizationId: organization.id,
        });
        const savedRole = await roleRepo.save(role);
        roles.push(savedRole);
        console.log(`   ✓ Created role: ${savedRole.name}`);
      } else {
        roles.push(existingRole);
        console.log(`   ℹ Role already exists: ${existingRole.name}`);
      }
    }

    // 3. Create Users
    console.log('\n👤 Creating users...');
    const adminRole = roles.find((r) => r.name === 'Admin');
    const userRole = roles.find((r) => r.name === 'User');

    const usersToCreate = [
      {
        email: 'admin@acme-corp.local',
        password: 'Admin@123',
        firstName: 'Admin',
        lastName: 'User',
        role: adminRole,
        status: UserStatus.ACTIVE,
        isActive: true,
        onboarded: true,
      },
      {
        email: 'john.doe@acme-corp.local',
        password: 'User@123',
        firstName: 'John',
        lastName: 'Doe',
        role: userRole,
        status: UserStatus.ACTIVE,
        isActive: true,
        onboarded: true,
      },
    ];

    for (const userData of usersToCreate) {
      const existingUser = await userRepo.findOne({
        where: {
          email: userData.email,
          organizationId: organization.id,
        },
      });

      if (!existingUser) {
        const hashedPassword = await authService.hashPassword(userData.password);
        const user = userRepo.create({
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          organizationId: organization.id,
          roleId: userData.role?.id || null,
          status: userData.status,
          isActive: userData.isActive,
          onboarded: userData.onboarded,
        });
        const savedUser = await userRepo.save(user);
        console.log(`   ✓ Created user: ${savedUser.email} (Role: ${userData.role?.name || 'None'})`);
        console.log(`     Password: ${userData.password}`);
      } else {
        console.log(`   ℹ User already exists: ${existingUser.email}`);
      }
    }

    console.log('\n✅ Database seed completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   Organization: ${organization.name}`);
    console.log(`   Roles: ${roles.length}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin: admin@acme-corp.local / Admin@123');
    console.log('   User: john.doe@acme-corp.local / User@123\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the seed function
seed();
