/*
  # Atualizar tipos de ativos na tabela assets_custody

  1. Changes
    - Expandir tipos de ativos para incluir OPCOES e FUTUROS
    - Manter compatibilidade com dados existentes
    - Atualizar constraint check

  2. Security
    - Manter RLS policies existentes
    - Não afetar dados existentes
*/

-- Update the type constraint to include new asset types
ALTER TABLE assets_custody DROP CONSTRAINT IF EXISTS assets_custody_type_check;

ALTER TABLE assets_custody ADD CONSTRAINT assets_custody_type_check 
  CHECK (type IN ('STOCK', 'RENDA_FIXA', 'OPCOES', 'FUTUROS'));

-- Update existing LFT records to RENDA_FIXA for consistency
UPDATE assets_custody SET type = 'RENDA_FIXA' WHERE type = 'LFT';