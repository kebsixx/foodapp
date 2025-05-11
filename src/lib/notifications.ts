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
  if (__DEV__) {
    handleRegistrationError('Notifications disabled in development');
    return "simulated-device-token";
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError('Physical device required');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission needed for notifications');
    return;
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? 
                    Constants?.easConfig?.projectId;

  if (!projectId) {
    handleRegistrationError('Project configuration error');
    return;
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError('Failed to get notification token');
    return;
  }
}

export default registerForPushNotificationsAsync;