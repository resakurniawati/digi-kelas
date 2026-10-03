export type StepStatus = 'locked' | 'available' | 'completed';

export interface Material {
  id: number;
  misi: number;
  title: string;
  slug: string;
  description: string;
  tip: string;
  icon: string;
  theme: string;
}

export interface MaterialProgress {
  material_id: number;
  emodul: StepStatus;
  video: StepStatus;
  lkpd: StepStatus;
  minigame: StepStatus;
  quiz: StepStatus;
}

// Status pre-test/post-test tunggal untuk seluruh kelas (bukan per materi)
export interface CourseProgress {
  pretest: StepStatus;
  posttest: StepStatus;
}

// Yang dipakai di UI — gabungan keduanya
export interface MaterialWithProgress extends Material {
  progress: MaterialProgress;
}