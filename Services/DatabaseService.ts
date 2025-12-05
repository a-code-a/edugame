import { Minigame } from '../types';

// Use environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

interface SaveGameResponse {
  success: boolean;
  game?: Minigame;
  error?: string;
}

class DatabaseService {
  private static instance: DatabaseService;
  private userId: string = '';

  private constructor() {
    // UserId will be set by AuthContext
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async saveGame(game: Minigame): Promise<SaveGameResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': this.userId,
        },
        body: JSON.stringify({
          ...game,
          userId: this.userId,
          creatorName: game.creatorName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const savedGame = await response.json();

      return {
        success: true,
        game: savedGame,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  public async getSavedGames(): Promise<Minigame[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/games?userId=${this.userId}`, {
        method: 'GET',
        headers: {
          'userId': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const games = await response.json();
      return games;
    } catch (error) {
      return [];
    }
  }

  public async updateGame(gameId: string, updates: Partial<Omit<Minigame, 'id'>>): Promise<SaveGameResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'userId': this.userId,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();

      return {
        success: true,
        game: updatedGame,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  public async deleteGame(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Attempting to delete game ${gameId} from ${API_BASE_URL}/games/${gameId}`);
      const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'userId': this.userId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        console.error('Delete game failed:', errorMessage);
        throw new Error(errorMessage);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteGame service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  public async incrementPlayCount(gameId: string): Promise<SaveGameResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/play`, {
        method: 'POST',
        headers: {
          'userId': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      return { success: true, game: updatedGame };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  public async toggleLike(gameId: string): Promise<SaveGameResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/like`, {
        method: 'POST',
        headers: {
          'userId': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      return { success: true, game: updatedGame };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  public async toggleDislike(gameId: string): Promise<SaveGameResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/dislike`, {
        method: 'POST',
        headers: {
          'userId': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      return { success: true, game: updatedGame };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  public async getPublicGames(page: number = 1, limit: number = 12): Promise<{ games: Minigame[], totalPages: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/explore?page=${page}&limit=${limit}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const games = data.games.map((game: any) => ({ ...game, isSavedToDB: true }));
      return { games, totalPages: data.totalPages };
    } catch (error) {
      return { games: [], totalPages: 0 };
    }
  }

  public async togglePublicStatus(gameId: string, isPublic: boolean): Promise<SaveGameResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': this.userId,
        },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedGame = await response.json();
      return { success: true, game: updatedGame };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public getUserId(): string {
    return this.userId;
  }
}

export default DatabaseService;