// Firebase Cloud Messaging background service worker.
// This file is static (served as-is from /public), so it cannot read Vite env
// vars — fill in the same values used for VITE_FIREBASE_* in .env.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBpE9qHybmlSv-rsMIsJ9_RDMoSBGeqW9A',
  authDomain: 'pointbox-3f28b.firebaseapp.com',
  projectId: 'pointbox-3f28b',
  storageBucket: 'pointbox-3f28b.firebasestorage.app',
  messagingSenderId: '195428108197',
  appId: '1:195428108197:web:598e6c307d29e30c178a4c',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'PointBox', {
    body: body || '',
    icon: icon || '/vite.svg',
  });
});
