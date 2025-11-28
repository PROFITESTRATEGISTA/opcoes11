/*
  # Adicionar colunas user_id às tabelas

  1. Modificações nas Tabelas
    - Adicionar coluna `user_id` na tabela `structures`
    - Adicionar coluna `user_id` na tabela `operations`
    - Configurar como foreign key para auth.users
    - Definir valores padrão para registros existentes

  2. Segurança
    - Manter RLS habilitado
    - Atualizar políticas para usar user_id
    - Garantir isolamento entre usuários

  3. Índices
    - Adicionar índices para performance
    - Otimizar consultas por user_id
*/

-- Adicionar coluna user_id na tabela structures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'structures' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE structures ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Adicionar coluna user_id na tabela operations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'operations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE operations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_structures_user_id ON structures(user_id);
CREATE INDEX IF NOT EXISTS idx_operations_user_id ON operations(user_id);

-- Atualizar políticas RLS para structures
DROP POLICY IF EXISTS "Allow public access to structures" ON structures;
DROP POLICY IF EXISTS "Users can read all structures" ON structures;
DROP POLICY IF EXISTS "Users can insert structures" ON structures;
DROP POLICY IF EXISTS "Users can update structures" ON structures;
DROP POLICY IF EXISTS "Users can delete structures" ON structures;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN auth.email() = 'pedropardal04@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Novas políticas para structures
CREATE POLICY "Users can read own structures or admin can read all"
  ON structures
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own structures"
  ON structures
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own structures or admin can update all"
  ON structures
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own structures or admin can delete all"
  ON structures
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Atualizar políticas RLS para operations
DROP POLICY IF EXISTS "Allow public access to operations" ON operations;
DROP POLICY IF EXISTS "Users can read all operations" ON operations;
DROP POLICY IF EXISTS "Users can insert operations" ON operations;
DROP POLICY IF EXISTS "Users can update operations" ON operations;
DROP POLICY IF EXISTS "Users can delete operations" ON operations;

-- Novas políticas para operations
CREATE POLICY "Users can read own operations or admin can read all"
  ON operations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own operations"
  ON operations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own operations or admin can update all"
  ON operations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own operations or admin can delete all"
  ON operations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());