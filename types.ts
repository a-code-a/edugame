
export interface Minigame {
  id: string;
  title: string;
  description: string;
  grade: number;
  subject: string;
  htmlContent: string;
  isSavedToDB?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  playCount?: number;
  likes?: number;
  dislikes?: number;
  likedBy?: string[];
  dislikedBy?: string[];
  isPublic?: boolean;
  creatorName?: string;
  forkedFrom?: string;
}

export interface Playlist {
  _id: string; // Mongoose ID
  title: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  games: string[]; // List of game IDs
  createdAt: string;
  updatedAt: string;
  gameCount?: number; // enriched field
}


