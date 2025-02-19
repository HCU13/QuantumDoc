import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3OIf5Rv_fpZ83VexcwLjbBiT0xd063MM",
  authDomain: "quantumdoc-aa05d.firebaseapp.com",
  projectId: "quantumdoc-aa05d",
  storageBucket: "quantumdoc-aa05d.firebasestorage.app",
  messagingSenderId: "194516029105",
  appId: "1:194516029105:web:4926b87c86c041d06b5c90",
  measurementId: "G-MF1VMSF05F",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP); // Burayı düzelttik
// export const FIRESTORE_DB = getFirestore(FIREBASE_APP); // Burayı düzelttik
