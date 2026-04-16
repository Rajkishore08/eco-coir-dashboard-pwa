import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, update } from "firebase/database";

// Firebase Configuration
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

// Device Configuration
const DEVICE_ID = "device_01";
const DATA_INTERVAL_SECONDS = 15;

// Operating Hours (IST)
const OPERATION_START_HOUR = 8;
const OPERATION_END_HOUR = 18;

// Thresholds
const THRESHOLDS = {
  overload_limit: 35,
  efficient_min: 25,
  efficient_max: 34,
  underusage_limit: 10,
  idle_threshold: 1,
};

// State tracking
let lastStatus = "IDLE";
let statusStartTime = Date.now();
let readingCount = 0;

// Generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Check if within operating hours
function isOperatingHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Random end time variation (18:00 - 18:20)
  const endMinute = Math.floor(Math.random() * 21);
  
  return hour >= OPERATION_START_HOUR && 
         (hour < OPERATION_END_HOUR || (hour === OPERATION_END_HOUR && minute <= endMinute));
}

// Generate realistic current value
function generateCurrentValue(): number {
  if (!isOperatingHours()) {
    // Off hours - idle current
    return parseFloat((Math.random() * 0.3).toFixed(2));
  }
  
  // During operation - realistic patterns
  const scenario = Math.random();
  
  if (scenario < 0.75) {
    // 75% - Efficient (25-34A)
    const base = 28 + Math.sin(Date.now() / 30000) * 3;
    const noise = (Math.random() - 0.5) * 2;
    return parseFloat(Math.max(25, Math.min(34, base + noise)).toFixed(2));
  } else if (scenario < 0.85) {
    // 10% - Overload (35-42A)
    return parseFloat((36 + Math.random() * 6).toFixed(2));
  } else if (scenario < 0.92) {
    // 7% - Underusage (10-24A)
    return parseFloat((15 + Math.random() * 9).toFixed(2));
  } else if (scenario < 0.97) {
    // 5% - Low usage (5-10A)
    return parseFloat((6 + Math.random() * 4).toFixed(2));
  } else {
    // 3% - Brief idle (0-1A)
    return parseFloat((Math.random() * 0.8).toFixed(2));
  }
}

// Classify status
function classifyStatus(current: number): string {
  if (current >= THRESHOLDS.overload_limit) return "OVERLOAD";
  if (current >= THRESHOLDS.efficient_min && current <= THRESHOLDS.efficient_max) return "EFFICIENT";
  if (current >= THRESHOLDS.underusage_limit && current < THRESHOLDS.efficient_min) return "UNDERUSAGE";
  if (current <= THRESHOLDS.idle_threshold) return "IDLE";
  return "UNDERUSAGE";
}

// Generate log message
function generateLogMessage(status: string, current: number, duration: number): string {
  switch (status) {
    case "OVERLOAD":
      return `Motor overload detected: ${current}A exceeds safe limit. Auto-stop initiated for ${duration}s.`;
    case "UNDERUSAGE":
      return `Motor operating below optimal range at ${current}A. Feed rate adjustment recommended.`;
    case "IDLE":
      return `Motor in idle state: ${current}A. Machine stopped or no load detected.`;
    case "EFFICIENT":
      return `Motor operating efficiently at ${current}A within optimal range.`;
    default:
      return `Motor status: ${status} at ${current}A`;
  }
}

// Main IoT device loop
async function runIoTDeviceSimulator() {
  console.log('========================================');
  console.log('🏭 IoT DEVICE SIMULATOR - STARTED');
  console.log('========================================\n');
  console.log(`📡 Device: ${DEVICE_ID}`);
  console.log(`⏱️  Sampling Rate: ${DATA_INTERVAL_SECONDS} seconds`);
  console.log(`⚡ Operating Hours: ${OPERATION_START_HOUR}:00 - ${OPERATION_END_HOUR}:00 IST`);
  console.log(`🔄 Mode: Real-time continuous data push`);
  console.log('\n🎯 Press Ctrl+C to stop\n');
  console.log('----------------------------------------\n');
  
  while (true) {
    try {
      const now = new Date();
      const timestamp = Math.floor(now.getTime() / 1000);
      const readableDate = now.toLocaleString('en-US', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Generate sensor reading
      const currentValue = generateCurrentValue();
      const status = classifyStatus(currentValue);
      const voltage = parseFloat((230 + (Math.random() - 0.5) * 10).toFixed(2));
      const powerFactor = parseFloat((0.85 + Math.random() * 0.10).toFixed(2));
      const temperature = parseFloat((35 + Math.random() * 15).toFixed(1));
      
      readingCount++;
      
      // 1. Push SENSOR_DATA
      const sensorId = generateUUID();
      const sensorRef = ref(database, `SENSOR_DATA/${sensorId}`);
      await set(sensorRef, {
        sensor_id: sensorId,
        device_id: DEVICE_ID,
        current_value: currentValue,
        voltage: voltage,
        power_factor: powerFactor,
        temperature: temperature,
        timestamp: timestamp,
        date: now.toISOString(),
        readable_date: readableDate
      });
      
      // 2. Update LIVE_DATA
      const liveRef = ref(database, `LIVE_DATA/${DEVICE_ID}`);
      await set(liveRef, {
        current: currentValue,
        voltage: voltage,
        power_factor: powerFactor,
        temperature: temperature,
        status: status,
        timestamp: timestamp,
        readable_date: readableDate
      });
      
      // 3. Handle MACHINE_EVENT (on status change)
      if (status !== lastStatus) {
        const eventDuration = Math.floor((now.getTime() - statusStartTime) / 1000);
        
        if (eventDuration > 0) {
          const eventId = generateUUID();
          const eventRef = ref(database, `MACHINE_EVENT/${eventId}`);
          await set(eventRef, {
            event_id: eventId,
            device_id: DEVICE_ID,
            current_value: currentValue,
            status_type: lastStatus,
            event_time: Math.floor(statusStartTime / 1000),
            duration: eventDuration,
            date: new Date(statusStartTime).toISOString(),
            readable_date: new Date(statusStartTime).toLocaleString('en-US', { 
              timeZone: 'Asia/Kolkata',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          });
          
          // 4. Add SYSTEM_LOG (critical events only)
          if (lastStatus === "OVERLOAD" || (eventDuration > 300 && lastStatus !== "EFFICIENT")) {
            const logId = generateUUID();
            const logRef = ref(database, `SYSTEM_LOGS/${logId}`);
            await set(logRef, {
              log_id: logId,
              device_id: DEVICE_ID,
              log_type: lastStatus === "OVERLOAD" ? "CRITICAL" : "WARNING",
              message: generateLogMessage(lastStatus, currentValue, eventDuration),
              timestamp: Math.floor(statusStartTime / 1000),
              date: new Date(statusStartTime).toISOString(),
              readable_date: new Date(statusStartTime).toLocaleString('en-US', { 
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            });
            
            console.log(`🚨 [${readableDate}] STATUS CHANGE: ${lastStatus} → ${status} (${eventDuration}s) | ${currentValue}A`);
          }
        }
        
        lastStatus = status;
        statusStartTime = now.getTime();
      }
      
      // Log current reading
      const operatingStatus = isOperatingHours() ? "🟢 OPERATING" : "🔴 OFF-HOURS";
      console.log(`${operatingStatus} [${readableDate}] ${status} | ${currentValue}A | ${voltage}V | ${temperature}°C | Reading #${readingCount}`);
      
      // Wait for next interval
      await new Promise(resolve => setTimeout(resolve, DATA_INTERVAL_SECONDS * 1000));
      
    } catch (error) {
      console.error('\n❌ Error pushing data:', error);
      // Continue running even on error
      await new Promise(resolve => setTimeout(resolve, DATA_INTERVAL_SECONDS * 1000));
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n========================================');
  console.log('🛑 IoT DEVICE SIMULATOR - STOPPED');
  console.log('========================================\n');
  console.log(`📊 Total Readings Sent: ${readingCount}`);
  console.log('👋 Goodbye!\n');
  process.exit(0);
});

// Start the simulator
runIoTDeviceSimulator().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
