/*
  # Create user profiles and teams tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `name` (text)
      - `phone` (text)
      - `company` (text)
      - `plan_type` (text) - FREE, PESSOA_FISICA, CORPORATIVO, CONSULTORIA, DIVIDEND_PORTFOLIO
      - `is_active` (boolean)
      - `is_admin` (boolean)
      - `created_at` (timestamptz)
      - `last_login_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text) - Nome do time
      - `owner_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
    
    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to teams)
      - `user_id` (uuid, foreign key to auth.users)
      - `role` (text) - OWNER, ADMIN, MEMBER
      - `created_at` (timestamptz)
    
    - `team_invites`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to teams)
      - `email` (text) - Email do convidado
      - `role` (text) - ADMIN, MEMBER
      - `invited_by` (uuid, foreign key to auth.users)
      - `status` (text) - PENDING, ACCEPTED, REJECTED
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Team members can view team data based on membership
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  phone text,
  company text,
  plan_type text DEFAULT 'FREE',
  is_active boolean DEFAULT true,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.is_admin = true
    )
  );

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'MEMBER',
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_invites table
CREATE TABLE IF NOT EXISTS team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'MEMBER',
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Enable RLS on teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team"
  ON teams FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can update team"
  ON teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete team"
  ON teams FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Enable RLS on team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
      AND (t.owner_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM team_members tm2
             WHERE tm2.team_id = t.id
             AND tm2.user_id = auth.uid()
           ))
    )
  );

CREATE POLICY "Team owners can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()
    )
  );

-- Enable RLS on team_invites
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team invites"
  ON team_invites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_invites.team_id
      AND (t.owner_id = auth.uid() OR
           EXISTS (
             SELECT 1 FROM team_members tm
             WHERE tm.team_id = t.id
             AND tm.user_id = auth.uid()
           ))
    )
  );

CREATE POLICY "Team owners can insert invites"
  ON team_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_invites.team_id
      AND t.owner_id = auth.uid()
    ) AND auth.uid() = invited_by
  );

CREATE POLICY "Team owners can update invites"
  ON team_invites FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_invites.team_id
      AND t.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_invites.team_id
      AND t.owner_id = auth.uid()
    )
  );

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_type ON user_profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);