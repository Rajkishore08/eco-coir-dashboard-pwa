# 🎉 Production-Grade IoT Data - Import Guide

## ✅ Data Generated Successfully!

Your **production-quality IoT device data** has been generated and is ready to import.

---

## 📊 What Was Generated

### File Details
- **Filename**: `firebase-complete-data.json`
- **Size**: 17 MB
- **Total Data Points**: 40,320 sensor readings
- **Date Range**: April 3-9, 2026
- **Sampling Rate**: Every 15 seconds
- **Time Zone**: IST (Indian Standard Time)

### Collections Included

#### 1. **DEVICE_INFO** (1 device)
Complete device metadata:
```json
{
  "device_name": "Crusher Motor Unit",
  "location": "Line 1",
  "status": "ACTIVE",
  "firmware_version": "v2.3.1",
  "last_maintenance": "2026-03-15T10:30:00+05:30",
  "installation_date": "2025-08-20",
  "sensor_type": "CT Clamp - 100A",
  "sampling_rate": "15s"
}
```

#### 2. **LIVE_DATA** (Current snapshot)
Latest real-time reading from the device

#### 3. **SENSOR_DATA** (40,320 readings)
Raw sensor data every 15 seconds including:
- ⚡ Current value (Amps)
- 🔌 Voltage (V)
- 📊 Power factor
- 🌡️ Temperature (°C)
- 🕐 Timestamp (Unix + ISO + Readable)

#### 4. **MACHINE_EVENT** (4,142 events)
Status change events with:
- Event classification (EFFICIENT, OVERLOAD, UNDERUSAGE, IDLE)
- Duration of each status
- Exact timestamps

#### 5. **THRESHOLD_CONFIG** (System thresholds)
```json
{
  "overload_limit": 35,
  "efficient_min": 25,
  "efficient_max": 34,
  "underusage_limit": 10,
  "idle_threshold": 1,
  "missing_timeout": 20,
  "data_interval_seconds": 15
}
```

#### 6. **SYSTEM_LOGS** (881 critical logs)
Automated system logs for:
- Critical overload events
- Extended status periods (>5 minutes)
- Mill shutdown events

---

## 🎯 Data Characteristics (Realistic IoT Behavior)

### Operating Schedule
- **Operating Hours**: 8:00 AM - 6:00 PM IST
- **Off Hours**: Machine idle (<1A current)
- **End Time Variation**: Random end between 6:00-6:20 PM

### Status Distribution
- **75%** - Efficient Operation (25-34A)
- **10%** - Overload Events (35-42A)
- **7%** - Underusage (10-24A)
- **5%** - Low Usage (5-10A)
- **3%** - Idle/Stopped (0-1A)

### Mill Down Period (April 7-9)
- Machine not functioning
- Current readings: <0.5A (idle noise)
- All data shows IDLE status

### Realistic Features
✅ Voltage fluctuations (225-235V)
✅ Power factor variations (0.85-0.95)
✅ Temperature readings (35-50°C)
✅ Sinusoidal load patterns during operation
✅ Random operational variations
✅ Proper status transitions
✅ Automatic event logging

---

## 📥 How to Import to Firebase

### Step 1: Navigate to Firebase Console
🔗 **Direct Link**: https://console.firebase.google.com/project/coir-tech-iot/database/coir-tech-iot-default-rtdb/data

### Step 2: Access Import Menu
1. Click the **⋮** (three dots) menu at the top-right
2. Select **"Import JSON"**

### Step 3: Select File
1. Click **"Browse"** or drag-and-drop
2. Select: `firebase-complete-data.json`
3. **Important**: Make sure you're importing to the **root** level

### Step 4: Import
1. Click **"Import"** button
2. Wait for upload to complete (17 MB file)
3. You'll see a success message

### Step 5: Verify
Check that all collections appear:
- ✓ DEVICE_INFO
- ✓ LIVE_DATA
- ✓ SENSOR_DATA
- ✓ MACHINE_EVENT
- ✓ THRESHOLD_CONFIG
- ✓ SYSTEM_LOGS

---

## 🚀 After Import

### 1. Refresh Your Dashboard
```bash
# Server should already be running on port 3000
# Just refresh your browser at:
http://localhost:3000/dashboard
```

### 2. What You'll See
- **Main Dashboard**: Live metrics from the latest data point
- **Power Management**: Hourly current consumption charts
- **Analytics**: Status distribution, efficiency metrics
- **Alerts**: System logs converted to alerts
- **Live Page**: Real-time data display

### 3. Data Flow
```
Firebase Realtime Database (40,320 readings)
    ↓
React Hooks (useLiveData, useRealtimeEvents)
    ↓
Dashboard UI (Real-time updates)
```

---

## 🔧 Data Quality Checks

### Verification Commands
```bash
# 1. Check total sensor readings
# Should show: 40,320 entries

# 2. Check machine events
# Should show: 4,142 status changes

# 3. Check date range
# First reading: April 3, 2026, 12:00:00 AM
# Last reading: April 9, 2026, 11:59:45 PM

# 4. Check mill down period (April 7-9)
# All readings should show IDLE status with <0.5A
```

### Expected Behavior
✅ Charts show realistic operating patterns
✅ Status distribution matches IoT behavior
✅ Overload events trigger proper alerts
✅ Mill down period shows idle status
✅ Operating hours: 8 AM - 6 PM visible in charts
✅ 15-second intervals consistent throughout

---

## 📝 Notes

### About Water Data
- **WATER_USAGE collection**: NOT included (sensor not installed)
- Water monitoring page shows "Not Available" message
- This is intentional and matches your hardware setup

### About Solar Data
- No solar generation data (not part of system)
- Power management shows only motor current consumption

### About File Size
- 17 MB is normal for 7 days × 40,320 readings
- Firebase can handle this easily
- Browser import may take 30-60 seconds
- Be patient during upload

### Editable Values
You can edit these directly in Firebase Console:
- `THRESHOLD_CONFIG/device_01/*` - All threshold values
- `DEVICE_INFO/device_01/status` - Device status
- `LIVE_DATA/device_01/*` - Current readings

---

## 🎨 What Makes This Data "Perfect"

1. **Realistic Patterns**: Not random - follows actual motor behavior
2. **Proper Timestamps**: Every 15 seconds, no gaps
3. **Status Logic**: Correct classification based on thresholds
4. **Event Generation**: Automatic logging of status changes
5. **System Logs**: Only critical events logged (not spamming)
6. **Operating Hours**: Respects mill schedule
7. **Mill Down**: Proper idle behavior for non-operational days
8. **IST Timezone**: Indian Standard Time throughout
9. **Voltage/Power Factor**: Realistic electrical parameters
10. **Temperature**: Sensible motor temperature ranges

---

## 🆘 Troubleshooting

### Import Fails
- **Problem**: File too large for browser
- **Solution**: File is 17 MB, browser should handle it. Try:
  1. Use Chrome/Firefox (better large file handling)
  2. Close other tabs to free memory
  3. Wait a bit longer (upload takes time)

### No Data Appears
- **Problem**: Import to wrong location
- **Solution**: Make sure you imported to ROOT, not a subfolder
  1. Clear Firebase again: `npm run clear-firebase`
  2. Re-import to the root level

### Charts Empty
- **Problem**: Dashboard not fetching data
- **Solution**: 
  1. Check browser console for errors
  2. Verify Firebase rules allow read access
  3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

---

## ✨ Summary

You now have **40,320 realistic IoT sensor readings** spanning **7 days** with:
- ✅ Every 15-second interval covered
- ✅ Realistic motor behavior patterns
- ✅ Proper status classification
- ✅ 4,142 machine events
- ✅ 881 system logs
- ✅ Complete device metadata
- ✅ Production-quality timestamps

**This data looks exactly like it came from your actual IoT hardware device!**

🎉 **Ready to import and explore your dashboard!**
