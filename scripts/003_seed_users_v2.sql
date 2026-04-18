-- Wayne Industries Database Schema
-- Script 003 v4: Reset de campos críticos de autenticação (sem deletar usuários)

-- Passo 1: Atualiza campos obrigatórios dos usuários existentes
UPDATE auth.users
SET 
    encrypted_password = extensions.crypt('wayne123', extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmation_sent_at = COALESCE(confirmation_sent_at, now()),
    aud = 'authenticated',
    role = 'authenticated',
    is_sso_user = false,
    banned_until = NULL,
    deleted_at = NULL,
    updated_at = now()
WHERE email IN ('bruce@wayne.com', 'lucius@wayne.com', 'harold@wayne.com');

-- Passo 2: Garante que as identidades existam (com provider_id)
DO $$
DECLARE
    v_user RECORD;
BEGIN
    FOR v_user IN (
        SELECT id, email 
        FROM auth.users 
        WHERE email IN ('bruce@wayne.com', 'lucius@wayne.com', 'harold@wayne.com')
    ) LOOP
        -- Remove identidade antiga corrompida (se existir) e recria
        DELETE FROM auth.identities 
        WHERE user_id = v_user.id AND provider = 'email';

        INSERT INTO auth.identities (
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        )
        VALUES (
            v_user.email,
            v_user.id,
            jsonb_build_object('sub', v_user.id::text, 'email', v_user.email),
            'email',
            now(),
            now(),
            now()
        );
    END LOOP;
END $$;
