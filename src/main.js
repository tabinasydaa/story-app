import Navbar from './components/navbar.js';
import renderPage from './router/router.js';
import { subscribeUserToPush } from './utils/push.js'; // Impor fungsi subscribeUserToPush

// Fungsi untuk merender Navbar
function renderNavbar() {
  const navContainer = document.getElementById('navbar');
  navContainer.innerHTML = '';  // Hapus navbar lama
  navContainer.appendChild(Navbar());  // Render navbar baru
}

// Event listener untuk memantau perubahan di localStorage (misalnya login/logout)
window.addEventListener('storage', (event) => {
  if (event.key === 'token') {  // Cek apakah key yang berubah adalah 'token'
    renderNavbar();  // Render ulang navbar
  }
});

// Panggil renderNavbar() saat halaman pertama kali dimuat
window.addEventListener('load', async () => {
  renderNavbar();  // Render navbar pada load halaman pertama

  renderPage(location.hash);  // Render halaman sesuai hash URL

  // Cek jika browser mendukung service worker dan PushManager
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully.');

      // Cek apakah izin untuk push notification sudah diberikan
      if (Notification.permission === 'granted') {
        await subscribeUserToPush();  // Berlangganan untuk push notification
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Meminta izin push notification jika belum diberikan
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Push notification permission granted');
      await subscribeUserToPush();  // Subscribe setelah izin diberikan
    } else {
      console.log('Push notification permission denied');
    }
  }

  // Event listener untuk tombol subscribe push notification
  const btnSubscribe = document.getElementById('btnSubscribe');
  if (btnSubscribe) {
    btnSubscribe.addEventListener('click', async () => {
      if (!('serviceWorker' in navigator)) {
        alert('Service Worker is not supported by this browser.');
        return;
      }
      if (!('PushManager' in window)) {
        alert('Push API is not supported by this browser.');
        return;
      }
      if (Notification.permission !== 'granted') {
        alert('Notification permission not granted.');
        return;
      }
      try {
        await subscribeUserToPush();  // Berlangganan push notification
        alert('Successfully subscribed to push notifications!');
      } catch (error) {
        console.error('Push subscription failed:', error);
        alert('Failed to subscribe to push notifications: ' + error.message);
      }
    });
  }

  // Aksesibilitas: Skip link untuk langsung ke konten utama
  document.querySelector('.skip-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('app');
    if (mainContent) {
      mainContent.focus({ preventScroll: false });
    }
  });
});
