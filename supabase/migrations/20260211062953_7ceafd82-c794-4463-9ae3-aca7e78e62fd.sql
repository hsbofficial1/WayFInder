
-- Locations table
CREATE TABLE public.locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'room',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_location_id TEXT NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  to_location_id TEXT NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_location_id, to_location_id)
);

-- Route steps table
CREATE TABLE public.route_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  icon_type TEXT NOT NULL DEFAULT 'straight',
  floor INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_route_steps_route_id ON public.route_steps(route_id, step_order);

-- Enable RLS (public read access since this is a public navigation app)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_steps ENABLE ROW LEVEL SECURITY;

-- Public read access policies (anyone can view navigation data)
CREATE POLICY "Locations are publicly readable"
  ON public.locations FOR SELECT
  USING (true);

CREATE POLICY "Routes are publicly readable"
  ON public.routes FOR SELECT
  USING (true);

CREATE POLICY "Route steps are publicly readable"
  ON public.route_steps FOR SELECT
  USING (true);

-- Seed locations
INSERT INTO public.locations (id, name, floor, type) VALUES
  ('main-gate', 'Main Gate', 0, 'entry'),
  ('reception', 'Reception Desk', 0, 'entry'),
  ('lobby', 'Main Lobby', 0, 'entry'),
  ('staircase-g', 'Staircase (Ground)', 0, 'utility'),
  ('lift-g', 'Lift (Ground)', 0, 'utility'),
  ('washroom-g', 'Washroom (Ground)', 0, 'utility'),
  ('cafeteria', 'Cafeteria', 0, 'hotspot'),
  ('meeting-room-1', 'Meeting Room 1', 0, 'room'),
  ('staircase-1', 'Staircase (1st Floor)', 1, 'utility'),
  ('lift-1', 'Lift (1st Floor)', 1, 'utility'),
  ('lab-a', 'Lab A', 1, 'lab'),
  ('lab-b', 'Lab B', 1, 'lab'),
  ('office-101', 'Office 101', 1, 'office'),
  ('office-102', 'Office 102', 1, 'office'),
  ('washroom-1', 'Washroom (1st Floor)', 1, 'utility'),
  ('break-room', 'Break Room', 1, 'hotspot'),
  ('staircase-2', 'Staircase (2nd Floor)', 2, 'utility'),
  ('lift-2', 'Lift (2nd Floor)', 2, 'utility'),
  ('server-room', 'Server Room', 2, 'room'),
  ('conference-hall', 'Conference Hall', 2, 'room'),
  ('desk-area', 'Open Desk Area', 2, 'hotspot'),
  ('washroom-2', 'Washroom (2nd Floor)', 2, 'utility');

-- Seed routes and steps
-- Route: Main Gate → Reception
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('main-gate', 'reception') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Main Gate. Walk straight ahead.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Go straight for about 15 steps through the entrance corridor.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'The Reception Desk is directly ahead on your right.', 'destination', 0 FROM r;

-- Route: Main Gate → Cafeteria
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('main-gate', 'cafeteria') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Main Gate. Walk straight ahead.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Go straight for about 15 steps past the entrance.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'Turn left at the Reception Desk.', 'left', 0 FROM r
UNION ALL SELECT id, 4, 'Walk straight for about 20 steps.', 'straight', 0 FROM r
UNION ALL SELECT id, 5, 'The Cafeteria entrance is on your left.', 'destination', 0 FROM r;

-- Route: Reception → Lab A
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('reception', 'lab-a') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Reception Desk.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Walk straight ahead towards the main corridor.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'Turn right and take the Staircase to the 1st Floor.', 'right', 0 FROM r
UNION ALL SELECT id, 4, 'Go up one flight of stairs.', 'stairs-up', 1 FROM r
UNION ALL SELECT id, 5, 'At the top, turn left into the corridor.', 'left', 1 FROM r
UNION ALL SELECT id, 6, 'Walk straight for about 10 steps.', 'straight', 1 FROM r
UNION ALL SELECT id, 7, 'Lab A is the first door on your right.', 'destination', 1 FROM r;

-- Route: Main Gate → Lab A
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('main-gate', 'lab-a') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Main Gate. Walk straight ahead.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Go straight past the Reception Desk.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'Turn right towards the Staircase.', 'right', 0 FROM r
UNION ALL SELECT id, 4, 'Go up one flight of stairs to the 1st Floor.', 'stairs-up', 1 FROM r
UNION ALL SELECT id, 5, 'Turn left into the corridor.', 'left', 1 FROM r
UNION ALL SELECT id, 6, 'Walk straight for about 10 steps.', 'straight', 1 FROM r
UNION ALL SELECT id, 7, 'Lab A is the first door on your right.', 'destination', 1 FROM r;

-- Route: Main Gate → Conference Hall
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('main-gate', 'conference-hall') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Main Gate. Walk straight ahead.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Go straight past the Reception to the Lift.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'Take the Lift to the 2nd Floor.', 'lift-up', 2 FROM r
UNION ALL SELECT id, 4, 'Exit the Lift and turn right.', 'right', 2 FROM r
UNION ALL SELECT id, 5, 'Walk straight for about 15 steps.', 'straight', 2 FROM r
UNION ALL SELECT id, 6, 'The Conference Hall is at the end of the corridor on your left.', 'destination', 2 FROM r;

-- Route: Reception → Office 101
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('reception', 'office-101') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Reception Desk.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Walk towards the Staircase on your right.', 'right', 0 FROM r
UNION ALL SELECT id, 3, 'Go up one flight of stairs.', 'stairs-up', 1 FROM r
UNION ALL SELECT id, 4, 'Turn right at the top of the stairs.', 'right', 1 FROM r
UNION ALL SELECT id, 5, 'Walk straight for about 8 steps.', 'straight', 1 FROM r
UNION ALL SELECT id, 6, 'Office 101 is on your left.', 'destination', 1 FROM r;

-- Route: Main Gate → Desk Area
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('main-gate', 'desk-area') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Main Gate. Walk straight ahead.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Go straight to the Lift area.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'Take the Lift to the 2nd Floor.', 'lift-up', 2 FROM r
UNION ALL SELECT id, 4, 'Exit the Lift and go straight.', 'straight', 2 FROM r
UNION ALL SELECT id, 5, 'Turn left after about 10 steps.', 'left', 2 FROM r
UNION ALL SELECT id, 6, 'The Open Desk Area is on your right.', 'destination', 2 FROM r;

-- Route: Lobby → Meeting Room 1
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('lobby', 'meeting-room-1') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are in the Main Lobby.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Turn right towards the corridor.', 'right', 0 FROM r
UNION ALL SELECT id, 3, 'Walk straight for about 12 steps.', 'straight', 0 FROM r
UNION ALL SELECT id, 4, 'Meeting Room 1 is the second door on your left.', 'destination', 0 FROM r;

-- Route: Reception → Break Room
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('reception', 'break-room') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Reception Desk.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Walk towards the Staircase.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'Go up one flight of stairs.', 'stairs-up', 1 FROM r
UNION ALL SELECT id, 4, 'Turn left at the top.', 'left', 1 FROM r
UNION ALL SELECT id, 5, 'Walk straight to the end of the corridor.', 'straight', 1 FROM r
UNION ALL SELECT id, 6, 'The Break Room is the last door on your right.', 'destination', 1 FROM r;

-- Route: Main Gate → Washroom (Ground)
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('main-gate', 'washroom-g') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are at the Main Gate. Walk straight ahead.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Go straight past Reception.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'Turn left at the end of the corridor.', 'left', 0 FROM r
UNION ALL SELECT id, 4, 'The Washroom is immediately on your right.', 'destination', 0 FROM r;

-- Route: Lobby → Server Room
WITH r AS (
  INSERT INTO public.routes (from_location_id, to_location_id) VALUES ('lobby', 'server-room') RETURNING id
)
INSERT INTO public.route_steps (route_id, step_order, instruction, icon_type, floor) SELECT id, 1, 'You are in the Main Lobby.', 'start', 0 FROM r
UNION ALL SELECT id, 2, 'Walk towards the Lift.', 'straight', 0 FROM r
UNION ALL SELECT id, 3, 'Take the Lift to the 2nd Floor.', 'lift-up', 2 FROM r
UNION ALL SELECT id, 4, 'Exit and turn left.', 'left', 2 FROM r
UNION ALL SELECT id, 5, 'Walk straight for about 8 steps.', 'straight', 2 FROM r
UNION ALL SELECT id, 6, 'The Server Room is the secured door on your right.', 'destination', 2 FROM r;
