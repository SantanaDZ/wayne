-- Wayne Industries
-- Script: Confirmar email dos usuários criados pelo Dashboard
-- Rode isto se os usuários foram criados sem confirmação de email

UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email IN ('bruce@wayne.com', 'lucius@wayne.com', 'harold@wayne.com');

-- Verificação: deve mostrar email_confirmed_at preenchido para todos
SELECT email, email_confirmed_at, created_at
FROM auth.users
WHERE email IN ('bruce@wayne.com', 'lucius@wayne.com', 'harold@wayne.com');
