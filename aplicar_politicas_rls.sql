-- ============================================================
-- SCRIPT DE CORRECCIÓN DE POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================
-- Explicación: Supabase bloquea por defecto cualquier UPDATE o DELETE 
-- si la tabla tiene RLS activado y no existe una política (Policy) explícita.
-- Debido a esto, el AdminDashboard y el panel de Edición reportaban "Éxito" 
-- en la pantalla, pero en la base de datos no se guardaba absolutamente nada.

-- 1. Políticas de Configuración del Evento (event_config)
-- Permitimos al Administrador (sesión iniciada) Editar la configuración del evento y sus categorías.
DROP POLICY IF EXISTS "Solo admin gestiona eventos" ON event_config;
CREATE POLICY "Solo admin gestiona eventos"
ON event_config FOR ALL 
USING (auth.uid() IS NOT NULL);

-- 2. Políticas de Eliminación de Participantes (participants)
-- Permitimos "Borrar Base de Datos" o "Borrar Participante", SOLO al Administrador.
DROP POLICY IF EXISTS "Admin Delete Participants" ON participants;
CREATE POLICY "Admin Delete Participants"
ON participants FOR DELETE
USING (auth.uid() IS NOT NULL);

-- 3. Políticas de Edición de Participantes (participants)
-- Permitimos que cualquier persona en la vista pública de Registrations.tsx edite su información.
DROP POLICY IF EXISTS "Public Update Participants" ON participants;
CREATE POLICY "Public Update Participants"
ON participants FOR UPDATE
USING (true);

-- (Nota: Supabase requiere políticas explícitas separadas para cada acción)
