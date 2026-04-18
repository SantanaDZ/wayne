-- Wayne Industries
-- Script pós-criação de usuários pelo Dashboard do Supabase
-- Execute DEPOIS de criar os 3 usuários manualmente pelo painel

-- 1. Define os cargos e departamentos nos perfis
UPDATE public.profiles
SET role = 'admin', department = 'Board of Directors', full_name = 'Bruce Wayne'
WHERE id = (SELECT id FROM auth.users WHERE email = 'bruce@wayne.com');

UPDATE public.profiles
SET role = 'manager', department = 'Applied Sciences', full_name = 'Lucius Fox'
WHERE id = (SELECT id FROM auth.users WHERE email = 'lucius@wayne.com');

UPDATE public.profiles
SET role = 'employee', department = 'Operations', full_name = 'Harold Allnut'
WHERE id = (SELECT id FROM auth.users WHERE email = 'harold@wayne.com');

-- 2. Verifica resultado
SELECT u.email, p.full_name, p.role, p.department
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email IN ('bruce@wayne.com', 'lucius@wayne.com', 'harold@wayne.com');
