// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth';
const firebaseToken = import.meta.env.VITE_FIREBASE_TOKEN;
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: firebaseToken,
  authDomain: "the-micronational-directory.firebaseapp.com",
  projectId: "the-micronational-directory",
  storageBucket: "the-micronational-directory.appspot.com",
  messagingSenderId: "499124068432",
  appId: "1:499124068432:web:a4cc5c2a454553dbc33155",
  measurementId: "G-SDWNPN1S1E",
  storageBucket: 'gs://the-micronational-directory.appspot.com'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const analytics = getAnalytics(app);
const storage = getStorage(app);
const auth = getAuth();

// init firebase
export { app, db, storage, auth };