import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration for NIT Rourkela Marks Management System
// Evaluators can replace these placeholder values with their active Firebase Config.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key-for-btech-project-nitr",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nitr-marks-management.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nitr-marks-management",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nitr-marks-management.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Check if using real Firebase vs. local fallback simulation
export const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "dummy-api-key-for-btech-project-nitr"
  );
};

export { app, db, auth };
