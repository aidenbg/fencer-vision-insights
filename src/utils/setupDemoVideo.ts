import { supabase } from '@/integrations/supabase/client';

export async function setupDemoVideo() {
  try {
    // Load the demo video file
    const response = await fetch('/src/assets/demo-fencing-video.mp4');
    if (!response.ok) {
      throw new Error('Failed to load demo video file');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Call the setup function
    const { data, error } = await supabase.functions.invoke('setup-demo-video', {
      body: {
        videoBase64: base64,
        filename: 'WuxiWorlds2025JMF-L4-PavelPuzankovRUS-vBikoTolbaEGY-00.01.44.584-00.01.51.565.mp4'
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error setting up demo video:', error);
    throw error;
  }
}

export async function getDemoVideo() {
  try {
    const { data, error } = await supabase
      .from('demo_videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching demo video:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getDemoVideo:', error);
    return null;
  }
}