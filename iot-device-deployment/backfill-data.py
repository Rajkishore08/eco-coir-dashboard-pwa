#!/usr/bin/env python3
"""
Backfill Historical Data Script
================================
Checks the last timestamp in the database and generates data from there to now.

Usage:
    python3 backfill-data.py
"""

import firebase_admin
from firebase_admin import credentials, db
import time
import math
import random
from datetime import datetime, timedelta
import uuid
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
OPERATION_END_HOUR = 18  # 6 PM base time
OPERATION_END_RANDOM_MINUTES = 30  # Can extend 0-30 minutes after 6 PM

# Thresholds
THRESHOLDS = {
    "overload_limit": 35,
    "efficient_min": 25,
    "efficient_max": 34,
    "underusage_limit": 10,
    "idle_threshold": 1,
}

# Missing data simulation (random)
MISSING_DATA_PROBABILITY = 0.1  # 10% chance per day

# IST timezone
IST = pytz.timezone('Asia/Kolkata')

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
# DATA GENERATION FUNCTIONS
# ============================================================================

def generate_current_value(hour, minute):
    """Generate realistic current values based on time of day"""
    # Base pattern: higher during mid-day
    time_factor = math.sin((hour - OPERATION_START_HOUR) * math.pi / 
                           (OPERATION_END_HOUR - OPERATION_START_HOUR))
    
    base_current = 28 + (8 * time_factor)
    noise = random.gauss(0, 3)
    current = max(0, base_current + noise)
    
    # Occasional variations
    rand = random.random()
    if rand < 0.05:  # 5% chance overload
        current = random.uniform(35, 42)
    elif rand < 0.15:  # 10% chance underusage
        current = random.uniform(5, 15)
    elif rand < 0.20:  # 5% chance idle
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
# BACKFILL LOGIC
# ============================================================================

def get_last_timestamp():
    """Get the last timestamp from the database"""
    print("\n🔍 Checking last timestamp in database...")
    
    # Get all machine events - structure is MACHINE_EVENT/{event_id}/{event_data}
    events_ref = db.reference("MACHINE_EVENT")
    all_events = events_ref.get()
    
    if not all_events:
        print("⚠ No data found in MACHINE_EVENT")
        return None
    
    print(f"✓ Found data in database")
    
    # Find the maximum event_time
    max_timestamp = 0
    total_events = 0
    
    for event_id, event_data in all_events.items():
        if isinstance(event_data, dict) and 'event_time' in event_data:
            total_events += 1
            timestamp = event_data['event_time']
            if timestamp > max_timestamp:
                max_timestamp = timestamp
    
    print(f"✓ Total events found: {total_events}")
    
    if max_timestamp > 0:
        last_dt = datetime.fromtimestamp(max_timestamp, tz=IST)
        print(f"✓ Last data point: {last_dt.strftime('%Y-%m-%d %H:%M:%S IST')}")
        return max_timestamp
    else:
        print("⚠ No valid timestamps found in database")
        return None

def get_day_end_time(date):
    """Get random end time for a specific day (6:00 PM to 6:30 PM)"""
    random_minutes = random.randint(0, OPERATION_END_RANDOM_MINUTES)
    end_time = date.replace(hour=OPERATION_END_HOUR, minute=random_minutes, second=0, microsecond=0)
    return end_time

def should_have_missing_data(date):
    """Randomly determine if a day should have missing data"""
    # Use date as seed for consistency
    random.seed(f"{date.year}-{date.month}-{date.day}")
    has_missing = random.random() < MISSING_DATA_PROBABILITY
    random.seed()  # Reset seed
    return has_missing

def backfill_data(start_timestamp):
    """Generate and insert data from start_timestamp to now"""
    now = datetime.now(IST)
    start_dt = datetime.fromtimestamp(start_timestamp, tz=IST)
    
    # Start from next interval after last timestamp
    current_dt = start_dt + timedelta(seconds=DATA_INTERVAL_SECONDS)
    
    print(f"\n📊 Generating data from {current_dt.strftime('%Y-%m-%d %H:%M:%S')} to {now.strftime('%Y-%m-%d %H:%M:%S')}")
    
    total_points = 0
    points_added = 0
    day_end_times = {}  # Cache end times per day
    missing_data_days = {}  # Track missing data periods per day
    
    while current_dt <= now:
        current_date = current_dt.date()
        
        # Get or calculate end time for this day
        if current_date not in day_end_times:
            day_end_times[current_date] = get_day_end_time(current_dt)
        
        day_end = day_end_times[current_date]
        
        # Check operating hours (8 AM to random time between 6:00-6:30 PM)
        start_time = current_dt.replace(hour=OPERATION_START_HOUR, minute=0, second=0, microsecond=0)
        
        if start_time <= current_dt <= day_end:
            # Check if this day should have missing data
            if current_date not in missing_data_days:
                missing_data_days[current_date] = should_have_missing_data(current_dt)
            
            # Skip data generation if in missing period (randomly determined)
            # Generate missing data period if applicable (10-60 min gap)
            in_missing_period = False
            
            if missing_data_days[current_date]:
                # Create a random missing period for this day (once per day)
                random.seed(f"missing-{current_date}")
                missing_start_hour = random.randint(OPERATION_START_HOUR + 1, OPERATION_END_HOUR - 2)
                missing_duration_minutes = random.randint(10, 60)
                random.seed()  # Reset
                
                missing_start = current_dt.replace(hour=missing_start_hour, minute=0, second=0, microsecond=0)
                missing_end = missing_start + timedelta(minutes=missing_duration_minutes)
                
                if missing_start <= current_dt <= missing_end:
                    in_missing_period = True
            
            if not in_missing_period:
                current_value = generate_current_value(current_dt.hour, current_dt.minute)
                status = determine_status(current_value)
                
                timestamp_seconds = int(current_dt.timestamp())
                
                # Log event
                log_event(timestamp_seconds, current_value, status)
                points_added += 1
                
                # Log critical events
                if status in ["OVERLOAD", "IDLE"]:
                    message = f"{status}: Current at {current_value}A"
                    log_system_log(timestamp_seconds, status, message)
                
                total_points += 1
                
                # Progress indicator
                if total_points % 100 == 0:
                    print(f"  Generated {total_points} data points... (latest: {current_dt.strftime('%Y-%m-%d %H:%M')})")
        
        current_dt += timedelta(seconds=DATA_INTERVAL_SECONDS)
    
    print(f"\n✓ Backfill complete!")
    print(f"  Total data points generated: {points_added}")
    print(f"  Time range: {datetime.fromtimestamp(start_timestamp, tz=IST).strftime('%Y-%m-%d %H:%M:%S')} to {now.strftime('%Y-%m-%d %H:%M:%S')}")

# ============================================================================
# MAIN
# ============================================================================

def main():
    print("=" * 70)
    print("IoT Data Backfill Script")
    print("=" * 70)
    
    # Initialize Firebase
    init_firebase()
    
    # Get last timestamp
    last_timestamp = get_last_timestamp()
    
    now = datetime.now(IST)
    
    if last_timestamp is None:
        print("\n⚠️  No existing data found in database.")
        print("\n📅 Would you like to generate initial data?")
        print("   Option 1: Generate data from April 1, 2026")
        print("   Option 2: Generate data from 7 days ago")
        print("   Option 3: Generate data from 30 days ago")
        print("   Option 4: Cancel")
        
        choice = input("\nEnter your choice (1/2/3/4): ").strip()
        
        if choice == '1':
            start_date = IST.localize(datetime(2026, 4, 1, OPERATION_START_HOUR, 0, 0))
        elif choice == '2':
            start_date = now - timedelta(days=7)
            start_date = start_date.replace(hour=OPERATION_START_HOUR, minute=0, second=0, microsecond=0)
        elif choice == '3':
            start_date = now - timedelta(days=30)
            start_date = start_date.replace(hour=OPERATION_START_HOUR, minute=0, second=0, microsecond=0)
        else:
            print("❌ Operation cancelled.")
            return
        
        last_timestamp = int(start_date.timestamp())
        print(f"\n✓ Will generate data starting from: {start_date.strftime('%Y-%m-%d %H:%M:%S IST')}")
        
        response = input("\n⚠ Proceed? (yes/no): ").strip().lower()
        if response != 'yes':
            print("❌ Backfill cancelled.")
            return
        
        # Perform backfill from chosen start date
        backfill_data(last_timestamp)
        print("\n✅ All done! Your database has been initialized with data.")
        return
    
    # Check if we're already up to date
    last_dt = datetime.fromtimestamp(last_timestamp, tz=IST)
    time_diff = now - last_dt
    
    if time_diff.total_seconds() < DATA_INTERVAL_SECONDS:
        print(f"\n✓ Database is up to date! Last data point was {time_diff.total_seconds():.0f} seconds ago.")
        return
    
    print(f"\n⏰ Time gap detected: {time_diff}")
    print(f"   Last data: {last_dt.strftime('%Y-%m-%d %H:%M:%S IST')}")
    print(f"   Current:   {now.strftime('%Y-%m-%d %H:%M:%S IST')}")
    
    # Confirm before proceeding
    response = input("\n⚠ Proceed with backfill? (yes/no): ").strip().lower()
    if response != 'yes':
        print("❌ Backfill cancelled.")
        return
    
    # Perform backfill
    backfill_data(last_timestamp)
    
    print("\n✅ All done! Your database is now up to date.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Backfill interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
