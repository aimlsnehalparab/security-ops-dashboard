# 🛡 Security Operations Dashboard

A full-stack Security Monitoring & Threat Detection Dashboard built using MERN stack.

This project simulates real-world SOC (Security Operations Center) detection logic including adaptive threat detection and behavioral analysis.

---

## 🚀 Features

### 🔐 Authentication System
- Email + Password login
- 6-digit MFA verification
- IP Whitelisting (Allowed IPs)
- IP Blacklisting
- Account Lock after suspicious behavior

---

### 🧠 Detection Logic Implemented

#### 1️⃣ Multi-IP Detection
Detects when a single user logs in from multiple IP addresses within a short time window.

#### 2️⃣ Impossible Travel Detection
Detects login attempts from geographically impossible distances in short time.

Uses:
- GeoIP lookup
- Velocity calculation
- Travel speed threshold logic

#### 3️⃣ Multiple Failed Login Detection
Triggers alert when failed attempts exceed defined threshold.

#### 4️⃣ Bot Detection Engine
Risk scoring based on:
- Missing User-Agent header
- Missing device fingerprint
- Abnormal request behavior

#### 5️⃣ MITRE ATT&CK Mapping
Alerts tagged with MITRE Technique IDs for real-world threat modeling.

---

## 📊 Dashboard Capabilities

- User Risk Summary
- Risk Distribution Overview
- Alert Monitoring
- Travel Alerts
- Bot Intelligence Engine
- Behavioral Signal Tracking

---

## 🛠 Tech Stack

Frontend:
- React.js
- Tailwind CSS

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose

Security Logic:
- GeoIP Service
- Velocity Engine
- Risk Scoring System

---

## 📁 Project Structure

```
client/
server/
```

---

## ⚙️ How To Run Locally

1. Clone the repo
```
git clone https://github.com/aimlsnehalparab/security-ops-dashboard.git
```

2. Install dependencies

```
cd server
npm install

cd ../client
npm install
```

3. Start backend
```
cd server
npm start
```

4. Start frontend
```
cd client
npm start
```

---

## 🎯 Future Improvements

- Real-time WebSocket alerts
- ML-based anomaly detection
- SIEM integration
- Deployment on cloud

---

## 👨‍💻 Author

Snehal Parab  
AIML Engineering Student  
Security Enthusiast
