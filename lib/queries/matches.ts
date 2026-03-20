import { supabase } from "@/lib/supabase";
import type { Match, MatchEvent, Standing } from "@/types";

export async function getMatches(tournamentId: string) {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(id, name, logo_url), away_team:teams!matches_away_team_id_fkey(id, name, logo_url)"
    )
    .eq("tournament_id", tournamentId)
    .order("match_number");
  if (error) throw error;
  return data as Match[];
}

export async function getMatch(id: string) {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*), match_events(*, player:players(name, jersey_number))"
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Match;
}

export async function updateMatchScore(
  id: string,
  homeScore: number,
  awayScore: number,
  homeScorePenalties?: number,
  awayScorePenalties?: number
) {
  const { data, error } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      home_score_penalties: homeScorePenalties ?? null,
      away_score_penalties: awayScorePenalties ?? null,
      status: "finished",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Match;
}

export async function addMatchEvent(event: Omit<MatchEvent, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("match_events")
    .insert(event)
    .select()
    .single();
  if (error) throw error;
  return data as MatchEvent;
}

export async function getStandings(tournamentId: string) {
  const { data, error } = await supabase
    .from("standings")
    .select("*, team:teams(id, name, logo_url)")
    .eq("tournament_id", tournamentId)
    .order("position");
  if (error) throw error;
  return data as Standing[];
}

export async function generateFixtureRoundRobin(tournamentId: string, teamIds: string[]) {
  const matches: Omit<Match, "id" | "created_at" | "updated_at" | "home_team" | "away_team">[] = [];
  let matchNumber = 1;

  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push("bye");

  const rounds = teams.length - 1;
  const half = teams.length / 2;

  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = teams[i];
      const away = teams[teams.length - 1 - i];
      if (home !== "bye" && away !== "bye") {
        matches.push({
          tournament_id: tournamentId,
          home_team_id: home,
          away_team_id: away,
          round: `Fecha ${round}`,
          match_number: matchNumber++,
          status: "scheduled",
          scheduled_at: null,
          venue: null,
          home_score: null,
          away_score: null,
          home_score_penalties: null,
          away_score_penalties: null,
          notes: null,
        });
      }
    }
    // Rotate teams (keep first fixed)
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }

  const { data, error } = await supabase.from("matches").insert(matches).select();
  if (error) throw error;
  return data as Match[];
}
