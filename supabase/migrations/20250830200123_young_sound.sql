/*
  # Sistema de Convites de Equipe

  1. New Tables
    - `team_invites`
      - `id` (uuid, primary key)
      - `owner_user_id` (uuid, foreign key to auth.users)
      - `invited_email` (text, email do convidado)
      - `invited_user_id` (uuid, foreign key to auth.users, nullable)
      - `status` (text, PENDING/ACCEPTED/REJECTED/CANCELLED)
      - `permissions` (jsonb, permissões do colaborador)
      - `invited_at` (timestamp)
      - `responded_at` (timestamp, nullable)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `team_members`
      - `id` (uuid, primary key)
      - `owner_user_id` (uuid, foreign key to auth.users)
      - `member_user_id` (uuid, foreign key to auth.users)
      - `permissions` (jsonb, permissões do membro)
      - `joined_at` (timestamp)
      - `last_active_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Policies for team management
    - Isolation between different teams
*/

-- Team Invites Table
CREATE TABLE IF NOT EXISTS team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
  permissions jsonb NOT NULL DEFAULT '{
    "canCreateStructures": true,
    "canEditStructures": true,
    "canExecuteRolls": true,
    "canViewReports": true,
    "canManageTreasury": false
  }'::jsonb,
  invited_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions jsonb NOT NULL DEFAULT '{
    "canCreateStructures": true,
    "canEditStructures": true,
    "canExecuteRolls": true,
    "canViewReports": true,
    "canManageTreasury": false
  }'::jsonb,
  joined_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(owner_user_id, member_user_id)
);

-- Enable RLS
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team_invites
CREATE POLICY "Users can read invites they sent or received"
  ON team_invites
  FOR SELECT
  TO authenticated
  USING (
    owner_user_id = auth.uid() OR 
    invited_user_id = auth.uid() OR 
    invited_email = auth.email()
  );

CREATE POLICY "Users can create invites for their team"
  ON team_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update invites they sent or received"
  ON team_invites
  FOR UPDATE
  TO authenticated
  USING (
    owner_user_id = auth.uid() OR 
    invited_user_id = auth.uid() OR 
    invited_email = auth.email()
  );

CREATE POLICY "Users can delete invites they sent"
  ON team_invites
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Policies for team_members
CREATE POLICY "Users can read their team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    owner_user_id = auth.uid() OR 
    member_user_id = auth.uid()
  );

CREATE POLICY "Team owners can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_invites_owner_user_id ON team_invites(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_invited_email ON team_invites(invited_email);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_members_owner_user_id ON team_members(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member_user_id ON team_members(member_user_id);

-- Function to automatically accept invite when user signs up
CREATE OR REPLACE FUNCTION handle_invite_on_signup()
RETURNS trigger AS $$
BEGIN
  -- Update pending invites for this email
  UPDATE team_invites 
  SET 
    invited_user_id = NEW.id,
    updated_at = now()
  WHERE 
    invited_email = NEW.email 
    AND status = 'PENDING' 
    AND invited_user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle invite acceptance on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_handle_invites ON auth.users;
CREATE TRIGGER on_auth_user_created_handle_invites
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invite_on_signup();