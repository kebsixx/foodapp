import { supabase } from "../lib/supabase";

export const sendVerificationCode = async (phoneNumber: string) => {
  try {
    console.log('Sending code to:', phoneNumber);
    const response = await fetch(
      'https://ftcctrtnvcytcuuljjik.functions.supabase.co/phone-verification',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      }
    );

    const data = await response.json();
    console.log('Verification response:', data);

    if (!data.success) {
      throw new Error(data.error || 'Failed to send verification code');
    }

    return data;
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
};

export const verifyCode = async (phoneNumber: string, code: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-code', {
      body: { phoneNumber, code }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};