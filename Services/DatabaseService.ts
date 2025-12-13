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
    // Don't fetch if no user is logged in
    if (!this.userId) {
      return [];
    }
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
      return games.map((game: any) => ({ ...game, isSavedToDB: true }));
    } catch (error) {
      return [];
    }
  }

  public async getHistory(): Promise<Minigame[]> {
    if (!this.userId) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/games/history`, {
        method: 'GET',
        headers: {
          'userId': this.userId,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.map((game: any) => ({ ...game, isSavedToDB: true }));
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  public async getLikedGames(): Promise<Minigame[]> {
    if (!this.userId) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/games/liked`, {
        method: 'GET',
        headers: {
          'userId': this.userId,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.map((game: any) => ({ ...game, isSavedToDB: true }));
    } catch (error) {
      console.error('Error fetching liked games:', error);
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

  public async forkGame(gameId: string, creatorName?: string): Promise<SaveGameResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/fork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': this.userId,
        },
        body: JSON.stringify({
          creatorName: creatorName || 'Anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newGame = await response.json();
      return { success: true, game: newGame };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  public async getPublicGames(
    page: number = 1,
    limit: number = 12,
    options?: {
      sort?: 'newest' | 'mostPlayed' | 'trending' | 'mostLiked';
      subject?: string;
      grade?: number | string;
      search?: string;
    }
  ): Promise<{ games: Minigame[], totalPages: number, totalGames: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (options?.sort) params.append('sort', options.sort);
      if (options?.subject && options.subject !== 'All') params.append('subject', options.subject);
      if (options?.grade && options.grade !== 'All') params.append('grade', options.grade.toString());
      if (options?.search) params.append('search', options.search);

      const response = await fetch(`${API_BASE_URL}/games/explore?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const games = data.games.map((game: any) => ({ ...game, isSavedToDB: true }));
      return { games, totalPages: data.totalPages, totalGames: data.totalGames || 0 };
    } catch (error) {
      return { games: [], totalPages: 0, totalGames: 0 };
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

  // Playlist methods
  public async getPlaylists(): Promise<any[]> {
    if (!this.userId) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/playlists`, {
        headers: { 'userId': this.userId }
      });
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async createPlaylist(title: string, description?: string, isPublic: boolean = false): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': this.userId
        },
        body: JSON.stringify({ title, description, isPublic })
      });
      if (!response.ok) throw new Error('Failed to create playlist');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async getPlaylist(id: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
        headers: { 'userId': this.userId }
      });
      if (!response.ok) throw new Error('Failed to fetch playlist');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async addGameToPlaylist(playlistId: string, gameId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': this.userId
        },
        body: JSON.stringify({ gameId })
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async removeGameFromPlaylist(playlistId: string, gameId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/games/${gameId}`, {
        method: 'DELETE',
        headers: { 'userId': this.userId }
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async deletePlaylist(playlistId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: { 'userId': this.userId }
      });
      return response.ok;
    } catch (error) {
      console.error(error);
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