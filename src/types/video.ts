export interface Video {
  id: string;
  tag: string;
  title: string;
  duration: string;       // format "M:SS" — hanya untuk display
  youtube_id: string;     // bukan full URL, biar fleksibel
  description: string;
}

export interface MaterialVideos {
  material_id: number;
  videos: Video[];
}