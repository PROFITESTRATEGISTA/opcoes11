/*
  # Criação das tabelas para estruturas de opções

  1. Novas Tabelas
    - `structures`
      - `id` (uuid, primary key)
      - `nome` (text, nome da estrutura)
      - `ativo` (text, ativo base opcional)
      - `legs` (jsonb, array das pernas da estrutura)
      - `premio_liquido` (numeric, prêmio líquido calculado)
      - `custo_montagem` (numeric, custo de montagem)
      - `data_vencimento` (date, data de vencimento)
      - `status` (text, status da estrutura)
      - `data_ativacao` (date, data de ativação)
      - `data_finalizacao` (date, data de finalização)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `operations`
      - `id` (uuid, primary key)
      - `structure_id` (uuid, foreign key)
      - `tipo` (text, tipo da operação)
      - `ativo` (text, código do ativo)
      - `pm` (numeric, preço médio)
      - `strike` (numeric, strike da opção)
      - `quantidade` (integer, quantidade)
      - `premio` (numeric, prêmio)
      - `taxa_coleta` (numeric, taxa/coleta)
      - `alta` (numeric, preço de alta)
      - `recompensa` (numeric, recompensa)
      - `data_entrada` (date, data de entrada)
      - `data_saida` (date, data de saída)
      - `status` (text, status da operação)
      - `resultado` (numeric, resultado da operação)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Enable RLS em ambas as tabelas
    - Políticas para usuários autenticados
*/

-- Criar tabela de estruturas
CREATE TABLE IF NOT EXISTS structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo text,
  legs jsonb NOT NULL DEFAULT '[]'::jsonb,
  premio_liquido numeric NOT NULL DEFAULT 0,
  custo_montagem numeric NOT NULL DEFAULT 0,
  data_vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'MONTANDO' CHECK (status IN ('MONTANDO', 'ATIVA', 'FINALIZADA')),
  data_ativacao date,
  data_finalizacao date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de operações
CREATE TABLE IF NOT EXISTS operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid NOT NULL REFERENCES structures(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  ativo text NOT NULL,
  pm numeric NOT NULL,
  strike numeric,
  quantidade integer NOT NULL,
  premio numeric NOT NULL DEFAULT 0,
  taxa_coleta numeric NOT NULL DEFAULT 0,
  alta numeric NOT NULL DEFAULT 0,
  recompensa numeric NOT NULL DEFAULT 0,
  data_entrada date NOT NULL,
  data_saida date,
  status text NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Fechada', 'Vencida')),
  resultado numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

-- Políticas para structures
CREATE POLICY "Users can read all structures"
  ON structures
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert structures"
  ON structures
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update structures"
  ON structures
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete structures"
  ON structures
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para operations
CREATE POLICY "Users can read all operations"
  ON operations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert operations"
  ON operations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update operations"
  ON operations
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete operations"
  ON operations
  FOR DELETE
  TO authenticated
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_structures_status ON structures(status);
CREATE INDEX IF NOT EXISTS idx_structures_data_vencimento ON structures(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_operations_structure_id ON operations(structure_id);
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);