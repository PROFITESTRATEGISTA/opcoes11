/*
  # Fix Complete Database Schema

  1. New Tables
    - `users` table for user profiles
    - Fix existing tables with proper constraints
    - Add missing indexes and relationships

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for all operations
    - Add helper functions for admin access

  3. Functions
    - `is_admin()` function to check admin privileges
    - `email()` function to get current user email
    - Trigger function for handling invites on signup

  4. Fixes
    - Ensure all foreign keys are properly set
    - Add missing constraints and indexes
    - Fix any schema inconsistencies
*/

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  company text,
  plan jsonb DEFAULT '{"type": "FREE", "name": "Sem Acesso", "price": 0, "features": ["Sem acesso ao produto"], "maxStructures": 0, "maxUsers": 1, "hasAdvancedAnalytics": false, "hasSharedAccess": false, "hasAdminControls": false}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'pedropardal04@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION email()
RETURNS text AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can read own profile or admin can read all"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own profile or admin can update all"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Fix existing tables constraints and add missing ones

-- Ensure cash_flow_entries has proper foreign key to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'cash_flow_entries' AND constraint_name = 'cash_flow_entries_user_id_fkey'
  ) THEN
    ALTER TABLE cash_flow_entries ADD CONSTRAINT cash_flow_entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure assets_custody has proper foreign key to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'assets_custody' AND constraint_name = 'assets_custody_user_id_fkey'
  ) THEN
    ALTER TABLE assets_custody ADD CONSTRAINT assets_custody_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix team_invites foreign keys to use auth.users
DO $$
BEGIN
  -- Drop existing foreign keys if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'team_invites' AND constraint_name = 'team_invites_owner_user_id_fkey'
  ) THEN
    ALTER TABLE team_invites DROP CONSTRAINT team_invites_owner_user_id_fkey;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'team_invites' AND constraint_name = 'team_invites_invited_user_id_fkey'
  ) THEN
    ALTER TABLE team_invites DROP CONSTRAINT team_invites_invited_user_id_fkey;
  END IF;
  
  -- Add correct foreign keys
  ALTER TABLE team_invites ADD CONSTRAINT team_invites_owner_user_id_fkey 
  FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  ALTER TABLE team_invites ADD CONSTRAINT team_invites_invited_user_id_fkey 
  FOREIGN KEY (invited_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
END $$;

-- Fix team_members foreign keys to use auth.users
DO $$
BEGIN
  -- Drop existing foreign keys if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'team_members' AND constraint_name = 'team_members_owner_user_id_fkey'
  ) THEN
    ALTER TABLE team_members DROP CONSTRAINT team_members_owner_user_id_fkey;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'team_members' AND constraint_name = 'team_members_member_user_id_fkey'
  ) THEN
    ALTER TABLE team_members DROP CONSTRAINT team_members_member_user_id_fkey;
  END IF;
  
  -- Add correct foreign keys
  ALTER TABLE team_members ADD CONSTRAINT team_members_owner_user_id_fkey 
  FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  ALTER TABLE team_members ADD CONSTRAINT team_members_member_user_id_fkey 
  FOREIGN KEY (member_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Update team_invites policies to work with auth.users
DROP POLICY IF EXISTS "Users can create invites for their team" ON team_invites;
DROP POLICY IF EXISTS "Users can read invites they sent or received" ON team_invites;
DROP POLICY IF EXISTS "Users can update invites they sent or received" ON team_invites;
DROP POLICY IF EXISTS "Users can delete invites they sent" ON team_invites;

CREATE POLICY "Users can create invites for their team"
  ON team_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can read invites they sent or received"
  ON team_invites
  FOR SELECT
  TO authenticated
  USING (
    owner_user_id = auth.uid() OR 
    invited_user_id = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update invites they sent or received"
  ON team_invites
  FOR UPDATE
  TO authenticated
  USING (
    owner_user_id = auth.uid() OR 
    invited_user_id = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    owner_user_id = auth.uid() OR 
    invited_user_id = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete invites they sent"
  ON team_invites
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Update team_members policies to work with auth.users
DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;
DROP POLICY IF EXISTS "Users can read their team members" ON team_members;

CREATE POLICY "Team owners can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can read their team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid() OR member_user_id = auth.uid());

-- Create trigger function for handling invites on signup
CREATE OR REPLACE FUNCTION handle_invite_on_signup()
RETURNS trigger AS $$
BEGIN
  -- Check if there's a pending invite for this email
  UPDATE team_invites 
  SET 
    invited_user_id = NEW.id,
    updated_at = now()
  WHERE 
    invited_email = NEW.email 
    AND status = 'PENDING' 
    AND expires_at > now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for invite handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invite_on_signup();

-- Insert admin user profile if not exists
INSERT INTO users (id, email, name, plan)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email),
  '{"type": "ADMIN", "name": "Administrador", "price": 0, "features": ["Acesso irrestrito", "Painel administrativo", "Gestão de usuários"], "maxStructures": -1, "maxUsers": -1, "hasAdvancedAnalytics": true, "hasSharedAccess": true, "hasAdminControls": true}'::jsonb
FROM auth.users 
WHERE email = 'pedropardal04@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  plan = '{"type": "ADMIN", "name": "Administrador", "price": 0, "features": ["Acesso irrestrito", "Painel administrativo", "Gestão de usuários"], "maxStructures": -1, "maxUsers": -1, "hasAdvancedAnalytics": true, "hasSharedAccess": true, "hasAdminControls": true}'::jsonb,
  updated_at = now();

-- Ensure all existing tables have proper RLS enabled
ALTER TABLE structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets_custody ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_invited_email ON team_invites(invited_email);
CREATE INDEX IF NOT EXISTS idx_team_invites_owner_user_id ON team_invites(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_members_owner_user_id ON team_members(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member_user_id ON team_members(member_user_id);