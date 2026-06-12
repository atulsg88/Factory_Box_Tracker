This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```Smart Box Tracking System using YOLO and Barcode/QR ScanningAn automated, real-time computer vision and IoT solution designed for efficient, secure, and touchless shipment verification within logistics and warehouse environments. This system transforms traditional manual tallying into an objective, data-driven workflow by tracking assets on moving conveyor belts.  🔗 Live Production Dashboard: factory-box-tracker.vercel.app📌 Project Overview & MotivationTraditional warehousing and logistics hubs rely heavily on manual counting during the loading and unloading phases. This human-centric approach is prone to errors, leading to inventory losses, expensive labor costs, and delivery disputes.  The Smart Box Tracking System eliminates these vulnerabilities. By integrating state-of-the-art deep learning object detection algorithms (YOLO) with custom kinematic predictive tracking and high-speed barcode/QR code parsing, the system continuously logs transit metadata and automatically reconciles shipments to instantly flag supply chain discrepancies.  Key BenefitsSuperior Accuracy: Minimizes human verification error through high-confidence AI boundary localization.  Double-Counting Prevention: Leverages predictive velocity and tracking logic so a single box isn't counted multiple times.  Real-time Dispute Resolution: Instantly flags missing or extra items by running a delivery-side reconciliation script against the expected digital manifest.  Operational Transparency: Synchronizes factory floor scans to a globally accessible live dashboard via cloud database persistence.  ⚙️ System ArchitectureThe workflow is structured into four distinct, linear processing modules to ensure low latency and high reliability:  Input Stage: An industrial global-shutter camera captures a high-framerate feed of items moving along a conveyor belt.  Processing Module (The Hub): A multi-threaded YOLO script determines box boundaries, while custom centroid tracking evaluates velocity trajectories to sustain object identities.  Storage & Mapping Stage: The system crops the region of interest, decodes the barcode or QR code data via the Pyzbar library, and pushes the data alongside trip metadata (trip_id, driver_id, timestamps) into a Firebase Firestore cloud database.  Verification & Reporting Stage: At the destination, the reconciliation script runs an automated comparison check between the "Actual List" and "Expected List" to handle discrepancies.  🛠️ Tech Stack & ComponentsSoftware EcosystemFrontend Dashboard: Next.js, React, Framer Motion, WebSockets (onSnapshot).  Computer Vision Engine: Python 3, OpenCV.  Object Detection Model: YOLO ($v5/v8/v11$).  Tracking Logic: Custom Centroid Tracking with Predictive Velocity / DeepSORT.  Cloud Database: Firebase Firestore.  Decoding Utilities: Pyzbar.  Hardware Specifications (Phase 2 Target)Edge Processing Unit: Headless Raspberry Pi 4B (Optimized for edge AI inference).  Sensor Hardware: High-framerate USB Camera with global shutter to avoid motion blur.  Physical Assembly: Standardized LED lighting array and miniature conveyor belt apparatus.  📊 Current Progress & StatusPhase 1: Prototyping & Proof of Concept (Completed)Developed and validated the tracking loop using a Python/OpenCV environment with standard video feeds.  Successfully implemented real-time grayscale optimization filtering for stable Pyzbar QR code isolation.  Programmed the predictive centroid velocity module to handle variable mock conveyor belt speeds.  Deployed the live Next.js production web dashboard to Vercel with functional automated KPI updating and real-time category chart generation.  Phase 2: Hardware Deployment & Calibration (In Progress)[ ] Porting the multi-threaded computer vision pipeline into a headless systemd background service on a standalone Raspberry Pi 4B.  [ ] Optimizing frame-skipping heuristics and inferencing thresholds to manage device thermal profiles.  [ ] Finalizing historical analytics views (day/month/year analytics filtering).  🚀 Local Installation & SetupPrerequisitesPython 3.9+Node.js 18+Firebase Service Account KeyBackend Setup (Vision Pipeline)Clone the repository and navigate to the backend directory:Bashgit clone https://github.com/your-username/smart-box-tracking.git
cd smart-box-tracking/backend
Install dependencies:Bashpip install -r requirements.txt
Set up your Firebase service account json credentials as serviceAccountKey.json in the root folder.Run the tracking script:Bashpython main.py
Frontend Setup (Dashboard)Navigate to the frontend directory:Bashcd ../frontend
Install packages:Bashnpm install
Configure your environmental variables in a .env.local file:Code snippetNEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
Spin up the development server:Bashnpm run dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
