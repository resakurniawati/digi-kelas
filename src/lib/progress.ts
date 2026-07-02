import materials from "../../public/assets/material-data.json";
import type {
  MaterialProgress,
  MaterialWithProgress,
  StepStatus,
} from "@/types/material";
import { supabase } from "./supabase/client";

// Tentukan default status berdasarkan posisi materi
function getDefaultStatus(
  materialId: number,
): Pick<
  MaterialProgress,
  "pretest" | "emodul" | "video" | "lkpd" | "minigame" | "quiz" | "posttest"
> {
  const isFirst = materialId === materials[0].id;

  return {
    pretest: isFirst ? "available" : "locked",
    emodul: "locked",
    video: "locked",
    lkpd: "locked",
    minigame: "locked",
    quiz: "locked",
    posttest: "locked",
  };
}

export async function getOrCreateProgress(
  sessionId: string,
  materialId: number,
): Promise<MaterialProgress> {
  // Coba ambil yang sudah ada
  const { data: existing } = await supabase
    .from("progress")
    .select("*")
    .eq("session_id", sessionId)
    .eq("material_id", materialId)
    .single();

  if (existing) return existing as MaterialProgress;

  // Belum ada — buat baru dengan default status
  // Cek apakah materi sebelumnya sudah selesai untuk menentukan apakah
  // pretest materi ini seharusnya available atau masih locked
  const defaultStatus = await resolveDefaultStatus(sessionId, materialId);

  const { data: newRow } = await supabase
    .from("progress")
    .insert({
      session_id: sessionId,
      material_id: materialId,
      ...defaultStatus,
    })
    .select("*")
    .single();

  return newRow as MaterialProgress;
}

// Cek apakah materi sebelumnya sudah posttest completed
async function resolveDefaultStatus(sessionId: string, materialId: number) {
  const materialIndex = materials.findIndex((m) => m.id === materialId);
  const isFirst = materialIndex === 0;

  if (isFirst) {
    return getDefaultStatus(materialId); // langsung available
  }

  const prevMaterialId = materials[materialIndex - 1].id;

  const { data: prevProgress } = await supabase
    .from("progress")
    .select("posttest")
    .eq("session_id", sessionId)
    .eq("material_id", prevMaterialId)
    .single();

  const prevCompleted = prevProgress?.posttest === "completed";

  return {
    pretest: prevCompleted
      ? ("available" as StepStatus)
      : ("locked" as StepStatus),
    emodul: "locked" as StepStatus,
    video: "locked" as StepStatus,
    lkpd: "locked" as StepStatus,
    minigame: "locked" as StepStatus,
    quiz: "locked" as StepStatus,
    posttest: "locked" as StepStatus,
  };
}

export async function getAllMaterialsWithProgress(
  sessionId: string,
): Promise<MaterialWithProgress[]> {
  // Ambil semua progress yang sudah ada untuk session ini
  const { data: existingRows } = await supabase
    .from("progress")
    .select("*")
    .eq("session_id", sessionId);

  // Ambil semua sertifikat untuk session ini
  const { data: certRows } = await supabase
    .from("certificates")
    .select("id, material_id")
    .eq("session_id", sessionId);

  return materials.map((material, index) => {
    const progress = existingRows?.find((p) => p.material_id === material.id);
    const certificate = certRows?.find((c) => c.material_id === material.id.toString());

    // Kalau belum ada row-nya, gunakan default —
    // Kita cek apakah material sebelumnya sudah posttest completed
    let pretestStatus: StepStatus = "locked";
    if (index === 0) {
      pretestStatus = "available";
    } else {
      const prevMaterialId = materials[index - 1].id;
      const prevProgress = existingRows?.find((p) => p.material_id === prevMaterialId);
      if (prevProgress?.posttest === "completed") {
        pretestStatus = "available";
      }
    }

    return {
      ...material,
      certificateId: certificate?.id,
      progress: progress ?? {
        material_id: material.id,
        pretest: pretestStatus,
        emodul: "locked",
        video: "locked",
        lkpd: "locked",
        minigame: "locked",
        quiz: "locked",
        posttest: "locked",
      },
    } as MaterialWithProgress;
  });
}
