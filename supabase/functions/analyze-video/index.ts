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
      throw new Error('YOLO_MODEL_API_URL not configured');
    }

    console.log(`Calling YOLOv5 model at ${modelApiUrl}`);
    
    // Call your Python YOLOv5 API - make sure we're calling the correct endpoint
    // Check if modelApiUrl ends with a slash and adjust accordingly
    const apiUrl = modelApiUrl.endsWith('/') ? `${modelApiUrl}detect` : `${modelApiUrl}/detect`;
    console.log(`Making request to: ${apiUrl}`);
    
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
      throw new Error(`Model API returned ${modelResponse.status}: ${await modelResponse.text()}`);
    }

    const modelResults = await modelResponse.json();
    console.log('Model results received:', modelResults);

    // Process YOLOv5 results into our format
    const analysisData = {
      objects: modelResults.detections?.map((det: any) => ({
        name: det.class_name,
        confidence: Math.round(det.confidence * 100),
        bbox: det.bbox, // [x1, y1, x2, y2]
        frame_number: det.frame || 0
      })) || [],
      actions: [], // Will be filled by action recognition model later
      metrics: {
        total_detections: modelResults.total_detections || 0,
        processing_time: modelResults.processing_time || '0s',
        frames_processed: modelResults.frames_processed || 0,
        model_version: 'yolov5-custom'
      }
    };

    // Save analytics to database
    const { error: analyticsError } = await supabase
      .from('video_analytics')
      .insert({
        video_id: videoId,
        total_touches: 0, // Will be updated by action recognition
        successful_touches: 0, // Will be updated by action recognition  
        accuracy: 0, // Will be updated by action recognition
        average_speed: 0, // Will be updated by action recognition
        average_reaction_time: 0, // Will be updated by action recognition
        dominant_hand: null, // Will be updated by pose estimation
        analysis_data: {
          objects: analysisData.objects,
          actions: analysisData.actions,
          processing_time: analysisData.metrics.processing_time,
          model_version: analysisData.metrics.model_version,
          total_detections: analysisData.metrics.total_detections,
          frames_processed: analysisData.metrics.frames_processed,
          confidence_threshold: 0.5
        }
      });

    if (analyticsError) {
      console.error('Error saving analytics:', analyticsError);
      throw analyticsError;
    }

    // Update video status to completed and save the output_video_id as bboxes_video_url
    const { error: updateError } = await supabase
      .from('videos')
      .update({ 
        analysis_status: 'completed',
        bboxes_video_url: modelResults.output_video_id ? 
          (modelApiUrl.endsWith('/') 
            ? `${modelApiUrl}videos/${modelResults.output_video_id}` 
            : `${modelApiUrl}/videos/${modelResults.output_video_id}`) 
          : null
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
        data: analysisData
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