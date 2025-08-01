import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { video_url, video_id } = await req.json();
    
    if (!video_url || !video_id) {
      return new Response(
        JSON.stringify({ error: 'Missing video_url or video_id' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing video ${video_id} with URL: ${video_url}`);

    // Get YOLO API URL from environment
    const yoloApiUrl = Deno.env.get('YOLO_MODEL_API_URL');
    if (!yoloApiUrl) {
      return new Response(
        JSON.stringify({ error: 'YOLO_MODEL_API_URL not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call YOLO API
    console.log(`Calling YOLO API at: ${yoloApiUrl}/process`);
    const yoloResponse = await fetch(`${yoloApiUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url,
        video_id
      })
    });

    if (!yoloResponse.ok) {
      const errorText = await yoloResponse.text();
      console.error(`YOLO API error: ${yoloResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `YOLO API failed: ${yoloResponse.status}` }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const yoloResult = await yoloResponse.json();
    console.log('YOLO API response:', yoloResult);

    if (!yoloResult.success || !yoloResult.urls) {
      return new Response(
        JSON.stringify({ error: 'YOLO processing failed' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update database with processed video URLs
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabase
      .from('videos')
      .update({
        detections_video_url: yoloResult.urls.detections,
        pose_video_url: yoloResult.urls.pose,
        all_video_url: yoloResult.urls.all,
        updated_at: new Date().toISOString()
      })
      .eq('id', video_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update database' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully processed video ${video_id} in ${yoloResult.processing_time}s`);

    return new Response(
      JSON.stringify({
        success: true,
        urls: yoloResult.urls,
        processing_time: yoloResult.processing_time
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});