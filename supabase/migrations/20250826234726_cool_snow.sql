/*
  # Add missing user_id column to structures table

  1. Changes
    - Add user_id column to structures table
    - Set up foreign key relationship to auth.users
    - Add index for performance
    - Update existing rows to have a valid user_id (if any exist)

  2. Security
    - Column allows NULL initially to handle existing data
    - Foreign key constraint ensures data integrity
*/

-- Add user_id column to structures table
ALTER TABLE structures ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_structures_user_id ON structures(user_id);

-- Update any existing rows to have the current user's ID (if logged in)
-- This is a fallback for existing data - in production you might want to handle this differently
UPDATE structures 
SET user_id = auth.uid() 
WHERE user_id IS NULL AND auth.uid() IS NOT NULL;