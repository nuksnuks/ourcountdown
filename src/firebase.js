// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyDIiLxjJPLVcHhiXuLCaoSqdw2bEuHk50k",

  authDomain: "until-nova.firebaseapp.com",

  projectId: "until-nova",

  storageBucket: "until-nova.firebasestorage.app",

  messagingSenderId: "37848570914",

  appId: "1:37848570914:web:cefaed9d04236081203e7b"

};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);