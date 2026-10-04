import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const defaultFirebaseConfig = {
  apiKey: "AIzaSyDPASkjOg4VgRJ6sDLuEau_aVp0afrvvtc",
  authDomain: "awakening-homeopathy.firebaseapp.com",
  projectId: "awakening-homeopathy",
  storageBucket: "awakening-homeopathy.firebasestorage.app",
  messagingSenderId: "80747269705",
  appId: "1:80747269705:web:53f29fc71ab39ca2d2f998",
  measurementId: "G-E05D6LR6FV",
};

const envOr = (value: string | undefined, fallback: string) => value?.trim() || fallback;

const firebaseConfig = {
  apiKey: envOr(import.meta.env.VITE_FIREBASE_API_KEY, defaultFirebaseConfig.apiKey),
  authDomain: envOr(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, defaultFirebaseConfig.authDomain),
  projectId: envOr(import.meta.env.VITE_FIREBASE_PROJECT_ID, defaultFirebaseConfig.projectId),
  storageBucket: envOr(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, defaultFirebaseConfig.storageBucket),
  messagingSenderId: envOr(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, defaultFirebaseConfig.messagingSenderId),
  appId: envOr(import.meta.env.VITE_FIREBASE_APP_ID, defaultFirebaseConfig.appId),
  measurementId: envOr(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, defaultFirebaseConfig.measurementId),
};

console.info("Firebase configuration loaded", {
  apiKeyPrefix: firebaseConfig.apiKey.slice(0, 4),
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageConfigured: Boolean(firebaseConfig.storageBucket),
});

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
