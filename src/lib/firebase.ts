import { initializeApp } from "firebase/app";
import { 
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCBiGfjXt2M2Qc8XukRXlcXhnUS1RxZPs0",
  authDomain: "salesinventory-4f014.firebaseapp.com",
  projectId: "salesinventory-4f014",
  storageBucket: "salesinventory-4f014.appspot.com",
  messagingSenderId: "694217621876",
  appId: "1:694217621876:web:ba3c98f10577c1c694ec21",
  measurementId: "G-W5KRX6F1KM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  cache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Set up auth persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);

export { 
  db, 
  auth, 
  storage,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};