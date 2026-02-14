import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: "gloverse-d94dc.firebaseapp.com",
  projectId: "gloverse-d94dc",
  storageBucket: "gloverse-d94dc.firebasestorage.app",
  messagingSenderId: "mock-id",
  appId: "mock-app-id"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
