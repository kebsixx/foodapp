import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking'
import { NavigationProp } from '@react-navigation/native';
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
    const data = response.notification.request.content.data as {
      url?: string;
      type?: string;
      slug?: string;
    };
    
    // Prioritaskan deep link jika ada
    if (data?.url && typeof data.url === 'string') {
      Linking.openURL(data.url);
    }
    // Gunakan custom deep link untuk order detail
    else if (data?.type === 'order-status-update' && data?.slug) {
      const deepLink = Linking.createURL(`/order-detail/${data.slug}`);
      Linking.openURL(deepLink);
    }
  });

  // Handle notifications when app is opened from quit state
  Notifications.getLastNotificationResponseAsync()
    .then(response => {
      if (!response) return;
      const data = response.notification.request.content.data as {
        url?: string;
        type?: string;
        slug?: string;
      };
      
      if (data?.url && typeof data.url === 'string') {
        Linking.openURL(data.url);
      }
      else if (data?.type === 'order-status-update' && data?.slug) {
        const deepLink = Linking.createURL(`/order-detail/${data.slug}`);
        Linking.openURL(deepLink);
      }
    });
}

export default registerForPushNotificationsAsync;