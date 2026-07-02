"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import materials from "../../../public/assets/material-data.json";

export async function saveScore(
  slug: string,
  sessionId: string,
  type: "pretest" | "posttest" | "quiz",
  score: number,
  durationSeconds?: number
) {
  if (!sessionId) return { success: false, error: "No session ID" };
  const material = materials.find((m) => m.slug === slug);
  if (!material) return { success: false, error: "Material not found" };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const payload: {
    session_id: string;
    material_id: string;
    type: string;
    score: number;
    duration_seconds?: number;
  } = {
    session_id: sessionId,
    material_id: material.id.toString(),
    type: type,
    score: score,
  };
  
  if (durationSeconds !== undefined) {
    payload.duration_seconds = durationSeconds;
  }

  const { error } = await supabase
    .from("scores")
    .upsert(payload, { onConflict: "session_id, material_id, type" });

  if (error) {
    console.error("Failed to save score:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function getScore(
  slug: string,
  sessionId: string,
  type: "pretest" | "posttest" | "quiz"
) {
  const material = materials.find((m) => m.slug === slug);
  if (!material) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("scores")
    .select("score, duration_seconds")
    .eq("session_id", sessionId)
    .eq("material_id", material.id)
    .eq("type", type)
    .single();

  if (data) {
    return { score: data.score, durationSeconds: data.duration_seconds };
  }
  return null;
}
