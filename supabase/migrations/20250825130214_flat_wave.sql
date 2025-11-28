/*
  # Create structures and operations tables with proper RLS policies

  1. New Tables
    - `structures`
      - `id` (uuid, primary key)
      - `nome` (text, required)
      - `ativo` (text, optional)
      - `legs` (jsonb array, default empty)
      - `premio_liquido` (numeric, default 0)
      - `custo_montagem` (numeric, default 0)
      - `data_vencimento` (date, required)
      - `status` (text, default 'MONTANDO')
      - `data_ativacao` (date, optional)
      - `data_finalizacao` (date, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `operations`
      - `id` (uuid, primary key)
      - `structure_id` (uuid, foreign key)
      - `tipo` (text, required)
      - `ativo` (text, required)
      - `pm` (numeric, required)
      - `strike` (numeric, optional)
      - `quantidade` (integer, required)
      - `premio` (numeric, default 0)
      - `taxa_coleta` (numeric, default 0)
      - `alta` (numeric, default 0)
      - `recompensa` (numeric, default 0)
      - `data_entrada` (date, required)
      - `data_saida` (date, optional)
      - `status` (text, default 'Aberta')
      - `resultado` (numeric, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add permissive policies for all operations (development mode)
    - Allow public access for CRUD operations
*/

-- Create structures table
CREATE TABLE IF NOT EXISTS structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo text,
  legs jsonb DEFAULT '[]'::jsonb NOT NULL,
  premio_liquido numeric DEFAULT 0 NOT NULL,
  custo_montagem numeric DEFAULT 0 NOT NULL,
  data_vencimento date NOT NULL,
  status text DEFAULT 'MONTANDO'::text NOT NULL,
  data_ativacao date,
  data_finalizacao date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT structures_status_check CHECK (status = ANY (ARRAY['MONTANDO'::text, 'ATIVA'::text, 'FINALIZADA'::text]))
);

-- Create operations table
CREATE TABLE IF NOT EXISTS operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid NOT NULL REFERENCES structures(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  ativo text NOT NULL,
  pm numeric NOT NULL,
  strike numeric,
  quantidade integer NOT NULL,
  premio numeric DEFAULT 0 NOT NULL,
  taxa_coleta numeric DEFAULT 0 NOT NULL,
  alta numeric DEFAULT 0 NOT NULL,
  recompensa numeric DEFAULT 0 NOT NULL,
  data_entrada date NOT NULL,
  data_saida date,
  status text DEFAULT 'Aberta'::text NOT NULL,
  resultado numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT operations_status_check CHECK (status = ANY (ARRAY['Aberta'::text, 'Fechada'::text, 'Vencida'::text]))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_structures_status ON structures USING btree (status);
CREATE INDEX IF NOT EXISTS idx_structures_data_vencimento ON structures USING btree (data_vencimento);
CREATE INDEX IF NOT EXISTS idx_operations_structure_id ON operations USING btree (structure_id);
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations USING btree (status);

-- Enable Row Level Security
ALTER TABLE structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public access to structures" ON structures;
DROP POLICY IF EXISTS "Allow public access to operations" ON operations;

-- Create permissive policies for development (allows all operations for everyone)
CREATE POLICY "Allow public access to structures"
  ON structures
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to operations"
  ON operations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);