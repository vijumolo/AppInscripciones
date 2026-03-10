-- Extensión para generar UUIDs (generalmente activada por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLA: event_config
-- Almacena la configuración de los eventos
-- ==========================================
CREATE TABLE event_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    location VARCHAR(255),
    -- Las categorías pueden guardarse como JSON. Ejemplo: ["Infantil", "Juvenil", "Abierta 10K", "Élite 21K"]
    categories JSONB DEFAULT '[]'::jsonb, 
    is_open BOOLEAN DEFAULT true,
    close_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. TABLA: participants
-- Almacena los registros de los participantes
-- ==========================================
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES event_config(id) ON DELETE CASCADE,
    documentnumber VARCHAR(50) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    birthdate DATE,
    gender VARCHAR(20),
    category VARCHAR(100),
    blood_type VARCHAR(10),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    city VARCHAR(100),
    t_shirt_size VARCHAR(10),
    status VARCHAR(50) DEFAULT 'registrado', -- Ej: 'registrado', 'pagado', 'cancelado'
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones: Un documento o email solo puede registrarse una vez por evento
    CONSTRAINT unique_document_per_event UNIQUE(event_id, documentnumber),
    CONSTRAINT unique_email_per_event UNIQUE(event_id, email)
);

-- ==========================================
-- 3. SEGURIDAD DE FILAS (Row Level Security - RLS)
-- Permisos para que la aplicación frontend pueda interactuar con Supabase
-- ==========================================

-- Habilitar RLS en ambas tablas
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Políticas para 'event_config':
-- Cualquiera (incluso sin login) puede LEER los eventos para ver el formulario
CREATE POLICY "Permitir lectura pública de event_config"
ON event_config FOR SELECT
USING (true);

-- Solo usuarios autenticados (admin) pueden INSERTAR/MODIFICAR/ELIMINAR eventos
-- (Opcional: Descomentar si requieres administración estricta)
/*
CREATE POLICY "Solo admin gestiona eventos"
ON event_config FOR ALL 
USING (auth.uid() IS NOT NULL);
*/

-- Políticas para 'participants':
-- Cualquiera puede INSCRIBIRSE (Insertar) en un evento
CREATE POLICY "Permitir inscripciones públicas"
ON participants FOR INSERT
WITH CHECK (true);

-- Para la página de lista de inscritos, si es pública, permitimos LEER a todos:
CREATE POLICY "Permitir lectura pública de participantes"
ON participants FOR SELECT
USING (true);

-- ==========================================
-- 4. DATOS DE PRUEBA (Opcional)
-- Para que tengas un evento activo apenas corras el script
-- ==========================================
INSERT INTO event_config (name, description, event_date, location, categories, is_open, close_date)
VALUES (
    'Gran Carrera Tibirita 2026', 
    'Evento deportivo para todas las edades.', 
    '2026-11-15', 
    'Parque Principal Tibirita', 
    '["Infantil (5-10 años)", "Juvenil (11-17 años)", "Abierta 5K", "Élite 10K"]', 
    true, 
    '2026-11-10 23:59:59'
);
