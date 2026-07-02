"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import materials from "../../../public/assets/material-data.json";

export async function submitFeedback(
  slug: string,
  sessionId: string,
  rating: number,
  comment: string
) {
  if (!sessionId) return { success: false, error: "No session ID" };
  const material = materials.find((m) => m.slug === slug);
  if (!material) return { success: false, error: "Material not found" };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from("feedback").insert({
    session_id: sessionId,
    material_id: material.id,
    rating,
    comment,
  });

  if (error) {
    console.error("Failed to submit feedback:", error);
    // If unique constraint violation, it might mean feedback already submitted
    if (error.code === '23505') {
      return { success: true };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}
