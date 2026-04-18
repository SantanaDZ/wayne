-- Wayne Industries Database Schema
-- Script 005: Seed equipments with images

DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Obter o ID do Bruce Wayne (Admin) para marcar como criador
    SELECT id INTO admin_id FROM auth.users WHERE email = 'bruce@wayne.com' LIMIT 1;

    -- Se não encontrar o Bruce (caso o script 003 não tenha sido rodado), tenta pegar qualquer admin
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
    END IF;

    -- Se ainda for nulo, apenas ignora ou usa um UUID fixo (não recomendado)
    IF admin_id IS NOT NULL THEN
        -- 1. Drone de reconhecimento stealth
        INSERT INTO public.equipment (id, name, description, category, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Drone de Reconhecimento Stealth',
            'Compacto, asas retráteis, sensores e câmeras avançadas para vigilância silenciosa.',
            'security',
            'available',
            'WT-DRN-001',
            'Batcaverna - Hangar',
            admin_id,
            '/equipamentos/drone.png'
        );

        -- 2. Óculos táticos de visão aumentada (AR/IR)
        INSERT INTO public.equipment (id, name, description, category, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Óculos Táticos de Visão Aumentada (AR/IR)',
            'HUD futurista, análise em tempo real, estilo militar com suporte a infravermelho.',
            'tech',
            'available',
            'WT-GGL-042',
            'Arsenal - Setor A',
            admin_id,
            '/equipamentos/oculos.png'
        );

        -- 3. Pulseira multifuncional hacker
        INSERT INTO public.equipment (id, name, description, category, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Pulseira Multifuncional Hacker',
            'Interface holográfica, controle de dispositivos remotos e ferramentas de invasão de sistemas.',
            'tech',
            'in_use',
            'WT-BRC-007',
            'Laboratório de P&D',
            admin_id,
            '/equipamentos/pulseira.png'
        );

        -- 4. Rifle de energia modular
        INSERT INTO public.equipment (id, name, description, category, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Rifle de Energia Modular',
            'Design sci-fi com peças intercambiáveis e emissão de pulsos de energia azul de alta intensidade.',
            'security',
            'maintenance',
            'WT-RFL-X1',
            'Arsenal - Cofre de Armas',
            admin_id,
            '/equipamentos/rifle.png'
        );

        -- 5. Capacete tático com IA integrada
        INSERT INTO public.equipment (id, name, description, category, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Capacete Tático com IA Integrada',
            'Visão 360°, assistência inteligente por voz, HUD de combate e comunicação criptografada.',
            'security',
            'available',
            'WT-HMT-PRO',
            'Arsenal - Indumentária',
            admin_id,
            '/equipamentos/capacete.png'
        );
    END IF;
END $$;
