-- Storage Cleanup Queue Migration
-- Run this in Supabase Dashboard > SQL Editor
--
-- Purpose: Automatically queue old profile pictures for deletion when users
-- upload a new one. A scheduled Edge Function processes the queue.

-- 1. Create the cleanup queue table
CREATE TABLE IF NOT EXISTS public.storage_cleanup_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'profile-pictures',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,

  -- Index for processing unprocessed items
  CONSTRAINT valid_bucket CHECK (bucket IN ('profile-pictures'))
);

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_cleanup_queue_unprocessed
  ON public.storage_cleanup_queue (queued_at)
  WHERE processed_at IS NULL;

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_cleanup_queue_user
  ON public.storage_cleanup_queue (user_id);

-- 2. Enable RLS (only service role can access)
ALTER TABLE public.storage_cleanup_queue ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can access (which is what we want)
-- The trigger runs with SECURITY DEFINER so it can insert

-- 3. Create function to extract file path from URL
CREATE OR REPLACE FUNCTION extract_storage_path(url TEXT, bucket_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  pattern TEXT;
  result TEXT;
BEGIN
  -- Pattern: .../storage/v1/object/public/{bucket}/{path}
  pattern := '/storage/v1/object/public/' || bucket_name || '/';

  IF position(pattern IN url) > 0 THEN
    result := substring(url FROM position(pattern IN url) + length(pattern));
    RETURN result;
  END IF;

  RETURN NULL;
END;
$$;

-- 4. Create trigger function to queue old profile pictures
CREATE OR REPLACE FUNCTION queue_old_profile_picture()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_path TEXT;
BEGIN
  -- Only trigger on UPDATE when profile_picture changes
  IF TG_OP = 'UPDATE' THEN
    -- Check if profile_picture actually changed
    IF OLD.raw_user_meta_data->>'profile_picture' IS DISTINCT FROM
       NEW.raw_user_meta_data->>'profile_picture' THEN

      -- Extract the old file path
      old_path := extract_storage_path(
        OLD.raw_user_meta_data->>'profile_picture',
        'profile-pictures'
      );

      -- Queue for deletion if we have a valid path
      IF old_path IS NOT NULL THEN
        INSERT INTO public.storage_cleanup_queue (file_path, bucket, user_id)
        VALUES (old_path, 'profile-pictures', OLD.id);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Create the trigger on auth.users
-- Note: This requires the trigger to be on the auth schema
DROP TRIGGER IF EXISTS queue_old_profile_picture_trigger ON auth.users;

CREATE TRIGGER queue_old_profile_picture_trigger
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION queue_old_profile_picture();

-- 6. Grant permissions for the cleanup Edge Function
-- The Edge Function will use service_role key, so no additional grants needed

-- 7. View for monitoring the queue
CREATE OR REPLACE VIEW public.storage_cleanup_status AS
SELECT
  COUNT(*) FILTER (WHERE processed_at IS NULL) as pending,
  COUNT(*) FILTER (WHERE processed_at IS NOT NULL AND error_message IS NULL) as completed,
  COUNT(*) FILTER (WHERE error_message IS NOT NULL) as failed,
  MAX(queued_at) FILTER (WHERE processed_at IS NULL) as oldest_pending
FROM public.storage_cleanup_queue;

-- Grant access to the view for authenticated users (optional, for admin dashboard)
-- GRANT SELECT ON public.storage_cleanup_status TO authenticated;

COMMENT ON TABLE public.storage_cleanup_queue IS
  'Queue for storage files that need to be deleted. Processed by scheduled Edge Function.';

COMMENT ON FUNCTION queue_old_profile_picture() IS
  'Trigger function that queues old profile pictures for deletion when updated.';
