import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDIiLxjJPLVcHhiXuLCaoSqdw2bEuHk50k",
  authDomain: "until-nova.firebaseapp.com",
  databaseURL: "https://until-nova-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "until-nova",
  storageBucket: "until-nova.firebasestorage.app",
  messagingSenderId: "37848570914",
  appId: "1:37848570914:web:cefaed9d04236081203e7b"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);