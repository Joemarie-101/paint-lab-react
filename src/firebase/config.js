// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChAlrhbUYP2L0gEyqV9PyyYN9PC2eQmeM",
  authDomain: "joe-s-paint-lab.firebaseapp.com",
  projectId: "joe-s-paint-lab",
  storageBucket: "joe-s-paint-lab.firebasestorage.app",
  messagingSenderId: "218713066693",
  appId: "1:218713066693:web:18748abd1fd153f4c2b4ac"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize Auth with error handling
let auth;
try {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Firebase persistence error:', error);
  });
} catch (error) {
  console.error('Firebase Auth initialization error:', error);
  throw error;
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app);
} catch (error) {
  console.error('Firestore initialization error:', error);
  throw error;
}

export { auth, db };

export { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  addDoc, // Add this export
  collection, 
  query, 
  where, 
  orderBy, 
  limit 
};

export default app;