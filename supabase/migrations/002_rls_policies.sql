-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Get current user's organization_id
CREATE OR REPLACE FUNCTION auth.organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Get current user's permissions
CREATE OR REPLACE FUNCTION auth.permissions()
RETURNS JSONB AS $$
  SELECT COALESCE(r.permissions, '[]'::jsonb)
  FROM public.users u
  LEFT JOIN public.roles r ON u.role_id = r.id
  WHERE u.id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Check if user has a specific permission
CREATE OR REPLACE FUNCTION auth.has_permission(required_permission TEXT)
RETURNS BOOLEAN AS $$
  SELECT auth.permissions() ? required_permission
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations policies
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id = auth.organization_id());

CREATE POLICY "org_update" ON organizations FOR UPDATE
  USING (id = auth.organization_id() AND auth.has_permission('organization:update'));

-- Roles policies
CREATE POLICY "roles_select" ON roles FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.has_permission('role:list:read'));

CREATE POLICY "roles_insert" ON roles FOR INSERT
  WITH CHECK (organization_id = auth.organization_id() AND auth.has_permission('role:create'));

CREATE POLICY "roles_update" ON roles FOR UPDATE
  USING (organization_id = auth.organization_id() AND auth.has_permission('role:update'));

CREATE POLICY "roles_delete" ON roles FOR DELETE
  USING (organization_id = auth.organization_id() AND auth.has_permission('role:update'));

-- Users policies
-- Users can always view their own profile
CREATE POLICY "users_select_self" ON users FOR SELECT
  USING (id = auth.uid());

-- Users can view others in their org with permission
CREATE POLICY "users_select_org" ON users FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.has_permission('user:list:read')
    AND id != auth.uid()
  );

-- Users can update their own profile
CREATE POLICY "users_update_self" ON users FOR UPDATE
  USING (id = auth.uid());

-- Users with permission can update others in org
CREATE POLICY "users_update_org" ON users FOR UPDATE
  USING (
    organization_id = auth.organization_id()
    AND auth.has_permission('user:update')
    AND id != auth.uid()
  );

-- Users with permission can insert new users in org
CREATE POLICY "users_insert" ON users FOR INSERT
  WITH CHECK (organization_id = auth.organization_id() AND auth.has_permission('user:create'));

-- Audit logs policies
CREATE POLICY "audit_select" ON audit_logs FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.has_permission('audit:list:read'));

CREATE POLICY "audit_insert" ON audit_logs FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

-- Service role bypass for backend operations
CREATE POLICY "service_org" ON organizations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_roles" ON roles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_users" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_audit" ON audit_logs FOR ALL USING (auth.role() = 'service_role');
