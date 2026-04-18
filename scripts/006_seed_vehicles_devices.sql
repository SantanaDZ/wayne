-- Wayne Industries Database Schema
-- Script 006: Seed vehicles and security devices with images

DO $$
DECLARE
    admin_id UUID;
    lucius_id UUID;
BEGIN
    -- Obter os IDs dos usuários criados anteriormente
    SELECT id INTO admin_id FROM auth.users WHERE email = 'bruce@wayne.com' LIMIT 1;
    SELECT id INTO lucius_id FROM auth.users WHERE email = 'lucius@wayne.com' LIMIT 1;

    -- Fallback se as contas não existirem
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
    END IF;
    IF lucius_id IS NULL THEN
        SELECT id INTO lucius_id FROM profiles WHERE role = 'manager' LIMIT 1;
    END IF;

    IF admin_id IS NOT NULL THEN
        -- ==========================================
        -- VEÍCULOS
        -- ==========================================
        
        -- Batmóvel (Clássico)
        INSERT INTO public.vehicles (id, name, description, type, status, plate_number, model, year, location, created_by, image_url, assigned_to)
        VALUES (
            gen_random_uuid(),
            'Batmóvel (Interceptor)',
            'Veículo de perseguição urbana com blindagem pesada e propulsão a jato.',
            'car',
            'available',
            'BATT-01',
            'WayneTech Custom',
            2024,
            'Batcaverna - Garagem Principal',
            admin_id,
            '/veiculos/batmovel.png',
            admin_id
        );

        -- Batmóvel 4x4 (Tumbler)
        INSERT INTO public.vehicles (id, name, description, type, status, plate_number, model, year, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Batmóvel 4x4 (Tumbler)',
            'Protótipo avançado para saltos e manobras em alta velocidade em terrenos irregulares.',
            'suv',
            'maintenance',
            'WK-TMBL',
            'Applied Sciences Prototype',
            2025,
            'Batcaverna - Oficina Norte',
            admin_id,
            '/veiculos/batmovel-4x4.png'
        );

        -- Buggy Armado
        INSERT INTO public.vehicles (id, name, description, type, status, plate_number, model, year, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Buggy de Resgate Armado',
            'Veículo ágil para extração rápida em zonas de conflito.',
            'other',
            'available',
            'RSQ-77',
            'WayneTech Nomad',
            2024,
            'Hangar 7',
            admin_id,
            '/veiculos/bug-armado.png'
        );

        -- Moto Tática
        INSERT INTO public.vehicles (id, name, description, type, status, plate_number, model, year, location, created_by, image_url, assigned_to)
        VALUES (
            gen_random_uuid(),
            'Batpod / Moto Tática',
            'Unidade de resposta rápida com canhões de 40mm e direção giro-estabilizada.',
            'motorcycle',
            'available',
            'MOTO-01',
            'WT Cycle',
            2024,
            'Batcaverna - Área de Lançamento',
            admin_id,
            '/veiculos/moto.png',
            admin_id
        );

        -- Caminhão de Transporte
        INSERT INTO public.vehicles (id, name, description, type, status, plate_number, model, year, location, created_by, image_url, assigned_to)
        VALUES (
            gen_random_uuid(),
            'Caminhão Logístico Wayne',
            'Transporte pesado blindado para equipamentos e recursos industriais.',
            'truck',
            'in_use',
            'WYN-LOGS',
            'Wayne Heavy Duty',
            2023,
            'Docas Externas',
            admin_id,
            '/veiculos/caminhao.png',
            lucius_id
        );

        -- ==========================================
        -- DISPOSITIVOS DE SEGURANÇA
        -- ==========================================

        -- Câmera Térmica
        INSERT INTO public.security_devices (id, name, description, type, status, serial_number, location, ip_address, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Câmera Térmica Sentinela',
            'Monitoramento infravermelho de alta resolução com detecção automática de ameaças.',
            'camera',
            'active',
            'CAM-TH-09',
            'Perímetro Externo - Setor 4',
            '10.0.4.52',
            admin_id,
            '/dispositivos/camera.png'
        );

        -- Scanner de Retina
        INSERT INTO public.security_devices (id, name, description, type, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Scanner de Retina Bio-Lock',
            'Autenticação biométrica estrita para acesso a níveis confidenciais.',
            'biometric',
            'active',
            'BIO-RT-01',
            'Elevador Social - Torre Wayne',
            admin_id,
            '/dispositivos/retina.png'
        );

        -- Sensor de Movimento
        INSERT INTO public.security_devices (id, name, description, type, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Sensor Sismológico/Movimento',
            'Detecta vibrações e intrusões em túneis e fundações.',
            'sensor',
            'active',
            'SNS-MV-44',
            'Nível B2 - Depósito de Arquivos',
            admin_id,
            '/dispositivos/sensor-movimento.png'
        );

        -- Keypad de Acesso
        INSERT INTO public.security_devices (id, name, description, type, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Terminal de Acesso Keypad',
            'Painel de entrada com criptografia quântica rotativa.',
            'other',
            'maintenance',
            'KEY-XP-88',
            'Sala de Servidores 2',
            admin_id,
            '/dispositivos/keypad.png'
        );

        -- Biometria Vocal
        INSERT INTO public.security_devices (id, name, description, type, status, serial_number, location, created_by, image_url)
        VALUES (
            gen_random_uuid(),
            'Módulo de Biometria Vocal',
            'Análise de frequência de voz e padrões rítmicos para identificação única.',
            'biometric',
            'active',
            'BIO-VC-03',
            'Central de Comando',
            admin_id,
            '/dispositivos/biometria.png'
        );

    END IF;
END $$;
