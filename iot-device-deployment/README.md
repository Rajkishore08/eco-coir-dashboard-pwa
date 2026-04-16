# 🏭 IoT Device Deployment - Complete Guide

Deploy the IoT data simulator to **any device** (Raspberry Pi, server, cloud VM, etc.) to push real-time data to Firebase.

---

## 📦 What's Included

```
iot-device-deployment/
├── iot-device-simulator.py          # Main IoT simulator script
├── add-missing-data-april16.py      # Add specific MISSING event (April 16)
├── setup-iot-device.sh              # Quick setup script (Linux/Mac)
├── requirements.txt                  # Python dependencies
├── firebase-config.json             # Firebase web config (reference)
├── firebase-service-account.json    # Firebase credentials (download required)
└── README.md                        # This file
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Firebase Service Account Key

1. Go to: https://console.firebase.google.com/project/coir-tech-iot/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Download the JSON file
4. Rename it to: **`firebase-service-account.json`**
5. Place it in this folder

⚠️ **Keep this file secure** - it has admin access to Firebase!

### Step 2: Install Dependencies

```bash
# Install Python packages
pip3 install -r requirements.txt
```

Or use the setup script:
```bash
chmod +x setup-iot-device.sh
./setup-iot-device.sh
```

### Step 3: Run the Simulator

```bash
python3 iot-device-simulator.py
```

That's it! Data flows to Firebase every 15 seconds.

---

## 📊 What the Simulator Does

### Real-time Data Push (Every 15 Seconds)
1. **SENSOR_DATA**: Raw readings (current, voltage, temperature)
2. **LIVE_DATA**: Latest values (dashboard display)
3. **MACHINE_EVENT**: Status changes (analytics)
4. **SYSTEM_LOGS**: Critical events (alerts)

### Operating Schedule
- **8 AM - 6 PM IST**: Normal operation (realistic load patterns)
- **6 PM - 8 AM**: Idle state (minimal current)
- **End time variation**: Random 6:00-6:20 PM

### Status Types & Frequency
- **EFFICIENT**: 25-34A (75% of operation) - Green
- **OVERLOAD**: ≥35A (10% - triggers alerts) - Red
- **UNDERUSAGE**: 10-24A (7%) - Amber
- **IDLE**: ≤1A (8%) - Gray
- **MISSING**: Data gaps (2-3 times/day, 10-60 min each) - Dark Gray

### Missing Data Logic
- **Frequency**: 2-3 gaps per day maximum
- **Duration**: 10-60 minutes each
- **Detection**: Automatically logs gaps >45 seconds
- **Purpose**: Simulates network outages, maintenance, power cuts

---

## 🎯 Add Specific Missing Data (Optional)

To add a 2-hour MISSING event for **April 16, 2026 (5:00 PM - 6:58 PM)**:

```bash
python3 add-missing-data-april16.py
```

This demonstrates:
- Network outage scenarios
- System downtime tracking
- Data quality monitoring
- Alert system functionality

**Result**: April 16 will show ~2 hours of MISSING time in dashboard.

---

## 🔄 Run as Background Service

### Using screen (Quick)
```bash
screen -S iot
python3 iot-device-simulator.py
# Press Ctrl+A, then D to detach

# Reattach later
screen -r iot
```

### Using systemd (Production)

1. Create service file:
```bash
sudo nano /etc/systemd/system/iot-simulator.service
```

2. Add configuration:
```ini
[Unit]
Description=IoT Device Simulator
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/iot-device-deployment
ExecStart=/usr/bin/python3 iot-device-simulator.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. Enable and start:
```bash
sudo systemctl enable iot-simulator
sudo systemctl start iot-simulator
sudo systemctl status iot-simulator
```

---

## ⚙️ Configuration

### Change Sampling Rate
Edit `iot-device-simulator.py`:
```python
DATA_INTERVAL_SECONDS = 15  # Change to 5, 10, 30, 60, etc.
```

### Change Device ID (for multiple devices)
```python
DEVICE_ID = "device_02"  # Change from device_01
```

### Adjust Thresholds
```python
THRESHOLDS = {
    "overload_limit": 35,
    "efficient_min": 25,
    "efficient_max": 34,
    "underusage_limit": 10,
    "idle_threshold": 1,
    "missing_timeout": 45,
}
```

### Change Missing Data Frequency
```python
# Frequency (currently 2-3 times per day)
max_daily_gaps = random.randint(2, 3)  # Change to (1, 2) or (3, 4)

# Duration (currently 10-60 minutes)
gap_minutes = random.randint(10, 60)  # Change to (5, 30) or (20, 90)

# Probability (currently 0.3%)
random.random() < 0.003  # Lower = less frequent
```

### Disable Simulated Gaps (Production)
```python
max_daily_gaps = 0  # No simulated gaps
```

---

## 🖥️ Terminal Output

When running, you'll see:
```
🏭 IoT DEVICE SIMULATOR - STARTED

📡 Device: device_01
⏱️  Sampling Rate: 15 seconds
⚡ Operating Hours: 8:00 - 18:00 IST

🟢 OPERATING [Apr 17, 2026, 09:15:30 AM] EFFICIENT | 28.45A | 232V | 42.3°C | #1
🟢 OPERATING [Apr 17, 2026, 09:15:45 AM] EFFICIENT | 29.12A | 228V | 44.1°C | #2

⚠️  SIMULATING DATA GAP #1/3: 25 minutes...
✅ DATA CONNECTION RESTORED

Press Ctrl+C to stop
```

---

## 📋 Deployment Checklist

- [ ] Python 3.7+ installed
- [ ] Dependencies installed (`pip3 install -r requirements.txt`)
- [ ] `firebase-service-account.json` downloaded and placed
- [ ] Script runs successfully in foreground
- [ ] Data appearing in Firebase Console
- [ ] Dashboard showing live updates
- [ ] Service configured for auto-start (optional)

---

## 🆘 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'firebase_admin'"
```bash
pip3 install -r requirements.txt
```

### Error: "firebase-service-account.json not found"
Make sure the file is in the same directory as the script and named exactly `firebase-service-account.json`

### No Data in Firebase
1. Check internet connection
2. Verify Firebase credentials are correct
3. Check Firebase Console for errors
4. Look at script output for error messages

### Service Won't Start
```bash
# Test manually first
python3 iot-device-simulator.py

# Check logs
sudo journalctl -u iot-simulator -n 50
```

---

## 📊 Data Structure

### SENSOR_DATA Entry
```json
{
  "sensor_id": "uuid",
  "device_id": "device_01",
  "current_value": 28.45,
  "voltage": 232.15,
  "power_factor": 0.92,
  "temperature": 42.3,
  "timestamp": 1776369630,
  "date": "2026-04-17T03:45:30.000Z",
  "readable_date": "Apr 17, 2026, 09:15:30 AM"
}
```

### MACHINE_EVENT Entry
```json
{
  "event_id": "uuid",
  "device_id": "device_01",
  "current_value": 28.45,
  "status_type": "EFFICIENT",
  "event_time": 1776369630,
  "duration": 45,
  "date": "2026-04-17T03:45:30.000Z",
  "readable_date": "Apr 17, 2026, 09:15:30 AM"
}
```

### MISSING Event Entry
```json
{
  "event_id": "uuid",
  "device_id": "device_01",
  "current_value": 0,
  "status_type": "MISSING",
  "event_time": 1776369630,
  "duration": 2400,
  "date": "2026-04-17T03:45:30.000Z",
  "readable_date": "Apr 17, 2026, 09:15:30 AM"
}
```

---

## 📈 Performance

### Resource Usage (Raspberry Pi 4)
- **CPU**: <5% average
- **RAM**: ~50MB
- **Network**: ~1.5 KB per reading
- **Daily Data**: ~8.6 MB (5,760 readings)
- **Monthly**: ~260 MB

### Firebase Free Tier
- **Connections**: 100 (you use 1) ✅
- **Downloaded**: 10 GB/month (you use ~260 MB) ✅
- **Storage**: 1 GB (easily sufficient) ✅

---

## 🔐 Security

### Protect Credentials
```bash
chmod 600 firebase-service-account.json
```

### Never Commit
Already in `.gitignore`:
```
firebase-service-account.json
*-firebase-adminsdk-*.json
```

### Keep Updated
```bash
# Update packages regularly
pip3 install --upgrade firebase-admin pytz
```

---

## 🎯 Use Cases

1. **Development**: Test dashboard without real hardware
2. **Demos**: Show live data during presentations
3. **Training**: Train operators with realistic scenarios
4. **Testing**: Load test Firebase and dashboard
5. **Prototyping**: Develop features before hardware ready

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Script runs without errors
- ✅ New data in Firebase every 15 seconds
- ✅ Dashboard updates in real-time
- ✅ Status changes logged correctly
- ✅ Missing data events appear (if enabled)
- ✅ Service restarts automatically on failure (if configured)

---

## 📞 Quick Commands

```bash
# Run simulator
python3 iot-device-simulator.py

# Add missing data for April 16
python3 add-missing-data-april16.py

# Check service status
sudo systemctl status iot-simulator

# View logs
sudo journalctl -u iot-simulator -f

# Stop service
sudo systemctl stop iot-simulator

# Restart service
sudo systemctl restart iot-simulator
```

---

## 🎉 You're All Set!

Your IoT device simulator is ready to:
- ✅ Push realistic data every 15 seconds
- ✅ Follow operating hours automatically (8 AM - 6 PM IST)
- ✅ Generate appropriate status changes
- ✅ Simulate missing data scenarios (2-3 times/day, 10-60 min)
- ✅ Update your dashboard in real-time

**Deploy it and watch your dashboard come alive!** 🚀

---

**Made for**: Eco-Coir Smart Factory IoT System  
**Version**: 1.0  
**Date**: April 2026
