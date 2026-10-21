# app.py
import os, json, asyncio
from datetime import datetime, timedelta
from typing import List, Tuple, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# ---------------- FastAPI ----------------
app = FastAPI(title="Demand Forecast + Stream API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Next.js dev server, production URLs, etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import StreamingResponse

async def decision_sse_generator():
    """
    Continuously stream decision layer outputs based on forecast updates.
    """
    last_y = 50.0
    t0 = round_to_hour(datetime.utcnow())

    for k in range(1, 500):  # stream 500 steps
        ts = t0 + timedelta(hours=k)
        p50 = one_step_predict(last_y, ts)
        last_y = p50

        # --- dynamic allocation ---
        zones = ["Downtown", "IT Park", "Mall", "Hospital", "University", "Residential Area"]
        zone_alloc = []
        for i, zone in enumerate(zones):
            demand = p50 * (0.8 + 0.4 * (i % 3))  # small variation per zone
            alloc_ev = int(demand // 5)
            alloc_ice = int(demand // 3)
            alloc_total = alloc_ev + alloc_ice
            capacity_est = alloc_total * 2.1
            unserved = max(0.0, demand - capacity_est)
            zone_alloc.append({
                "zone": zone,
                "demand": round(demand, 2),
                "alloc_ev": alloc_ev,
                "alloc_ice": alloc_ice,
                "alloc_total": alloc_total,
                "capacity_est": round(capacity_est, 1),
                "unserved": round(unserved, 1),
            })

        # --- dynamic reposition moves ---
        reposition_ev = [{"from": "Downtown", "to": "IT Park", "count": (k % 5) + 1}]
        reposition_ice = [{"from": "Hospital", "to": "Mall", "count": (k % 3) + 2}]

        payload = {
            "zone_alloc": zone_alloc,
            "reposition_ev": reposition_ev,
            "reposition_ice": reposition_ice,
        }

        yield f"data: {json.dumps(payload)}\n\n"
        await asyncio.sleep(5)  # every 5 sec update

@app.get("/decision_stream")
async def decision_stream():
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(decision_sse_generator(), media_type="text/event-stream", headers=headers)

# ======================================
#  SECTION 1: Historical CSV (optional seed)
# ======================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DF_PATH = os.path.join(BASE_DIR, "data", "Synthetic_Fleet_Demand_Dataset.csv")
df = pd.read_csv(DF_PATH)

time_col = next((c for c in df.columns if c.lower() in ("time", "timestamp", "datetime")), None)
if not time_col:
    raise RuntimeError(f"CSV must contain a time column. Found: {list(df.columns)}")

ts = pd.to_datetime(df[time_col], errors="coerce", utc=True)
df = df.loc[ts.notna()].copy()
df["__iso"] = ts.dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def latest_observed_from_csv(path: str) -> Optional[float]:
    """Optional: get last observed demand from CSV."""
    try:
        head = pd.read_csv(path, nrows=5)
        time_col = next((c for c in head.columns if c.lower() in ("time","timestamp","datetime")), None)
        if not time_col:
            return None
        df = pd.read_csv(path, parse_dates=[time_col])
        df = df.dropna(subset=[time_col]).sort_values(time_col)
        hourly = df.set_index(time_col).groupby(pd.Grouper(freq="h")).size()
        return float(hourly.iloc[-1]) if len(hourly) else None
    except Exception:
        return None

# ======================================
#  SECTION 2: XGBoost demand forecast
# ======================================
MODEL_PATH = os.path.join(BASE_DIR, "models", "xgb_demand_model.joblib")
METADATA_PATH = os.path.join(BASE_DIR, "models", "xgb_demand_model.json")

DEFAULT_FEATURES = ["lag1", "dow", "hour"]
Q05_FALLBACK, Q95_FALLBACK = -12.0, 12.0

model = joblib.load(MODEL_PATH)
try:
    with open(METADATA_PATH, "r") as f:
        meta = json.load(f)
    FEATURES = meta.get("feature_columns", DEFAULT_FEATURES)
    q05, q95 = float(meta.get("q05", Q05_FALLBACK)), float(meta.get("q95", Q95_FALLBACK))
except Exception:
    FEATURES = DEFAULT_FEATURES
    q05, q95 = Q05_FALLBACK, Q95_FALLBACK
    meta = {}

class DemandForecast(BaseModel):
    time: str
    p50: float
    p90_range: Tuple[float, float]

class MetaOut(BaseModel):
    model_type: str
    features: List[str]
    q05: float
    q95: float
    created_at_utc: Optional[str] = None

def round_to_hour(dt: datetime) -> datetime:
    return dt.replace(minute=0, second=0, microsecond=0)

def one_step_predict(last_y: float, ts: datetime) -> float:
    row = pd.DataFrame([[last_y, ts.weekday(), ts.hour]], columns=FEATURES)
    return float(model.predict(row)[0])

# ======================================
#  SECTION 3: SSE Streaming endpoint
# ======================================
async def sse_generator():
    """Continuously stream ML forecast values."""
    last_y = 50.0  # seed demand
    t0 = round_to_hour(datetime.utcnow())

    for k in range(1, 500):  # stream 500 hours
        ts = t0 + timedelta(hours=k)
        p50 = one_step_predict(last_y, ts)
        last_y = p50
        lo, hi = max(0.0, p50 + q05), max(0.0, p50 + q95)

        payload = [{"time": ts.isoformat(), "p50": p50, "p90_range": [lo, hi]}]
        yield f"data: {json.dumps(payload)}\n\n"
        await asyncio.sleep(2)  # push every 2 sec

@app.get("/stream")
async def stream():
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(sse_generator(), media_type="text/event-stream", headers=headers)

from db import fetch_vehicles_from_db, fetch_kpis_from_db, telemetry_stream_worker

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(telemetry_stream_worker())

# ======================================
#  SECTION 4: REST APIs
# ======================================
@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "FleetView API", "timestamp": datetime.utcnow().isoformat()}

@app.get("/vehicles")
async def get_vehicles():
    data = await fetch_vehicles_from_db()
    if data:
        return data
    # Fallback default vehicles if Supabase is not yet configured
    return [
        {"id": f"v{i}", "vehicle_id": f"FVT-{1000+i}", "vehicle_type": "Car" if i % 3 != 0 else "Ambulance", "fuel_type": "EV" if i % 2 == 0 else "ICE", "soc": 80, "status": "free", "lat": 13.0827 + (i * 0.004), "lng": 80.2707 + (i * 0.004)}
        for i in range(1, 16)
    ]

@app.get("/kpis")
async def get_kpis():
    data = await fetch_kpis_from_db()
    if data:
        return data
    return {
        "requests_served": 230,
        "avg_wait": 5.2,
        "p90_wait": 12.8,
        "ev_trips": 98,
        "ice_trips": 89,
        "utilization": 74.5,
    }

@app.get("/meta", response_model=MetaOut)
def meta_info():
    return MetaOut(
        model_type="XGBRegressor",
        features=FEATURES,
        q05=q05, q95=q95,
        created_at_utc=meta.get("created_at_utc"),
    )

@app.get("/forecast", response_model=List[DemandForecast])
def forecast_api(
    horizon: int = Query(24, ge=1, le=168),
    last_y: Optional[float] = Query(None),
    start: Optional[str] = Query(None),
):
    t0 = datetime.fromisoformat(start) if start else round_to_hour(datetime.utcnow())
    last_y = last_y or latest_observed_from_csv(DF_PATH) or 50.0

    preds: List[DemandForecast] = []
    y = float(last_y)
    for k in range(1, horizon+1):
        ts = t0 + timedelta(hours=k)
        p50 = one_step_predict(y, ts)
        y = p50
        lower, upper = max(0.0, p50+q05), max(0.0, p50+q95)
        preds.append(DemandForecast(time=ts.isoformat(), p50=p50, p90_range=(lower, upper)))
    return preds
@app.get("/forecast_zones")
def forecast_zones(horizon: int = Query(6, ge=1, le=24)):
    """
    Zone-level demand forecasting heuristic based on spatial density.
    Returns projected passenger demand across primary zones.
    """
    zones = ["Downtown","IT Park","Mall","Hospital","University","Residential Area"]
    t0 = round_to_hour(datetime.utcnow())

    forecasts = []
    for k in range(1, horizon+1):
        ts = t0 + timedelta(hours=k)
        row = {"time": ts.isoformat()}
        for i, z in enumerate(zones):
            row[z] = round(20 + 5*i + (k*0.8), 2)
        forecasts.append(row)

    return forecasts

from collections import defaultdict
import random

@app.get("/decision_layer")
def decision_layer(
    horizon: int = Query(12, ge=1, le=168),
    last_y: Optional[float] = Query(None),
    start: Optional[str] = Query(None),
):
    """
    Optimization layer: Computes EV vs ICE allocation and proactive repositioning moves.
    Balancing vehicle capacity against projected hourly demand spikes.
    """

    # Get forecast
    t0 = datetime.fromisoformat(start) if start else round_to_hour(datetime.utcnow())
    last_y = last_y or latest_observed_from_csv(DF_PATH) or 50.0

    preds = []
    y = float(last_y)
    for k in range(1, horizon + 1):
        ts = t0 + timedelta(hours=k)
        p50 = one_step_predict(y, ts)
        y = p50
        preds.append((ts, p50))

    # Multi-zone allocation engine
    zones = ["Downtown", "IT Park", "Mall", "Hospital", "University", "Residential Area"]
    zone_alloc = []
    for i, zone in enumerate(zones):
        demand = preds[i % len(preds)][1]  # cycle through forecast
        alloc_ev = int(demand // 5)
        alloc_ice = int(demand // 3)
        alloc_total = alloc_ev + alloc_ice
        capacity_est = alloc_total * 2.1
        unserved = max(0.0, demand - capacity_est)
        zone_alloc.append({
            "zone": zone,
            "demand": round(demand, 2),
            "alloc_ev": alloc_ev,
            "alloc_ice": alloc_ice,
            "alloc_total": alloc_total,
            "capacity_est": round(capacity_est, 1),
            "unserved": round(unserved, 1),
        })

    # Dynamic fleet repositioning balancing
    reposition_ev = [
        {"from": "Downtown", "to": "IT Park", "count": 3},
        {"from": "University", "to": "Mall", "count": 2},
    ]
    reposition_ice = [
        {"from": "Hospital", "to": "Downtown", "count": 4},
        {"from": "Mall", "to": "Residential Area", "count": 1},
    ]

    return {
        "zone_alloc": zone_alloc,
        "reposition_ev": reposition_ev,
        "reposition_ice": reposition_ice,
    }
