#!/usr/bin/env python3
"""
IoT Device Simulator - Standalone Python Script
================================================
Simulates real IoT hardware device for coir processing mill.
Can be deployed to any device (Raspberry Pi, server, etc.)

Usage:
    python3 iot-device-simulator.py

Press Ctrl+C to stop gracefully.
"""

import firebase_admin
from firebase_admin import credentials, db
import time
import math
import random
from datetime import datetime
import uuid
import signal
import sys
import pytz

# ============================================================================
# CONFIGURATION
# ============================================================================

FIREBASE_CONFIG = {
    "databaseURL": "https://coir-tech-iot-default-rtdb.firebaseio.com"
}

# Path to Firebase service account key (you'll need to download this)
SERVICE_ACCOUNT_KEY = "firebase-service-account.json"

# Device Configuration
DEVICE_ID = "device_01"
DATA_INTERVAL_SECONDS = 15

# Operating Hours (IST)
OPERATION_START_HOUR = 8
OPERATION_END_HOUR = 18

# Thresholds
THRESHOLDS = {
    "overload_limit": 35,
    "efficient_min": 25,
    "efficient_max": 34,
    "underusage_limit": 10,
    "idle_threshold": 1,
    "missing_timeout": 45,  # Seconds - consider data MISSING after this gap
}

# Global state tracking
last_status = "IDLE"
status_start_time = time.time()
reading_count = 0
running = True
daily_gaps_created = 0
last_gap_reset_date = None

# IST Timezone
IST = pytz.timezone('Asia/Kolkata')

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_uuid():
    """Generate unique ID for records"""
    return str(uuid.uuid4())


def get_ist_time():
    """Get current time in IST"""
    return datetime.now(IST)


def is_operating_hours():
    """Check if within operating hours (8 AM - 6 PM IST)"""
    now = get_ist_time()
    hour = now.hour
    minute = now.minute
    
    # Random end time variation (18:00 - 18:20)
    end_minute = random.randint(0, 20)
    
    return (hour >= OPERATION_START_HOUR and 
            (hour < OPERATION_END_HOUR or (hour == OPERATION_END_HOUR and minute <= end_minute)))


def generate_current_value():
    """Generate realistic current value based on operating hours and patterns"""
    if not is_operating_hours():
        # Off hours - idle current
        return round(random.random() * 0.3, 2)
    
    # During operation - realistic patterns
    scenario = random.random()
    
    if scenario < 0.75:
        # 75% - Efficient (25-34A)
        base = 28 + math.sin(time.time() / 30) * 3
        noise = (random.random() - 0.5) * 2
        return round(max(25, min(34, base + noise)), 2)
    elif scenario < 0.85:
        # 10% - Overload (35-42A)
        return round(36 + random.random() * 6, 2)
    elif scenario < 0.92:
        # 7% - Underusage (10-24A)
        return round(15 + random.random() * 9, 2)
    elif scenario < 0.97:
        # 5% - Low usage (5-10A)
        return round(6 + random.random() * 4, 2)
    else:
        # 3% - Brief idle (0-1A)
        return round(random.random() * 0.8, 2)


def classify_status(current):
    """Classify current status based on thresholds"""
    if current >= THRESHOLDS["overload_limit"]:
        return "OVERLOAD"
    elif current >= THRESHOLDS["efficient_min"] and current <= THRESHOLDS["efficient_max"]:
        return "EFFICIENT"
    elif current >= THRESHOLDS["underusage_limit"] and current < THRESHOLDS["efficient_min"]:
        return "UNDERUSAGE"
    elif current <= THRESHOLDS["idle_threshold"]:
        return "IDLE"
    else:
        return "UNDERUSAGE"


def generate_log_message(status, current, duration):
    """Generate descriptive log message"""
    messages = {
        "OVERLOAD": f"Motor overload detected: {current}A exceeds safe limit. Auto-stop initiated for {duration}s.",
        "UNDERUSAGE": f"Motor operating below optimal range at {current}A. Feed rate adjustment recommended.",
        "IDLE": f"Motor in idle state: {current}A. Machine stopped or no load detected.",
        "EFFICIENT": f"Motor operating efficiently at {current}A within optimal range.",
        "MISSING": f"Data connection lost for {duration}s. Sensor readings unavailable."
    }
    return messages.get(status, f"Motor status: {status} at {current}A")


def signal_handler(sig, frame):
    """Handle graceful shutdown on Ctrl+C"""
    global running
    print('\n\n========================================')
    print('🛑 IoT DEVICE SIMULATOR - STOPPED')
    print('========================================\n')
    print(f'📊 Total Readings Sent: {reading_count}')
    print('👋 Goodbye!\n')
    running = False
    sys.exit(0)


# ============================================================================
# MAIN SIMULATOR LOOP
# ============================================================================

def run_simulator():
    """Main IoT device simulation loop"""
    global last_status, status_start_time, reading_count
    
    # Initialize Firebase
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
        firebase_admin.initialize_app(cred, FIREBASE_CONFIG)
        print("✅ Firebase initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        print(f"\n⚠️  Make sure '{SERVICE_ACCOUNT_KEY}' exists in the same directory!")
        print("Download it from Firebase Console:")
        print("Project Settings → Service Accounts → Generate New Private Key")
        sys.exit(1)
    
    # Get database reference
    firebase_db = db.reference('/')
    
    print('========================================')
    print('🏭 IoT DEVICE SIMULATOR - STARTED')
    print('========================================\n')
    print(f'📡 Device: {DEVICE_ID}')
    print(f'⏱️  Sampling Rate: {DATA_INTERVAL_SECONDS} seconds')
    print(f'⚡ Operating Hours: {OPERATION_START_HOUR}:00 - {OPERATION_END_HOUR}:00 IST')
    print(f'🔄 Mode: Real-time continuous data push')
    print('\n🎯 Press Ctrl+C to stop\n')
    print('----------------------------------------\n')
    
    last_reading_time = time.time()
    
    while running:
        try:
            # Check if we need to reset daily gap counter (new day)
            global daily_gaps_created, last_gap_reset_date
            current_date = get_ist_time().date()
            if last_gap_reset_date is None or current_date != last_gap_reset_date:
                daily_gaps_created = 0
                last_gap_reset_date = current_date
                if reading_count > 0:  # Don't print on first run
                    print(f'\n📅 New day started: {current_date}. Gap counter reset.\n')
            
            # Simulate occasional data gaps (2-3 times per day maximum)
            # Only during operating hours, with 0.3% chance per reading (~2-3 times per day)
            max_daily_gaps = random.randint(2, 3)  # 2 or 3 gaps per day
            if (daily_gaps_created < max_daily_gaps and 
                is_operating_hours() and 
                random.random() < 0.003):  # 0.3% chance
                
                # Simulate data gap (10-60 minutes)
                gap_minutes = random.randint(10, 60)
                gap_duration = gap_minutes * 60  # Convert to seconds
                daily_gaps_created += 1
                
                print(f'\n⚠️  SIMULATING DATA GAP #{daily_gaps_created}/{max_daily_gaps}: {gap_minutes} minutes ({gap_duration} seconds)...\n')
                
                # Log MISSING status event
                missing_event_id = generate_uuid()
                gap_start_time = time.time()
                gap_start_date = datetime.fromtimestamp(gap_start_time, IST)
                
                firebase_db.child('MACHINE_EVENT').child(missing_event_id).set({
                    'event_id': missing_event_id,
                    'device_id': DEVICE_ID,
                    'current_value': 0,
                    'status_type': 'MISSING',
                    'event_time': int(gap_start_time),
                    'duration': gap_duration,
                    'date': gap_start_date.isoformat(),
                    'readable_date': gap_start_date.strftime('%b %d, %Y, %I:%M:%S %p')
                })
                
                # Log the gap
                log_id = generate_uuid()
                firebase_db.child('SYSTEM_LOGS').child(log_id).set({
                    'log_id': log_id,
                    'device_id': DEVICE_ID,
                    'log_type': 'ERROR',
                    'message': f'Data connection lost for {gap_minutes} minutes. Sensor readings unavailable.',
                    'timestamp': int(gap_start_time),
                    'date': gap_start_date.isoformat(),
                    'readable_date': gap_start_date.strftime('%b %d, %Y, %I:%M:%S %p')
                })
                
                print(f'💤 Waiting {gap_minutes} minutes...')
                time.sleep(gap_duration)
                last_status = 'MISSING'
                status_start_time = time.time()
                print(f'✅ DATA CONNECTION RESTORED (Gap #{daily_gaps_created} complete)\n')
            
            # Get current timestamp
            now = get_ist_time()
            timestamp = int(now.timestamp())
            readable_date = now.strftime('%b %d, %Y, %I:%M:%S %p')
            
            # Check if there was a gap since last reading (detection logic)
            time_since_last_reading = time.time() - last_reading_time
            if time_since_last_reading > THRESHOLDS["missing_timeout"]:
                # There was a gap - log it as MISSING
                missing_event_id = generate_uuid()
                missing_start = last_reading_time
                missing_date = datetime.fromtimestamp(missing_start, IST)
                missing_duration = int(time_since_last_reading)
                
                firebase_db.child('MACHINE_EVENT').child(missing_event_id).set({
                    'event_id': missing_event_id,
                    'device_id': DEVICE_ID,
                    'current_value': 0,
                    'status_type': 'MISSING',
                    'event_time': int(missing_start),
                    'duration': missing_duration,
                    'date': missing_date.isoformat(),
                    'readable_date': missing_date.strftime('%b %d, %Y, %I:%M:%S %p')
                })
                
                print(f'⚠️  MISSING DATA DETECTED: {missing_duration}s gap')
            
            # Generate sensor reading
            current_value = generate_current_value()
            status = classify_status(current_value)
            voltage = round(230 + (random.random() - 0.5) * 10, 2)
            power_factor = round(0.85 + random.random() * 0.10, 2)
            temperature = round(35 + random.random() * 15, 1)
            
            reading_count += 1
            last_reading_time = time.time()
            
            # 1. Push SENSOR_DATA
            sensor_id = generate_uuid()
            firebase_db.child('SENSOR_DATA').child(sensor_id).set({
                'sensor_id': sensor_id,
                'device_id': DEVICE_ID,
                'current_value': current_value,
                'voltage': voltage,
                'power_factor': power_factor,
                'temperature': temperature,
                'timestamp': timestamp,
                'date': now.isoformat(),
                'readable_date': readable_date
            })
            
            # 2. Update LIVE_DATA
            firebase_db.child('LIVE_DATA').child(DEVICE_ID).set({
                'current': current_value,
                'voltage': voltage,
                'power_factor': power_factor,
                'temperature': temperature,
                'status': status,
                'timestamp': timestamp,
                'readable_date': readable_date
            })
            
            # 3. Handle MACHINE_EVENT (on status change)
            if status != last_status:
                event_duration = int(time.time() - status_start_time)
                
                if event_duration > 0:
                    event_id = generate_uuid()
                    event_time = int(status_start_time)
                    event_date = datetime.fromtimestamp(status_start_time, IST)
                    
                    firebase_db.child('MACHINE_EVENT').child(event_id).set({
                        'event_id': event_id,
                        'device_id': DEVICE_ID,
                        'current_value': current_value,
                        'status_type': last_status,
                        'event_time': event_time,
                        'duration': event_duration,
                        'date': event_date.isoformat(),
                        'readable_date': event_date.strftime('%b %d, %Y, %I:%M:%S %p')
                    })
                    
                    # 4. Add SYSTEM_LOG (critical events only)
                    if last_status == "OVERLOAD" or last_status == "MISSING" or (event_duration > 300 and last_status != "EFFICIENT"):
                        log_id = generate_uuid()
                        log_type = "CRITICAL" if last_status in ["OVERLOAD", "MISSING"] else "WARNING"
                        
                        firebase_db.child('SYSTEM_LOGS').child(log_id).set({
                            'log_id': log_id,
                            'device_id': DEVICE_ID,
                            'log_type': log_type,
                            'message': generate_log_message(last_status, current_value, event_duration),
                            'timestamp': event_time,
                            'date': event_date.isoformat(),
                            'readable_date': event_date.strftime('%b %d, %Y, %I:%M:%S %p')
                        })
                        
                        print(f'🚨 [{readable_date}] STATUS CHANGE: {last_status} → {status} ({event_duration}s) | {current_value}A')
                
                last_status = status
                status_start_time = time.time()
            
            # Log current reading
            operating_status = "🟢 OPERATING" if is_operating_hours() else "🔴 OFF-HOURS"
            print(f'{operating_status} [{readable_date}] {status} | {current_value}A | {voltage}V | {temperature}°C | Reading #{reading_count}')
            
            # Wait for next interval
            time.sleep(DATA_INTERVAL_SECONDS)
            
        except KeyboardInterrupt:
            signal_handler(None, None)
        except Exception as e:
            print(f'\n❌ Error pushing data: {e}')
            # Continue running even on error
            time.sleep(DATA_INTERVAL_SECONDS)


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Run the simulator
    try:
        run_simulator()
    except Exception as e:
        print(f'\n❌ Fatal error: {e}')
        sys.exit(1)
