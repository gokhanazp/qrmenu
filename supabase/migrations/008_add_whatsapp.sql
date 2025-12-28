-- Add WhatsApp field to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS whatsapp TEXT;