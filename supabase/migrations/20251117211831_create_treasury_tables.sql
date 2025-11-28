/*
  # Create treasury tables

  1. New Tables
    - `assets_custody`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `symbol` (text) - Símbolo do ativo
      - `name` (text) - Nome do ativo
      - `quantity` (numeric) - Quantidade
      - `average_price` (numeric) - Preço médio
      - `market_price` (numeric) - Preço de mercado
      - `guarantee_released` (numeric) - % de garantia liberada
      - `used_as_guarantee` (boolean) - Usado como garantia
      - `type` (text) - STOCK, RENDA_FIXA, OPCOES, FUTUROS
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cash_flow_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date) - Data do lançamento
      - `type` (text) - DEPOSIT, WITHDRAWAL, STRUCTURE_COST, STRUCTURE_PREMIUM, ROLL_COST, EXERCISE_COST, BROKERAGE, TAX, PROFIT
      - `description` (text) - Descrição
      - `amount` (numeric) - Valor
      - `balance` (numeric) - Saldo após lançamento
      - `related_structure_id` (uuid) - ID da estrutura relacionada
      - `related_roll_id` (uuid) - ID da rolagem relacionada
      - `created_at` (timestamptz)
    
    - `guarantee_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date) - Data do lançamento
      - `type` (text) - DEPOSIT, WITHDRAWAL
      - `description` (text) - Descrição
      - `amount` (numeric) - Valor
      - `balance` (numeric) - Saldo após lançamento
      - `created_at` (timestamptz)
    
    - `future_settlements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date) - Data de liquidação
      - `type` (text) - STOCK_SETTLEMENT, FUTURES_SETTLEMENT, FIXED_INCOME_SETTLEMENT
      - `description` (text) - Descrição
      - `amount` (numeric) - Valor
      - `asset_symbol` (text) - Símbolo do ativo
      - `settlement_days` (integer) - Dias para liquidação
      - `trade_date` (date) - Data da operação
      - `status` (text) - PENDING, EXECUTED, CANCELLED
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create assets_custody table
CREATE TABLE IF NOT EXISTS assets_custody (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL,
  quantity numeric DEFAULT 0,
  average_price numeric DEFAULT 0,
  market_price numeric DEFAULT 0,
  guarantee_released numeric DEFAULT 0,
  used_as_guarantee boolean DEFAULT false,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assets_custody ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets"
  ON assets_custody FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON assets_custody FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON assets_custody FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON assets_custody FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create cash_flow_entries table
CREATE TABLE IF NOT EXISTS cash_flow_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  amount numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  related_structure_id uuid REFERENCES option_structures(id) ON DELETE SET NULL,
  related_roll_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cash_flow_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cash flow"
  ON cash_flow_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cash flow"
  ON cash_flow_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cash flow"
  ON cash_flow_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cash flow"
  ON cash_flow_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create guarantee_entries table
CREATE TABLE IF NOT EXISTS guarantee_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  amount numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guarantee_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guarantee entries"
  ON guarantee_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guarantee entries"
  ON guarantee_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guarantee entries"
  ON guarantee_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own guarantee entries"
  ON guarantee_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create future_settlements table
CREATE TABLE IF NOT EXISTS future_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  amount numeric DEFAULT 0,
  asset_symbol text NOT NULL,
  settlement_days integer DEFAULT 0,
  trade_date date NOT NULL,
  status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE future_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settlements"
  ON future_settlements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settlements"
  ON future_settlements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settlements"
  ON future_settlements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settlements"
  ON future_settlements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_custody_user_id ON assets_custody(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_custody_type ON assets_custody(type);
CREATE INDEX IF NOT EXISTS idx_cash_flow_entries_user_id ON cash_flow_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_entries_date ON cash_flow_entries(date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_entries_type ON cash_flow_entries(type);
CREATE INDEX IF NOT EXISTS idx_guarantee_entries_user_id ON guarantee_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_future_settlements_user_id ON future_settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_future_settlements_status ON future_settlements(status);