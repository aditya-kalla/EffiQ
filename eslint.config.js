// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpj9N6AcurFRx2B2N0uZl18rqHvWBDpoU",
  authDomain: "effiq-8ac78.firebaseapp.com",
  projectId: "effiq-8ac78",
  storageBucket: "effiq-8ac78.firebasestorage.app",
  messagingSenderId: "573751953117",
  appId: "1:573751953117:web:45e5fdbe425cbccd223d34",
  measurementId: "G-6L4HH6CCG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);