// ─── User Roles ──────────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "tournament_admin" | "captain" | "player";

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Tournament ───────────────────────────────────────────────────────────────

export type TournamentType = "league" | "cup" | "group_knockout";
export type TournamentStatus = "draft" | "registration" | "active" | "finished" | "cancelled";

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  type: TournamentType;
  status: TournamentStatus;
  admin_id: string;
  logo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  max_teams: number;
  teams_per_group: number | null;
  points_win: number;
  points_draw: number;
  points_loss: number;
  created_at: string;
  updated_at: string;
}

// ─── Team ────────────────────────────────────────────────────────────────────

export type TeamStatus = "active" | "inactive" | "disqualified";

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  logo_url: string | null;
  captain_id: string | null;
  status: TeamStatus;
  group_name: string | null;
  color_primary: string | null;
  color_secondary: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Player ───────────────────────────────────────────────────────────────────

export type PlayerStatus = "active" | "suspended" | "injured" | "inactive";

export interface Player {
  id: string;
  team_id: string;
  profile_id: string | null;
  name: string;
  jersey_number: number | null;
  position: string | null;
  date_of_birth: string | null;
  photo_url: string | null;
  status: PlayerStatus;
  created_at: string;
  updated_at: string;
}

// ─── Match ────────────────────────────────────────────────────────────────────

export type MatchStatus = "scheduled" | "in_progress" | "finished" | "postponed" | "cancelled";
export type MatchRound = "group" | "round_of_16" | "quarter_final" | "semi_final" | "final" | string;

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  round: string;
  match_number: number;
  status: MatchStatus;
  scheduled_at: string | null;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
  home_score_penalties: number | null;
  away_score_penalties: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  home_team?: Team;
  away_team?: Team;
}

// ─── Match Event ──────────────────────────────────────────────────────────────

export type EventType = "goal" | "yellow_card" | "red_card" | "substitution" | "own_goal" | "penalty_goal";

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string | null;
  team_id: string;
  event_type: EventType;
  minute: number;
  description: string | null;
  created_at: string;
}

// ─── Standing ─────────────────────────────────────────────────────────────────

export interface Standing {
  id: string;
  tournament_id: string;
  team_id: string;
  group_name: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  position: number;
  updated_at: string;
  // Relations
  team?: Team;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type PlanType = "free" | "basic" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";

export interface Subscription {
  id: string;
  profile_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  max_tournaments: number;
  max_teams_per_tournament: number;
  started_at: string;
  expires_at: string | null;
  created_at: string;
}
