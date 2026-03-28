// ========== FIREBASE CORE INITIALIZATION ==========
// Using Firebase Compat libraries for Vanilla JS (No bundlers needed)

const firebaseConfig = {
  apiKey: "AIzaSyAkCIMMPMinQ5CpoaqQWjpvLlxtH_yrBTA",
  authDomain: "urbanedge-9a626.firebaseapp.com",
  projectId: "urbanedge-9a626",
  storageBucket: "urbanedge-9a626.firebasestorage.app",
  messagingSenderId: "1096236263765",
  appId: "1:1096236263765:web:2381e3d1cd6aee80c567dc",
  measurementId: "G-ZX24WS88HK"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized
}

// Global Database instance variable
window.db = firebase.firestore();

console.log("🔥 Firebase Cloud Database Initialized Successfully!");
