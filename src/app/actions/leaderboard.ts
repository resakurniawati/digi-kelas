"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

import materials from "../../../public/assets/material-data.json";

export type MaterialScoreDetail = {
  pretest: number;
  quiz: number;
  posttest: number;
  total: number;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  totalScore: number;
  materials: Record<string, MaterialScoreDetail>;
};

export type LeaderboardData = {
  entries: LeaderboardEntry[];
  materialTabs: { id: string; title: string; misi: number }[];
};

export async function getLeaderboard(materialId: string = "overall"): Promise<LeaderboardData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const materialTabs = materials.map(m => ({ id: m.id.toString(), title: m.title, misi: m.misi }));

  let query = supabase.from("scores").select(`
    score, material_id, type, session_id,
    sessions ( name )
  `);
  
  if (materialId !== "overall") {
    query = query.eq("material_id", materialId);
  }
  
  const { data: scoresData, error } = await query;
  
  if (error) {
    console.error("Failed to fetch leaderboard:", error);
    return { entries: [], materialTabs };
  }

  const sessionMap = new Map<string, LeaderboardEntry>();
  
  scoresData.forEach((sc: any) => {
    if (!sc.sessions) return;
    
    const sid = sc.session_id;
    if (!sessionMap.has(sid)) {
      sessionMap.set(sid, { id: sid, name: sc.sessions.name, totalScore: 0, materials: {} });
    }
    
    const entry = sessionMap.get(sid)!;
    const mId = sc.material_id;
    
    if (!entry.materials[mId]) {
      entry.materials[mId] = { pretest: 0, quiz: 0, posttest: 0, total: 0 };
    }
    
    const sVal = sc.score || 0;
    if (sc.type === "pretest") entry.materials[mId].pretest += sVal;
    else if (sc.type === "quiz") entry.materials[mId].quiz += sVal;
    else if (sc.type === "posttest") entry.materials[mId].posttest += sVal;
    
    entry.materials[mId].total += sVal;
    entry.totalScore += sVal;
  });

  let entries = Array.from(sessionMap.values());
  
  if (materialId === "overall") {
    entries = entries.filter(e => e.totalScore > 0).sort((a, b) => b.totalScore - a.totalScore);
  } else {
    entries = entries.filter(e => {
      const mat = e.materials[materialId];
      return mat && mat.total > 0;
    }).sort((a, b) => {
      const scoreA = a.materials[materialId]?.total || 0;
      const scoreB = b.materials[materialId]?.total || 0;
      return scoreB - scoreA;
    });
  }

  // Limit to 10 right after sorting on the backend
  entries = entries.slice(0, 10);

  return { entries, materialTabs };
}
