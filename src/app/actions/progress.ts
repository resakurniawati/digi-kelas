"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import materials from "../../../public/assets/material-data.json";

export async function markResourceCompleted(slug: string, sessionId: string, resourceType: "emodul" | "video" | "lkpd" | "minigame" | "quiz" | "posttest") {
  if (!sessionId) return { success: false, error: "No session ID" };
  const material = materials.find((m) => m.slug === slug);
  if (!material) return { success: false, error: "Material not found" };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get current progress
  const { data: progress, error: fetchError } = await supabase
    .from("progress")
    .select("*")
    .eq("session_id", sessionId)
    .eq("material_id", material.id)
    .single();

  if (fetchError) {
    console.error("Fetch progress error:", fetchError);
  }

  if (!progress) {
    console.log("Progress not found for session:", sessionId, "material:", material.id);
    return { success: false, error: "Progress not found" };
  }

  // Determine what to update
  const updates: Record<string, string> = {};
  
  if (progress[resourceType] !== "completed") {
    updates[resourceType] = "completed";
  }

  // Check if either emodul or video is completed (or will be completed)
  const isEmodulCompleted = resourceType === "emodul" || progress.emodul === "completed";
  const isVideoCompleted = resourceType === "video" || progress.video === "completed";

  // If one of them is completed, ensure lkpd and minigame are available
  if (isEmodulCompleted || isVideoCompleted) {
    if (progress.lkpd === "locked") updates.lkpd = "available";
    if (progress.minigame === "locked") updates.minigame = "available";
  }

  // Check if either lkpd or minigame is completed
  const isLkpdCompleted = resourceType === "lkpd" || progress.lkpd === "completed";
  const isMinigameCompleted = resourceType === "minigame" || progress.minigame === "completed";

  // If one of them is completed, ensure quiz is available
  if (isLkpdCompleted || isMinigameCompleted) {
    if (progress.quiz === "locked") updates.quiz = "available";
  }

  // Check if quiz is completed
  const isQuizCompleted = resourceType === "quiz" || progress.quiz === "completed";

  // If quiz is completed, ensure posttest is available
  if (isQuizCompleted) {
    if (progress.posttest === "locked") updates.posttest = "available";
  }

  console.log("Progress updates to apply:", updates);

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("progress")
      .update(updates)
      .eq("session_id", sessionId)
      .eq("material_id", material.id);

    if (error) {
      console.error("Failed to update progress:", error);
      return { success: false, error: error.message };
    }
    
    // Revalidate the dashboard page so the UI reflects the unlocked status
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath(`/materi/${slug}`);
    revalidatePath(`/video/${slug}`);
    revalidatePath(`/lkpd/${slug}`);
    revalidatePath(`/minigame/${slug}`);
    revalidatePath(`/quiz/${slug}`);
    revalidatePath(`/post-test/${slug}`);
  }

  return { success: true, updates };
}

export async function initializeProgress(slug: string, sessionId: string) {
  if (!sessionId) return { success: false, error: "No session ID" };
  const material = materials.find((m) => m.slug === slug);
  if (!material) return { success: false, error: "Material not found" };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if progress data exists
  const { data: existingProgress } = await supabase
    .from("progress")
    .select("*")
    .eq("session_id", sessionId)
    .eq("material_id", material.id)
    .single();

  if (existingProgress) {
    const updates: Record<string, string> = { pretest: "completed" };
    if (existingProgress.emodul === "locked") updates.emodul = "available";
    if (existingProgress.video === "locked") updates.video = "available";

    // Update existing progress
    const { error: progressError } = await supabase
      .from("progress")
      .update(updates)
      .eq("session_id", sessionId)
      .eq("material_id", material.id);

    if (progressError) {
      console.error("Failed to update progress:", progressError);
      return { success: false, error: progressError.message };
    }
  } else {
    // Create new progress if not found
    const { error: progressInsertError } = await supabase
      .from("progress")
      .insert({
        session_id: sessionId,
        material_id: material.id,
        pretest: "completed",
        emodul: "available",
        video: "available",
        lkpd: "locked",
        minigame: "locked",
        quiz: "locked",
        posttest: "locked",
      });

    if (progressInsertError) {
      console.error("Failed to insert progress:", progressInsertError);
      return { success: false, error: progressInsertError.message };
    }
  }

  // Revalidate the dashboard
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/");
  
  return { success: true };
}
