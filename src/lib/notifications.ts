import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

function handleRegistrationError(errorMessage: string) {
  const shortMessage = errorMessage.length > 50 
    ? errorMessage.substring(0, 50) + '...' 
    : errorMessage;

  Toast.show({
    type: 'custom_toast',
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
    props: {
      title: 'Notification Error',
      message: Device.isDevice 
        ? shortMessage 
        : 'Please use a physical device for notifications'
    }
  });
}

async function registerForPushNotificationsAsync() {
  // Even in development, we want to get the token for testing
  if (__DEV__) {
    console.log('Running in development mode, but still attempting to get token');
    // Don't return early - continue to get actual token
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError('Physical device required');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission needed for notifications');
    return null;
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? 
                    Constants?.easConfig?.projectId;

  if (!projectId) {
    handleRegistrationError('Project configuration error');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    console.log('Successfully obtained push token:', tokenData.data);
    return tokenData.data;
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Failed to get push token:', error);
    handleRegistrationError(`Failed to get token: ${error}`);
    return null;
  }
}

export default registerForPushNotificationsAsync;