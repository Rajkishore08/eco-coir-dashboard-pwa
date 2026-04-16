import { writeFileSync } from 'fs';
import { join } from 'path';

// Device Configuration
const DEVICE_ID = "device_01";
const DEVICE_NAME = "Crusher Motor Unit";
const LOCATION = "Line 1";

// Data Generation Parameters
const DATA_INTERVAL_SECONDS = 15;
const START_DATE = new Date('2026-04-03T00:00:00+05:30'); // IST timezone
const END_DATE = new Date('2026-04-09T23:59:59+05:30');

// Operating Hours (IST)
const OPERATION_START_HOUR = 8;  // 8 AM
const OPERATION_END_HOUR = 18;   // 6 PM

// Threshold Configuration (Amps)
const THRESHOLDS = {
  overload_limit: 35,
  efficient_min: 25,
  efficient_max: 34,
  underusage_limit: 10,
  idle_threshold: 1,
  missing_timeout: 20,
  data_interval_seconds: DATA_INTERVAL_SECONDS
};

// Mill Status by Date
const MILL_DOWN_DATES = ['2026-04-07', '2026-04-08', '2026-04-09']; // Mill not functioning

// Generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Determine current value based on time and status
function generateCurrentValue(date: Date, dateStr: string): number {
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  // Mill down - idle current with noise
  if (MILL_DOWN_DATES.includes(dateStr)) {
    return parseFloat((Math.random() * 0.5).toFixed(2));
  }
  
  // Before operation starts
  if (hour < OPERATION_START_HOUR) {
    return parseFloat((Math.random() * 0.3).toFixed(2));
  }
  
  // After operation ends (with some random variation in end time 18:00 - 18:20)
  const endMinute = Math.floor(Math.random() * 21); // 0-20 minutes
  if (hour > OPERATION_END_HOUR || (hour === OPERATION_END_HOUR && minute > endMinute)) {
    return parseFloat((Math.random() * 0.5).toFixed(2));
  }
  
  // During operation - realistic operational current
  // Simulate normal operation with occasional variations
  const timeProgress = (hour - OPERATION_START_HOUR) + (minute / 60);
  const totalOperationHours = OPERATION_END_HOUR - OPERATION_START_HOUR;
  const progressRatio = timeProgress / totalOperationHours;
  
  // Random scenario selection
  const scenario = Math.random();
  
  if (scenario < 0.75) {
    // 75% - Efficient operation (25-34 A)
    const base = 27 + Math.sin(progressRatio * Math.PI * 4) * 3; // Sinusoidal variation
    const noise = (Math.random() - 0.5) * 2;
    return parseFloat(Math.max(25, Math.min(34, base + noise)).toFixed(2));
  } else if (scenario < 0.85) {
    // 10% - Overload (35-42 A) - brief periods
    const base = 36 + Math.random() * 6;
    return parseFloat(Math.min(42, base).toFixed(2));
  } else if (scenario < 0.92) {
    // 7% - Underusage (10-24 A)
    const base = 15 + Math.random() * 9;
    return parseFloat(base.toFixed(2));
  } else if (scenario < 0.97) {
    // 5% - Low usage (5-10 A)
    const base = 6 + Math.random() * 4;
    return parseFloat(base.toFixed(2));
  } else {
    // 3% - Idle/stopped (0-1 A)
    return parseFloat((Math.random() * 0.8).toFixed(2));
  }
}

// Classify status based on current
function classifyStatus(current: number): string {
  if (current >= THRESHOLDS.overload_limit) return "OVERLOAD";
  if (current >= THRESHOLDS.efficient_min && current <= THRESHOLDS.efficient_max) return "EFFICIENT";
  if (current >= THRESHOLDS.underusage_limit && current < THRESHOLDS.efficient_min) return "UNDERUSAGE";
  if (current <= THRESHOLDS.idle_threshold) return "IDLE";
  return "UNDERUSAGE";
}

// Generate alert/log messages
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

// Main data generation function
function generateCompleteIoTData() {
  console.log('🏭 Generating Production-Grade IoT Data...\n');
  
  const data: any = {
    DEVICE_INFO: {},
    LIVE_DATA: {},
    SENSOR_DATA: {},
    MACHINE_EVENT: {},
    THRESHOLD_CONFIG: {},
    SYSTEM_LOGS: {}
  };
  
  // 1. Device Information
  data.DEVICE_INFO[DEVICE_ID] = {
    device_name: DEVICE_NAME,
    location: LOCATION,
    status: "ACTIVE",
    firmware_version: "v2.3.1",
    last_maintenance: "2026-03-15T10:30:00+05:30",
    installation_date: "2025-08-20",
    sensor_type: "CT Clamp - 100A",
    sampling_rate: `${DATA_INTERVAL_SECONDS}s`
  };
  
  // 2. Threshold Configuration
  data.THRESHOLD_CONFIG[DEVICE_ID] = THRESHOLDS;
  
  console.log('✓ Device configuration created');
  
  // 3. Generate Time-Series Data
  let currentDate = new Date(START_DATE);
  let lastStatus = "IDLE";
  let statusStartTime = currentDate.getTime();
  let dataPointCount = 0;
  let eventCount = 0;
  let logCount = 0;
  
  while (currentDate <= END_DATE) {
    const timestamp = Math.floor(currentDate.getTime() / 1000);
    const dateStr = currentDate.toISOString().split('T')[0];
    const readableDate = currentDate.toLocaleString('en-US', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Generate realistic current value
    const currentValue = generateCurrentValue(currentDate, dateStr);
    const status = classifyStatus(currentValue);
    
    // A. SENSOR_DATA - Raw readings every 15 seconds
    const sensorId = generateUUID();
    data.SENSOR_DATA[sensorId] = {
      sensor_id: sensorId,
      device_id: DEVICE_ID,
      current_value: currentValue,
      voltage: 230 + (Math.random() - 0.5) * 10, // Voltage variation 225-235V
      power_factor: parseFloat((0.85 + Math.random() * 0.10).toFixed(2)), // 0.85-0.95
      temperature: parseFloat((35 + Math.random() * 15).toFixed(1)), // 35-50°C
      timestamp: timestamp,
      date: currentDate.toISOString(),
      readable_date: readableDate
    };
    
    // B. MACHINE_EVENT - Status changes and significant events
    if (status !== lastStatus) {
      const eventDuration = Math.floor((currentDate.getTime() - statusStartTime) / 1000);
      
      // Only log if duration > 0
      if (eventDuration > 0) {
        const eventId = generateUUID();
        data.MACHINE_EVENT[eventId] = {
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
        
        // C. SYSTEM_LOGS - Critical events only
        if (lastStatus === "OVERLOAD" || (eventDuration > 300 && lastStatus !== "EFFICIENT")) {
          const logId = generateUUID();
          data.SYSTEM_LOGS[logId] = {
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
    
    // Progress indicator
    if (dataPointCount % 1000 === 0) {
      const progress = ((currentDate.getTime() - START_DATE.getTime()) / (END_DATE.getTime() - START_DATE.getTime()) * 100).toFixed(1);
      process.stdout.write(`\r⏳ Processing: ${progress}% | Data points: ${dataPointCount} | Events: ${eventCount} | Logs: ${logCount}`);
    }
    
    // Increment by 15 seconds
    currentDate = new Date(currentDate.getTime() + DATA_INTERVAL_SECONDS * 1000);
  }
  
  console.log(`\n✓ Time-series data generated: ${dataPointCount} sensor readings`);
  console.log(`✓ Machine events logged: ${eventCount} status changes`);
  console.log(`✓ System logs created: ${logCount} critical entries`);
  
  // 4. Set LIVE_DATA to the latest reading
  const latestSensorKey = Object.keys(data.SENSOR_DATA).pop();
  if (latestSensorKey) {
    const latestSensor = data.SENSOR_DATA[latestSensorKey];
    data.LIVE_DATA[DEVICE_ID] = {
      current: latestSensor.current_value,
      voltage: latestSensor.voltage,
      power_factor: latestSensor.power_factor,
      temperature: latestSensor.temperature,
      status: classifyStatus(latestSensor.current_value),
      timestamp: latestSensor.timestamp,
      readable_date: latestSensor.readable_date
    };
  }
  
  console.log('✓ Live data snapshot set');
  
  return data;
}

// Generate and save
console.log('========================================');
console.log('🚀 IoT Data Generation System');
console.log('========================================\n');
console.log(`📅 Date Range: April 3-9, 2026`);
console.log(`⏱️  Interval: ${DATA_INTERVAL_SECONDS} seconds`);
console.log(`🏭 Device: ${DEVICE_NAME} (${DEVICE_ID})`);
console.log(`📍 Location: ${LOCATION}`);
console.log(`⚡ Operating: ${OPERATION_START_HOUR}:00 - ${OPERATION_END_HOUR}:00 IST`);
console.log(`🛑 Mill Down: April 7-9, 2026\n`);

const data = generateCompleteIoTData();

// Write to file
const outputPath = join(process.cwd(), 'firebase-complete-data.json');
writeFileSync(outputPath, JSON.stringify(data, null, 2));

const fileSizeMB = (Buffer.byteLength(JSON.stringify(data)) / (1024 * 1024)).toFixed(2);

console.log('\n========================================');
console.log('✅ DATA GENERATION COMPLETE!');
console.log('========================================\n');
console.log(`📁 File: firebase-complete-data.json`);
console.log(`💾 Size: ${fileSizeMB} MB`);
console.log(`📊 Collections:`);
console.log(`   - DEVICE_INFO: 1 device`);
console.log(`   - LIVE_DATA: Current snapshot`);
console.log(`   - SENSOR_DATA: ${Object.keys(data.SENSOR_DATA).length} readings`);
console.log(`   - MACHINE_EVENT: ${Object.keys(data.MACHINE_EVENT).length} events`);
console.log(`   - THRESHOLD_CONFIG: System thresholds`);
console.log(`   - SYSTEM_LOGS: ${Object.keys(data.SYSTEM_LOGS).length} logs`);
console.log('\n📝 Next Steps:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/coir-tech-iot/database');
console.log('2. Click ⋮ menu → Import JSON');
console.log('3. Select: firebase-complete-data.json');
console.log('4. Click Import');
console.log('5. Refresh your dashboard!');
console.log('\n🎉 Your IoT device data is ready!\n');
