// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);