CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  consumer_number text NOT NULL UNIQUE,
  city text NOT NULL DEFAULT 'Kochi',
  connection_type text NOT NULL DEFAULT 'Domestic 1-phase',
  cycle_start_day int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tariff_slabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slab_order int NOT NULL,
  min_units int NOT NULL,
  max_units int,
  rate_per_unit numeric(6,2) NOT NULL,
  fixed_charge numeric(8,2) NOT NULL DEFAULT 0,
  label text NOT NULL
);

CREATE TABLE public.meter_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  reading_date date NOT NULL,
  units_used numeric(6,2) NOT NULL,
  night_units numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, reading_date)
);

CREATE TABLE public.appliances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  watts int NOT NULL,
  hours_per_day numeric(4,1) NOT NULL DEFAULT 1,
  standby_watts numeric(5,1) NOT NULL DEFAULT 0,
  always_on boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.households TO anon, authenticated;
GRANT SELECT ON public.tariff_slabs TO anon, authenticated;
GRANT SELECT ON public.meter_readings TO anon, authenticated;
GRANT SELECT ON public.appliances TO anon, authenticated;
GRANT ALL ON public.households TO service_role;
GRANT ALL ON public.tariff_slabs TO service_role;
GRANT ALL ON public.meter_readings TO service_role;
GRANT ALL ON public.appliances TO service_role;

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariff_slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appliances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public demo households are viewable" ON public.households FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public tariff slabs are viewable" ON public.tariff_slabs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public demo readings are viewable" ON public.meter_readings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public demo appliances are viewable" ON public.appliances FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.tariff_slabs (slab_order, min_units, max_units, rate_per_unit, fixed_charge, label) VALUES
  (1, 0, 50, 3.25, 40, '0 - 50 units'),
  (2, 51, 100, 4.05, 65, '51 - 100 units'),
  (3, 101, 150, 5.10, 85, '101 - 150 units'),
  (4, 151, 200, 6.95, 100, '151 - 200 units'),
  (5, 201, 250, 8.20, 120, '201 - 250 units'),
  (6, 251, NULL, 9.60, 145, 'Above 250 units');

INSERT INTO public.households (id, name, consumer_number, city, connection_type, cycle_start_day) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Nair Family, Kakkanad', 'KSEB-1194-88231', 'Kochi', 'Domestic 1-phase', 1),
  ('22222222-2222-2222-2222-222222222222', 'Menon Residence, Thrissur', 'KSEB-2210-40117', 'Thrissur', 'Domestic 1-phase', 1);

INSERT INTO public.meter_readings (household_id, reading_date, units_used, night_units)
SELECT '11111111-1111-1111-1111-111111111111',
       d::date,
       round((6.2 + 2.4 * sin(extract(doy from d) / 3.0) + (extract(dow from d) IN (0,6))::int * 1.6)::numeric, 2),
       round((1.4 + 0.5 * cos(extract(doy from d) / 4.0))::numeric, 2)
FROM generate_series(current_date - interval '59 days', current_date, interval '1 day') d;

INSERT INTO public.meter_readings (household_id, reading_date, units_used, night_units)
SELECT '22222222-2222-2222-2222-222222222222',
       d::date,
       round((4.1 + 1.5 * sin(extract(doy from d) / 5.0))::numeric, 2),
       round((0.8 + 0.3 * cos(extract(doy from d) / 3.0))::numeric, 2)
FROM generate_series(current_date - interval '59 days', current_date, interval '1 day') d;

INSERT INTO public.appliances (household_id, name, category, watts, hours_per_day, standby_watts, always_on) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Air Conditioner (bedroom)', 'Cooling', 1500, 4.0, 2.5, false),
  ('11111111-1111-1111-1111-111111111111', 'Refrigerator', 'Kitchen', 180, 24.0, 0, true),
  ('11111111-1111-1111-1111-111111111111', 'Water Heater', 'Bathroom', 2000, 0.6, 3.0, false),
  ('11111111-1111-1111-1111-111111111111', 'Washing Machine', 'Laundry', 500, 0.7, 4.5, false),
  ('11111111-1111-1111-1111-111111111111', 'LED TV 43"', 'Entertainment', 90, 5.0, 12.0, false),
  ('11111111-1111-1111-1111-111111111111', 'Set-top Box', 'Entertainment', 15, 5.0, 14.0, true),
  ('11111111-1111-1111-1111-111111111111', 'WiFi Router', 'Network', 10, 24.0, 10.0, true),
  ('11111111-1111-1111-1111-111111111111', 'Ceiling Fans (x4)', 'Cooling', 280, 10.0, 0, false),
  ('11111111-1111-1111-1111-111111111111', 'Microwave Oven', 'Kitchen', 1200, 0.3, 3.5, false),
  ('11111111-1111-1111-1111-111111111111', 'Phone / Laptop Chargers', 'Electronics', 65, 6.0, 5.0, false),
  ('22222222-2222-2222-2222-222222222222', 'Refrigerator', 'Kitchen', 150, 24.0, 0, true),
  ('22222222-2222-2222-2222-222222222222', 'Ceiling Fans (x3)', 'Cooling', 210, 9.0, 0, false),
  ('22222222-2222-2222-2222-222222222222', 'LED TV 32"', 'Entertainment', 60, 4.0, 9.0, false),
  ('22222222-2222-2222-2222-222222222222', 'WiFi Router', 'Network', 8, 24.0, 8.0, true),
  ('22222222-2222-2222-2222-222222222222', 'Water Pump', 'Utility', 750, 0.5, 0, false);