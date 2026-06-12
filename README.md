# Smart Box Tracking System using YOLO and Barcode/QR Scanning

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?style=flat&logo=vercel)](https://factory-box-tracker.vercel.app/)
[![Python](https://img.shields.io/badge/Backend-Python%203.x-blue?style=flat&logo=python)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Cloud%20Database-Firebase%20Firestore-orange?style=flat&logo=firebase)](https://firebase.google.com/)

An automated, real-time computer vision and IoT solution designed for efficient, secure, and touchless shipment verification within logistics and warehouse environments. This system transforms traditional manual tallying into an objective, data-driven workflow by tracking assets on moving conveyor belts.

🔗 **Live Production Dashboard:** [factory-box-tracker.vercel.app](https://factory-box-tracker.vercel.app/)

---

## 📌 Project Overview & Motivation

Traditional warehousing and logistics hubs rely heavily on manual counting during the loading and unloading phases. This human-centric approach is prone to errors, leading to inventory losses, expensive labor costs, and delivery disputes. 

The **Smart Box Tracking System** eliminates these vulnerabilities. By integrating state-of-the-art deep learning object detection algorithms (**YOLO**) with custom kinematic predictive tracking and high-speed barcode/QR code parsing, the system continuously logs transit metadata and automatically reconciles shipments to instantly flag supply chain discrepancies.

### Key Benefits
* **Superior Accuracy:** Minimizes human verification error through high-confidence AI boundary localization.
* **Double-Counting Prevention:** Leverages predictive velocity and tracking logic so a single box isn't counted multiple times.
* **Real-time Dispute Resolution:** Instantly flags missing or extra items by running a delivery-side reconciliation script against the expected digital manifest.
* **Operational Transparency:** Synchronizes factory floor scans to a globally accessible live dashboard via cloud database persistence.

---

## ⚙️ System Architecture

The workflow is structured into four distinct, linear processing modules to ensure low latency and high reliability:

1. **Input Stage:** An industrial global-shutter camera captures a high-framerate feed of items moving along a conveyor belt.
2. **Processing Module (The Hub):** A multi-threaded YOLO script determines box boundaries, while custom centroid tracking evaluates velocity trajectories to sustain object identities.
3. **Storage & Mapping Stage:** The system crops the region of interest, decodes the barcode or QR code data via the `Pyzbar` library, and pushes the data alongside trip metadata (`trip_id`, `driver_id`, timestamps) into a Firebase Firestore cloud database.
4. **Verification & Reporting Stage:** At the destination, the reconciliation script runs an automated comparison check between the "Actual List" and "Expected List" to handle discrepancies.

---

## 🛠️ Tech Stack & Components

### Software Ecosystem
* **Frontend Dashboard:** Next.js, React, Framer Motion, WebSockets (`onSnapshot`).
* **Computer Vision Engine:** Python 3, OpenCV.
* **Object Detection Model:** YOLO (v5/v8/v11).
* **Tracking Logic:** Custom Centroid Tracking with Predictive Velocity / DeepSORT.
* **Cloud Database:** Firebase Firestore.
* **Decoding Utilities:** Pyzbar.

### Hardware Specifications (Phase 2 Target)
* **Edge Processing Unit:** Headless Raspberry Pi 4B (Optimized for edge AI inference).
* **Sensor Hardware:** High-framerate USB Camera with global shutter to avoid motion blur.
* **Physical Assembly:** Standardized LED lighting array and miniature conveyor belt apparatus.

---

## 📊 Current Progress & Status

### Phase 1: Prototyping & Proof of Concept (Completed)
* Developed and validated the tracking log using a Python/OpenCV environment with standard video feeds.
* Successfully implemented real-time grayscale optimization filtering for stable Pyzbar QR code isolation.
* Programmed the predictive centroid velocity module to handle variable mock conveyor belt speeds.
* Deployed the live Next.js production web dashboard to **Vercel** with functional automated KPI updating and real-time category chart generation.

### Phase 2: Hardware Deployment & Calibration (In Progress)
- [ ] Porting the multi-threaded computer vision pipeline into a headless `systemd` background service on a standalone Raspberry Pi 4B.
- [ ] Optimizing frame-skipping heuristics and inferencing thresholds to manage device thermal profiles.
- [ ] Finalizing historical analytics views (day/month/year analytics filtering).

---

## 🚀 Local Installation & Setup

### Prerequisites
* Python 3.9+
* Node.js 18+
* Firebase Service Account Key

### Backend Setup (Vision Pipeline)
1. Clone the repository and navigate to the backend directory:
   ```bash
   git clone [https://github.com/atulsg88/Factory_Box_Tracker.git](https://github.com/atulsg88/Factory_Box_Tracker.git)
