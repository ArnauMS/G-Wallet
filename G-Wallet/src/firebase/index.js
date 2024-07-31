import { getFunctions } from "@firebase/functions";
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDzvWFY1z4QgGxE8l3UFHw8PTvELs6Y8cE",
  authDomain: "g-wallet-2991d.firebaseapp.com",
  projectId: "g-wallet-2991d",
  storageBucket: "g-wallet-2991d.appspot.com",
  messagingSenderId: "657880052066",
  appId: "1:657880052066:web:4753454d39d0440ce7bc3b"
};

// Inicialización de firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const firestore = getFirestore(app);
const functions = getFunctions(app);

export { app, auth, firestore, functions };
