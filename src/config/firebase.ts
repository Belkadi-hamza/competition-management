import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  
  return apiKey && 
         projectId && 
         apiKey !== 'your_api_key_here' && 
         projectId !== 'your_project_id' &&
         apiKey !== 'AIzaSyDummyKeyForDevelopment123456789012345' &&
         projectId !== 'your-project-id' &&
         apiKey.length > 20 && // Basic validation for API key length
         projectId.length > 5; // Basic validation for project ID length
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if properly configured
let app;
let auth;
let db;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    auth = null;
    db = null;
  }
} else {
  console.warn('Firebase not configured. Please update your .env file with valid Firebase credentials.');
  auth = null;
  db = null;
}

export { auth, db };

export const isConfigured = isFirebaseConfigured();

export default app;