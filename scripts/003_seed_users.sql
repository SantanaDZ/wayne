-- Wayne Industries Database Schema
-- Script 003: Criar usuários mockados (Admin, Manager, Employee) direto na base de dados (ignora confirmação de email).
-- Copie este conteúdo e rode no painel SQL Editor do Supabase.

-- Obs: A senha padrão para todos será "wayne123"

DO $$
DECLARE
    admin_uid UUID := gen_random_uuid();
    manager_uid UUID := gen_random_uuid();
    employee_uid UUID := gen_random_uuid();
BEGIN
    -- ==========================================
    -- 1. BRUCE WAYNE (ADMIN)
    -- ==========================================
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        admin_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
        'bruce@wayne.com', crypt('wayne123', gen_salt('bf')), now(), 
        '{"provider":"email","providers":["email"]}', '{"full_name":"Bruce Wayne","role":"admin","department":"Board of Directors"}', 
        now(), now()
    );

    -- ==========================================
    -- 2. LUCIUS FOX (MANAGER)
    -- ==========================================
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        manager_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
        'lucius@wayne.com', crypt('wayne123', gen_salt('bf')), now(), 
        '{"provider":"email","providers":["email"]}', '{"full_name":"Lucius Fox","role":"manager","department":"Applied Sciences"}', 
        now(), now()
    );

    -- ==========================================
    -- 3. HAROLD ALLNUT (EMPLOYEE)
    -- ==========================================
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        employee_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
        'harold@wayne.com', crypt('wayne123', gen_salt('bf')), now(), 
        '{"provider":"email","providers":["email"]}', '{"full_name":"Harold" "Allnut","role":"employee","department":"Operations"}', 
        now(), now()
    );

END $$;
