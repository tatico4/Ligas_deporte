import { supabase } from "@/lib/supabase";
import type { Team } from "@/types";

export async function getTeams(tournamentId: string) {
  const { data, error } = await supabase
    .from("teams")
    .select("*, captain:profiles(id, full_name, avatar_url)")
    .eq("tournament_id", tournamentId)
    .order("name");
  if (error) throw error;
  return data as Team[];
}

export async function getTeam(id: string) {
  const { data, error } = await supabase
    .from("teams")
    .select("*, captain:profiles(id, full_name, avatar_url), players(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Team;
}

export async function createTeam(team: Omit<Team, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("teams")
    .insert(team)
    .select()
    .single();
  if (error) throw error;
  return data as Team;
}

export async function updateTeam(id: string, updates: Partial<Team>) {
  const { data, error } = await supabase
    .from("teams")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Team;
}
