import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

    // Initialize Supabase client with service role for server operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    
    // Validate video URL - reject blob and data URLs
    if (videoUrl.startsWith('blob:') || videoUrl.startsWith('data:')) {
      throw new Error('Invalid video URL. Please upload video to storage first.');
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
        video_url: videoUrl,
        return_method: 'direct'  // Request direct video return for efficiency
      })
    });

    if (!modelResponse.ok) {
      const errorText = await modelResponse.text();
      console.error(`Model API error (${modelResponse.status}): ${errorText}`);
      throw new Error(`Model API returned ${modelResponse.status}: ${errorText}`);
    }

    let detectionVideoUrl = null;

    // Check if Flask returned a video directly (which it should with return_method: 'direct')
    const contentType = modelResponse.headers.get('content-type');
    if (contentType?.includes('video')) {
      console.log('Flask returned video directly, uploading to Supabase Storage...');
      
      // Upload the video blob to Supabase Storage
      const videoBlob = await modelResponse.blob();
      const fileName = `detections_${videoId}_${Date.now()}.mp4`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('demo-videos')
        .upload(fileName, videoBlob, {
          contentType: 'video/mp4'
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload detection video: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('demo-videos')
        .getPublicUrl(fileName);
      
      detectionVideoUrl = publicUrl;
      console.log(`Detection video uploaded to storage: ${detectionVideoUrl}`);
    } else {
      // Fallback: try to parse JSON response (backward compatibility)
      try {
        const modelResults = await modelResponse.json();
        console.log('Model results received:', JSON.stringify(modelResults));
        
        if (modelResults.video_id) {
          // Flask returned a video ID, construct download URL
          detectionVideoUrl = modelApiUrl.endsWith('/') 
            ? `${modelApiUrl}download/${modelResults.video_id}` 
            : `${modelApiUrl}/download/${modelResults.video_id}`;
          console.log(`Detection video URL from Flask: ${detectionVideoUrl}`);
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Unexpected response format from Flask API');
      }
    }


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
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
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
