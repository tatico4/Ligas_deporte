-- ============================================================
-- CANCHERO - Schema inicial
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM TYPES ──────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('super_admin', 'tournament_admin', 'captain', 'player');
CREATE TYPE tournament_type AS ENUM ('league', 'cup', 'group_knockout');
CREATE TYPE tournament_status AS ENUM ('draft', 'registration', 'active', 'finished', 'cancelled');
CREATE TYPE team_status AS ENUM ('active', 'inactive', 'disqualified');
CREATE TYPE player_status AS ENUM ('active', 'suspended', 'injured', 'inactive');
CREATE TYPE match_status AS ENUM ('scheduled', 'in_progress', 'finished', 'postponed', 'cancelled');
CREATE TYPE event_type AS ENUM ('goal', 'yellow_card', 'red_card', 'substitution', 'own_goal', 'penalty_goal');
CREATE TYPE plan_type AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
-- Extiende auth.users de Supabase

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'player',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan plan_type NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'trial',
  max_tournaments INT NOT NULL DEFAULT 1,
  max_teams_per_tournament INT NOT NULL DEFAULT 8,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TOURNAMENTS ──────────────────────────────────────────────────────────────

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type tournament_type NOT NULL DEFAULT 'league',
  status tournament_status NOT NULL DEFAULT 'draft',
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logo_url TEXT,
  start_date DATE,
  end_date DATE,
  max_teams INT NOT NULL DEFAULT 8,
  teams_per_group INT,
  points_win INT NOT NULL DEFAULT 3,
  points_draw INT NOT NULL DEFAULT 1,
  points_loss INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TEAMS ───────────────────────────────────────────────────────────────────

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  captain_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status team_status NOT NULL DEFAULT 'active',
  group_name TEXT,
  color_primary TEXT DEFAULT '#16a34a',
  color_secondary TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, name)
);

-- ─── PLAYERS ─────────────────────────────────────────────────────────────────

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  jersey_number INT,
  position TEXT,
  date_of_birth DATE,
  photo_url TEXT,
  status player_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);

-- ─── MATCHES ─────────────────────────────────────────────────────────────────

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  round TEXT NOT NULL DEFAULT 'Fecha 1',
  match_number INT NOT NULL,
  status match_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  venue TEXT,
  home_score INT,
  away_score INT,
  home_score_penalties INT,
  away_score_penalties INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (home_team_id <> away_team_id)
);

-- ─── MATCH EVENTS ────────────────────────────────────────────────────────────

CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  minute INT NOT NULL CHECK (minute >= 0 AND minute <= 200),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STANDINGS ───────────────────────────────────────────────────────────────

CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  group_name TEXT,
  played INT NOT NULL DEFAULT 0,
  won INT NOT NULL DEFAULT 0,
  drawn INT NOT NULL DEFAULT 0,
  lost INT NOT NULL DEFAULT 0,
  goals_for INT NOT NULL DEFAULT 0,
  goals_against INT NOT NULL DEFAULT 0,
  goal_difference INT GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points INT NOT NULL DEFAULT 0,
  position INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, team_id)
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_tournaments_admin_id ON tournaments(admin_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_teams_tournament_id ON teams(tournament_id);
CREATE INDEX idx_teams_captain_id ON teams(captain_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_home_team_id ON matches(home_team_id);
CREATE INDEX idx_matches_away_team_id ON matches(away_team_id);
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_standings_tournament_id ON standings(tournament_id);

-- ─── FUNCTION: Auto-crear profile al registrarse ─────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'player')
  );

  -- Crear suscripción trial por defecto
  INSERT INTO subscriptions (profile_id, plan, status, max_tournaments, max_teams_per_tournament, expires_at)
  VALUES (
    NEW.id,
    'free',
    'trial',
    1,
    8,
    NOW() + INTERVAL '30 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── FUNCTION: Actualizar standings al cargar resultado ──────────────────────

CREATE OR REPLACE FUNCTION update_standings_on_result()
RETURNS TRIGGER AS $$
DECLARE
  v_tournament_id UUID;
  v_points_win INT;
  v_points_draw INT;
  v_points_loss INT;
BEGIN
  IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    SELECT id, points_win, points_draw, points_loss
    INTO v_tournament_id, v_points_win, v_points_draw, v_points_loss
    FROM tournaments WHERE id = NEW.tournament_id;

    -- Insertar standings si no existen
    INSERT INTO standings (tournament_id, team_id) VALUES (v_tournament_id, NEW.home_team_id) ON CONFLICT DO NOTHING;
    INSERT INTO standings (tournament_id, team_id) VALUES (v_tournament_id, NEW.away_team_id) ON CONFLICT DO NOTHING;

    -- Resetear y recalcular (simplificado - en prod usar función más eficiente)
    WITH match_results AS (
      SELECT
        tournament_id,
        home_team_id AS team_id,
        home_score AS gf,
        away_score AS ga,
        CASE
          WHEN home_score > away_score THEN 'W'
          WHEN home_score < away_score THEN 'L'
          ELSE 'D'
        END AS result
      FROM matches WHERE tournament_id = v_tournament_id AND status = 'finished'
      UNION ALL
      SELECT
        tournament_id,
        away_team_id AS team_id,
        away_score AS gf,
        home_score AS ga,
        CASE
          WHEN away_score > home_score THEN 'W'
          WHEN away_score < home_score THEN 'L'
          ELSE 'D'
        END AS result
      FROM matches WHERE tournament_id = v_tournament_id AND status = 'finished'
    ),
    aggregated AS (
      SELECT
        tournament_id,
        team_id,
        COUNT(*) AS played,
        COUNT(*) FILTER (WHERE result = 'W') AS won,
        COUNT(*) FILTER (WHERE result = 'D') AS drawn,
        COUNT(*) FILTER (WHERE result = 'L') AS lost,
        SUM(gf) AS goals_for,
        SUM(ga) AS goals_against,
        COUNT(*) FILTER (WHERE result = 'W') * v_points_win +
        COUNT(*) FILTER (WHERE result = 'D') * v_points_draw +
        COUNT(*) FILTER (WHERE result = 'L') * v_points_loss AS points
      FROM match_results
      GROUP BY tournament_id, team_id
    )
    UPDATE standings s
    SET
      played = a.played,
      won = a.won,
      drawn = a.drawn,
      lost = a.lost,
      goals_for = a.goals_for,
      goals_against = a.goals_against,
      points = a.points,
      updated_at = NOW()
    FROM aggregated a
    WHERE s.tournament_id = a.tournament_id AND s.team_id = a.team_id;

    -- Actualizar posiciones
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY tournament_id
        ORDER BY points DESC, goal_difference DESC, goals_for DESC
      ) AS pos
      FROM standings WHERE tournament_id = v_tournament_id
    )
    UPDATE standings s SET position = r.pos
    FROM ranked r WHERE s.id = r.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_result_updated
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_standings_on_result();

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

-- Profiles: cada uno ve el suyo, super_admin ve todos
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Tournaments: público puede ver activos, admin ve los suyos, super_admin ve todos
CREATE POLICY "tournaments_select_public" ON tournaments FOR SELECT
  USING (status IN ('active', 'finished') OR admin_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

CREATE POLICY "tournaments_insert" ON tournaments FOR INSERT
  WITH CHECK (admin_id = auth.uid() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('tournament_admin', 'super_admin')
  ));

CREATE POLICY "tournaments_update" ON tournaments FOR UPDATE
  USING (admin_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

CREATE POLICY "tournaments_delete" ON tournaments FOR DELETE
  USING (admin_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- Teams: lectura pública, escritura solo admin del torneo o capitán
CREATE POLICY "teams_select" ON teams FOR SELECT USING (true);

CREATE POLICY "teams_insert" ON teams FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tournaments t
    WHERE t.id = tournament_id AND t.admin_id = auth.uid()
  ));

CREATE POLICY "teams_update" ON teams FOR UPDATE
  USING (captain_id = auth.uid() OR EXISTS (
    SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.admin_id = auth.uid()
  ));

-- Players: lectura pública, escritura capitán o admin
CREATE POLICY "players_select" ON players FOR SELECT USING (true);

CREATE POLICY "players_write" ON players FOR ALL
  USING (EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_id AND (
      t.captain_id = auth.uid() OR
      EXISTS (SELECT 1 FROM tournaments tr WHERE tr.id = t.tournament_id AND tr.admin_id = auth.uid())
    )
  ));

-- Matches: lectura pública, escritura admin del torneo
CREATE POLICY "matches_select" ON matches FOR SELECT USING (true);

CREATE POLICY "matches_write" ON matches FOR ALL
  USING (EXISTS (
    SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.admin_id = auth.uid()
  ));

-- Match events: lectura pública, escritura admin
CREATE POLICY "match_events_select" ON match_events FOR SELECT USING (true);

CREATE POLICY "match_events_write" ON match_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM matches m
    JOIN tournaments t ON t.id = m.tournament_id
    WHERE m.id = match_id AND t.admin_id = auth.uid()
  ));

-- Standings: lectura pública
CREATE POLICY "standings_select" ON standings FOR SELECT USING (true);

CREATE POLICY "standings_write" ON standings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'tournament_admin')
  ));

-- Subscriptions: solo el dueño y super_admin
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT
  USING (profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));
