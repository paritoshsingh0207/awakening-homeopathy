import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

const required = ["apiKey", "authDomain", "projectId", "messagingSenderId", "appId"] as const;
const missing = required.filter((key) => !firebaseConfig[key]);

if (missing.length) {
  throw new Error(
    `Firebase configuration missing: ${missing.join(", ")}. ` +
      "Create .env.local in the project root, copy the exact Firebase Web App config values into the VITE_FIREBASE_* variables, then fully restart npm run dev."
  );
}

if (!firebaseConfig.apiKey?.startsWith("AIza")) {
  throw new Error(
    "VITE_FIREBASE_API_KEY does not look like a Firebase Web API key. " +
      "Copy apiKey from Firebase Console > Project settings > General > Your apps > Web app. " +
      "Do not use the project ID, app ID, or a placeholder value."
  );
}

if (firebaseConfig.apiKey.includes("...") || firebaseConfig.apiKey.toLowerCase().includes("your")) {
  throw new Error(
    "VITE_FIREBASE_API_KEY still contains a placeholder. Replace it with the complete apiKey from your Firebase Web App configuration and restart Vite."
  );
}

console.info("Firebase configuration loaded", {
  apiKeyPresent: true,
  apiKeyPrefix: firebaseConfig.apiKey.slice(0, 4),
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageConfigured: Boolean(firebaseConfig.storageBucket),
});

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
