import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDNq-2B1z-9HZPWAaOzRqERrfDWdoWjKIQ",
  authDomain: "coir-tech-iot.firebaseapp.com",
  databaseURL: "https://coir-tech-iot-default-rtdb.firebaseio.com",
  projectId: "coir-tech-iot",
  storageBucket: "coir-tech-iot.firebasestorage.app",
  messagingSenderId: "998326741393",
  appId: "1:998326741393:web:4627e1862351d248f45230"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Mock time series logic mimicking High Active / Low Idle states
const generateTimeSeriesData = () => {
  const data = [];
  const hours = 24;
  
  for (let i = 0; i <= hours; i++) {
    const timeStr = `${i.toString().padStart(2, '0')}:00`;
    let consumption = 0;
    
    // Idle state: 00:00 to 05:00 and 19:00 to 24:00
    if (i < 6 || i > 18) {
      // Idle phase: low power baseline + jitter
      consumption = 200 + Math.floor(Math.random() * 150);
    } else {
      // Active state: high power industrial operations
      consumption = 2200 + Math.floor(Math.random() * 600);
      
      // Add occasional dips during active phase (breaks/machine swap)
      if (Math.random() > 0.8) {
        consumption -= 1000;
      }
    }
    
    data.push({ time: timeStr, consumption });
  }
  return data;
};

async function seedDatabase() {
  console.log('Generating seed data...');
  const timeSeriesData = generateTimeSeriesData();
  
  try {
    const dbRef = ref(database, 'metrics/power_series');
    await set(dbRef, timeSeriesData);
    console.log('Firebase Seeding completely successful!');
    console.table(timeSeriesData);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed Firebase:', error);
    process.exit(1);
  }
}

seedDatabase();
