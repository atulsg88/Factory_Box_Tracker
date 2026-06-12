import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB42eMqL3O7IFLZWydBmX-RA78o0y3IBpw",
  authDomain: "box-detection-75f81.firebaseapp.com",
  projectId: "box-detection-75f81",
  storageBucket: "box-detection-75f81.firebasestorage.app",
  messagingSenderId: "316007235728",
  appId: "1:316007235728:web:a20b1081aff646977a9815",
  measurementId: "G-8FYGS2Z2XD"
};

// Initialize Firebase safely for SSR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize analytics only on client side
const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null;

export const db = getFirestore(app);