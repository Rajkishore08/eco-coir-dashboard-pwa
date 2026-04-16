# Eco-Coir Dashboard PWA

IoT-based real-time monitoring dashboard for coir processing operations with Firebase integration.

## Important Notes

- **Water Monitoring**: Not available (sensor not installed)
- **Solar Generation**: Not part of system infrastructure
- **All data**: Sourced from Firebase Realtime Database in real-time

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
Open http://localhost:3000/dashboard

**Available Pages**:
- `/dashboard` - Main overview with live metrics
- `/dashboard/live` - Detailed live monitoring
- `/dashboard/power` - Power/current consumption analysis
- `/dashboard/analytics` - Historical analytics and insights
- `/dashboard/daily-analysis` - ⭐ **NEW** Day-wise breakdown and metrics
- `/dashboard/alerts` - System alerts and notifications
- `/dashboard/water` - Shows "not available" message
- `/dashboard/settings` - System configuration

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

### Collections (All Used in Dashboard)
```
Firebase Realtime Database
├── DEVICE_INFO       # Device metadata (device name, location, status)
├── LIVE_DATA         # Current values (real-time display)
├── SENSOR_DATA       # Raw readings (15-second intervals)
├── MACHINE_EVENT     # Status change events (analytics)
├── THRESHOLD_CONFIG  # System limits (editable via Firebase Console)
└── SYSTEM_LOGS       # Event logs (alerts page)
```

**Note**: WATER_USAGE collection is not used (sensor not installed)

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

### Dashboard
- `npm run dev` - Start development server
- `npm run build` - Build for production

### Data Generation (Historical)
- `npm run generate-perfect-data` - Generate complete historical data (April 3-9)
- `npm run add-current-week` - Add current week data (April 10-17)
- `npm run add-missing-april16` - Add 2-hour MISSING data gap on April 16 (5PM-7PM)
- `npm run clear-firebase` - Clear all Firebase data

### Real-time Simulation ⭐ NEW

#### Option 1: Standalone Python (Recommended for Production)
```bash
cd iot-device-deployment/
python3 iot-device-simulator.py
```
- ✅ **Can run on separate device** (Raspberry Pi, server, etc.)
- ✅ Production-ready with systemd service
- ✅ No Node.js required
- ✅ All deployment files in `iot-device-deployment/` folder
- 📖 See [iot-device-deployment/README.md](iot-device-deployment/README.md) for quick start
- 📖 See [iot-device-deployment/QUICKSTART-IOT-DEVICE.md](iot-device-deployment/QUICKSTART-IOT-DEVICE.md) for 5-min setup
- 📖 See [iot-device-deployment/IOT-DEPLOYMENT-GUIDE.md](iot-device-deployment/IOT-DEPLOYMENT-GUIDE.md) for full documentation

#### Option 2: TypeScript (Development Only)
```bash
npm run iot-simulator
```
- For local testing only
- Requires Node.js environment
- 📖 See [IOT-SIMULATOR-GUIDE.md](IOT-SIMULATOR-GUIDE.md) for details

**Both simulators**:
- Push data every 15 seconds (like real hardware)
- Follow operating hours (8 AM - 6 PM IST)
- Update dashboard in real-time

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
- Mill operational hours: 8 AM - 6 PM (in database, not UI restriction)
- Mill down: April 7-9 (Tuesday-Thursday)
- Total data points: ~40,320 across 7 days (historical)
- **Real-time mode**: Use `npm run iot-simulator` for continuous live data
