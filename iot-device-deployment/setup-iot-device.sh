#!/bin/bash
# Quick Setup Script for IoT Device Simulator
# Run this on your Raspberry Pi or Linux device

set -e

echo "========================================="
echo "🏭 IoT Device Simulator - Quick Setup"
echo "========================================="
echo ""

# Check if Python 3 is installed
echo "📦 Checking Python 3..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Installing..."
    sudo apt update
    sudo apt install python3 python3-pip -y
else
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Found: $PYTHON_VERSION"
fi

# Check if pip3 is installed
echo "📦 Checking pip3..."
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Installing..."
    sudo apt install python3-pip -y
else
    echo "✅ pip3 is installed"
fi

# Install Python dependencies
echo ""
echo "📥 Installing Python packages..."
pip3 install firebase-admin pytz

# Check if firebase-service-account.json exists
echo ""
if [ ! -f "firebase-service-account.json" ]; then
    echo "⚠️  WARNING: firebase-service-account.json not found!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to: https://console.firebase.google.com/project/coir-tech-iot/settings/serviceaccounts/adminsdk"
    echo "2. Click 'Generate new private key'"
    echo "3. Download the JSON file"
    echo "4. Rename it to 'firebase-service-account.json'"
    echo "5. Place it in this directory: $(pwd)"
    echo ""
    read -p "Press Enter when done..."
fi

# Make Python script executable
chmod +x iot-device-simulator.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "========================================="
echo "🚀 Quick Start"
echo "========================================="
echo ""
echo "Test run (foreground):"
echo "  python3 iot-device-simulator.py"
echo ""
echo "Run in background (screen):"
echo "  screen -S iot-simulator"
echo "  python3 iot-device-simulator.py"
echo "  Press Ctrl+A, then D to detach"
echo ""
echo "Set up as system service:"
echo "  See IOT-DEPLOYMENT-GUIDE.md for detailed instructions"
echo ""
echo "========================================="
