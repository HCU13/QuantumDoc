import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase Configuration
 * Centralizes all Firebase setup and ensures consistent service exports
 */

// Firebase configuration - replace with your own config in production
const firebaseConfig = {
  apiKey: "AIzaSyC3OIf5Rv_fpZ83VexcwLjbBiT0xd063MM",
  authDomain: "quantumdoc-aa05d.firebaseapp.com",
  projectId: "quantumdoc-aa05d",
  storageBucket: "quantumdoc-aa05d.firebasestorage.app",
  messagingSenderId: "194516029105",
  appId: "1:194516029105:web:4926b87c86c041d06b5c90",
  measurementId: "G-MF1VMSF05F",
};

// Initialize Firebase app instance
export const FIREBASE_APP = initializeApp(firebaseConfig);

// Initialize and export Auth service
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

// Initialize and export Firestore service
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);

// Initialize and export Storage service
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

// Get current environment (development/production)
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Logging function for Firebase operations (only in development)
export const logFirebaseOperation = (operation, details) => {
  if (IS_DEVELOPMENT) {
    console.log(`[Firebase ${operation}]`, details);
  }
};

// Default export of the app instance
export default FIREBASE_APP;
