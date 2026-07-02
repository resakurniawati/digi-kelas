"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import materials from "../../../public/assets/material-data.json";

export async function generateCertificate(
  slug: string,
  sessionId: string,
  learnerName: string,
  score: number
) {
  if (!sessionId) return { success: false, error: "No session ID" };
  const material = materials.find((m) => m.slug === slug);
  if (!material) return { success: false, error: "Material not found" };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if certificate already exists
  const { data: existing } = await supabase
    .from("certificates")
    .select("id")
    .eq("session_id", sessionId)
    .eq("material_id", material.id)
    .single();

  if (existing) {
    return { success: true, certificateId: existing.id };
  }

  // Generate new certificate
  const { data, error } = await supabase
    .from("certificates")
    .insert({
      session_id: sessionId,
      material_id: material.id.toString(),
      learner_name: learnerName,
      score: score,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to generate certificate:", error);
    return { success: false, error: error.message };
  }

  return { success: true, certificateId: data.id };
}

export async function getCertificate(slug: string, sessionId: string) {
  const material = materials.find((m) => m.slug === slug);
  if (!material) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("certificates")
    .select("id, created_at, learner_name")
    .eq("session_id", sessionId)
    .eq("material_id", material.id)
    .single();

  return data || null;
}
