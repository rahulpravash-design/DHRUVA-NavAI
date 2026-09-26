# DHRUVA

## AI/ML-Based Intelligent Dead Reckoning for Seamless Navigation

> **Navigation that does not stop where the sky does.**

**SIH26168 · ISRO · Smart India Hackathon 2026**

DHRUVA is a smartphone-only intelligent dead-reckoning system designed to maintain navigation when GNSS becomes unavailable, unreliable, jammed, or spoofed.

Instead of depending entirely on satellite positioning, DHRUVA combines **smartphone IMU sensors, AI-based speed estimation, vehicle-motion physics, an Error-State Kalman Filter, GNSS trust verification, and offline map matching** to maintain a continuous navigation state.

---

## 🎯 Problem

Conventional smartphone navigation depends heavily on GNSS.

GNSS can become unavailable or unreliable in:

* Tunnels
* Underpasses
* Flyovers
* Urban canyons
* GNSS-jammed environments
* GNSS-spoofed environments

When GNSS disappears, navigation applications may freeze or jump to an incorrect position.

When GNSS is spoofed, the problem becomes more serious: the device may receive a position that looks valid but is actually false.

A simple accelerometer-only fallback is also insufficient because small sensor errors accumulate rapidly over time.

### The challenge

The system needs to:

1. Continue positioning during GNSS outages.
2. Estimate vehicle motion using smartphone sensors.
3. Detect suspicious GNSS measurements.
4. Reject false GNSS positions.
5. Re-enter GNSS smoothly when a trustworthy signal returns.
6. Provide an honest estimate of positioning uncertainty.

---

# 💡 Solution

DHRUVA provides an **on-device navigation resilience layer**.

```text
Smartphone Sensors
       ↓
Mount-Agnostic Alignment
       ↓
AI Speed Estimation
       ↓
Error-State EKF
       ↓
GNSS Trust Guard
       ↓
Offline Map Matching
       ↓
NAVSTATE
       ↓
Position + Heading + Speed
+ 95% Confidence + GNSS Trust
```

Everything is designed to run locally on the smartphone.

---

# 🚀 Core Innovations

## 1. AI Speed Pseudo-Measurement

A lightweight **1D CNN** estimates vehicle speed from smartphone motion/vibration and provides an uncertainty estimate.

The uncertainty allows the filter to determine how much it should trust the AI measurement.

---

## 2. Mount-Agnostic Alignment

The phone does not need to be mounted in one fixed orientation.

DHRUVA estimates the phone-to-vehicle alignment using:

* Gravity-based roll/pitch estimation
* Motion-based yaw estimation
* Automatic re-alignment when phone orientation changes

---

## 3. Calibrated 95% Confidence

DHRUVA provides a confidence radius derived from the navigation filter's covariance.

The goal is not simply to display an expanding circle, but to verify whether the stated confidence actually matches ground truth.

---

## 4. GNSS Trust Guard

The GNSS Trust Guard is a key differentiator of DHRUVA.

It evaluates incoming GNSS measurements using:

* χ² NIS testing
* CUSUM
* Fix-to-fix consistency
* Controlled GNSS re-entry

Suspicious GNSS jumps can be rejected instead of blindly accepted.

---

## 5. Offline & On-Device Operation

DHRUVA is designed to run without requiring continuous cloud connectivity.

The positioning engine, AI model, map matching and offline maps can operate locally on the device.

---

# 🧠 Navigation Modes

DHRUVA supports seamless transitions between:

```text
GNSS LOCK
    ↓
OUTAGE DETECTED
    ↓
DR ACTIVE
    ↓
TRUSTED RE-ENTRY
    ↓
GNSS LOCK
```

The goal is to prevent:

* Frozen position
* Sudden position jumps
* Blind acceptance of spoofed GNSS

---

# 🏗️ Technical Architecture

### 01 — SENSE

Collect:

* IMU measurements
* Raw GNSS
* GNSS C/N0
* Satellite status

### 02 — ALIGN

Transform the phone coordinate system into the vehicle coordinate system.

### 03 — SPEEDNET

Run the lightweight 1D CNN through TensorFlow Lite.

Output:

```text
Vehicle Speed
+
Speed Uncertainty
```

### 04 — ES-EKF

An Error-State Extended Kalman Filter fuses:

* IMU
* AI speed
* Vehicle-motion constraints
* GNSS when trusted

Additional constraints include:

* Non-Holonomic Constraint (NHC)
* Zero-Velocity Updates (ZUPT)

### 05 — TRUST GUARD

Determine whether GNSS measurements are consistent with the predicted navigation state.

### 06 — MAP MATCH

Use an offline OpenStreetMap road graph with HMM-based map matching.

### 07 — NAVSTATE

Produce the common navigation state:

```text
Position
Heading
Speed
95% Confidence Radius
Navigation Mode
GNSS Trust
```

---

# 🛠️ Technology Stack

## Android

* Kotlin
* Jetpack Compose
* MapLibre Native

## AI / ML

* Python
* TensorFlow
* TensorFlow/Keras
* TensorFlow Lite
* 1D CNN

## Navigation

* Error-State EKF
* NHC
* ZUPT
* GNSS Trust Guard
* HMM Map Matching

## Web Dashboard

* React
* Vite
* TypeScript
* Tailwind CSS
* MapLibre GL

## Sensors

* Android SensorManager
* GnssMeasurement
* GnssStatus
* LocationManager

## Maps & Storage

* OpenStreetMap
* Offline map tiles
* Offline road graph
* SQLite

---

# 📊 Evaluation

DHRUVA is evaluated using an evidence-first methodology.

## Target 1 — Drift

```text
< 10% drift
< 100 m per km
at 60 km/h
```

## Target 2 — Dead-Reckoning Improvement

Target:

```text
≥ 70% less position error
than physics-only dead reckoning
during 60-second outages
```

## Target 3 — Spoof Detection

Target:

```text
≥ 95% of injected spoofed jumps
> 100 m rejected within 1 second
```

> **Important:** These are evaluation targets, not claimed achieved results.

---

# 🧪 Evaluation Protocol

### Datasets

Primary:

* Google Smartphone Decimeter Challenge (GSDC) phone traces

Additional:

* Own underpass drives

Vehicle-grade benchmark:

* IO-VNBD

Vehicle-grade results are kept separate from phone-only results.

### GNSS Outages

Test:

```text
30 seconds
60 seconds
120 seconds
```

Outages can be injected at random points and compared with natural tunnel outages where available.

### Ablation Testing

The system is evaluated progressively:

```text
Physics
   ↓
+ AI Speed
   ↓
+ NHC
   ↓
+ Map Matching
   ↓
+ GNSS Trust Guard
```

### Metrics

* Endpoint error
* Maximum position error
* Drift percentage
* 95% confidence coverage
* GNSS re-entry jump
* Spoof detection rate

---

# 👥 Target Users

## Drivers

Useful for:

* Tunnels
* Underpasses
* Flyovers
* Urban canyons

## Emergency Responders

Potential users include:

* Ambulances
* Fire services
* Police

Reliable positioning can help reduce navigation errors during emergency response.

## Fleets & Ride-Hailing

DHRUVA can potentially operate as a positioning SDK for fleet and mobility applications.

## Future Strategic Applications

Potential future applications include:

* GNSS-jammed environments
* GNSS-spoofed environments
* Rugged Android devices
* Underground/tunnel environments with additional infrastructure

---

# 🔍 Existing Systems

| System                | Strength                             | Limitation                                                 | DHRUVA Approach                           |
| --------------------- | ------------------------------------ | ---------------------------------------------------------- | ----------------------------------------- |
| Google Maps           | Rich maps and routing                | Offline maps do not guarantee offline positioning          | Offline positioning layer                 |
| Waze Beacons          | Accurate equipped tunnels            | Requires installed infrastructure                          | No additional infrastructure              |
| u-blox / Teltonika DR | High-grade dead reckoning            | Additional hardware / vehicle integration                  | Smartphone-only                           |
| OsmAnd / Organic Maps | Offline maps                         | Positioning still depends on available positioning sources | DHRUVA positioning source                 |
| AVNet Research        | Strong smartphone DR research result | Research implementation; spoof handling not the focus      | Build toward deployable phone-only system |

DHRUVA builds on prior research rather than claiming smartphone dead reckoning as a completely new concept.

---

# 📱 Why Smartphone-Only?

DHRUVA intentionally avoids requiring:

* Wheel-speed sensors
* External GNSS receivers
* Tunnel beacons
* Dedicated vehicle hardware

The objective is to make the resilience layer deployable using hardware already available in a smartphone.

---

# 🔐 Privacy & Security

DHRUVA is designed around local processing.

Key principles:

* On-device inference
* No location upload by default
* Local encrypted logs
* GNSS consistency checking
* Spoof-resistant navigation state

---

# 📈 Current Development Status

### ✅ Completed

* Problem and competitor research
* System architecture
* NavState data contract
* Tactical HUD UI design
* Python reference engine
* Error-State EKF
* Non-Holonomic Constraint
* Replay-based processing

### 🚧 In Progress

* Evaluation harness
* 30 / 60 / 120-second outage evaluation
* SpeedNet training
* GNSS Trust Guard

### 🔜 Next

* Kotlin on-device engine
* Android live + replay application
* Real-world underpass data collection
* Python/Kotlin parity validation

> The project intentionally separates implemented functionality from planned functionality. No evaluation number should be treated as an achieved result unless produced by the evaluation harness.

---

# 🌍 Impact

### SDG 9 — Industry, Innovation & Infrastructure

DHRUVA aims to provide a software-based resilience layer for navigation infrastructure without requiring new hardware.

### SDG 11 — Sustainable Cities & Communities

Reliable positioning can support:

* Urban mobility
* Emergency response
* Tunnel navigation
* Transportation resilience

---

# 🗂️ Suggested Repository Structure

```text
DHRUVA/
│
├── android/
│   ├── app/
│   ├── engine/
│   ├── sensors/
│   ├── navigation/
│   ├── trust-guard/
│   └── map-matching/
│
├── python/
│   ├── dhruva/
│   │   ├── ekf/
│   │   ├── speednet/
│   │   ├── alignment/
│   │   ├── trust_guard/
│   │   ├── map_matching/
│   │   └── navstate/
│   ├── training/
│   ├── evaluation/
│   └── replay/
│
├── models/
│   └── speednet/
│
├── web/
│   └── dashboard/
│
├── data/
│   ├── sample/
│   └── schemas/
│
├── docs/
│   ├── architecture/
│   ├── research/
│   └── evaluation/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── golden/
│
├── scripts/
│
├── README.md
├── LICENSE
└── .gitignore
```

---

# 🏆 Core Differentiator

The key difference is:

> **Google Maps can store the map offline. DHRUVA aims to keep the position working offline — while also checking whether GNSS is lying.**

---

# 👨‍💻 Team

**Team:** CTRL ALT ELITE

**Institution:** PGP College of Engineering and Technology, Namakkal

**Problem Statement:** SIH26168

**Organization:** ISRO

**Event:** Smart India Hackathon 2026

---

# 📜 Project Status

**Prototype / Research & Development**

DHRUVA is being developed as a research-oriented prototype for smartphone-based GNSS-resilient navigation.

Performance claims will be updated only after reproducible evaluation using the defined testing protocol.

---

## 🚀 Vision

> **Navigation that does not stop where the sky does.**
