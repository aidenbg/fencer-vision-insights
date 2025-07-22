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

  try {
    const { videoId, videoUrl } = await req.json();
    
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
    // Check if modelApiUrl ends with a slash and adjust accordingly
    const apiUrl = modelApiUrl.endsWith('/') ? `${modelApiUrl}analyze` : `${modelApiUrl}/analyze`;
    console.log(`Making request to: ${apiUrl}`);
    
    // If videoUrl is a base64 data URL, we can pass it directly to the Flask app
    const modelResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: videoUrl,
        confidence_threshold: 0.5,
        iou_threshold: 0.4
      })
    });

    if (!modelResponse.ok) {
      const errorText = await modelResponse.text();
      console.error(`Model API error (${modelResponse.status}): ${errorText}`);
      throw new Error(`Model API returned ${modelResponse.status}: ${errorText}`);
    }

    const modelResults = await modelResponse.json();
    console.log('Model results received:', modelResults);

    // Just process the basic detection results - no complex analytics needed

    // Update video status to completed and save the output_video_id as detection_video_url
    const detectionVideoUrl = modelResults.output_video_id ? 
      (modelApiUrl.endsWith('/') 
        ? `${modelApiUrl}download/${modelResults.output_video_id}` 
        : `${modelApiUrl}/download/${modelResults.output_video_id}`) 
      : null;

    const { error: updateError } = await supabase
      .from('videos')
      .update({ 
        analysis_status: 'completed',
        detection_video_url: detectionVideoUrl
      })
      .eq('id', videoId);

    if (updateError) {
      console.error('Error updating video status:', updateError);
      throw updateError;
    }

    console.log(`Analysis completed for video ${videoId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video analysis completed',
        detectionVideoUrl: detectionVideoUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-video function:', error);
    
    // Make sure to update video status to error if we have videoId
    try {
      if (typeof videoId === 'string') {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('videos')
          .update({ analysis_status: 'error' })
          .eq('id', videoId);
      }
    } catch (updateError) {
      console.error('Error updating video status to error:', updateError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});