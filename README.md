# Eco-Coir Dashboard PWA

IoT-based real-time monitoring dashboard for coir processing operations with Firebase integration.

## Quick Start

### Step 1: Clear Firebase (if needed)
```bash
npm run clear-firebase
```
This removes all existing data from Firebase.

### Step 2: Import Initial Data (April 3-6)

The `firebase-data.json` file is ready in the project root.

Import to Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/project/coir-tech-iot/database/coir-tech-iot-default-rtdb/data)
2. Click the 3-dot menu → Import JSON
3. Select `firebase-data.json` (7.4MB)
4. Click Import

### Step 3: Add Remaining Days (April 7-9)
```bash
npm run add-remaining-days
```
This adds April 7-9 data (mill down period) directly to Firebase.

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: View Dashboard
http://localhost:3000/dashboard/live

## Data Details

### Date Range
- **April 3-6, 2026**: Normal operation (8 AM - 6 PM)
- **April 7-9, 2026**: Mill down (idle, <0.5 A)

### Data Format
Each sensor reading includes:
```json
{
  "sensor_id": "uuid",
  "device_id": "device_01",
  "current_value": 28.5,
  "timestamp": 1775154600,
  "date": "2026-04-02T18:30:00.000Z",
  "readable_date": "Apr 3, 2026, 12:00:00 AM"
}
```

### Collections
```
Firebase Realtime Database
├── DEVICE_INFO       # Device metadata
├── LIVE_DATA         # Current values
├── SENSOR_DATA       # Raw readings (15-second intervals)
├── MACHINE_EVENT     # Status change events
├── THRESHOLD_CONFIG  # System limits (editable)
└── SYSTEM_LOGS       # Event logs
```

### Status Classification
- **EFFICIENT**: 25-34 A (normal operation)
- **OVERLOAD**: ≥35 A (excessive load)
- **UNDERUSAGE**: 5-10 A (below optimal)
- **IDLE**: ≤1 A (machine stopped)
- **MISSING**: null (no data)

## Configuration

### Editable Thresholds (in Firebase)
```json
{
  "overload_limit": 35,
  "underusage_limit": 10,
  "idle_threshold": 1,
  "missing_timeout": 20,
  "data_interval_seconds": 15
}
```

Edit these values in Firebase Console under `THRESHOLD_CONFIG/device_01`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate-data` - Generate 4-day JSON file (April 3-6)
- `npm run add-remaining-days` - Add April 7-9 to Firebase
- `npm run clear-firebase` - Clear all Firebase data

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Firebase Realtime Database
- TypeScript
- Tailwind CSS
- Recharts
- Radix UI Components

## Notes

- Data interval: 15 seconds (consistent, no gaps)
- Water consumption: Not implemented (sensor not installed)
- Solar energy: Not included in this project
- Mill operational hours: 8 AM - 6 PM (April 3-6)
- Mill down: April 7-9 (Tuesday-Thursday)
- Total data points: ~40,320 across 7 days
