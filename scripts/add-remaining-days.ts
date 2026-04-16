import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push } from "firebase/database";

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

type StatusType = "EFFICIENT" | "OVERLOAD" | "UNDERUSAGE" | "IDLE" | "MISSING";

const DEVICE_ID = "device_01";
const DATA_INTERVAL_SECONDS = 15;

const THRESHOLDS = {
  overload_limit: 35,
  underusage_limit: 10,
  idle_threshold: 1,
  missing_timeout: 20
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getCurrentValue(date: Date, hour: number, minute: number, second: number, isMillDown: boolean): number | null {
  if (isMillDown) {
    return Math.random() * 0.5;
  }

  const totalMinutes = hour * 60 + minute;
  const startMinutes = 8 * 60;
  const endMinutes = 18 * 60;
  
  if (totalMinutes >= startMinutes && totalMinutes < endMinutes) {
    const random = Math.random();
    
    if (random < 0.03) {
      return Math.random() * 5 + 35;
    }
    
    if (random < 0.06) {
      return Math.random() * 5 + 5;
    }
    
    if (random < 0.08) {
      return Math.random() * 1;
    }
    
    return Math.random() * 9 + 25;
  }
  
  return Math.random() * 0.8;
}

function classifyStatus(current: number | null): StatusType {
  if (current === null) return "MISSING";
  if (current >= THRESHOLDS.overload_limit) return "OVERLOAD";
  if (current <= THRESHOLDS.idle_threshold) return "IDLE";
  if (current < THRESHOLDS.underusage_limit) return "UNDERUSAGE";
  return "EFFICIENT";
}

async function addRemainingDays() {
  console.log("🚀 Adding remaining days (April 7-9, 2026)...\n");
  
  const startDate = new Date('2026-04-07T00:00:00');
  const endDate = new Date('2026-04-09T23:59:59');
  const millDownDate = new Date('2026-04-07T00:00:00');
  
  let lastEventStatus: StatusType | null = null;
  let eventStartTime: number | null = null;
  let dataPointsCount = 0;
  let batchCount = 0;
  
  console.log("📊 Adding data from April 7 to April 9, 2026");
  console.log(`⏱️  Data interval: ${DATA_INTERVAL_SECONDS} seconds`);
  console.log("⚠️  Mill is down - all data will show IDLE status\n");
  
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const isMillDown = currentDate >= millDownDate;
    const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        for (let second = 0; second < 60; second += DATA_INTERVAL_SECONDS) {
          const dataDate = new Date(currentDate);
          dataDate.setHours(hour, minute, second, 0);
          
          const timestamp = Math.floor(dataDate.getTime() / 1000);
          const dateString = dataDate.toISOString();
          
          const currentValue = getCurrentValue(dataDate, hour, minute, second, isMillDown);
          const status = classifyStatus(currentValue);
          
          // Add data for EVERY 15-second interval
          const sensorId = generateUUID();
          await set(ref(database, `SENSOR_DATA/${sensorId}`), {
            sensor_id: sensorId,
            device_id: DEVICE_ID,
            current_value: currentValue !== null ? Math.round(currentValue * 10) / 10 : 0,
            timestamp,
            date: dateString,
            readable_date: dataDate.toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          });
          
          if (status !== lastEventStatus && lastEventStatus !== null && eventStartTime !== null) {
            const duration = timestamp - eventStartTime;
            const eventId = generateUUID();
            
            await set(ref(database, `MACHINE_EVENT/${eventId}`), {
              event_id: eventId,
              device_id: DEVICE_ID,
              current_value: currentValue !== null ? Math.round(currentValue * 10) / 10 : 0,
              status_type: lastEventStatus,
              event_time: eventStartTime,
              event_date: new Date(eventStartTime * 1000).toISOString(),
              duration
            });
            
            const logId = generateUUID();
            await set(ref(database, `SYSTEM_LOGS/${logId}`), {
              log_id: logId,
              device_id: DEVICE_ID,
              log_type: "EVENT",
              message: `${lastEventStatus} lasted ${duration} seconds`,
              timestamp: eventStartTime,
              date: new Date(eventStartTime * 1000).toISOString()
            });
          }
          
          lastEventStatus = status;
          eventStartTime = timestamp;
          
          dataPointsCount++;
          batchCount++;
          
          if (batchCount >= 100) {
            process.stdout.write('.');
            batchCount = 0;
          }
        }
      }
    }
    
    console.log(`\n  ✓ ${dateStr} - ${dataPointsCount} data points added`);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const now = new Date();
  const nowTimestamp = Math.floor(now.getTime() / 1000);
  const latestValue = getCurrentValue(now, now.getHours(), now.getMinutes(), now.getSeconds(), true);
  const latestStatus = classifyStatus(latestValue);
  
  await set(ref(database, `LIVE_DATA/${DEVICE_ID}`), {
    current: latestValue !== null ? Math.round(latestValue * 10) / 10 : 0,
    status: latestStatus,
    timestamp: nowTimestamp,
    date: now.toISOString(),
    readable_date: now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  });
  
  console.log(`\n✅ Remaining days data added successfully!`);
  console.log(`📊 Total data points added: ${dataPointsCount}`);
  console.log(`⏱️  Data interval: ${DATA_INTERVAL_SECONDS} seconds`);
  console.log(`\n🎉 Complete historical data now available (April 3-9, 2026)\n`);
  
  process.exit(0);
}

addRemainingDays().catch((error) => {
  console.error("❌ Error adding data:", error);
  process.exit(1);
});
