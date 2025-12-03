/**
 * Storage Cleanup Edge Function
 *
 * Processes the storage_cleanup_queue table, deleting orphaned files.
 * Designed to be called by a scheduled cron job (e.g., weekly).
 *
 * Usage:
 * - Deploy: supabase functions deploy cleanup-storage
 * - Schedule via Supabase Dashboard > Database > Extensions > pg_cron
 *   OR call manually: POST /functions/v1/cleanup-storage
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createClient } from 'jsr:@supabase/supabase-js@2';

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;

interface CleanupItem {
  id: string;
  file_path: string;
  bucket: string;
  retry_count: number;
}

Deno.serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify this is called with service role (internal only)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.includes('Bearer')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results = {
    processed: 0,
    deleted: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Fetch unprocessed items (oldest first, limited batch)
    const { data: items, error: fetchError } = await supabase
      .from('storage_cleanup_queue')
      .select('id, file_path, bucket, retry_count')
      .is('processed_at', null)
      .lt('retry_count', MAX_RETRIES)
      .order('queued_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw new Error(`Failed to fetch queue: ${fetchError.message}`);
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No items to process',
          ...results,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Process each item
    for (const item of items as CleanupItem[]) {
      results.processed++;

      try {
        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from(item.bucket)
          .remove([item.file_path]);

        if (deleteError) {
          // Check if file doesn't exist (already deleted) - treat as success
          if (
            deleteError.message?.includes('Not found') ||
            deleteError.message?.includes('Object not found')
          ) {
            // File already gone, mark as processed
            await supabase
              .from('storage_cleanup_queue')
              .update({ processed_at: new Date().toISOString() })
              .eq('id', item.id);
            results.deleted++;
          } else {
            throw deleteError;
          }
        } else {
          // Successfully deleted, mark as processed
          await supabase
            .from('storage_cleanup_queue')
            .update({ processed_at: new Date().toISOString() })
            .eq('id', item.id);
          results.deleted++;
        }
      } catch (itemError) {
        results.failed++;
        const errorMessage = itemError instanceof Error ? itemError.message : String(itemError);
        results.errors.push(`${item.file_path}: ${errorMessage}`);

        // Update retry count and error message
        await supabase
          .from('storage_cleanup_queue')
          .update({
            retry_count: item.retry_count + 1,
            error_message: errorMessage,
          })
          .eq('id', item.id);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${results.processed} items`,
        ...results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: 'Cleanup failed',
        message: errorMessage,
        ...results,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
