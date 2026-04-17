#!/usr/bin/env python3
"""
Operating Hours Monitor - Continuous Real-time IoT Simulator
=============================================================
Runs continuously and sends data every 15 seconds ONLY during operating hours.
Operating hours: 8 AM to random time between 6:00 PM - 6:30 PM IST

Usage:
    python3 operating-hours-monitor.py

Press Ctrl+C to stop gracefully.
"""

import firebase_admin
from firebase_admin import credentials, db
import time
import math
import random
from datetime import datetime, timedelta
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

SERVICE_ACCOUNT_KEY = "firebase-service-account.json"
DEVICE_ID = "device_01"
DATA_INTERVAL_SECONDS = 15

# Operating Hours (IST)
OPERATION_START_HOUR = 8
OPERATION_END_HOUR = 18  # 6 PM base
OPERATION_END_RANDOM_MINUTES = 30  # Can extend 0-30 minutes

# Thresholds
THRESHOLDS = {
    "overload_limit": 35,
    "efficient_min": 25,
    "efficient_max": 34,
    "underusage_limit": 10,
    "idle_threshold": 1,
    "missing_timeout": 45
}

# IST timezone
IST = pytz.timezone('Asia/Kolkata')

# Global state
running = True
today_end_time = None
last_reading_time = None

# ============================================================================
# FIREBASE INITIALIZATION
# ============================================================================

def init_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
        firebase_admin.initialize_app(cred, FIREBASE_CONFIG)
        print("✓ Firebase initialized successfully")

# ============================================================================
# DATA GENERATION
# ============================================================================

def generate_current_value(hour, minute):
    """Generate realistic current values based on time of day"""
    time_factor = math.sin((hour - OPERATION_START_HOUR) * math.pi / 
                           (OPERATION_END_HOUR - OPERATION_START_HOUR))
    
    base_current = 28 + (8 * time_factor)
    noise = random.gauss(0, 3)
    current = max(0, base_current + noise)
    
    # Occasional variations
    rand = random.random()
    if rand < 0.05:  # 5% overload
        current = random.uniform(35, 42)
    elif rand < 0.15:  # 10% underusage
        current = random.uniform(5, 15)
    elif rand < 0.20:  # 5% idle
        current = random.uniform(0, 1)
    
    return round(current, 2)

def determine_status(current):
    """Determine machine status based on current"""
    if current >= THRESHOLDS["overload_limit"]:
        return "OVERLOAD"
    elif current <= THRESHOLDS["idle_threshold"]:
        return "IDLE"
    elif current < THRESHOLDS["underusage_limit"]:
        return "UNDERLOAD"
    elif THRESHOLDS["efficient_min"] <= current <= THRESHOLDS["efficient_max"]:
        return "EFFICIENT"
    else:
        return "NORMAL"

def generate_log_message(status, current):
    """Generate appropriate log message"""
    messages = {
        "OVERLOAD": f"Machine overload detected: {current}A exceeds safe limit",
        "UNDERLOAD": f"Machine underutilized: Current at {current}A",
        "IDLE": f"Machine idle: Minimal current detected ({current}A)",
        "EFFICIENT": f"Operating efficiently at {current}A",
        "NORMAL": f"Normal operation at {current}A"
    }
    return messages.get(status, f"Status: {status}, Current: {current}A")

# ============================================================================
# FIREBASE LOGGING
# ============================================================================

def log_event(timestamp_seconds, current, status):
    """Log machine event to Firebase"""
    event_id = str(uuid.uuid4())
    event_ref = db.reference(f"MACHINE_EVENT/{event_id}")
    
    event_time_dt = datetime.fromtimestamp(timestamp_seconds, tz=IST)
    
    event_data = {
        "event_id": event_id,
        "device_id": DEVICE_ID,
        "current_value": current,
        "status_type": status,
        "event_time": timestamp_seconds,
        "duration": DATA_INTERVAL_SECONDS,
        "date": event_time_dt.isoformat(),
        "readable_date": event_time_dt.strftime('%b %d, %Y, %I:%M:%S %p')
    }
    
    event_ref.set(event_data)

def log_system_log(timestamp_seconds, status, message):
    """Log system log to Firebase"""
    log_id = str(uuid.uuid4())
    log_ref = db.reference(f"SYSTEM_LOGS/{log_id}")
    
    log_type = "ERROR" if status in ["OVERLOAD", "MISSING"] else "ALERT" if status in ["UNDERLOAD", "IDLE"] else "INFO"
    
    log_time_dt = datetime.fromtimestamp(timestamp_seconds, tz=IST)
    
    log_data = {
        "log_id": log_id,
        "device_id": DEVICE_ID,
        "log_type": log_type,
        "message": message,
        "timestamp": timestamp_seconds,
        "date": log_time_dt.isoformat(),
        "readable_date": log_time_dt.strftime('%b %d, %Y, %I:%M:%S %p')
    }
    
    log_ref.set(log_data)

# ============================================================================
# OPERATING HOURS LOGIC
# ============================================================================

def get_today_end_time():
    """Get today's random end time (6:00 PM to 6:30 PM)"""
    now = datetime.now(IST)
    random_minutes = random.randint(0, OPERATION_END_RANDOM_MINUTES)
    end_time = now.replace(hour=OPERATION_END_HOUR, minute=random_minutes, second=0, microsecond=0)
    return end_time

def is_operating_hours():
    """Check if current time is within operating hours"""
    global today_end_time
    
    now = datetime.now(IST)
    
    # Reset end time at midnight
    if today_end_time is None or now.date() != today_end_time.date():
        today_end_time = get_today_end_time()
        print(f"\n📅 Today's mill will operate until: {today_end_time.strftime('%I:%M %p IST')}")
    
    start_time = now.replace(hour=OPERATION_START_HOUR, minute=0, second=0, microsecond=0)
    
    return start_time <= now <= today_end_time

# ============================================================================
# SIGNAL HANDLERS
# ============================================================================

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    global running
    print("\n\n⚠ Stopping operating hours monitor...")
    running = False
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# ============================================================================
# MAIN LOOP
# ============================================================================

def main():
    global last_reading_time
    
    print("=" * 70)
    print("Operating Hours Monitor - Real-time IoT Simulator")
    print("=" * 70)
    print(f"Device ID: {DEVICE_ID}")
    print(f"Data Interval: {DATA_INTERVAL_SECONDS} seconds")
    print(f"Operating Hours: {OPERATION_START_HOUR}:00 AM to 6:00-6:30 PM IST")
    print("=" * 70)
    
    # Initialize Firebase
    init_firebase()
    
    print("\n✓ Monitor started successfully!")
    print("📡 Waiting for operating hours to begin data transmission...")
    print("Press Ctrl+C to stop\n")
    
    last_reading_time = time.time()
    
    while running:
        try:
            now = datetime.now(IST)
            
            if is_operating_hours():
                # Generate and send data
                current_value = generate_current_value(now.hour, now.minute)
                status = determine_status(current_value)
                timestamp_seconds = int(now.timestamp())
                
                # Log event
                log_event(timestamp_seconds, current_value, status)
                last_reading_time = time.time()
                
                # Log critical events
                if status in ["OVERLOAD", "IDLE"]:
                    message = generate_log_message(status, current_value)
                    log_system_log(timestamp_seconds, status, message)
                
                # Print status
                status_icon = "⚡" if status == "EFFICIENT" else "⚠️" if status in ["OVERLOAD", "UNDERLOAD"] else "💤" if status == "IDLE" else "✓"
                print(f"{status_icon} [{now.strftime('%Y-%m-%d %H:%M:%S')}] {status}: {current_value}A")
                
            else:
                # Outside operating hours - just wait
                if now.second == 0:  # Print once per minute
                    print(f"⏸️  [{now.strftime('%H:%M')}] Outside operating hours - Waiting...")
            
            # Sleep until next interval
            time.sleep(DATA_INTERVAL_SECONDS)
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            time.sleep(DATA_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
