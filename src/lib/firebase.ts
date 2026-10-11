
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Local testing only: NEXT_PUBLIC_FIREBASE_EMULATORS=true connects to the
// Firestore (127.0.0.1:8080) and Auth (127.0.0.1:9099) emulators.
const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === 'true';

// Initialize Firebase.
// The checks for credentials are removed to allow the build process in CI/CD environments to complete.
// If the credentials are not provided in the production environment, `initializeApp` will fail at runtime.
const isFirstInit = !getApps().length;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
if (useEmulators && isFirstInit) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// Auth is created lazily: getAuth() validates the API key immediately, which would
// break prerendering in builds where the Firebase env vars are not set.
let authEmulatorConnected = false;
const getFirebaseAuth = () => {
  const auth = getAuth(app);
  if (useEmulators && !authEmulatorConnected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    authEmulatorConnected = true;
  }
  return auth;
};

export { app, db, getFirebaseAuth };
