"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import materials from "../../../public/assets/material-data.json";

type ResourceType =
  | "emodul"
  | "video"
  | "lkpd"
  | "minigame"
  | "quiz"
  | "posttest";

export async function markResourceCompleted(
  slug: string,
  sessionId: string,
  resourceType: ResourceType,
) {
  if (!sessionId) return { success: false, error: "No session ID" };
  const materialIndex = materials.findIndex((m) => m.slug === slug);
  if (materialIndex === -1)
    return { success: false, error: "Material not found" };
  const material = materials[materialIndex];
  const isLastMaterial = materialIndex === materials.length - 1;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get current progress
  let { data: progress } = await supabase
    .from("progress")
    .select("*")
    .eq("session_id", sessionId)
    .eq("material_id", material.id)
    .single();

  if (!progress) {
    // Sesi lama (sebelum perubahan ke alur global pretest/posttest) mungkin
    // belum punya row untuk materi ini meski materi sebelumnya sudah quiz
    // completed — buat row-nya sekarang mengikuti aturan yang sama dengan
    // getAllMaterialsWithProgress, supaya sesi tidak macet permanen.
    let allowed = false;

    if (materialIndex > 0) {
      const prevMaterial = materials[materialIndex - 1];
      const { data: prevProgress } = await supabase
        .from("progress")
        .select("quiz")
        .eq("session_id", sessionId)
        .eq("material_id", prevMaterial.id)
        .single();
      allowed = prevProgress?.quiz === "completed";
    }

    if (!allowed) {
      console.log("Progress not found for session:", sessionId, "material:", material.id);
      return { success: false, error: "Progress not found" };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("progress")
      .insert({
        session_id: sessionId,
        material_id: material.id,
        pretest: "locked",
        emodul: "available",
        video: "available",
        lkpd: "locked",
        minigame: "locked",
        quiz: "locked",
        posttest: "locked",
      })
      .select("*")
      .single();

    if (insertError || !inserted) {
      console.error("Failed to create progress:", insertError);
      return { success: false, error: insertError?.message ?? "Failed to create progress" };
    }

    progress = inserted;
  }

  // Determine what to update on this material's own row
  const updates: Record<string, string> = {};

  if (progress[resourceType] !== "completed") {
    updates[resourceType] = "completed";
  }

  const isEmodulCompleted = resourceType === "emodul" || progress.emodul === "completed";
  const isVideoCompleted = resourceType === "video" || progress.video === "completed";

  if (isEmodulCompleted || isVideoCompleted) {
    if (progress.lkpd === "locked") updates.lkpd = "available";
    if (progress.minigame === "locked") updates.minigame = "available";
  }

  const isLkpdCompleted = resourceType === "lkpd" || progress.lkpd === "completed";
  const isMinigameCompleted = resourceType === "minigame" || progress.minigame === "completed";

  if (isLkpdCompleted || isMinigameCompleted) {
    if (progress.quiz === "locked") updates.quiz = "available";
  }

  const isQuizCompleted = resourceType === "quiz" || progress.quiz === "completed";

  // Quiz materi terakhir membuka post-test global (dulunya posttest materi itu sendiri)
  if (isQuizCompleted && isLastMaterial && progress.posttest === "locked") {
    updates.posttest = "available";
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
  }

  // Quiz selesai pada materi bukan-terakhir membuka e-modul/video materi berikutnya
  // (dulunya ini menunggu posttest materi itu + pretest materi berikutnya)
  if (resourceType === "quiz" && isQuizCompleted && !isLastMaterial) {
    const nextMaterial = materials[materialIndex + 1];

    const { data: nextProgress } = await supabase
      .from("progress")
      .select("*")
      .eq("session_id", sessionId)
      .eq("material_id", nextMaterial.id)
      .single();

    if (nextProgress) {
      const nextUpdates: Record<string, string> = {};
      if (nextProgress.emodul === "locked") nextUpdates.emodul = "available";
      if (nextProgress.video === "locked") nextUpdates.video = "available";
      if (Object.keys(nextUpdates).length > 0) {
        await supabase
          .from("progress")
          .update(nextUpdates)
          .eq("session_id", sessionId)
          .eq("material_id", nextMaterial.id);
      }
    } else {
      await supabase.from("progress").insert({
        session_id: sessionId,
        material_id: nextMaterial.id,
        pretest: "locked",
        emodul: "available",
        video: "available",
        lkpd: "locked",
        minigame: "locked",
        quiz: "locked",
        posttest: "locked",
      });
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/materi/${nextMaterial.slug}`);
    revalidatePath(`/video/${nextMaterial.slug}`);
  }

  // Revalidate the dashboard page so the UI reflects the unlocked status
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/");
  revalidatePath(`/materi/${slug}`);
  revalidatePath(`/video/${slug}`);
  revalidatePath(`/lkpd/${slug}`);
  revalidatePath(`/minigame/${slug}`);
  revalidatePath(`/quiz/${slug}`);
  revalidatePath("/post-test");

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
  revalidatePath("/pre-test");

  return { success: true };
}
