import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let videoId: string | undefined;

  try {
    const requestData = await req.json();
    videoId = requestData.videoId;
    const videoUrl = requestData.videoUrl;
    
    if (!videoId || !videoUrl) {
      throw new Error('Missing videoId or videoUrl');
    }

    console.log(`Starting analysis for video ${videoId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update video status to analyzing
    await supabase
      .from('videos')
      .update({ analysis_status: 'analyzing' })
      .eq('id', videoId);

    // Call your YOLOv5 model API
    const modelApiUrl = Deno.env.get('YOLO_MODEL_API_URL');
    
    if (!modelApiUrl) {
      throw new Error('YOLO_MODEL_API_URL environment variable is not configured');
    }

    console.log(`Calling YOLOv5 model at ${modelApiUrl}`);
    
    // Check if the video URL is a blob URL (browser-only) or a data URL
    if (videoUrl.startsWith('blob:')) {
      throw new Error('Blob URLs cannot be accessed by the server. Please use base64 data URLs.');
    }
    
    // Call your Python YOLOv5 API - use the correct /analyze endpoint
    const apiUrl = modelApiUrl.endsWith('/') ? `${modelApiUrl}analyze` : `${modelApiUrl}/analyze`;
    console.log(`Making request to: ${apiUrl}`);
    
    const modelResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: videoUrl
      })
    });

    if (!modelResponse.ok) {
      const errorText = await modelResponse.text();
      console.error(`Model API error (${modelResponse.status}): ${errorText}`);
      throw new Error(`Model API returned ${modelResponse.status}: ${errorText}`);
    }

    const modelResults = await modelResponse.json();
    console.log('Model results received:', JSON.stringify(modelResults));

    // FIXED: Changed from output_video_id to video_id
    const detectionVideoUrl = modelResults.video_id ? 
      (modelApiUrl.endsWith('/') 
        ? `${modelApiUrl}download/${modelResults.video_id}` 
        : `${modelApiUrl}/download/${modelResults.video_id}`) 
      : null;

    console.log(`Detection video URL: ${detectionVideoUrl}`);

    // Update video status to completed and save the detection video URL
    const { data, error: updateError } = await supabase
      .from('videos')
      .update({ 
        analysis_status: 'completed',
        detection_video_url: detectionVideoUrl
      })
      .eq('id', videoId)
      .select();

    if (updateError) {
      console.error('Error updating video status:', JSON.stringify(updateError));
      throw updateError;
    }

    console.log(`Analysis completed for video ${videoId}. Updated record:`, JSON.stringify(data));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video analysis completed',
        detectionVideoUrl: detectionVideoUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-video function:', error.message || error);
    console.error('Error stack:', error.stack);
    
    // Update video status to error if we have videoId
    if (videoId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('videos')
          .update({ analysis_status: 'error' })
          .eq('id', videoId);
      } catch (updateError) {
        console.error('Error updating video status to error:', updateError.message || updateError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message || String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
