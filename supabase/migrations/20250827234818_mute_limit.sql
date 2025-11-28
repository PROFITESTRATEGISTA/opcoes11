/*
  # Sistema de Fluxo de Caixa e Custódia

  1. New Tables
    - `cash_flow_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `type` (text)
      - `description` (text)
      - `amount` (numeric)
      - `balance` (numeric)
      - `related_structure_id` (uuid, optional)
      - `related_roll_id` (uuid, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `assets_custody`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `symbol` (text)
      - `name` (text)
      - `quantity` (integer)
      - `average_price` (numeric)
      - `market_price` (numeric)
      - `guarantee_released` (numeric)
      - `used_as_guarantee` (boolean)
      - `type` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Cash Flow Entries Table
CREATE TABLE IF NOT EXISTS cash_flow_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'STRUCTURE_COST', 'STRUCTURE_PREMIUM', 'ROLL_COST', 'EXERCISE_COST', 'BROKERAGE', 'TAX', 'PROFIT')),
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  balance numeric NOT NULL DEFAULT 0,
  related_structure_id uuid,
  related_roll_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assets Custody Table
CREATE TABLE IF NOT EXISTS assets_custody (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  average_price numeric NOT NULL DEFAULT 0,
  market_price numeric NOT NULL DEFAULT 0,
  guarantee_released numeric NOT NULL DEFAULT 70,
  used_as_guarantee boolean NOT NULL DEFAULT true,
  type text NOT NULL CHECK (type IN ('STOCK', 'LFT')) DEFAULT 'STOCK',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cash_flow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets_custody ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cash_flow_entries
CREATE POLICY "Users can read own cash flow entries"
  ON cash_flow_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cash flow entries"
  ON cash_flow_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cash flow entries"
  ON cash_flow_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cash flow entries"
  ON cash_flow_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for assets_custody
CREATE POLICY "Users can read own assets"
  ON assets_custody
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON assets_custody
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON assets_custody
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets_custody
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cash_flow_entries_user_id ON cash_flow_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_entries_date ON cash_flow_entries(date);
CREATE INDEX IF NOT EXISTS idx_assets_custody_user_id ON assets_custody(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_custody_symbol ON assets_custody(symbol);