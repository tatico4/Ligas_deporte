import { supabase } from "@/lib/supabase";
import type { Tournament } from "@/types";

export async function getTournaments(adminId?: string) {
  let query = supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });

  if (adminId) {
    query = query.eq("admin_id", adminId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Tournament[];
}

export async function getTournament(id: string) {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Tournament;
}

export async function createTournament(tournament: Omit<Tournament, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("tournaments")
    .insert(tournament)
    .select()
    .single();
  if (error) throw error;
  return data as Tournament;
}

export async function updateTournament(id: string, updates: Partial<Tournament>) {
  const { data, error } = await supabase
    .from("tournaments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Tournament;
}

export async function deleteTournament(id: string) {
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw error;
}
