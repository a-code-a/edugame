import { Minigame } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';
const USER_ID = 'user-123'; // In a real app, this would come from authentication

interface SaveGameResponse {
  success: boolean;
  game?: Minigame;
  error?: string;
}

class DatabaseService {
  private static instance: DatabaseService;
  private userId: string;

  private constructor() {
    this.userId = USER_ID;
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

  public async deleteGame(gameId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'userId': this.userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      return false;
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