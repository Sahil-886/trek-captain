-- Trek Captain — Seed Data
-- ============================================================
-- IMPORTANT: captains.id references auth.users.
-- You MUST create an auth user first, then replace the UUID below.
--
-- Steps:
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
--    Email: sahil@trekcaptain.app  Password: whatever
-- 2. Copy the UUID from the new user row
-- 3. Replace '00000000-0000-0000-0000-000000000001' below with that UUID
-- 4. Run this SQL in the SQL Editor
-- ============================================================

-- Replace this UUID with a real auth.users UUID!
do $$
declare
  captain_uuid uuid := '00000000-0000-0000-0000-000000000001';
  trek1_uuid uuid := gen_random_uuid();
  trek2_uuid uuid := gen_random_uuid();
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
  p7 uuid; p8 uuid; p9 uuid; p10 uuid; p11 uuid; p12 uuid; p13 uuid; p14 uuid;
begin

-- Captain
insert into captains (id, slug, brand_name, full_name, tagline, bio, accent_color, whatsapp, instagram, email, city, is_public)
values (
  captain_uuid,
  'sahil-treks',
  'Sahil Treks',
  'Sahil Devendramakhamale',
  'Adventure starts where the road ends',
  'Passionate trekker and organizer based out of Mumbai. I''ve been leading groups into the Sahyadris since 2021 — from moonlit Kalsubai summits to monsoon-drenched Harishchandragad traversals. Every trek is planned with safety, fun, and the right amount of challenge.',
  '#FF6B2C',
  '919876543210',
  'sahiltreks',
  'sahil@trekcaptain.app',
  'Mumbai',
  true
);

-- Trek 1: Kalsubai Night Trek
insert into treks (id, captain_id, slug, title, location, region, start_date, end_date, difficulty, price_per_person, max_capacity, cover_color, meeting_point, status, description, itinerary, packing_list, inclusions, exclusions, highlights, is_published)
values (
  trek1_uuid,
  captain_uuid,
  'kalsubai-night-trek',
  'Kalsubai Night Trek',
  'Kalsubai Peak, Ahmednagar',
  'Sahyadris',
  '2026-08-14',
  '2026-08-15',
  'Moderate',
  1499,
  25,
  '#FF6B2C',
  'Kasara Railway Station, East Exit, 11:00 PM',
  'Upcoming',
  'Scale the highest peak in Maharashtra under the stars! Kalsubai Night Trek is a thrilling moonlit adventure through rocky terrain and iron ladders, rewarding you with a spectacular sunrise from 1,646 meters above sea level.',
  '[
    {"day": 1, "title": "Meet at Kasara Station", "description": "Assemble at the east exit. Head count, introductions, and a quick briefing."},
    {"day": 1, "title": "Depart for Bari Village", "description": "Private bus to the base village — 1.5 hour drive through the ghats."},
    {"day": 1, "title": "Begin Night Ascent", "description": "Start the trek from Bari village. Headlamps on, moderate pace. The trail is well-marked."},
    {"day": 1, "title": "Iron Ladders Section", "description": "Quick snack break at the famous iron ladder section. Refill water, catch your breath."},
    {"day": 2, "title": "Summit — Sunrise!", "description": "Reach the peak at 1,646m. Watch the spectacular sunrise paint the Sahyadris gold."},
    {"day": 2, "title": "Breakfast at Summit", "description": "Hot poha and chai at the Kalsubai temple. Soak in the views."},
    {"day": 2, "title": "Descend to Base", "description": "Begin descent — 2.5 to 3 hours down to Bari village."},
    {"day": 2, "title": "Lunch & Depart", "description": "Hot lunch at a local dhaba — varan bhaat, bhakri, thecha. Bus back to Kasara by 1 PM."}
  ]'::jsonb,
  '["Trekking shoes (mandatory)", "Headlamp or torch", "2L water bottle", "Light jacket / windcheater", "Energy bars and dry snacks", "Rain poncho", "Personal medication", "Small daypack (30L)"]'::jsonb,
  '["Transport (Kasara ↔ Bari)", "Breakfast at summit", "Lunch at base", "Trek lead and safety rope", "First aid kit"]'::jsonb,
  '["Personal snacks beyond meals", "Camera / GoPro", "Travel insurance"]'::jsonb,
  'Night trek under the stars • Iron ladder adventure • Sunrise from the highest point in Maharashtra • Hot chai at 1,646m',
  true
);

-- Trek 2: Harishchandragad Monsoon Trek
insert into treks (id, captain_id, slug, title, location, region, start_date, end_date, difficulty, price_per_person, max_capacity, cover_color, meeting_point, status, description, itinerary, packing_list, inclusions, exclusions, highlights, is_published)
values (
  trek2_uuid,
  captain_uuid,
  'harishchandragad-monsoon',
  'Harishchandragad Monsoon Trek',
  'Harishchandragad, Ahmednagar',
  'Sahyadris',
  '2026-08-22',
  '2026-08-24',
  'Hard',
  2299,
  20,
  '#2DD4A7',
  'Shivajinagar Bus Stand, Pune, 6:00 AM',
  'Upcoming',
  'One of the most challenging treks in the Sahyadris! The ancient Nalichi Vaat route takes you through dense forests, rock patches, and a thrilling exposed traverse to reach the iconic Konkan Kada — the largest overhang in Asia.',
  '[
    {"day": 1, "title": "Depart from Pune", "description": "Bus from Shivajinagar to Khireshwar village. 4-hour drive through the ghats."},
    {"day": 1, "title": "Begin Nalichi Vaat", "description": "Enter the dense forest trail. Steep climb through rock patches and exposed sections."},
    {"day": 1, "title": "Packed Lunch Break", "description": "Lunch at a flat clearing midway. Carry packed meals."},
    {"day": 1, "title": "Reach Fort & Camp Setup", "description": "Arrive at Harishchandragad. Set up camp near Kedareshwar cave."},
    {"day": 1, "title": "Explore Kedareshwar Cave", "description": "Visit the ancient Shiva lingam surrounded by water in the cave temple."},
    {"day": 1, "title": "Dinner & Bonfire", "description": "Hot dinner under the stars. Stories, chai, and camaraderie."},
    {"day": 2, "title": "Sunrise at Konkan Kada", "description": "Walk to the iconic cliff — the largest overhang in Asia. Breathtaking sunrise views."},
    {"day": 2, "title": "Breakfast & Explore", "description": "Poha and chai at camp. Visit the ancient Saptatirtha Pushkarni stepped tank."},
    {"day": 2, "title": "Descend via Pachnai", "description": "Easier descent route through Pachnai village. 3-hour trek down."},
    {"day": 2, "title": "Lunch & Depart", "description": "Maharashtrian thali at a village home. Bus back to Pune by evening."}
  ]'::jsonb,
  '["Sturdy trekking shoes (ankle support)", "3L water", "Rain poncho and waterproof bag cover", "Warm layer for night", "Headlamp", "Trekking pole (recommended)", "Sunscreen", "Personal medication", "Sleeping bag liner", "40L backpack"]'::jsonb,
  '["Transport (Pune ↔ base)", "All meals (2 dinners, 2 breakfasts, 1 lunch)", "Camping equipment", "Trek lead and safety gear", "First aid"]'::jsonb,
  '["Personal snacks", "Sleeping bag (rentals available ₹200)", "Camera gear"]'::jsonb,
  'Konkan Kada — Asia''s largest overhang • Ancient cave temple • Monsoon waterfalls • Camping under the stars • Challenging Nalichi Vaat route',
  true
);

-- Participants for Trek 1 (Kalsubai) — 8 participants
p1 := gen_random_uuid();
p2 := gen_random_uuid();
p3 := gen_random_uuid();
p4 := gen_random_uuid();
p5 := gen_random_uuid();
p6 := gen_random_uuid();
p7 := gen_random_uuid();
p8 := gen_random_uuid();

insert into participants (id, trek_id, captain_id, name, phone, email, age, gender, blood_group, emergency_contact, status) values
  (p1, trek1_uuid, captain_uuid, 'Priya Sharma',    '9876543201', 'priya.sharma@gmail.com',    24, 'Female', 'B+',  '9876000001', 'Confirmed'),
  (p2, trek1_uuid, captain_uuid, 'Rohan Patil',     '9876543202', 'rohan.patil@gmail.com',     27, 'Male',   'O+',  '9876000002', 'Confirmed'),
  (p3, trek1_uuid, captain_uuid, 'Sneha Kulkarni',  '9876543203', 'sneha.kulkarni@gmail.com',  22, 'Female', 'A+',  '9876000003', 'Confirmed'),
  (p4, trek1_uuid, captain_uuid, 'Aditya Joshi',    '9876543204', 'aditya.joshi@gmail.com',    29, 'Male',   'AB+', '9876000004', 'Confirmed'),
  (p5, trek1_uuid, captain_uuid, 'Meera Rao',       '9876543205', 'meera.rao@gmail.com',       25, 'Female', 'O-',  '9876000005', 'Confirmed'),
  (p6, trek1_uuid, captain_uuid, 'Vikram Desai',    '9876543206', 'vikram.desai@gmail.com',    31, 'Male',   'A-',  '9876000006', 'Confirmed'),
  (p7, trek1_uuid, captain_uuid, 'Ananya Nair',     '9876543207', 'ananya.nair@gmail.com',     23, 'Female', 'B+',  '9876000007', 'Waitlist'),
  (p8, trek1_uuid, captain_uuid, 'Karan Gupta',     '9876543208', 'karan.gupta@gmail.com',     26, 'Male',   'O+',  '9876000008', 'Confirmed');

-- Participants for Trek 2 (Harishchandragad) — 6 participants
p9 := gen_random_uuid();
p10 := gen_random_uuid();
p11 := gen_random_uuid();
p12 := gen_random_uuid();
p13 := gen_random_uuid();
p14 := gen_random_uuid();

insert into participants (id, trek_id, captain_id, name, phone, email, age, gender, blood_group, emergency_contact, status) values
  (p9,  trek2_uuid, captain_uuid, 'Nisha Mehta',       '9876543209', 'nisha.mehta@gmail.com',      28, 'Female', 'A+',  '9876000009', 'Confirmed'),
  (p10, trek2_uuid, captain_uuid, 'Aryan Iyer',        '9876543210', 'aryan.iyer@gmail.com',       30, 'Male',   'B-',  '9876000010', 'Confirmed'),
  (p11, trek2_uuid, captain_uuid, 'Pooja Reddy',       '9876543211', 'pooja.reddy@gmail.com',      26, 'Female', 'O+',  '9876000011', 'Confirmed'),
  (p12, trek2_uuid, captain_uuid, 'Rahul Bhat',        '9876543212', 'rahul.bhat@gmail.com',       33, 'Male',   'AB-', '9876000012', 'Confirmed'),
  (p13, trek2_uuid, captain_uuid, 'Tanvi Patel',       '9876543213', 'tanvi.patel@gmail.com',      21, 'Female', 'A+',  '9876000013', 'Confirmed'),
  (p14, trek2_uuid, captain_uuid, 'Siddharth Singh',   '9876543214', 'siddharth.singh@gmail.com',  27, 'Male',   'O+',  '9876000014', 'Confirmed');

-- Payments — mix of full, partial, and unpaid
insert into payments (participant_id, trek_id, captain_id, amount, mode, note, paid_at) values
  -- Trek 1 payments
  (p1, trek1_uuid, captain_uuid, 1499, 'UPI',  'Full payment',     '2026-08-02T10:00:00Z'),
  (p2, trek1_uuid, captain_uuid, 1499, 'UPI',  'Full payment',     '2026-08-03T14:30:00Z'),
  (p3, trek1_uuid, captain_uuid, 500,  'UPI',  'Advance',          '2026-08-04T09:15:00Z'),
  (p4, trek1_uuid, captain_uuid, 1499, 'Cash', 'Full payment',     '2026-08-05T11:00:00Z'),
  (p5, trek1_uuid, captain_uuid, 750,  'Bank', 'Partial — advance','2026-08-06T16:00:00Z'),
  (p6, trek1_uuid, captain_uuid, 1499, 'UPI',  'Full payment',     '2026-08-07T08:45:00Z'),
  (p8, trek1_uuid, captain_uuid, 1499, 'UPI',  'Full payment',     '2026-08-08T12:00:00Z'),
  -- Trek 2 payments
  (p9,  trek2_uuid, captain_uuid, 2299, 'UPI',  'Full payment',    '2026-08-10T10:00:00Z'),
  (p10, trek2_uuid, captain_uuid, 1000, 'Bank', 'Advance',         '2026-08-11T14:00:00Z'),
  (p11, trek2_uuid, captain_uuid, 2299, 'UPI',  'Full payment',    '2026-08-12T09:30:00Z'),
  (p12, trek2_uuid, captain_uuid, 2299, 'Cash', 'Full payment',    '2026-08-13T11:00:00Z'),
  (p13, trek2_uuid, captain_uuid, 500,  'UPI',  'Token advance',   '2026-08-14T15:00:00Z');
  -- p14 (Siddharth) — no payment yet (unpaid)

-- Announcements
insert into announcements (trek_id, captain_id, message, priority, is_public) values
  (trek1_uuid, captain_uuid, '🎒 Packing list updated! Don''t forget: headlamp (mandatory), 2L water, light jacket, and energy bars. Full list on the trek page.', 'Normal', true),
  (trek1_uuid, captain_uuid, '⚠️ Weather alert: Moderate rainfall expected on trek night. Carry rain poncho and waterproof bag cover. Trek is ON — we go rain or shine!', 'Urgent', true),
  (trek2_uuid, captain_uuid, '📋 Fitness check: This is a Hard grade trek. Please ensure you can comfortably walk 15km with elevation gain. Reach out if concerns.', 'Normal', true),
  (trek2_uuid, captain_uuid, '🚌 Transport confirmed! Traveller bus from Shivajinagar. Exact boarding point: opposite Café Goodluck, 5:45 AM sharp.', 'Normal', false);

-- Expenses
insert into expenses (trek_id, captain_id, title, amount, category, paid_by, date) values
  (trek1_uuid, captain_uuid, 'Bus rental (Kasara ↔ Bari)',  4500, 'Transport', 'Sahil', '2026-08-10'),
  (trek1_uuid, captain_uuid, 'Breakfast at summit',          1200, 'Food',      'Sahil', '2026-08-10'),
  (trek1_uuid, captain_uuid, 'Lunch at base dhaba',          2000, 'Food',      'Sahil', '2026-08-10'),
  (trek2_uuid, captain_uuid, 'Bus rental (Pune ↔ Khireshwar)', 8000, 'Transport', 'Sahil', '2026-08-18'),
  (trek2_uuid, captain_uuid, 'Camping equipment rental',     3000, 'Stay',      'Sahil', '2026-08-18'),
  (trek2_uuid, captain_uuid, 'Food supplies (2 days)',        5000, 'Food',      'Sahil', '2026-08-20');

end $$;
