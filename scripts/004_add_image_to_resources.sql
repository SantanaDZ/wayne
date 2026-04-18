-- Wayne Industries Database Schema
-- Script 004: Add image support

ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.security_devices ADD COLUMN IF NOT EXISTS image_url TEXT;
