/*
  # Fix user signup trigger

  1. Functions
    - Create function to handle new user signup
    - Automatically insert user profile when auth user is created
  
  2. Triggers
    - Trigger on auth.users insert
    - Create corresponding profile in public.users
  
  3. Security
    - Maintain RLS policies
    - Ensure data consistency
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, plan, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(
      NEW.raw_user_meta_data->>'plan',
      jsonb_build_object(
        'id', 'free',
        'type', 'FREE',
        'name', 'Sem Acesso',
        'price', 0,
        'features', jsonb_build_array('Sem acesso ao produto', 'Apenas visualização de preços'),
        'maxUsers', 1,
        'maxStructures', 0,
        'hasSharedAccess', false,
        'hasAdminControls', false,
        'hasAdvancedAnalytics', false
      )
    ),
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;