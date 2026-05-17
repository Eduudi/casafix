importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAS-TYke-ipjn28cBqVx-urjbXDh0ky1Fw",
  authDomain: "elaresolve-2f835.firebaseapp.com",
  projectId: "elaresolve-2f835",
  storageBucket: "elaresolve-2f835.firebasestorage.app",
  messagingSenderId: "456455241718",
  appId: "1:456455241718:web:b4adfe159f4e85024991d7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
  });
});
