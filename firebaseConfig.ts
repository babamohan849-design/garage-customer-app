import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvc_wTTk39eZ5qon4u5vIjnuxdcY_O9kI",
  authDomain: "studyai-t7t3e.firebaseapp.com",
  projectId: "studyai-t7t3e",
  storageBucket: "studyai-t7t3e.firebasestorage.app",
  messagingSenderId: "180680436933",
  appId: "1:180680436933:web:cf0bc940452d4cd0c214ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);