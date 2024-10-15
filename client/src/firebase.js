// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration (from the Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAblb0XCt04-1GzIX-9ciQiT2qPhToUDgA",
  authDomain: "collaborative-code-edito-135fa.firebaseapp.com",
  projectId: "collaborative-code-edito-135fa",
  storageBucket: "collaborative-code-edito-135fa.appspot.com",
  messagingSenderId: "274241548403",
  appId: "1:274241548403:web:644c554e86cae178b6ba06",
  measurementId: "G-DEYRY4F36J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
