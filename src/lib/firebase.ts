import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type Messaging, type MessagePayload } from 'firebase/messaging';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messaging: Messaging | null = null;

function getFirebaseApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

async function getMessagingInstance(): Promise<Messaging | null> {
  if (!firebaseConfig.apiKey) return null;
  if (!(await isSupported())) return null;

  if (!messaging) {
    messaging = getMessaging(getFirebaseApp());
  }
  return messaging;
}

/**
 * Requests notification permission and returns an FCM registration token
 * for this browser/device. Returns null if unsupported, denied, or
 * misconfigured so callers can fall back gracefully (e.g. login without
 * push registration).
 */
export async function getFcmDeviceToken(): Promise<string | null> {
  try {
    if (!vapidKey) {
      console.warn('Firebase/FCM is not configured (missing VITE_FIREBASE_* env vars).');
      return null;
    }

    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission was not granted:', permission);
      return null;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (error) {
    console.error('Failed to get FCM device token:', error);
    return null;
  }
}

/**
 * Shows FCM messages that arrive while the tab is focused. Firebase only
 * auto-displays notifications via the service worker when the tab is in the
 * background — in the foreground the app must handle `onMessage` itself.
 */
export async function listenForForegroundMessages(
  onReceive: (payload: MessagePayload) => void
): Promise<() => void> {
  const messagingInstance = await getMessagingInstance();
  if (!messagingInstance) {
    return () => {};
  }
  return onMessage(messagingInstance, onReceive);
}
