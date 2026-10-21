import os
import asyncio
import random
from typing import List, Dict, Any, Optional
from datetime import datetime

try:
    from supabase import create_client, Client
except ImportError:
    create_client, Client = None, None

from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path=ENV_PATH)

SUPABASE_URL = os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", ""))
SUPABASE_KEY = os.getenv("SUPABASE_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))

supabase: Optional[Any] = None
if create_client and SUPABASE_URL and SUPABASE_KEY and "your-project" not in SUPABASE_URL:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected successfully to Supabase Database!")
    except Exception as e:
        print(f"Supabase connection warning: {e}")
else:
    print("Supabase credentials not yet provided or client missing. Operating in graceful local mode.")

def get_supabase_client():
    return supabase

async def fetch_vehicles_from_db() -> List[Dict[str, Any]]:
    """Fetch current vehicle telemetry from Supabase table."""
    if not supabase:
        return []
    try:
        res = supabase.table("vehicles").select("*").execute()
        return res.data or []
    except Exception as e:
        print(f"Error fetching vehicles from Supabase: {e}")
        return []

async def fetch_kpis_from_db() -> Dict[str, Any]:
    """Fetch current fleet KPIs from Supabase table."""
    if not supabase:
        return {}
    try:
        res = supabase.table("kpis").select("*").eq("id", 1).single().execute()
        return res.data or {}
    except Exception as e:
        print(f"Error fetching KPIs from Supabase: {e}")
        return {}

async def telemetry_stream_worker():
    """
    Background worker that updates vehicle telemetry and KPIs every 3 seconds in Supabase.
    This simulates real IoT / GPS tracking devices feeding live data to the database.
    """
    print("Telemetry database stream worker started.")
    while True:
        try:
            await asyncio.sleep(3)  # Every 3 seconds
            if not supabase:
                continue

            vehicles = await fetch_vehicles_from_db()
            if not vehicles:
                continue

            # Pick a random vehicle to move or update status
            v = random.choice(vehicles)
            v_id = v.get("vehicle_id")
            cur_lat = float(v.get("lat", 13.0827))
            cur_lng = float(v.get("lng", 80.2707))
            cur_soc = int(v.get("soc", 80))
            fuel_type = v.get("fuel_type", "EV")
            status = v.get("status", "free")

            # Simulate small GPS delta
            new_lat = round(cur_lat + (random.random() - 0.5) * 0.002, 6)
            new_lng = round(cur_lng + (random.random() - 0.5) * 0.002, 6)

            # Battery adjustment for EVs
            if fuel_type == "EV":
                if status == "charging":
                    new_soc = min(100, cur_soc + 2)
                    if new_soc >= 98:
                        status = "free"
                else:
                    new_soc = max(15, cur_soc - 1)
                    if new_soc <= 20:
                        status = "charging"
            else:
                new_soc = 100

            # Toggle busy / free occasionally
            if random.random() > 0.85 and status != "charging":
                status = "free" if status == "busy" else "busy"

            # Update vehicle in database
            supabase.table("vehicles").update({
                "lat": new_lat,
                "lng": new_lng,
                "soc": new_soc,
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("vehicle_id", v_id).execute()

            # Increment requests served slightly
            if random.random() > 0.6:
                kpis = await fetch_kpis_from_db()
                if kpis:
                    reqs = kpis.get("requests_served", 230) + 1
                    supabase.table("kpis").update({
                        "requests_served": reqs,
                        "updated_at": datetime.utcnow().isoformat()
                    }).eq("id", 1).execute()

        except Exception as e:
            # Keep worker alive even if network hiccups
            await asyncio.sleep(3)
