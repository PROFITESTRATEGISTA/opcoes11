/*
  # Create structures and operations tables

  1. New Tables
    - `option_structures`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `nome` (text)
      - `ativo` (text)
      - `premio_liquido` (numeric)
      - `custo_montagem` (numeric)
      - `data_vencimento` (date)
      - `status` (text)
      - `data_ativacao` (date)
      - `data_finalizacao` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `option_legs`
      - `id` (uuid, primary key)
      - `structure_id` (uuid, foreign key to option_structures)
      - `tipo` (text) - CALL, PUT, ACAO, WIN, WDO, BIT
      - `strike` (numeric)
      - `vencimento` (date)
      - `premio` (numeric)
      - `quantidade` (integer)
      - `posicao` (text) - COMPRADA, VENDIDA
      - `ativo` (text)
      - `preco_vista` (numeric)
      - `preco_entrada` (numeric)
      - `custom_margin_percentage` (numeric)
      - `created_at` (timestamptz)
    
    - `trading_operations`
      - `id` (uuid, primary key)
      - `structure_id` (uuid, foreign key to option_structures)
      - `tipo` (text)
      - `ativo` (text)
      - `pm` (numeric) - Preço Médio
      - `strike` (numeric)
      - `quantidade` (integer)
      - `premio` (numeric)
      - `taxa_coleta` (numeric)
      - `custo_exercicio` (numeric)
      - `corretagem` (numeric)
      - `alta` (numeric)
      - `recompensa` (numeric)
      - `data_entrada` (date)
      - `data_saida` (date)
      - `status` (text)
      - `resultado` (numeric)
      - `created_at` (timestamptz)
    
    - `roll_positions`
      - `id` (uuid, primary key)
      - `structure_id` (uuid, foreign key to option_structures)
      - `user_id` (uuid, foreign key to auth.users)
      - `data_roll` (date)
      - `custo_roll` (numeric)
      - `motivo_roll` (text)
      - `status` (text)
      - `lucro_realizado` (numeric)
      - `taxas_adicionais` (numeric)
      - `observacoes` (text)
      - `created_at` (timestamptz)
    
    - `exercise_records`
      - `id` (uuid, primary key)
      - `structure_id` (uuid, foreign key to option_structures)
      - `user_id` (uuid, foreign key to auth.users)
      - `structure_name` (text)
      - `data_exercicio` (date)
      - `custo_total_exercicio` (numeric)
      - `resultado_total_exercicio` (numeric)
      - `observacoes` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create option_structures table
CREATE TABLE IF NOT EXISTS option_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  ativo text,
  premio_liquido numeric DEFAULT 0,
  custo_montagem numeric DEFAULT 0,
  data_vencimento date NOT NULL,
  status text DEFAULT 'MONTANDO',
  data_ativacao date,
  data_finalizacao date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE option_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own structures"
  ON option_structures FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own structures"
  ON option_structures FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own structures"
  ON option_structures FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own structures"
  ON option_structures FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create option_legs table
CREATE TABLE IF NOT EXISTS option_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid REFERENCES option_structures(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL,
  strike numeric DEFAULT 0,
  vencimento date NOT NULL,
  premio numeric DEFAULT 0,
  quantidade integer DEFAULT 0,
  posicao text NOT NULL,
  ativo text NOT NULL,
  preco_vista numeric,
  preco_entrada numeric,
  custom_margin_percentage numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE option_legs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view legs of own structures"
  ON option_legs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = option_legs.structure_id
      AND option_structures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert legs to own structures"
  ON option_legs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = option_legs.structure_id
      AND option_structures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update legs of own structures"
  ON option_legs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = option_legs.structure_id
      AND option_structures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = option_legs.structure_id
      AND option_structures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete legs of own structures"
  ON option_legs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = option_legs.structure_id
      AND option_structures.user_id = auth.uid()
    )
  );

-- Create trading_operations table
CREATE TABLE IF NOT EXISTS trading_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid REFERENCES option_structures(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  ativo text NOT NULL,
  pm numeric DEFAULT 0,
  strike numeric,
  quantidade integer DEFAULT 0,
  premio numeric DEFAULT 0,
  taxa_coleta numeric DEFAULT 0,
  custo_exercicio numeric,
  corretagem numeric,
  alta numeric DEFAULT 0,
  recompensa numeric DEFAULT 0,
  data_entrada date NOT NULL,
  data_saida date,
  status text DEFAULT 'Aberta',
  resultado numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trading_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view operations of own structures"
  ON trading_operations FOR SELECT
  TO authenticated
  USING (
    structure_id IS NULL OR
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = trading_operations.structure_id
      AND option_structures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert operations to own structures"
  ON trading_operations FOR INSERT
  TO authenticated
  WITH CHECK (
    structure_id IS NULL OR
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = trading_operations.structure_id
      AND option_structures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update operations of own structures"
  ON trading_operations FOR UPDATE
  TO authenticated
  USING (
    structure_id IS NULL OR
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = trading_operations.structure_id
      AND option_structures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    structure_id IS NULL OR
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = trading_operations.structure_id
      AND option_structures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete operations of own structures"
  ON trading_operations FOR DELETE
  TO authenticated
  USING (
    structure_id IS NULL OR
    EXISTS (
      SELECT 1 FROM option_structures
      WHERE option_structures.id = trading_operations.structure_id
      AND option_structures.user_id = auth.uid()
    )
  );

-- Create roll_positions table
CREATE TABLE IF NOT EXISTS roll_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid REFERENCES option_structures(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_roll date NOT NULL,
  custo_roll numeric DEFAULT 0,
  motivo_roll text,
  status text DEFAULT 'PENDENTE',
  lucro_realizado numeric,
  taxas_adicionais numeric,
  observacoes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roll_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rolls"
  ON roll_positions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rolls"
  ON roll_positions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rolls"
  ON roll_positions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rolls"
  ON roll_positions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create exercise_records table
CREATE TABLE IF NOT EXISTS exercise_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid REFERENCES option_structures(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  structure_name text NOT NULL,
  data_exercicio date NOT NULL,
  custo_total_exercicio numeric DEFAULT 0,
  resultado_total_exercicio numeric DEFAULT 0,
  observacoes text,
  status text DEFAULT 'EXECUTADO',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exercise_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercises"
  ON exercise_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises"
  ON exercise_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
  ON exercise_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON exercise_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_option_structures_user_id ON option_structures(user_id);
CREATE INDEX IF NOT EXISTS idx_option_structures_status ON option_structures(status);
CREATE INDEX IF NOT EXISTS idx_option_legs_structure_id ON option_legs(structure_id);
CREATE INDEX IF NOT EXISTS idx_trading_operations_structure_id ON trading_operations(structure_id);
CREATE INDEX IF NOT EXISTS idx_roll_positions_user_id ON roll_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_roll_positions_structure_id ON roll_positions(structure_id);
CREATE INDEX IF NOT EXISTS idx_exercise_records_user_id ON exercise_records(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_records_structure_id ON exercise_records(structure_id);