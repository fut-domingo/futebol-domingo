import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAkIHyE7LS6ogsO4bTfykMX1dWSgp-H2Nw",
  authDomain: "futebol-site.firebaseapp.com",
  projectId: "futebol-site",
  storageBucket: "futebol-site.firebasestorage.app",
  messagingSenderId: "136783934691",
  appId: "1:136783934691:web:3696f0593486a1601401d6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // ✅ adiciona isso
