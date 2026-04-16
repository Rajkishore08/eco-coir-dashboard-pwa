import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDNq-2B1z-9HZPWAaOzRqERrfDWdoWjKIQ",
  authDomain: "coir-tech-iot.firebaseapp.com",
  databaseURL: "https://coir-tech-iot-default-rtdb.firebaseio.com",
  projectId: "coir-tech-iot",
  storageBucket: "coir-tech-iot.firebasestorage.app",
  messagingSenderId: "998326741393",
  appId: "1:998326741393:web:4627e1862351d248f45230",
  measurementId: "G-Z79ZR1EWJ9"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

export { database, ref, onValue, set, push, get };
