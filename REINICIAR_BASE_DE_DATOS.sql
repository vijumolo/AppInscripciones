-- Extensión para generar UUIDs de forma nativa en Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PELIGRO: ESTO BORRARÁ LAS TABLAS ACTUALES (Y SU INFORMACIÓN) 
-- PARA VOLVER A CREARLAS DESDE CERO
-- ==========================================
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS event_config CASCADE;

-- ==========================================
-- 1. TABLA: event_config
-- ==========================================
CREATE TABLE event_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eventname TEXT NOT NULL,
    eventdescription TEXT,
    activecategories TEXT[] DEFAULT '{}'::text[],
    registration_close_date DATE,
    nequi_number VARCHAR(50),
    daviplata_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. TABLA: participants
-- ==========================================
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES event_config(id) ON DELETE CASCADE,
    documentnumber VARCHAR(50) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(50),
    dob DATE,
    gender VARCHAR(20),
    category VARCHAR(100),
    licensenumber VARCHAR(100),
    club VARCHAR(100),
    sponsor VARCHAR(100),
    payment_method VARCHAR(50),
    payment_id VARCHAR(100),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restringe que la misma cédula o correo no se registren 2 veces en el mismo evento
    CONSTRAINT unique_document_per_event UNIQUE(event_id, documentnumber),
    CONSTRAINT unique_email_per_event UNIQUE(event_id, email)
);

-- ==========================================
-- 3. DATOS INICIALES (Para que no salga en blanco)
-- ==========================================
INSERT INTO event_config (eventname, eventdescription, activecategories, registration_close_date, nequi_number, daviplata_number)
VALUES (
    'Evento Deportivo Emerald 2026', 
    'Añade aquí la descripción general de la válida. Modifícame desde el panel Admin.', 
    ARRAY['Infantil', 'Juvenil', 'Élite', 'Abierta'], 
    CURRENT_DATE + INTERVAL '60 days',
    '',
    ''
);

-- ==========================================
-- 4. SEGURIDAD DE FILAS (Row Level Security - RLS)
-- ==========================================
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Lectura de la configuración pública (Para la página web inicial)
CREATE POLICY "Permitir lectura pública de event_config" ON event_config FOR SELECT USING (true);

-- Que cualquiera (sin loguearse) pueda enviar formularios
CREATE POLICY "Permitir inscripciones públicas" ON participants FOR INSERT WITH CHECK (true);

-- Que cualquiera vea la tabla de participantes inscritos
CREATE POLICY "Permitir lectura pública de participantes" ON participants FOR SELECT USING (true);

-- Control TOTAL de los administradores logueados en su panel
CREATE POLICY "Admin total event_config" ON event_config FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin total participants" ON participants FOR ALL USING (auth.uid() IS NOT NULL);
