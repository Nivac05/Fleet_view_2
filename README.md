# 🚗 FLEET VIEW: Real-Time Fleet Telemetry & Optimization Platform

[![CI Pipeline](https://github.com/actions/workflows/ci.yml/badge.svg)](../../actions)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![Cloud](https://img.shields.io/badge/Cloud-AWS%20Free%20Tier-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com)

---

## 🌐 Overview

**FleetView** is a production-grade, real-time fleet monitoring and AI optimization platform designed to manage both Electric Vehicles (EVs) and Internal Combustion Engine (ICE) vehicles.

* **Backend (FastAPI + Python)**: Exposes high-throughput endpoints for telemetry ingestion, hourly passenger demand prediction using an **XGBoost Regressor**, and heuristic zone re-allocation and repositioning moves.
* **Frontend (Next.js 15 + Tailwind + Recharts)**: Live operator dashboard with Google Maps routing, fuel type breakdown, battery state of charge (SOC), wait time distributions, and GenAI recommendations.
* **Real-time Database (Supabase PostgreSQL)**: Stores persistent vehicle telemetry and trip states, broadcasting live vehicle coordinates and KPI updates every 2–4 seconds via WebSockets.
* **CI/CD Automation (GitHub Actions)**: Fully automated testing, linting, and container builds on every commit.
* **Cloud Hosting (AWS)**: 100% Free-Tier compatible cloud deployment running scalable containerized services.

---

## 📸 Dashboard Screenshots

<p align="center">
  <img width="800" src="https://github.com/user-attachments/assets/72e7156c-2dd0-4aee-8871-dcf533b6a2d4" alt="Fleet Overview" />
</p>

<p align="center">
  <img width="800" src="https://github.com/user-attachments/assets/a1834294-5661-47b3-9bcb-0c331de7a903" alt="Demand & Wait Times" />
</p>

<p align="center">
  <img width="800" src="https://github.com/user-attachments/assets/12090d5e-41a2-4a87-8631-72551d12b5e5" alt="Fuel Distribution" />
</p>

<p align="center">
  <img width="800" src="https://github.com/user-attachments/assets/70004ce1-2530-461b-8761-92b79e3cc767" alt="Decision Layer" />
</p>

---

## 📁 Structured Project Layout

```text
FleetView/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated testing, linting & Next.js build
│       └── deploy.yml             # AWS deployment pipeline
│
├── backend/                       # Python FastAPI Backend
│   ├── data/                      # Historical datasets
│   │   └── Synthetic_Fleet_Demand_Dataset.csv
│   ├── models/                    # Serialized Machine Learning models
│   │   ├── xgb_demand_model.joblib
│   │   └── xgb_demand_model.json
│   ├── db.py                      # Supabase Database client & telemetry worker
│   ├── main.py                    # FastAPI application, SSE streams & REST APIs
│   ├── schema.sql                 # Ready-to-run PostgreSQL database schema
│   ├── Dockerfile                 # Production backend container
│   ├── requirements.txt           # Python dependencies
│   └── .env.example
│
├── frontend/                      # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/                   # Next.js App Router (pages & layouts)
│   │   ├── components/            # UI components, Google Maps & charts
│   │   ├── hooks/                 # Real-time state hooks (useFleetData)
│   │   ├── lib/                   # Supabase & API utility connectors
│   │   └── types/                 # TypeScript type definitions
│   │   ├── lib/                   # Supabase & API utility connectors
│   │   └── types/                 # TypeScript type definitions
│   ├── package.json
│   └── .env.example
│
└── README.md                      # Documentation
```

---

## ⚡ Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:9002` in your browser.

---

## 🗄️ Database Setup (Supabase - $0 Free Tier)

1. Create a free account at [Supabase.com](https://supabase.com).
2. Create a new project (e.g. `fleetview-db`).
3. Open the **SQL Editor** on the left menu.
4. Copy and paste the contents of `backend/schema.sql` and click **Run**.
5. Copy your **Project URL** and **anon public key** from Project Settings -> API into:
   * `backend/.env` as `SUPABASE_URL` and `SUPABASE_KEY`
   * `frontend/.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🤖 Continuous Integration & Deployment (GitHub Actions)

Every push or pull request to the `main` branch automatically triggers the `.github/workflows/ci.yml` pipeline:
* **Backend Job**: Validates Python syntax, checks dependencies, and verifies API startup.
* **Frontend Job**: Runs TypeScript type-checking and builds production Next.js bundles.
* **Cost**: **$0.00** (Free on public repositories / 2,000 free minutes on private repositories).

---

## ☁️ Zero-Cost Cloud Deployment (AWS Free Tier)

FleetView is designed to run entirely within the **AWS Always Free & 12-Month Free Tiers**:
* **Backend**: Run containerized on an AWS EC2 `t2.micro` / `t3.micro` (750 hours/month free = 24/7 online) or AWS App Runner.
* **Frontend**: Deploy with zero configuration to Vercel (Hobby Free Tier) or AWS S3 + CloudFront (1 TB transfer free).
* **Database**: Hosted on Supabase (500 MB free) with WebSocket Realtime enabled.

---

## 📊 Dashboard Walkthrough & Features

* **Live KPIs Panel**: Real-time counters for requests served, average wait times, P90 SLA wait times, and fleet utilization.
* **Google Maps Telemetry**: Displays live markers for EVs, ICE vehicles, ambulances, and buses with real-time location delta streaming.
* **Wait Time Distribution**: Recharts histogram categorizing passenger wait times into SLA brackets.
* **Fuel Type Analysis**: Stacked bar chart tracking EV vs. ICE operational hours.
* **Demand Forecast (XGBoost)**: Live time-series predictions indicating upcoming peak passenger hours with confidence intervals (P50 and P90).
* **Decision Layer**: AI heuristic algorithm that calculates per-zone vehicle allocation and recommends repositioning movements to minimize unserved demand.
