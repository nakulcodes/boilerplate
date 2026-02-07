-- Seed Script for Supabase Local Development
-- Run with: docker exec -i supabase-db psql -U postgres < supabase/seed.sql

DO $$
DECLARE
  v_org_id UUID;
  v_role_id UUID;
  v_user_id UUID;
  v_admin_email TEXT := 'admin@example.com';
  v_admin_password TEXT := 'password123';
  v_org_name TEXT := 'Acme Inc';
  v_org_slug TEXT := 'acme';
  v_org_domain TEXT := 'acme.com';
  v_all_permissions JSONB := '["user:create","user:list:read:own","user:list:read:team","user:list:read:all","user:read:own","user:read:team","user:read:all","user:update:own","user:update:team","user:update:all","user:update-status","user:impersonate","role:create","role:update-status","role:read","role:list:read","role:update","organization:read","organization:update","organization:settings","audit:list:read","audit:read"]';
BEGIN
  -- Check if organization already exists
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = v_org_slug;

  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug, domain, status)
    VALUES (v_org_name, v_org_slug, v_org_domain, 'active')
    RETURNING id INTO v_org_id;
    RAISE NOTICE 'Created organization: % (ID: %)', v_org_name, v_org_id;
  ELSE
    RAISE NOTICE 'Organization already exists: % (ID: %)', v_org_name, v_org_id;
  END IF;

  -- Check if admin role already exists
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'Admin' AND organization_id = v_org_id;

  IF v_role_id IS NULL THEN
    INSERT INTO public.roles (name, permissions, organization_id, is_default)
    VALUES ('Admin', v_all_permissions, v_org_id, true)
    RETURNING id INTO v_role_id;
    RAISE NOTICE 'Created Admin role (ID: %)', v_role_id;
  ELSE
    RAISE NOTICE 'Admin role already exists (ID: %)', v_role_id;
  END IF;

  -- Create Member role
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Member' AND organization_id = v_org_id) THEN
    INSERT INTO public.roles (name, permissions, organization_id, is_default)
    VALUES ('Member', '["user:read:own","user:update:own","organization:read"]'::jsonb, v_org_id, false);
    RAISE NOTICE 'Created Member role';
  END IF;

  -- Check if admin user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_admin_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_change,
      phone_change_token,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new,
      email_change_token_current,
      email_change_confirm_status,
      reauthentication_token,
      is_sso_user
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_admin_email,
      crypt(v_admin_password, gen_salt('bf')),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      NOW(),
      NOW(),
      NULL,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      0,
      '',
      false
    );

    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id::text,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_admin_email, 'email_verified', true),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created auth user: % (ID: %)', v_admin_email, v_user_id;
  ELSE
    RAISE NOTICE 'Auth user already exists: % (ID: %)', v_admin_email, v_user_id;
  END IF;

  -- Create user profile
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    INSERT INTO public.users (id, email, first_name, last_name, organization_id, role_id, status, is_active, onboarded)
    VALUES (v_user_id, v_admin_email, 'Admin', 'User', v_org_id, v_role_id, 'active', true, true);
    RAISE NOTICE 'Created user profile for: %', v_admin_email;
  ELSE
    RAISE NOTICE 'User profile already exists for: %', v_admin_email;
  END IF;

  -- Create sample users
  FOR i IN 1..3 LOOP
    DECLARE
      sample_email TEXT := 'user' || i || '@example.com';
      sample_user_id UUID;
      member_role_id UUID;
    BEGIN
      SELECT id INTO member_role_id FROM public.roles WHERE name = 'Member' AND organization_id = v_org_id;
      SELECT id INTO sample_user_id FROM auth.users WHERE email = sample_email;

      IF sample_user_id IS NULL THEN
        sample_user_id := gen_random_uuid();

        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password,
          email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
          is_super_admin, created_at, updated_at, phone, phone_change, phone_change_token,
          confirmation_token, recovery_token, email_change, email_change_token_new,
          email_change_token_current, email_change_confirm_status, reauthentication_token, is_sso_user
        ) VALUES (
          sample_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          sample_email, crypt('password123', gen_salt('bf')), NOW(), NOW(),
          '{"provider": "email", "providers": ["email"]}'::jsonb, '{}'::jsonb,
          false, NOW(), NOW(), NULL, '', '', '', '', '', '', '', 0, '', false
        );

        INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
          gen_random_uuid(), sample_user_id::text, sample_user_id,
          jsonb_build_object('sub', sample_user_id::text, 'email', sample_email, 'email_verified', true),
          'email', NOW(), NOW(), NOW()
        );

        INSERT INTO public.users (id, email, first_name, last_name, organization_id, role_id, status, is_active, onboarded)
        VALUES (sample_user_id, sample_email, 'User', i::text, v_org_id, member_role_id, 'active', true, true);

        RAISE NOTICE 'Created sample user: %', sample_email;
      END IF;
    END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Seed completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin: admin@example.com / password123';
  RAISE NOTICE 'Users: user1-3@example.com / password123';
  RAISE NOTICE '========================================';
END $$;
