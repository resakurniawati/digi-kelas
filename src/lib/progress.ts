import materials from "../../public/assets/material-data.json";
import type {
  CourseProgress,
  MaterialWithProgress,
  StepStatus,
} from "@/types/material";
import { supabase } from "./supabase/client";

export interface HomeProgressData {
  materials: MaterialWithProgress[];
  course: CourseProgress;
  certificateId?: string;
}

export async function getAllMaterialsWithProgress(
  sessionId: string,
): Promise<HomeProgressData> {
  // Ambil semua progress yang sudah ada untuk session ini
  const { data: existingRows } = await supabase
    .from("progress")
    .select("*")
    .eq("session_id", sessionId);

  const lastMaterial = materials[materials.length - 1];

  // Sertifikat kelulusan tunggal, tersimpan di bawah material_id materi terakhir
  const { data: certRow } = await supabase
    .from("certificates")
    .select("id")
    .eq("session_id", sessionId)
    .eq("material_id", lastMaterial.id.toString())
    .single();

  const firstRow = existingRows?.find((p) => p.material_id === materials[0].id);
  const lastRow = existingRows?.find((p) => p.material_id === lastMaterial.id);

  const course: CourseProgress = {
    pretest: (firstRow?.pretest as StepStatus) ?? "available",
    posttest: (lastRow?.posttest as StepStatus) ?? "locked",
  };

  const materialsWithProgress: MaterialWithProgress[] = materials.map(
    (material, index) => {
      const row = existingRows?.find((p) => p.material_id === material.id);

      // Kalau belum ada row-nya, tentukan status default emodul/video:
      // materi pertama menunggu pre-test global, materi lain menunggu quiz materi sebelumnya
      let defaultStatus: StepStatus = "locked";
      if (index === 0) {
        defaultStatus = course.pretest === "completed" ? "available" : "locked";
      } else {
        const prevRow = existingRows?.find(
          (p) => p.material_id === materials[index - 1].id,
        );
        defaultStatus = prevRow?.quiz === "completed" ? "available" : "locked";
      }

      return {
        ...material,
        progress: row
          ? {
              material_id: row.material_id,
              emodul: row.emodul,
              video: row.video,
              lkpd: row.lkpd,
              minigame: row.minigame,
              quiz: row.quiz,
            }
          : {
              material_id: material.id,
              emodul: defaultStatus,
              video: defaultStatus,
              lkpd: "locked",
              minigame: "locked",
              quiz: "locked",
            },
      };
    },
  );

  return {
    materials: materialsWithProgress,
    course,
    certificateId: certRow?.id,
  };
}
