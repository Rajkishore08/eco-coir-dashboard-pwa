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
current_reading = 28.0  # Current actual reading
target_current = 28.0   # Target current to move towards
last_status = "NORMAL"  # Track last status for smooth transitions

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

def get_target_current(hour, minute):
    """Get target current based on time of day and occasional transitions"""
    global target_current, last_status
    
    # Base current follows time of day pattern (efficient range: 25-34A)
    time_factor = math.sin((hour - OPERATION_START_HOUR) * math.pi / 
                           (OPERATION_END_HOUR - OPERATION_START_HOUR))
    base_target = 28 + (4 * time_factor)  # Range: 24-32A (mostly efficient)
    
    # Significant load changes happen rarely - every 5-10 minutes
    # At 15-second intervals: 0.3% chance = ~1 time per 5-6 minutes
    if random.random() < 0.003:
        rand = random.random()
        if rand < 0.15:  # 15% of load changes = overload (rare but happens)
            target_current = random.uniform(36, 42)
            print(f"\n   🔧 Load increased - ramping to {target_current:.1f}A\n")
        elif rand < 0.25:  # 10% of load changes = light load
            target_current = random.uniform(26, 30)
            print(f"\n   🔧 Load decreased - settling to {target_current:.1f}A\n")
        else:  # 75% of load changes = normal efficient operation
            target_current = base_target + random.gauss(0, 2)
    else:
        # Keep target stable - only tiny drift (motor very stable)
        # Add small noise to make it feel "alive" but not jumpy
        target_current = target_current * 0.98 + base_target * 0.02
        target_current += random.gauss(0, 0.1)  # Very small random walk
    
    # Clamp to reasonable bounds
    target_current = max(24, min(43, target_current))
    
    return target_current

def generate_current_value(hour, minute):
    """Generate realistic current with smooth transitions"""
    global current_reading, target_current
    
    # Get target current
    target = get_target_current(hour, minute)
    
    # Smoothly move current towards target (simulate motor inertia)
    # Move ~25-30% of the distance to target each reading
    transition_speed = 0.30  # 30% per reading (takes ~3-4 readings = 45-60 seconds for full transition)
    current_reading = current_reading * (1 - transition_speed) + target * transition_speed
    
    # Add small realistic noise (±0.5A, not ±3A)
    noise = random.gauss(0, 0.4)
    current_reading = current_reading + noise
    
    # Ensure within bounds
    current_reading = max(0, min(45, current_reading))
    
    return round(current_reading, 2)

def determine_status(current):
    """Determine machine status based on current"""
    if current >= THRESHOLDS["overload_limit"]:
        return "OVERLOAD"
    elif current <= THRESHOLDS["idle_threshold"]:
        return "IDLE"
    elif current < THRESHOLDS["underusage_limit"]:
        return "UNDERUSAGE"
    elif THRESHOLDS["efficient_min"] <= current <= THRESHOLDS["efficient_max"]:
        return "EFFICIENT"
    else:
        # 10-25A range - consider it efficient operation
        return "EFFICIENT"

def generate_log_message(status, current):
    """Generate appropriate log message"""
    messages = {
        "OVERLOAD": f"Machine overload detected: {current}A exceeds safe limit",
        "UNDERUSAGE": f"Machine underutilized: Current at {current}A",
        "IDLE": f"Machine idle: Minimal current detected ({current}A)",
        "EFFICIENT": f"Operating efficiently at {current}A"
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
    
    # Also update LIVE_DATA for real-time dashboard display
    live_ref = db.reference(f"LIVE_DATA/{DEVICE_ID}")
    live_data = {
        "current": current,
        "status": status,
        "timestamp": timestamp_seconds
    }
    live_ref.set(live_data)

def log_system_log(timestamp_seconds, status, message):
    """Log system log to Firebase"""
    log_id = str(uuid.uuid4())
    log_ref = db.reference(f"SYSTEM_LOGS/{log_id}")
    
    log_type = "ERROR" if status in ["OVERLOAD", "MISSING"] else "ALERT" if status in ["UNDERUSAGE", "IDLE"] else "INFO"
    
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
    global last_reading_time, current_reading, target_current
    
    print("=" * 70)
    print("Operating Hours Monitor - Real-time IoT Simulator")
    print("=" * 70)
    print(f"Device ID: {DEVICE_ID}")
    print(f"Data Interval: {DATA_INTERVAL_SECONDS} seconds")
    print(f"Operating Hours: {OPERATION_START_HOUR}:00 AM to 6:00-6:30 PM IST")
    print(f"Note: Current changes gradually - transitions in ~1 minute")
    print("=" * 70)
    
    # Initialize Firebase
    init_firebase()
    
    print("\n✓ Monitor started successfully!")
    print("📡 Waiting for operating hours to begin data transmission...")
    print("Press Ctrl+C to stop\n")
    
    last_reading_time = time.time()
    
    # Check if we're starting during operating hours - simulate motor startup
    now = datetime.now(IST)
    if is_operating_hours():
        print("🔧 Motor startup sequence initiated...")
        print("   Current will ramp up gradually over ~45-60 seconds\n")
        current_reading = 0.0  # Start from 0
        target_current = 28.0  # Target normal operating current
    
    while running:
        try:
            global last_status
            now = datetime.now(IST)
            
            if is_operating_hours():
                # Generate and send data (smooth, realistic transitions)
                current_value = generate_current_value(now.hour, now.minute)
                status = determine_status(current_value)
                timestamp_seconds = int(now.timestamp())
                
                # Log event
                log_event(timestamp_seconds, current_value, status)
                last_reading_time = time.time()
                
                # Log critical events (but only on status change to avoid spam)
                if status in ["OVERLOAD", "IDLE"] and status != last_status:
                    message = generate_log_message(status, current_value)
                    log_system_log(timestamp_seconds, status, message)
                
                last_status = status
                
                # Print status with target indicator
                status_icon = "⚡" if status == "EFFICIENT" else "⚠️" if status in ["OVERLOAD", "UNDERUSAGE"] else "💤" if status == "IDLE" else "✓"
                trend = "↗" if target_current > current_value + 1 else "↘" if target_current < current_value - 1 else "→"
                print(f"{status_icon} [{now.strftime('%Y-%m-%d %H:%M:%S')}] {status}: {current_value}A {trend} (target: {target_current:.1f}A)")
                
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
