-- Wayne Industries
-- Script: Apagar TODOS os usuários e dados vinculados (reset completo)
-- Execute no SQL Editor do Supabase

-- 1. Remove dados que dependem de profiles
DELETE FROM public.area_access;
DELETE FROM public.activity_logs;
DELETE FROM public.security_devices;
DELETE FROM public.vehicles;
DELETE FROM public.equipment;
DELETE FROM public.restricted_areas;

-- 2. Remove profiles (dependem de auth.users)
DELETE FROM public.profiles;

-- 3. Remove identidades de autenticação
DELETE FROM auth.identities;

-- 4. Remove sessões e tokens ativos
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;
DELETE FROM auth.mfa_factors;

-- 5. Por último, remove os usuários
DELETE FROM auth.users;

-- Verificação: deve retornar 0 linhas
SELECT COUNT(*) as total_usuarios FROM auth.users;
