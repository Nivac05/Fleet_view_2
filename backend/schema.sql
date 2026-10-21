
-- 1. Create Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL UNIQUE,
    vehicle_type TEXT NOT NULL DEFAULT 'Car', -- Car, Bus, Ambulance
    fuel_type TEXT NOT NULL DEFAULT 'EV',     -- EV, ICE
    current_zone TEXT NOT NULL DEFAULT 'Downtown',
    capacity INT NOT NULL DEFAULT 4,
    soc INT NOT NULL DEFAULT 100,             -- Battery State of Charge (0-100)
    status TEXT NOT NULL DEFAULT 'free',      -- free, busy, charging
    lat DOUBLE PRECISION NOT NULL DEFAULT 13.0827,
    lng DOUBLE PRECISION NOT NULL DEFAULT 80.2707,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Live Fleet Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id TEXT REFERENCES public.vehicles(vehicle_id) ON DELETE CASCADE,
    origin_zone TEXT NOT NULL,
    destination_zone TEXT NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    dest_lat DOUBLE PRECISION NOT NULL,
    dest_lng DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
    wait_time_minutes DOUBLE PRECISION DEFAULT 4.5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Live KPIs Table
CREATE TABLE IF NOT EXISTS public.kpis (
    id INT PRIMARY KEY DEFAULT 1,
    requests_served INT NOT NULL DEFAULT 230,
    avg_wait DOUBLE PRECISION NOT NULL DEFAULT 5.2,
    p90_wait DOUBLE PRECISION NOT NULL DEFAULT 12.8,
    ev_trips INT NOT NULL DEFAULT 98,
    ice_trips INT NOT NULL DEFAULT 89,
    utilization DOUBLE PRECISION NOT NULL DEFAULT 74.5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT single_kpi_row CHECK (id = 1)
);

-- 4. Enable Supabase Realtime for instant WebSocket broadcasts on updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kpis;

-- 5. Seed Initial Fleet Data (15 initial vehicles across Chennai zones)
INSERT INTO public.vehicles (id, vehicle_id, vehicle_type, fuel_type, current_zone, capacity, soc, status, lat, lng)
VALUES
    ('v1', 'FVT-1001', 'Car', 'EV', 'Downtown', 4, 85, 'busy', 13.0827, 80.2707),
    ('v2', 'FVT-1002', 'Car', 'ICE', 'IT Park', 4, 100, 'free', 12.9863, 80.2432),
    ('v3', 'FVT-1003', 'Car', 'EV', 'Mall', 4, 45, 'charging', 13.0604, 80.2496),
    ('v4', 'FVT-1004', 'Ambulance', 'ICE', 'Hospital', 2, 100, 'busy', 13.0732, 80.2376),
    ('v5', 'FVT-1005', 'Bus', 'EV', 'University', 30, 72, 'free', 13.0102, 80.2355),
    ('v6', 'FVT-1006', 'Car', 'EV', 'Residential Area', 4, 90, 'free', 13.0359, 80.2144),
    ('v7', 'FVT-1007', 'Car', 'ICE', 'Downtown', 4, 100, 'busy', 13.0850, 80.2750),
    ('v8', 'FVT-1008', 'Car', 'EV', 'IT Park', 4, 30, 'charging', 12.9900, 80.2450),
    ('v9', 'FVT-1009', 'Car', 'EV', 'Downtown', 4, 65, 'free', 13.0780, 80.2680),
    ('v10', 'FVT-1010', 'Car', 'ICE', 'Mall', 4, 100, 'free', 13.0580, 80.2520),
    ('v11', 'FVT-1011', 'Car', 'EV', 'Hospital', 4, 80, 'busy', 13.0710, 80.2400),
    ('v12', 'FVT-1012', 'Bus', 'ICE', 'University', 35, 100, 'busy', 13.0130, 80.2310),
    ('v13', 'FVT-1013', 'Car', 'EV', 'Residential Area', 4, 55, 'free', 13.0320, 80.2180),
    ('v14', 'FVT-1014', 'Ambulance', 'EV', 'Hospital', 2, 92, 'free', 13.0750, 80.2350),
    ('v15', 'FVT-1015', 'Car', 'ICE', 'Downtown', 4, 100, 'charging', 13.0810, 80.2720)
ON CONFLICT (vehicle_id) DO NOTHING;

-- 6. Seed Initial KPI snapshot
INSERT INTO public.kpis (id, requests_served, avg_wait, p90_wait, ev_trips, ice_trips, utilization)
VALUES (1, 230, 5.2, 12.8, 98, 89, 74.5)
ON CONFLICT (id) DO NOTHING;
