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
      console.log('✅ Game saved to database successfully:', savedGame.id);
      
      return {
        success: true,
        game: savedGame,
      };
    } catch (error) {
      console.error('❌ Error saving game to database:', error);
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
      console.log('✅ Retrieved saved games from database:', games.length);
      return games;
    } catch (error) {
      console.error('❌ Error fetching saved games:', error);
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
      console.log('✅ Game updated in database successfully:', gameId);
      
      return {
        success: true,
        game: updatedGame,
      };
    } catch (error) {
      console.error('❌ Error updating game in database:', error);
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

      console.log('✅ Game deleted from database successfully:', gameId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting game from database:', error);
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