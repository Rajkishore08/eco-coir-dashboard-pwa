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

// Date Range: April 10 - Today
const START_DATE = new Date('2026-04-10T00:00:00+05:30');
const END_DATE = new Date(); // Today

// Operating Hours (IST)
const OPERATION_START_HOUR = 8;
const OPERATION_END_HOUR = 18;

// Threshold Configuration
const THRESHOLDS = {
  overload_limit: 35,
  efficient_min: 25,
  efficient_max: 34,
  underusage_limit: 10,
  idle_threshold: 1
};

// Generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate realistic current value
function generateCurrentValue(date: Date): number {
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  // Before operation starts
  if (hour < OPERATION_START_HOUR) {
    return parseFloat((Math.random() * 0.3).toFixed(2));
  }
  
  // After operation ends (with random variation 18:00-18:20)
  const endMinute = Math.floor(Math.random() * 21);
  if (hour > OPERATION_END_HOUR || (hour === OPERATION_END_HOUR && minute > endMinute)) {
    return parseFloat((Math.random() * 0.5).toFixed(2));
  }
  
  // During operation
  const timeProgress = (hour - OPERATION_START_HOUR) + (minute / 60);
  const totalOperationHours = OPERATION_END_HOUR - OPERATION_START_HOUR;
  const progressRatio = timeProgress / totalOperationHours;
  
  const scenario = Math.random();
  
  if (scenario < 0.75) {
    // 75% Efficient (25-34A)
    const base = 27 + Math.sin(progressRatio * Math.PI * 4) * 3;
    const noise = (Math.random() - 0.5) * 2;
    return parseFloat(Math.max(25, Math.min(34, base + noise)).toFixed(2));
  } else if (scenario < 0.85) {
    // 10% Overload (35-42A)
    return parseFloat((36 + Math.random() * 6).toFixed(2));
  } else if (scenario < 0.92) {
    // 7% Underusage (10-24A)
    return parseFloat((15 + Math.random() * 9).toFixed(2));
  } else if (scenario < 0.97) {
    // 5% Low usage (5-10A)
    return parseFloat((6 + Math.random() * 4).toFixed(2));
  } else {
    // 3% Idle (0-1A)
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

// Main function
async function addCurrentWeekData() {
  console.log('========================================');
  console.log('📅 Adding Current Week IoT Data');
  console.log('========================================\n');
  
  const startDateStr = START_DATE.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
  const endDateStr = END_DATE.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
  
  console.log(`📅 Date Range: ${startDateStr} - ${endDateStr}`);
  console.log(`⏱️  Interval: ${DATA_INTERVAL_SECONDS} seconds`);
  console.log(`🏭 Device: ${DEVICE_ID}`);
  console.log(`⚡ Operating: ${OPERATION_START_HOUR}:00 - ${OPERATION_END_HOUR}:00 IST\n`);
  
  let currentDate = new Date(START_DATE);
  let lastStatus = "IDLE";
  let statusStartTime = currentDate.getTime();
  let dataPointCount = 0;
  let eventCount = 0;
  let logCount = 0;
  let batchCount = 0;
  
  // Batch updates for better performance
  const BATCH_SIZE = 100;
  let sensorBatch: any = {};
  let eventBatch: any = {};
  let logBatch: any = {};
  let latestReading: any = null;
  
  console.log('⏳ Generating and pushing data...\n');
  
  while (currentDate <= END_DATE) {
    const timestamp = Math.floor(currentDate.getTime() / 1000);
    const readableDate = currentDate.toLocaleString('en-US', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Generate current value
    const currentValue = generateCurrentValue(currentDate);
    const status = classifyStatus(currentValue);
    
    // SENSOR_DATA
    const sensorId = generateUUID();
    sensorBatch[sensorId] = {
      sensor_id: sensorId,
      device_id: DEVICE_ID,
      current_value: currentValue,
      voltage: parseFloat((230 + (Math.random() - 0.5) * 10).toFixed(2)),
      power_factor: parseFloat((0.85 + Math.random() * 0.10).toFixed(2)),
      temperature: parseFloat((35 + Math.random() * 15).toFixed(1)),
      timestamp: timestamp,
      date: currentDate.toISOString(),
      readable_date: readableDate
    };
    
    latestReading = {
      current: currentValue,
      voltage: sensorBatch[sensorId].voltage,
      power_factor: sensorBatch[sensorId].power_factor,
      temperature: sensorBatch[sensorId].temperature,
      status: status,
      timestamp: timestamp,
      readable_date: readableDate
    };
    
    // MACHINE_EVENT
    if (status !== lastStatus) {
      const eventDuration = Math.floor((currentDate.getTime() - statusStartTime) / 1000);
      
      if (eventDuration > 0) {
        const eventId = generateUUID();
        eventBatch[eventId] = {
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
        };
        eventCount++;
        
        // SYSTEM_LOGS (critical events only)
        if (lastStatus === "OVERLOAD" || (eventDuration > 300 && lastStatus !== "EFFICIENT")) {
          const logId = generateUUID();
          logBatch[logId] = {
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
          };
          logCount++;
        }
      }
      
      lastStatus = status;
      statusStartTime = currentDate.getTime();
    }
    
    dataPointCount++;
    
    // Push batch to Firebase
    if (dataPointCount % BATCH_SIZE === 0) {
      batchCount++;
      
      // Push sensor data
      const sensorRef = ref(database, 'SENSOR_DATA');
      await update(sensorRef, sensorBatch);
      
      // Push events
      if (Object.keys(eventBatch).length > 0) {
        const eventRef = ref(database, 'MACHINE_EVENT');
        await update(eventRef, eventBatch);
      }
      
      // Push logs
      if (Object.keys(logBatch).length > 0) {
        const logRef = ref(database, 'SYSTEM_LOGS');
        await update(logRef, logBatch);
      }
      
      // Clear batches
      sensorBatch = {};
      eventBatch = {};
      logBatch = {};
      
      const progress = ((currentDate.getTime() - START_DATE.getTime()) / (END_DATE.getTime() - START_DATE.getTime()) * 100).toFixed(1);
      process.stdout.write(`\r⏳ Progress: ${progress}% | Batches: ${batchCount} | Data: ${dataPointCount} | Events: ${eventCount} | Logs: ${logCount}`);
    }
    
    // Increment by 15 seconds
    currentDate = new Date(currentDate.getTime() + DATA_INTERVAL_SECONDS * 1000);
  }
  
  // Push remaining data
  if (Object.keys(sensorBatch).length > 0) {
    const sensorRef = ref(database, 'SENSOR_DATA');
    await update(sensorRef, sensorBatch);
    
    if (Object.keys(eventBatch).length > 0) {
      const eventRef = ref(database, 'MACHINE_EVENT');
      await update(eventRef, eventBatch);
    }
    
    if (Object.keys(logBatch).length > 0) {
      const logRef = ref(database, 'SYSTEM_LOGS');
      await update(logRef, logBatch);
    }
  }
  
  // Update LIVE_DATA with latest reading
  if (latestReading) {
    const liveRef = ref(database, `LIVE_DATA/${DEVICE_ID}`);
    await set(liveRef, latestReading);
  }
  
  console.log('\n\n========================================');
  console.log('✅ DATA PUSH COMPLETE!');
  console.log('========================================\n');
  console.log(`📊 Summary:`);
  console.log(`   - Sensor readings: ${dataPointCount}`);
  console.log(`   - Machine events: ${eventCount}`);
  console.log(`   - System logs: ${logCount}`);
  console.log(`   - Batches pushed: ${batchCount + 1}`);
  console.log(`   - Latest status: ${latestReading?.status}`);
  console.log(`   - Current draw: ${latestReading?.current}A`);
  console.log('\n🎉 Dashboard should now show current data!\n');
  
  process.exit(0);
}

addCurrentWeekData().catch((error) => {
  console.error('\n❌ Error adding data:', error);
  process.exit(1);
});
