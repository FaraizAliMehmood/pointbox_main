import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

function firebaseSwSource(env: Record<string, string>) {
  return `// Auto-generated from VITE_FIREBASE_* in .env by vite.config.ts — do not edit by hand.
// Firebase Cloud Messaging background service worker.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '${env.VITE_FIREBASE_API_KEY ?? ''}',
  authDomain: '${env.VITE_FIREBASE_AUTH_DOMAIN ?? ''}',
  projectId: '${env.VITE_FIREBASE_PROJECT_ID ?? ''}',
  storageBucket: '${env.VITE_FIREBASE_STORAGE_BUCKET ?? ''}',
  messagingSenderId: '${env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? ''}',
  appId: '${env.VITE_FIREBASE_APP_ID ?? ''}',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'PointBox', {
    body: body || '',
    icon: icon || '/vite.svg',
  });
});
`
}

// Keeps public/firebase-messaging-sw.js in sync with .env so the Firebase
// config only has to be maintained in one place.
function firebaseSwPlugin(): Plugin {
  return {
    name: 'generate-firebase-sw',
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), 'VITE_')
      const outPath = path.resolve(__dirname, 'public/firebase-messaging-sw.js')
      fs.writeFileSync(outPath, firebaseSwSource(env))
    },
  }
}

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [react(), tailwindcss(), firebaseSwPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
