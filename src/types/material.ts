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
  pretest: StepStatus;
  emodul: StepStatus;
  video: StepStatus;
  lkpd: StepStatus;
  minigame: StepStatus;
  quiz: StepStatus;
  posttest: StepStatus;
}

// Yang dipakai di UI — gabungan keduanya
export interface MaterialWithProgress extends Material {
  progress: MaterialProgress;
  certificateId?: string;
}