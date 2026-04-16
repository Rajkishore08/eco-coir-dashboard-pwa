#!/usr/bin/env python3
"""
Add Missing Data Event for April 16, 2026
==========================================
Creates a MISSING status event from 5:00 PM to 6:58 PM IST (118 minutes gap)
"""

import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime
import pytz
import uuid

# Firebase Configuration
FIREBASE_CONFIG = {
    "databaseURL": "https://coir-tech-iot-default-rtdb.firebaseio.com"
}

SERVICE_ACCOUNT_KEY = "firebase-service-account.json"
DEVICE_ID = "device_01"

# IST Timezone
IST = pytz.timezone('Asia/Kolkata')

def generate_uuid():
    """Generate unique ID"""
    return str(uuid.uuid4())

def main():
    print('========================================')
    print('Adding MISSING Data Event for April 16')
    print('========================================\n')
    
    # Initialize Firebase
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
        firebase_admin.initialize_app(cred, FIREBASE_CONFIG)
        print("✅ Firebase initialized successfully\n")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return
    
    firebase_db = db.reference('/')
    
    # Define missing data period
    # April 16, 2026, 5:00 PM IST
    missing_start = IST.localize(datetime(2026, 4, 16, 17, 0, 0))  # 5:00 PM
    missing_end = IST.localize(datetime(2026, 4, 16, 18, 58, 0))   # 6:58 PM
    
    # Calculate duration
    duration_seconds = int((missing_end - missing_start).total_seconds())
    duration_minutes = duration_seconds // 60
    
    print(f"📅 Date: April 16, 2026")
    print(f"⏰ Start: 5:00 PM IST")
    print(f"⏰ End: 6:58 PM IST")
    print(f"⏱️  Duration: {duration_minutes} minutes ({duration_seconds} seconds)\n")
    
    # Create MISSING event
    event_id = generate_uuid()
    event_timestamp = int(missing_start.timestamp())
    
    print(f"Creating MISSING event...")
    
    firebase_db.child('MACHINE_EVENT').child(event_id).set({
        'event_id': event_id,
        'device_id': DEVICE_ID,
        'current_value': 0,
        'status_type': 'MISSING',
        'event_time': event_timestamp,
        'duration': duration_seconds,
        'date': missing_start.isoformat(),
        'readable_date': missing_start.strftime('%b %d, %Y, %I:%M:%S %p')
    })
    
    print(f"✅ MACHINE_EVENT created: {event_id}")
    
    # Create system log
    log_id = generate_uuid()
    
    firebase_db.child('SYSTEM_LOGS').child(log_id).set({
        'log_id': log_id,
        'device_id': DEVICE_ID,
        'log_type': 'ERROR',
        'message': f'Data connection lost for {duration_minutes} minutes (5:00 PM - 6:58 PM). Sensor readings unavailable.',
        'timestamp': event_timestamp,
        'date': missing_start.isoformat(),
        'readable_date': missing_start.strftime('%b %d, %Y, %I:%M:%S %p')
    })
    
    print(f"✅ SYSTEM_LOG created: {log_id}")
    
    print('\n========================================')
    print('✅ Missing Data Event Added Successfully!')
    print('========================================\n')
    print(f"Summary:")
    print(f"  - Event ID: {event_id}")
    print(f"  - Date: April 16, 2026")
    print(f"  - Time: 5:00 PM - 6:58 PM IST")
    print(f"  - Duration: {duration_minutes} minutes")
    print(f"  - Status: MISSING")
    print(f"\n🔍 Check your dashboard at:")
    print(f"   Daily Analysis → Single Day View → Apr 16, 2026")
    print(f"\nYou should now see ~2 hours of MISSING time!")

if __name__ == "__main__":
    main()
