-- StudySphere Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT,
  first_name  TEXT,
  last_name   TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Courses ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  course_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name      TEXT NOT NULL,
  course_code      TEXT,
  professor_name   TEXT,
  semester         TEXT,
  credits          INTEGER DEFAULT 3,
  current_grade    NUMERIC(5,2),
  color            TEXT DEFAULT '#6366f1',
  task_count       INTEGER DEFAULT 0,
  completed_tasks  INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Assignments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  assignment_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id       UUID REFERENCES courses(course_id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        TIMESTAMPTZ,
  estimated_time  INTEGER,
  actual_time     INTEGER,
  priority_level  TEXT DEFAULT 'medium' CHECK (priority_level IN ('high', 'medium', 'low')),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in progress', 'completed')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── Study Sessions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_sessions (
  session_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id         UUID REFERENCES courses(course_id) ON DELETE SET NULL,
  title             TEXT DEFAULT 'Study Session',
  start_time        TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time          TIMESTAMPTZ,
  duration_minutes  INTEGER,
  topic             TEXT,
  notes             TEXT,
  location          TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── GPA Records ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gpa_records (
  gpa_record_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id       UUID REFERENCES courses(course_id) ON DELETE SET NULL,
  semester        TEXT NOT NULL,
  year            INTEGER NOT NULL,
  gpa_value       NUMERIC(4,2) NOT NULL,
  cumulative_gpa  NUMERIC(4,2),
  goal_gpa        NUMERIC(4,2),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── Burnout Alerts ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS burnout_alerts (
  alert_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type       TEXT,
  severity_level   TEXT DEFAULT 'low' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  message          TEXT NOT NULL,
  description      TEXT,
  trigger_factors  JSONB DEFAULT '[]',
  recommendations  JSONB DEFAULT '[]',
  status           TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpa_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_alerts ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "own profile select" ON profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own profile insert" ON profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own profile update" ON profiles FOR UPDATE USING (user_id = auth.uid());

-- Courses
CREATE POLICY "own courses select" ON courses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own courses insert" ON courses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own courses update" ON courses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "own courses delete" ON courses FOR DELETE USING (user_id = auth.uid());

-- Assignments
CREATE POLICY "own assignments select" ON assignments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own assignments insert" ON assignments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own assignments update" ON assignments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "own assignments delete" ON assignments FOR DELETE USING (user_id = auth.uid());

-- Study Sessions
CREATE POLICY "own sessions select" ON study_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own sessions insert" ON study_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own sessions update" ON study_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "own sessions delete" ON study_sessions FOR DELETE USING (user_id = auth.uid());

-- GPA Records
CREATE POLICY "own gpa select" ON gpa_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own gpa insert" ON gpa_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own gpa update" ON gpa_records FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "own gpa delete" ON gpa_records FOR DELETE USING (user_id = auth.uid());

-- Burnout Alerts
CREATE POLICY "own alerts select" ON burnout_alerts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "own alerts insert" ON burnout_alerts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "own alerts update" ON burnout_alerts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "own alerts delete" ON burnout_alerts FOR DELETE USING (user_id = auth.uid());

-- ─── Auto-create profile on signup ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
