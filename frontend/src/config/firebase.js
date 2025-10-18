// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBr4Oz3yW_qIayh62_eeq8Pc7CQusgk2cc",
  authDomain: "skillsyncer-941d8.firebaseapp.com",
  projectId: "skillsyncer-941d8",
  storageBucket: "skillsyncer-941d8.firebasestorage.app",
  messagingSenderId: "945551183018",
  appId: "1:945551183018:web:53ad793833b996bb8994d3",
  measurementId: "G-5E02Y0P3W6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;