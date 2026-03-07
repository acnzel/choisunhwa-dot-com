-- Add missing speaker profile fields from Excel
ALTER TABLE speakers
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS lecture_topics text,
  ADD COLUMN IF NOT EXISTS books text;
