-- ==========================================
-- SCRIPT DE ACTUALIZACIÓN DE BASE DE DATOS
-- Funcionalidad: Añadir cuentas dinámicas y métodos de pago
-- ==========================================

-- 1. Añadimos columnas a `event_config` para grabar los números de pago del evento
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS nequi_number VARCHAR(50);
ALTER TABLE event_config ADD COLUMN IF NOT EXISTS daviplata_number VARCHAR(50);

-- 2. Añadimos columnas a `participants` para que el usuario documente su pago
ALTER TABLE participants ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE participants ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);
