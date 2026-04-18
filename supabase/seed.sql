-- Script de Criação e Seed para Dispositivos de Segurança e Controle de Acesso
-- Copie este conteúdo e cole no SQL Editor do seu painel Supabase e clique em "RUN".

-- 1. Tabela: Dispositivos de Segurança (security_devices)
CREATE TABLE IF NOT EXISTS public.security_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'camera', 'sensor', 'biometric', 'alarm'
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    serial_number TEXT,
    location TEXT NOT NULL,
    ip_address TEXT,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela: Áreas Restritas (restricted_areas)
CREATE TABLE IF NOT EXISTS public.restricted_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    security_level TEXT NOT NULL CHECK (security_level IN ('low', 'medium', 'high', 'maximum')),
    status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'lockdown', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela: Controle de Acesso às Áreas (area_access)
CREATE TABLE IF NOT EXISTS public.area_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    area_id UUID REFERENCES public.restricted_areas(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(area_id, profile_id)
);

-- 4. Tabela: Logs de Acesso (access_logs)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    area_id UUID REFERENCES public.restricted_areas(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    access_type TEXT NOT NULL CHECK (access_type IN ('granted', 'denied')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB
);

-- 5. Configurar Row Level Security (RLS)

ALTER TABLE public.security_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricted_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Helper: retorna o role do usuário autenticado consultando profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()
$$;

-- security_devices
-- Qualquer autenticado pode ler
CREATE POLICY "sd_select" ON public.security_devices
  FOR SELECT TO authenticated USING (true);

-- Apenas quem criou pode inserir com seu próprio user_id
CREATE POLICY "sd_insert" ON public.security_devices
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Admin ou manager podem atualizar
CREATE POLICY "sd_update" ON public.security_devices
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Somente admin pode excluir
CREATE POLICY "sd_delete" ON public.security_devices
  FOR DELETE TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- restricted_areas
CREATE POLICY "ra_select" ON public.restricted_areas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ra_insert" ON public.restricted_areas
  FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "ra_update" ON public.restricted_areas
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "ra_delete" ON public.restricted_areas
  FOR DELETE TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- area_access
CREATE POLICY "aa_select" ON public.area_access
  FOR SELECT TO authenticated USING (
    profile_id = auth.uid()
    OR public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "aa_insert" ON public.area_access
  FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "aa_delete" ON public.area_access
  FOR DELETE TO authenticated
  USING (public.get_current_user_role() IN ('admin', 'manager'));

-- access_logs
-- Todos podem inserir (registrar próprio acesso)
CREATE POLICY "al_select" ON public.access_logs
  FOR SELECT TO authenticated USING (
    profile_id = auth.uid()
    OR public.get_current_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "al_insert" ON public.access_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

-- Logs são imutáveis — apenas admin pode excluir para auditoria
CREATE POLICY "al_delete" ON public.access_logs
  FOR DELETE TO authenticated
  USING (public.get_current_user_role() = 'admin');


-- 6. Adicionar Dados de Teste (Seed Mock Data)
-- Algumas áreas restritas icônicas das Indústrias Wayne / Batcaverna!
INSERT INTO public.restricted_areas (name, description, security_level, status) VALUES
('Batcaverna - Nível Principal', 'Centro de comando primário', 'maximum', 'operational'),
('Laboratório de P&D (Armas)', 'Setor de tecnologias bélicas', 'high', 'operational'),
('Garagem do Tumbler', 'Acesso ao Batmóvel', 'high', 'operational'),
('Sala dos Servidores (I.A. Brother Eye)', 'Núcleo de processamento de Gotham', 'maximum', 'lockdown'),
('Sala de Reuniões da Diretoria', 'Sala de reuniões executivas G1', 'medium', 'operational'),
('Arsenal', 'Estoque de Batarangs e Gadgets', 'maximum', 'operational');

INSERT INTO public.security_devices (name, description, type, status, serial_number, location, ip_address) VALUES
('Câmera Térmica Entrada', 'Monitoramento infravermelho', 'camera', 'active', 'CAM-TH-001', 'Túnel Principal', '192.168.1.101'),
('Sensor Sismológico', 'Detecta perfurações não autorizadas', 'sensor', 'active', 'SENS-SM-104', 'Perímetro Subterrâneo', '192.168.1.105'),
('Scanner de Retina Wayne', 'Controle Biométrico', 'biometric', 'active', 'BIO-RET-11', 'Portão D', '192.168.1.111'),
('Torreta Autônoma No-Lethal', 'Defesa perimetral não armada letal', 'alarm', 'maintenance', 'TUR-NL-01', 'Setor Leste', '192.168.1.200');
