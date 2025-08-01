import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] ========== NEW REQUEST ==========`);
  console.log(`[${new Date().toISOString()}] Method: ${req.method}`);
  console.log(`[${new Date().toISOString()}] URL: ${req.url}`);
  console.log(`[${new Date().toISOString()}] Headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    console.log(`[${new Date().toISOString()}] Parsing request body...`);
    const requestBody = await req.json();
    console.log(`[${new Date().toISOString()}] Request body:`, JSON.stringify(requestBody));
    
    const { video_url, video_id } = requestBody;
    
    if (!video_url || !video_id) {
      console.error(`[${new Date().toISOString()}] Missing required parameters:`, { video_url: !!video_url, video_id: !!video_id });
      return new Response(
        JSON.stringify({ error: 'Missing video_url or video_id' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[${new Date().toISOString()}] Processing request for video ${video_id}`);
    console.log(`[${new Date().toISOString()}] Video URL: ${video_url}`);
    
    // Get YOLO API URL from environment
    const yoloApiUrl = Deno.env.get('YOLO_MODEL_API_URL');
    console.log(`[${new Date().toISOString()}] YOLO API URL configured: ${yoloApiUrl ? 'Yes' : 'No'}`);
    
    if (!yoloApiUrl) {
      console.error(`[${new Date().toISOString()}] YOLO_MODEL_API_URL environment variable not set`);
      return new Response(
        JSON.stringify({ error: 'YOLO_MODEL_API_URL not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Call YOLO API
    const yoloStartTime = Date.now();
    const yoloEndpoint = `${yoloApiUrl}/process`;
    console.log(`[${new Date().toISOString()}] Calling YOLO API at: ${yoloEndpoint}`);
    console.log(`[${new Date().toISOString()}] YOLO API request payload:`, { video_url, video_id });
    
    const yoloResponse = await fetch(yoloEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url,
        video_id
      })
    });
    
    const yoloResponseTime = Date.now() - yoloStartTime;
    console.log(`[${new Date().toISOString()}] YOLO API response status: ${yoloResponse.status} (took ${yoloResponseTime}ms)`);
    console.log(`[${new Date().toISOString()}] YOLO API response headers:`, Object.fromEntries(yoloResponse.headers.entries()));
    
    if (!yoloResponse.ok) {
      const errorText = await yoloResponse.text();
      console.error(`[${new Date().toISOString()}] YOLO API error response: ${errorText}`);
      return new Response(
        JSON.stringify({ error: `YOLO API failed: ${yoloResponse.status}`, details: errorText }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const yoloResult = await yoloResponse.json();
    console.log(`[${new Date().toISOString()}] YOLO API success response:`, JSON.stringify(yoloResult));
    
    if (!yoloResult.success || !yoloResult.urls) {
      console.error(`[${new Date().toISOString()}] YOLO API returned invalid response structure:`, {
        success: yoloResult.success,
        hasUrls: !!yoloResult.urls
      });
      return new Response(
        JSON.stringify({ error: 'YOLO processing failed', details: yoloResult }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[${new Date().toISOString()}] YOLO processing completed in ${yoloResult.processing_time}s`);
    console.log(`[${new Date().toISOString()}] Generated URLs:`, {
      detections: yoloResult.urls.detections,
      pose: yoloResult.urls.pose,
      all: yoloResult.urls.all
    });
    
    // Update database with processed video URLs
    console.log(`[${new Date().toISOString()}] Initializing Supabase client...`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log(`[${new Date().toISOString()}] Supabase URL configured: ${supabaseUrl ? 'Yes' : 'No'}`);
    console.log(`[${new Date().toISOString()}] Supabase key configured: ${supabaseKey ? 'Yes' : 'No'}`);
    
    const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');
    
    const dbStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Updating database for video ${video_id}...`);
    
    const updateData = {
      detections_video_url: yoloResult.urls.detections,
      pose_video_url: yoloResult.urls.pose,
      all_video_url: yoloResult.urls.all,
      updated_at: new Date().toISOString()
    };
    console.log(`[${new Date().toISOString()}] Database update data:`, updateData);
    
    const { error: updateError, data: updateData } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', video_id)
      .select();
    
    const dbResponseTime = Date.now() - dbStartTime;
    console.log(`[${new Date().toISOString()}] Database update took ${dbResponseTime}ms`);
    
    if (updateError) {
      console.error(`[${new Date().toISOString()}] Database update error:`, updateError);
      console.error(`[${new Date().toISOString()}] Error details:`, JSON.stringify(updateError));
      return new Response(
        JSON.stringify({ error: 'Failed to update database', details: updateError }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[${new Date().toISOString()}] Database update successful:`, updateData);
    
    const totalTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ========== REQUEST COMPLETED ==========`);
    console.log(`[${new Date().toISOString()}] Total request time: ${totalTime}ms`);
    console.log(`[${new Date().toISOString()}] YOLO processing time: ${yoloResult.processing_time}s`);
    console.log(`[${new Date().toISOString()}] Database update time: ${dbResponseTime}ms`);
    
    const successResponse = {
      success: true,
      urls: yoloResult.urls,
      processing_time: yoloResult.processing_time,
      total_request_time_ms: totalTime
    };
    
    console.log(`[${new Date().toISOString()}] Sending success response:`, successResponse);
    
    return new Response(
      JSON.stringify(successResponse), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] ========== REQUEST FAILED ==========`);
    console.error(`[${new Date().toISOString()}] Error type:`, error.constructor.name);
    console.error(`[${new Date().toISOString()}] Error message:`, error.message);
    console.error(`[${new Date().toISOString()}] Error stack:`, error.stack);
    console.error(`[${new Date().toISOString()}] Total time before error: ${totalTime}ms`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
