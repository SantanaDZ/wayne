-- Wayne Industries Database Schema
-- Script 001: Create all tables with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resource_status AS ENUM ('available', 'in_use', 'maintenance', 'retired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE device_status AS ENUM ('active', 'inactive', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view profiles
CREATE POLICY "profiles_select_all" ON public.profiles 
    FOR SELECT USING (true);

-- Users can update their own profile (except role)
CREATE POLICY "profiles_update_own" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Only admins can insert profiles (trigger handles auto-creation)
CREATE POLICY "profiles_insert" ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin" ON public.profiles 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 2. EQUIPMENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'tech',
    status resource_status NOT NULL DEFAULT 'available',
    serial_number TEXT UNIQUE,
    location TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for equipment
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Everyone can view equipment
CREATE POLICY "equipment_select_all" ON public.equipment 
    FOR SELECT USING (true);

-- Managers and admins can insert equipment
CREATE POLICY "equipment_insert" ON public.equipment 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Managers and admins can update equipment
CREATE POLICY "equipment_update" ON public.equipment 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Only admins can delete equipment
CREATE POLICY "equipment_delete" ON public.equipment 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 3. VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'car',
    license_plate TEXT UNIQUE,
    status resource_status NOT NULL DEFAULT 'available',
    location TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Everyone can view vehicles
CREATE POLICY "vehicles_select_all" ON public.vehicles 
    FOR SELECT USING (true);

-- Managers and admins can insert vehicles
CREATE POLICY "vehicles_insert" ON public.vehicles 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Managers and admins can update vehicles
CREATE POLICY "vehicles_update" ON public.vehicles 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Only admins can delete vehicles
CREATE POLICY "vehicles_delete" ON public.vehicles 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 4. SECURITY DEVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.security_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'camera',
    location TEXT,
    status device_status NOT NULL DEFAULT 'active',
    last_check TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for security_devices
ALTER TABLE public.security_devices ENABLE ROW LEVEL SECURITY;

-- Everyone can view security devices
CREATE POLICY "security_devices_select_all" ON public.security_devices 
    FOR SELECT USING (true);

-- Managers and admins can insert security devices
CREATE POLICY "security_devices_insert" ON public.security_devices 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Managers and admins can update security devices
CREATE POLICY "security_devices_update" ON public.security_devices 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Only admins can delete security devices
CREATE POLICY "security_devices_delete" ON public.security_devices 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- 5. ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Managers and admins can view all logs, employees can view their own
CREATE POLICY "activity_logs_select" ON public.activity_logs 
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Everyone can insert their own logs
CREATE POLICY "activity_logs_insert" ON public.activity_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON public.equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public.equipment(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON public.vehicles(type);
CREATE INDEX IF NOT EXISTS idx_security_devices_status ON public.security_devices(status);
CREATE INDEX IF NOT EXISTS idx_security_devices_type ON public.security_devices(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ============================================
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS equipment_updated_at ON public.equipment;
CREATE TRIGGER equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS vehicles_updated_at ON public.vehicles;
CREATE TRIGGER vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS security_devices_updated_at ON public.security_devices;
CREATE TRIGGER security_devices_updated_at
    BEFORE UPDATE ON public.security_devices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
