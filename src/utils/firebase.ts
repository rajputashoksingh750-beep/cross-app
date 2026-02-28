import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBqxqT9G01iqIPtPYXvX6vhNFNAj-ENoY8",
    authDomain: "cross-92c84.firebaseapp.com",
    projectId: "cross-92c84",
    storageBucket: "cross-92c84.firebasestorage.app",
    messagingSenderId: "713266308316",
    appId: "1:713266308316:web:4df77960749832f3d6c019",
    measurementId: "G-TFX2VMK3FQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
