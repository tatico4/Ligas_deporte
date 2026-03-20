import * as FileSystem from "expo-file-system";
import { supabase } from "@/lib/supabase";

// ─── Bucket names ──────────────────────────────────────────────────────────────
// Crear estos buckets en Supabase Dashboard > Storage:
//   - "logos"   → torneos y equipos  (public)
//   - "avatars" → perfiles de usuario (public)
//   - "players" → fotos de jugadores  (public)
export type StorageBucket = "logos" | "avatars" | "players";

// ─── Upload ───────────────────────────────────────────────────────────────────
/**
 * Sube una imagen local al bucket indicado y devuelve la URL pública.
 * @param bucket  nombre del bucket
 * @param path    ruta dentro del bucket, ej: "tournaments/abc123.jpg"
 * @param localUri URI local del archivo (viene de expo-image-picker)
 */
export async function uploadImage(
  bucket: StorageBucket,
  path: string,
  localUri: string
): Promise<string> {
  // Leer el archivo como base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Detectar extensión y mime type
  const ext = localUri.split(".").pop()?.toLowerCase() ?? "jpg";
  const mime = ext === "png" ? "image/png" : "image/jpeg";

  // Convertir base64 a ArrayBuffer (compatible con Supabase JS v2)
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, byteArray, {
      contentType: mime,
      upsert: true, // sobrescribir si ya existe
    });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Delete ───────────────────────────────────────────────────────────────────
export async function deleteImage(bucket: StorageBucket, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.warn("No se pudo eliminar la imagen:", error.message);
}

// ─── Helpers de path ──────────────────────────────────────────────────────────
export function tournamentLogoPath(tournamentId: string) {
  return `tournaments/${tournamentId}.jpg`;
}

export function teamLogoPath(teamId: string) {
  return `teams/${teamId}.jpg`;
}

export function avatarPath(userId: string) {
  return `users/${userId}.jpg`;
}

export function playerPhotoPath(playerId: string) {
  return `players/${playerId}.jpg`;
}
