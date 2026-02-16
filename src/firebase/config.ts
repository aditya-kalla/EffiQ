// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDn9mdrXzDo3VLgA0D8cpoikhAKCRayfjY",
  authDomain: "effiq-b3e50.firebaseapp.com",
  databaseURL: "https://effiq-b3e50-default-rtdb.firebaseio.com",
  projectId: "effiq-b3e50",
  storageBucket: "effiq-b3e50.firebasestorage.app",
  messagingSenderId: "109863914318",
  appId: "1:109863914318:web:8a82e9960f753302952c1f",
  measurementId: "G-J06N577M83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);