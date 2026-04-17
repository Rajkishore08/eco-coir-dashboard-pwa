#!/usr/bin/env python3
"""
Idle Hours Monitor - Machine Idle State Logger
===============================================
Runs continuously and logs idle status when machine is NOT operating.
Logs when: Before 8 AM, after 6:00-6:30 PM, and on non-operating days.

Usage:
    python3 idle-hours-monitor.py

Press Ctrl+C to stop gracefully.
"""

import firebase_admin
from firebase_admin import credentials, db
import time
from datetime import datetime, timedelta
import signal
import sys
import pytz
import uuid

# ============================================================================
# CONFIGURATION
# ============================================================================

FIREBASE_CONFIG = {
    "databaseURL": "https://coir-tech-iot-default-rtdb.firebaseio.com"
}

SERVICE_ACCOUNT_KEY = "firebase-service-account.json"
DEVICE_ID = "device_01"
CHECK_INTERVAL_SECONDS = 300  # Check every 5 minutes (less frequent than operating monitor)

# Operating Hours (IST)
OPERATION_START_HOUR = 8
OPERATION_END_HOUR = 18
OPERATION_END_RANDOM_MINUTES = 30

# IST timezone
IST = pytz.timezone('Asia/Kolkata')

# Global state
running = True
last_idle_log_time = None
today_end_time = None

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
# FIREBASE LOGGING
# ============================================================================

def log_idle_event(timestamp_seconds):
    """Log machine idle event to Firebase"""
    event_id = str(uuid.uuid4())
    event_ref = db.reference(f"MACHINE_EVENT/{event_id}")
    
    event_time_dt = datetime.fromtimestamp(timestamp_seconds, tz=IST)
    
    event_data = {
        "event_id": event_id,
        "device_id": DEVICE_ID,
        "current_value": 0.0,
        "status_type": "IDLE",
        "event_time": timestamp_seconds,
        "duration": CHECK_INTERVAL_SECONDS,
        "date": event_time_dt.isoformat(),
        "readable_date": event_time_dt.strftime('%b %d, %Y, %I:%M:%S %p')
    }
    
    event_ref.set(event_data)
    
    # Also update LIVE_DATA for real-time dashboard display
    live_ref = db.reference(f"LIVE_DATA/{DEVICE_ID}")
    live_data = {
        "current": 0.0,
        "status": "IDLE",
        "timestamp": timestamp_seconds
    }
    live_ref.set(live_data)

def log_idle_system_log(timestamp_seconds, message):
    """Log idle system log to Firebase"""
    log_id = str(uuid.uuid4())
    log_ref = db.reference(f"SYSTEM_LOGS/{log_id}")
    
    log_time_dt = datetime.fromtimestamp(timestamp_seconds, tz=IST)
    
    log_data = {
        "log_id": log_id,
        "device_id": DEVICE_ID,
        "log_type": "INFO",
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
    """Get today's end time from a file or generate random"""
    global today_end_time
    now = datetime.now(IST)
    
    # This should ideally sync with operating-hours-monitor
    # For simplicity, we'll use a slightly later time to ensure we catch the end
    import random
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
    
    start_time = now.replace(hour=OPERATION_START_HOUR, minute=0, second=0, microsecond=0)
    
    # Add buffer to avoid conflicts with operating monitor
    end_time_with_buffer = today_end_time + timedelta(minutes=5)
    
    return start_time <= now <= end_time_with_buffer

# ============================================================================
# SIGNAL HANDLERS
# ============================================================================

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    global running
    print("\n\n⚠ Stopping idle hours monitor...")
    running = False
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# ============================================================================
# MAIN LOOP
# ============================================================================

def main():
    global last_idle_log_time
    
    print("=" * 70)
    print("Idle Hours Monitor - Machine Idle State Logger")
    print("=" * 70)
    print(f"Device ID: {DEVICE_ID}")
    print(f"Check Interval: {CHECK_INTERVAL_SECONDS} seconds ({CHECK_INTERVAL_SECONDS // 60} minutes)")
    print(f"Logs idle status when outside: {OPERATION_START_HOUR}:00 AM - 6:30 PM IST")
    print("=" * 70)
    
    # Initialize Firebase
    init_firebase()
    
    print("\n✓ Idle monitor started successfully!")
    print("💤 Monitoring for non-operating hours...")
    print("Press Ctrl+C to stop\n")
    
    while running:
        try:
            now = datetime.now(IST)
            
            if not is_operating_hours():
                # Machine is not operating - log idle status
                timestamp_seconds = int(now.timestamp())
                
                # Log idle event
                log_idle_event(timestamp_seconds)
                
                # Determine reason for idle
                hour = now.hour
                if hour < OPERATION_START_HOUR:
                    reason = f"Machine idle: Before operating hours (starts at {OPERATION_START_HOUR}:00 AM)"
                elif hour >= OPERATION_END_HOUR:
                    reason = f"Machine idle: After operating hours (ended around 6:00-6:30 PM)"
                else:
                    reason = "Machine idle: Non-operating period"
                
                # Log system log (only once every hour to avoid spam)
                current_hour = now.strftime('%Y-%m-%d %H')
                if last_idle_log_time != current_hour:
                    log_idle_system_log(timestamp_seconds, reason)
                    last_idle_log_time = current_hour
                
                # Print status
                print(f"💤 [{now.strftime('%Y-%m-%d %H:%M:%S')}] IDLE: Machine not operating")
                
            else:
                # During operating hours - operating monitor handles this
                if now.second == 0 and now.minute % 30 == 0:  # Print every 30 minutes
                    print(f"⏸️  [{now.strftime('%H:%M')}] Operating hours - Standby mode...")
            
            # Sleep until next check
            time.sleep(CHECK_INTERVAL_SECONDS)
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
