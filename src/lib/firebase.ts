
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "campusconnect-wbdi0",
  appId: "1:623714764322:web:a3c76f0375a9e8cde02c7b",
  storageBucket: "campusconnect-wbdi0.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "campusconnect-wbdi0.firebaseapp.com",
  messagingSenderId: "623714764322",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
