-- Run this in Supabase SQL Editor to create the audio replies bucket
-- Dashboard: https://supabase.com/dashboard/project/hkkguqogmrydcilwaspo/storage/buckets

-- 1. Create storage bucket for Twilio TTS reply audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-replies', 'audio-replies', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public reads on audio-replies bucket
CREATE POLICY "Public read audio-replies"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-replies');

-- 3. Allow service role to upload
CREATE POLICY "Service role upload audio-replies"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio-replies');
