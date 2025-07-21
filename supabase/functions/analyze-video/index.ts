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

    // Simulate AI video analysis with realistic fencing data
    // In a real implementation, this would call an actual AI model
    const mockAnalysisData = {
      objects: [
        { name: 'Fencer 1', confidence: Math.floor(Math.random() * 10) + 90 },
        { name: 'Fencer 2', confidence: Math.floor(Math.random() * 10) + 90 },
        { name: 'Weapon (Foil/Épée/Sabre)', confidence: Math.floor(Math.random() * 5) + 95 },
        { name: 'Target Area', confidence: Math.floor(Math.random() * 15) + 85 },
        { name: 'Piste', confidence: Math.floor(Math.random() * 10) + 90 }
      ],
      actions: [
        { name: 'Attack', count: Math.floor(Math.random() * 10) + 8 },
        { name: 'Parry', count: Math.floor(Math.random() * 8) + 6 },
        { name: 'Riposte', count: Math.floor(Math.random() * 6) + 4 },
        { name: 'Lunge', count: Math.floor(Math.random() * 8) + 10 },
        { name: 'Retreat', count: Math.floor(Math.random() * 12) + 15 },
        { name: 'Advance', count: Math.floor(Math.random() * 15) + 20 }
      ],
      metrics: {
        total_touches: Math.floor(Math.random() * 10) + 15,
        successful_touches: Math.floor(Math.random() * 8) + 8,
        accuracy: Math.floor(Math.random() * 20) + 70,
        average_speed: parseFloat((Math.random() * 2 + 3).toFixed(2)),
        average_reaction_time: parseFloat((Math.random() * 0.5 + 0.2).toFixed(3)),
        dominant_hand: Math.random() > 0.5 ? 'right' : 'left'
      }
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save analytics to database
    const { error: analyticsError } = await supabase
      .from('video_analytics')
      .insert({
        video_id: videoId,
        total_touches: mockAnalysisData.metrics.total_touches,
        successful_touches: mockAnalysisData.metrics.successful_touches,
        accuracy: mockAnalysisData.metrics.accuracy,
        average_speed: mockAnalysisData.metrics.average_speed,
        average_reaction_time: mockAnalysisData.metrics.average_reaction_time,
        dominant_hand: mockAnalysisData.metrics.dominant_hand,
        analysis_data: {
          objects: mockAnalysisData.objects,
          actions: mockAnalysisData.actions,
          processing_time: '2.5s',
          model_version: 'fencing-ai-v1.0',
          confidence_threshold: 0.8
        }
      });

    if (analyticsError) {
      console.error('Error saving analytics:', analyticsError);
      throw analyticsError;
    }

    // Update video status to completed
    const { error: updateError } = await supabase
      .from('videos')
      .update({ analysis_status: 'completed' })
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
        data: mockAnalysisData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-video function:', error);
    
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