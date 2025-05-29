import { subscribePushNotification } from './api';  // Pastikan fungsi ini diimpor dengan benar

const VAPID_PUBLIC_KEY = 'BFkKmM0gwQevEYHp6IJyGynJVnKdvMJZByjNges0FNpW-1SlHl9vPyltmPf9VjnuGKydXAEH68xDHrqteJ1RpPo';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

// Fungsi untuk subscribe user ke push notification
export async function subscribeUserToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      console.log('[Push] Subscription already exists');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token tidak ditemukan. Pastikan Anda sudah login terlebih dahulu.');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    let subscriptionData = subscription.toJSON();

    // Kirim subscription ke server
    await subscribePushNotification(subscriptionData, token);
    console.log('[Push] Subscription sent to server:', subscriptionData);
  } catch (error) {
    console.error('[Push] Subscription failed:', error.message);
    alert('Gagal berlangganan push notification: ' + error.message);
  }
}

