# IoT Device Monitoring Guide

Complete guide for running the IoT monitoring system for the EcoCoir mill.

## 📋 Available Scripts

### 1. **Backfill Data** (One-time historical data)
Fills in missing data from the last timestamp to now.

```bash
npm run backfill-data
```

**When to use:**
- After setting up the system for the first time
- After any downtime to fill in missing historical data
- To catch up data from yesterday to today

**Features:**
- ✅ Checks last timestamp in database
- ✅ Generates data for operating hours only (8 AM - random 6:00-6:30 PM)
- ✅ Adds random missing data periods (10% chance per day)
- ✅ Skips non-operating hours automatically

---

### 2. **Operating Hours Monitor** (Continuous real-time)
Runs continuously and sends data every 15 seconds during operating hours.

```bash
npm run monitor-operating
```

**When to use:**
- Run this script on your IoT device (Raspberry Pi, server, etc.)
- For real-time data simulation during mill operating hours
- Primary script for production use

**Features:**
- ⚡ Sends data every 15 seconds
- 🕐 Only during operating hours (8 AM to random 6:00-6:30 PM)
- 📊 Realistic current variations
- 🚨 Logs critical events (OVERLOAD, IDLE)
- 💤 Automatically waits outside operating hours

**To run in background:**
```bash
# Using screen
screen -S operating-monitor
npm run monitor-operating
# Press Ctrl+A then D to detach

# Using nohup
nohup npm run monitor-operating > operating-monitor.log 2>&1 &
```

---

### 3. **Idle Hours Monitor** (Continuous idle logging)
Runs continuously and logs idle status when machine is NOT operating.

```bash
npm run monitor-idle
```

**When to use:**
- Run alongside the operating monitor
- Logs machine idle state outside operating hours
- Provides complete 24/7 coverage

**Features:**
- 💤 Logs idle status every 5 minutes
- 🕐 Only logs outside operating hours
- 📝 Creates hourly system logs (to avoid spam)
- 🔇 Standby mode during operating hours

**To run in background:**
```bash
# Using screen
screen -S idle-monitor
npm run monitor-idle
# Press Ctrl+A then D to detach

# Using nohup
nohup npm run monitor-idle > idle-monitor.log 2>&1 &
```

---

## 🚀 Complete Setup Instructions

### Step 1: Initial Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Place your Firebase credentials
cp your-firebase-key.json firebase-service-account.json
```

### Step 2: Fill Historical Data
```bash
# Check and fill any missing data
npm run backfill-data
```

### Step 3: Start Continuous Monitoring
Open two terminal windows/sessions:

**Terminal 1 - Operating Hours:**
```bash
npm run monitor-operating
```

**Terminal 2 - Idle Hours:**
```bash
npm run monitor-idle
```

---

## 📊 Operating Logic

### Operating Hours
- **Start:** 8:00 AM IST (fixed)
- **End:** Random between 6:00 PM - 6:30 PM IST (varies daily)
- **Data Frequency:** Every 15 seconds
- **Current Range:** 0A - 42A (realistic variations)

### Status Thresholds
| Status | Current Range | Description |
|--------|---------------|-------------|
| IDLE | 0A - 1A | Machine not running |
| UNDERLOAD | 1A - 10A | Machine underutilized |
| NORMAL | 10A - 25A | Normal operation |
| EFFICIENT | 25A - 34A | Optimal performance |
| OVERLOAD | 35A+ | Exceeding safe limits |

### Missing Data
- **Frequency:** Random, ~10% chance per day
- **Duration:** 10-60 minutes per occurrence
- **Purpose:** Simulates real network/power outages

---

## 🛠️ Production Deployment

### Option 1: Using systemd (Recommended for Linux)

Create service files:

**`/etc/systemd/system/ecocoir-operating.service`**
```ini
[Unit]
Description=EcoCoir Operating Hours Monitor
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/iot-device-deployment
ExecStart=/usr/bin/python3 operating-hours-monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**`/etc/systemd/system/ecocoir-idle.service`**
```ini
[Unit]
Description=EcoCoir Idle Hours Monitor
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/iot-device-deployment
ExecStart=/usr/bin/python3 idle-hours-monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ecocoir-operating.service
sudo systemctl enable ecocoir-idle.service
sudo systemctl start ecocoir-operating.service
sudo systemctl start ecocoir-idle.service

# Check status
sudo systemctl status ecocoir-operating.service
sudo systemctl status ecocoir-idle.service
```

### Option 2: Using screen (Quick setup)
```bash
# Start operating monitor
screen -S operating -dm bash -c "cd iot-device-deployment && python3 operating-hours-monitor.py"

# Start idle monitor
screen -S idle -dm bash -c "cd iot-device-deployment && python3 idle-hours-monitor.py"

# List running screens
screen -ls

# Attach to a screen
screen -r operating
screen -r idle
```

---

## 📝 Monitoring & Logs

### Check Running Status
```bash
# List all screens
screen -ls

# View logs (if using nohup)
tail -f operating-monitor.log
tail -f idle-monitor.log

# Check systemd logs
sudo journalctl -u ecocoir-operating.service -f
sudo journalctl -u ecocoir-idle.service -f
```

### Stop Services
```bash
# If using screen
screen -r operating  # Then press Ctrl+C
screen -r idle       # Then press Ctrl+C

# If using systemd
sudo systemctl stop ecocoir-operating.service
sudo systemctl stop ecocoir-idle.service
```

---

## 🔍 Troubleshooting

### Script not connecting to Firebase
1. Check credentials file exists: `firebase-service-account.json`
2. Verify Firebase URL in script
3. Check network connectivity

### No data during operating hours
1. Verify current time is between 8 AM - 6:30 PM IST
2. Check if `today_end_time` was properly generated
3. Restart the operating monitor

### Both monitors running simultaneously
- This is correct! They complement each other:
  - Operating monitor: Handles 8 AM - 6:30 PM
  - Idle monitor: Handles outside those hours

### Data gaps in dashboard
1. Check both monitors are running
2. Verify Firebase connection
3. Run backfill script to fill gaps

---

## 📞 Support

For issues or questions, refer to:
- Main README: `../README.md`
- IoT Deployment: `./README.md`
- Missing Data Logic: `./MISSING-DATA-DETECTION.md`
