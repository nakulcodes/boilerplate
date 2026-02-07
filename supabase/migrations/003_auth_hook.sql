-- Custom Access Token Hook
-- Adds organization_id, permissions, first_name, last_name, role_id to JWT claims
-- Enable in Supabase Dashboard: Authentication > Hooks > Customize Access Token

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_data RECORD;
BEGIN
  SELECT
    u.organization_id,
    COALESCE(r.permissions, '[]'::jsonb) as permissions,
    u.first_name,
    u.last_name,
    u.role_id
  INTO user_data
  FROM public.users u
  LEFT JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_data.organization_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{organization_id}', to_jsonb(user_data.organization_id));
    claims := jsonb_set(claims, '{permissions}', user_data.permissions);
    claims := jsonb_set(claims, '{first_name}', to_jsonb(COALESCE(user_data.first_name, '')));
    claims := jsonb_set(claims, '{last_name}', to_jsonb(user_data.last_name));
    claims := jsonb_set(claims, '{role_id}', to_jsonb(user_data.role_id));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to Supabase auth admin
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public roles for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
