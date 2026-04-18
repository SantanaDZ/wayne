-- Wayne Industries Database Schema
-- Script 003 v3: Corrigir Identidades sem deletar usuários (Evita erro de FK)

DO $$
DECLARE
    row_user RECORD;
BEGIN
    -- Para cada usuário que criamos anteriormente
    FOR row_user IN (
        SELECT id, email FROM auth.users 
        WHERE email IN ('bruce@wayne.com', 'lucius@wayne.com', 'harold@wayne.com')
    ) LOOP
        -- Tenta inserir a identidade apenas se ela não existir
        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
            row_user.id, 
            row_user.id, 
            format('{"sub":"%s","email":"%s"}', row_user.id, row_user.email)::jsonb, 
            'email', 
            now(), 
            now(), 
            now()
        )
        ON CONFLICT (provider, id) DO NOTHING; -- Evita erro se já existir por algum motivo
        
        -- Garante que o aud e role estejam corretos (essencial para evitar o erro 500)
        UPDATE auth.users 
        SET aud = 'authenticated', role = 'authenticated'
        WHERE id = row_user.id;
        
    END LOOP;
END $$;
