export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          domain: string;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          domain: string;
          status?: 'active' | 'inactive' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          domain?: string;
          status?: 'active' | 'inactive' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          permissions: string[];
          organization_id: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          permissions?: string[];
          organization_id: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          permissions?: string[];
          organization_id?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          organization_id: string;
          role_id: string | null;
          status: 'invited' | 'active' | 'inactive' | 'blocked';
          is_active: boolean;
          onboarded: boolean;
          invite_token: string | null;
          invite_expires: string | null;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          organization_id: string;
          role_id?: string | null;
          status?: 'invited' | 'active' | 'inactive' | 'blocked';
          is_active?: boolean;
          onboarded?: boolean;
          invite_token?: string | null;
          invite_expires?: string | null;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          organization_id?: string;
          role_id?: string | null;
          status?: 'invited' | 'active' | 'inactive' | 'blocked';
          is_active?: boolean;
          onboarded?: boolean;
          invite_token?: string | null;
          invite_expires?: string | null;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_id: string | null;
          method: string;
          path: string;
          action: string;
          status_code: number;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          duration: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          actor_id?: string | null;
          method: string;
          path: string;
          action: string;
          status_code: number;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          actor_id?: string | null;
          method?: string;
          path?: string;
          action?: string;
          status_code?: number;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_status: 'invited' | 'active' | 'inactive' | 'blocked';
      organization_status: 'active' | 'inactive' | 'suspended';
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
