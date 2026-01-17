/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3UOQhpLtlGIsBgj6bCsXlK4v6Owu7xXo",
  authDomain: "akila-menu.firebaseapp.com",
  databaseURL: "https://akila-menu-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "akila-menu",
  storageBucket: "akila-menu.firebasestorage.app",
  messagingSenderId: "694272456877",
  appId: "1:694272456877:web:204bd29f29014311d66e24"
};

const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
