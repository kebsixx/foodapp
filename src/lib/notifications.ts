import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { supabase } from './supabase';

function handleRegistrationError(errorMessage: string) {
  console.error("Notification registration error:", errorMessage);
  
  const shortMessage = errorMessage.length > 50 
    ? `${errorMessage.substring(0, 47)}...` 
    : errorMessage;

  Toast.show({
    type: 'error',
    position: 'bottom',
    visibilityTime: 5000,
    text1: 'Notification Error',
    text2: Device.isDevice 
      ? shortMessage 
      : 'Please use a physical device for notifications',
    props: {
      isError: true
    }
  });
}

export async function registerForPushNotificationsAsync(userId: string) {
  if (!Device.isDevice) {
    handleRegistrationError('Must use physical device for notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Notification permission denied');
    return null;
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? 
                   Constants?.easConfig?.projectId;
  
  if (!projectId) {
    const errorMsg = 'Missing Expo project ID in configuration';
    handleRegistrationError(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    
    if (!tokenData.data) {
      handleRegistrationError('Received empty push token');
      return null;
    }

    // Simpan token ke Supabase
    const { error } = await supabase
      .from('users')
      .update({ expo_notification_token: tokenData.data })
      .eq('id', userId);

    if (error) {
      console.error('Error saving push token:', error);
      throw new Error('Failed to save push token');
    }

    console.log('Push token saved to database');
    return tokenData.data;
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : JSON.stringify(e);
    handleRegistrationError(`Failed to get token: ${error}`);
    return null;
  }
}

export function setupNotificationHandlers() {
  // Handle notifications when app is foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Handle notification taps
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'order-status-update') {
      // Navigate to order detail screen
      console.log('Notification tapped for order:', data.orderId);
      // navigation.navigate('OrderDetail', { orderId: data.orderId });
    }
  });
}

export default registerForPushNotificationsAsync;