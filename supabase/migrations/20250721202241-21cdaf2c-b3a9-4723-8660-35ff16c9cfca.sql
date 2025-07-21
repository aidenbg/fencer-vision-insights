-- Remove the profiles table as it's unnecessary
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop the handle_new_user function since it references profiles
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;