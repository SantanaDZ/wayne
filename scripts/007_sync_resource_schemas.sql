-- Wayne Industries Database Schema
-- Script 007: Sync resource schemas with frontend types

-- 1. Fix Vehicles table
DO $$ 
BEGIN
    -- Adicionar colunas faltantes
    ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS model TEXT;
    ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS year INTEGER;
    
    -- Sincronizar nome da coluna da placa (de license_plate para plate_number)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='vehicles' AND column_name='license_plate'
    ) THEN
        ALTER TABLE public.vehicles RENAME COLUMN license_plate TO plate_number;
    END IF;
END $$;

-- 2. Fix Security Devices table
DO $$ 
BEGIN
    -- Adicionar colunas faltantes
    ALTER TABLE public.security_devices ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.security_devices ADD COLUMN IF NOT EXISTS serial_number TEXT;
    ALTER TABLE public.security_devices ADD COLUMN IF NOT EXISTS ip_address TEXT;
    ALTER TABLE public.security_devices ADD COLUMN IF NOT EXISTS last_maintenance TIMESTAMPTZ;
END $$;

-- 3. Ensure Restricted Areas tables exist (Módulo de Controle de Acesso)
CREATE TABLE IF NOT EXISTS public.restricted_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    security_level TEXT NOT NULL DEFAULT 'low',
    status TEXT NOT NULL DEFAULT 'operational',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.area_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID NOT NULL REFERENCES public.restricted_areas(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL REFERENCES public.profiles(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(area_id, profile_id)
);

-- RLS for Restricted Areas
ALTER TABLE public.restricted_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_access ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "areas_select_all" ON public.restricted_areas FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "access_select_all" ON public.area_access FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Drop and recreate triggers for updated_at on the new table
DROP TRIGGER IF EXISTS restricted_areas_updated_at ON public.restricted_areas;
CREATE TRIGGER restricted_areas_updated_at
    BEFORE UPDATE ON public.restricted_areas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
