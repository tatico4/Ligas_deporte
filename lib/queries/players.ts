import { supabase } from "@/lib/supabase";
import type { Player } from "@/types";

export async function getPlayers(teamId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .order("jersey_number");
  if (error) throw error;
  return data as Player[];
}

export async function createPlayer(player: Omit<Player, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("players")
    .insert(player)
    .select()
    .single();
  if (error) throw error;
  return data as Player;
}

export async function updatePlayer(id: string, updates: Partial<Player>) {
  const { data, error } = await supabase
    .from("players")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Player;
}

export async function deletePlayer(id: string) {
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw error;
}

export async function getTopScorers(tournamentId: string) {
  const { data, error } = await supabase
    .from("match_events")
    .select(
      "player:players(id, name, jersey_number, team:teams(name, logo_url))"
    )
    .in("event_type", ["goal", "penalty_goal"])
    .eq("matches.tournament_id", tournamentId);
  if (error) throw error;
  return data;
}
