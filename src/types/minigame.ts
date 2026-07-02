export interface Minigame {
  id: string;
  type: "custom" | "iframe";
  componentId?: string;
  embedUrl?: string;
  title: string;
  description: string;
  data?: Record<string, unknown>; // Additional custom data for the game
}
