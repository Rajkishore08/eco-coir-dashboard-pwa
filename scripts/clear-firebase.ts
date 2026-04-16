import { initializeApp } from "firebase/app";
import { getDatabase, ref, remove } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function clearFirebase() {
  console.log("🗑️  Clearing ALL Firebase data...\n");
  
  await remove(ref(database));
  
  console.log("✅ All data cleared from Firebase!");
  console.log("\n📝 Next steps:");
  console.log("1. Import firebase-data.json to Firebase Console");
  console.log("2. Run 'npm run add-remaining-days' to add April 7-9\n");
  
  process.exit(0);
}

clearFirebase().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
