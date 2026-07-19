import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let video_id: string | undefined;

  try {
    const body = await req.json();
    video_id = body.video_id;
    const video_url: string | undefined = body.video_url;

    if (!video_url || !video_id) {
      return new Response(JSON.stringify({ error: 'Missing video_url or video_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const yoloApiUrl = Deno.env.get('YOLO_MODEL_API_URL');
    if (!yoloApiUrl) {
      throw new Error('YOLO_MODEL_API_URL not configured');
    }

    console.log(`Processing video ${video_id} via ${yoloApiUrl}/process`);

    const yoloResponse = await fetch(`${yoloApiUrl}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url, video_id }),
    });

    if (!yoloResponse.ok) {
      const errorText = await yoloResponse.text();
      throw new Error(`Referee API failed (${yoloResponse.status}): ${errorText}`);
    }

    const result = await yoloResponse.json();
    // Expected shape: { success: true, annotated_video_url, log_url }
    // Also accept nested: { urls: { annotated, log } }
    const annotated =
      result.annotated_video_url ?? result.urls?.annotated ?? result.urls?.annotated_video_url;
    const log = result.log_url ?? result.urls?.log ?? result.urls?.log_url;

    if (result.success === false || !annotated) {
      throw new Error(`Referee API returned invalid response: ${JSON.stringify(result)}`);
    }

    const { error: updateError } = await supabase
      .from('videos')
      .update({
        annotated_video_url: annotated,
        log_url: log ?? null,
        status: 'Complete',
        updated_at: new Date().toISOString(),
      })
      .eq('id', video_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, annotated_video_url: annotated, log_url: log }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('process-video error:', error);
    if (video_id) {
      await supabase
        .from('videos')
        .update({ status: 'Failed', updated_at: new Date().toISOString() })
        .eq('id', video_id);
    }
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
