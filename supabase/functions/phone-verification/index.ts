import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Twilio } from "https://esm.sh/twilio@4.11.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWILIO_ACCOUNT_SID = "AC86b11ec58033f1e324b672ddd88d94c0"; 
const TWILIO_AUTH_TOKEN = "c0c1898ce66bae13c8797fd6963668e2";   
const TWILIO_PHONE_NUMBER = "+6285175280571";     
const SUPABASE_URL = "https://ftcctrtnvcytcuuljjik.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Y2N0cnRudmN5dGN1dWxqamlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODI2NzAwNiwiZXhwIjoyMDQzODQzMDA2fQ.1vznps03JHQmJqQ5CPF4i-EqpIC9vZGV2EDTh6h3jmE";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber } = await req.json();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    console.log('Sending SMS to:', phoneNumber); // Tambah logging

    // Initialize Twilio
    const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // Send SMS dengan error handling yang lebih baik
    try {
      const message = await twilioClient.messages.create({
        body: `Your verification code for Cerita Senja is: ${code}`,
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER
      });
      
      console.log('Twilio message sent:', message.sid);
    } catch (twilioError) {
      console.error('Twilio error:', twilioError);
      throw new Error(`Failed to send SMS: ${twilioError.message}`);
    }

    // Store code in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    await supabase
      .from('verification_codes')
      .insert({
        phone: phoneNumber,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Verification code sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error details:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send verification code'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});