import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting demo video setup...')

    // Read the demo video file (this would be the downloaded file)
    const { videoBase64, filename } = await req.json()
    
    console.log(`Processing demo video: ${filename}`)
    
    // Convert base64 to binary
    const videoBuffer = Uint8Array.from(atob(videoBase64), c => c.charCodeAt(0))
    
    // Upload original video to storage
    const originalFileName = `demo-original-${Date.now()}.mp4`
    const { data: originalUpload, error: originalError } = await supabaseClient.storage
      .from('demo-videos')
      .upload(originalFileName, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true
      })

    if (originalError) {
      console.error('Error uploading original video:', originalError)
      throw originalError
    }

    const { data: originalUrlData } = supabaseClient.storage
      .from('demo-videos')
      .getPublicUrl(originalFileName)

    console.log(`Original video uploaded: ${originalUrlData.publicUrl}`)

    // Call the analyze-video function to process the video
    const yoloApiUrl = Deno.env.get('YOLO_MODEL_API_URL')
    if (!yoloApiUrl) {
      throw new Error('YOLO_MODEL_API_URL not configured')
    }

    console.log(`Calling YOLO model at ${yoloApiUrl}`)
    
    const modelResponse = await fetch(`${yoloApiUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_data: videoBase64,
        filename: filename
      })
    })

    if (!modelResponse.ok) {
      throw new Error(`Model API failed with status: ${modelResponse.status}`)
    }

    const modelResult = await modelResponse.json()
    console.log('Model results received:', modelResult)

    const detectionVideoUrl = `${yoloApiUrl}/download/${modelResult.video_id}`
    console.log('Detection video URL:', detectionVideoUrl)

    // Download the detection video
    const detectionResponse = await fetch(detectionVideoUrl)
    if (!detectionResponse.ok) {
      throw new Error(`Failed to download detection video: ${detectionResponse.status}`)
    }

    const detectionVideoBuffer = new Uint8Array(await detectionResponse.arrayBuffer())
    
    // Upload detection video to storage
    const detectionFileName = `demo-detections-${Date.now()}.mp4`
    const { data: detectionUpload, error: detectionError } = await supabaseClient.storage
      .from('demo-videos')
      .upload(detectionFileName, detectionVideoBuffer, {
        contentType: 'video/mp4',
        upsert: true
      })

    if (detectionError) {
      console.error('Error uploading detection video:', detectionError)
      throw detectionError
    }

    const { data: detectionUrlData } = supabaseClient.storage
      .from('demo-videos')
      .getPublicUrl(detectionFileName)

    console.log(`Detection video uploaded: ${detectionUrlData.publicUrl}`)

    // Save to demo_videos table
    const { data: demoVideo, error: insertError } = await supabaseClient
      .from('demo_videos')
      .insert({
        title: 'Fencing Demo - World Championships',
        original_video_url: originalUrlData.publicUrl,
        detection_video_url: detectionUrlData.publicUrl
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting demo video record:', insertError)
      throw insertError
    }

    console.log('Demo video setup completed:', demoVideo)

    return new Response(
      JSON.stringify({
        success: true,
        demoVideo,
        message: 'Demo video processed and saved successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in setup-demo-video function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})