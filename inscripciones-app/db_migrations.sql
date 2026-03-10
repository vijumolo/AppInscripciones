-- Migration to update schema for Event Registration System

-- 1. Update event_config table
ALTER TABLE public.event_config 
  DROP COLUMN IF EXISTS event_date,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS is_open,
  DROP COLUMN IF EXISTS categories,
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS description,
  ADD COLUMN IF NOT EXISTS eventName text,
  ADD COLUMN IF NOT EXISTS eventDescription text,
  ADD COLUMN IF NOT EXISTS activeCategories text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS registration_close_date date;

-- Insert a default row if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.event_config) THEN
    INSERT INTO public.event_config (eventName, eventDescription, activeCategories, registration_close_date)
    VALUES (
      'Mi Evento Deportivo', 
      'Descripción del evento', 
      ARRAY['Pro', 'Amateur'], 
      CURRENT_DATE + INTERVAL '30 days'
    );
  END IF;
END $$;

-- 2. Update participants table
-- Drop old columns we no longer need (making sure safely)
ALTER TABLE public.participants
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS birthdate,
  DROP COLUMN IF EXISTS blood_type,
  DROP COLUMN IF EXISTS emergency_contact_name,
  DROP COLUMN IF EXISTS emergency_contact_phone,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS t_shirt_size,
  DROP COLUMN IF EXISTS status;

-- Add new columns according to requirements
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS licensenumber text,
  ADD COLUMN IF NOT EXISTS dob date,
  ADD COLUMN IF NOT EXISTS club text,
  ADD COLUMN IF NOT EXISTS sponsor text,
  ADD COLUMN IF NOT EXISTS mobile text;

-- Ensure constraints and default values if necessary
-- For a fresh deployment, dropping and recreating might be cleaner, but we are altering.
-- 'documentnumber' should be UNIQUE.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'participants_documentnumber_key'
  ) THEN
    ALTER TABLE public.participants ADD CONSTRAINT participants_documentnumber_key UNIQUE (documentnumber);
  END IF;
END $$;
