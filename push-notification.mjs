import express from 'express';
import webPush from 'web-push';
import bodyParser from 'body-parser';
import cors from 'cors';  // Middleware untuk CORS
import jwt from 'jsonwebtoken';  // Import jsonwebtoken untuk verifikasi token

const app = express();
const port = 3001;  // Port yang digunakan untuk server

// VAPID Public dan Private Key
const vapidPublicKey = 'BFkKmM0gwQevEYHp6IJyGynJVnKdvMJZByjNges0FNpW-1SlHl9vPyltmPf9VjnuGKydXAEH68xDHrqteJ1RpPo';
const vapidPrivateKey = '6yXGHwRUz4sexxIAP1gqUk2UUTUeIU70qWGtwFdSwoo';

// Set VAPID details
webPush.setVapidDetails(
  'mailto:your-email@example.com',  // Ganti dengan email Anda
  vapidPublicKey,
  vapidPrivateKey
);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route untuk mengecek apakah server berjalan
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Middleware untuk verifikasi token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Token di header 'Authorization'
  if (!token) {
    return res.status(403).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, vapidPrivateKey);  // Verifikasi token
    req.user = decoded; // Simpan informasi user di request
    next(); // Melanjutkan ke middleware berikutnya
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Token invalid atau kedaluwarsa' });
  }
};

// Endpoint untuk menerima subscription dari frontend
app.post('/notifications/subscribe', verifyToken, (req, res) => {
  const subscription = req.body;

  // Validasi subscription data
  if (!subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ message: 'Invalid subscription data' });
  }

  console.log('New subscription:', subscription);

  res.status(201).json({
    message: 'Successfully subscribed to push notification!',
    data: subscription,
  });
});

// Endpoint untuk mengirim notifikasi
app.post('/send-notification', (req, res) => {
  const subscription = req.body;
  const { endpoint, p256dh, auth } = subscription.keys;
  if (!endpoint || !p256dh || !auth) {
    return res.status(400).json({ message: 'Missing required fields (endpoint, p256dh, auth)' });
  }

  const pushSubscription = {
    endpoint,
    keys: { p256dh, auth },
  };

  const payload = JSON.stringify({
    title: 'Cerita Baru!',
    body: 'Ada cerita baru yang bisa kamu baca!',
  });

  webPush.sendNotification(pushSubscription, payload)
    .then(() => res.status(200).json({ message: 'Notification sent successfully' }))
    .catch((error) => {
      console.error('Error sending push notification:', error);
      res.status(500).json({
        message: 'Failed to send notification',
        error: error.message,
      });
    });
});

// Jalankan server di port 3001
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
