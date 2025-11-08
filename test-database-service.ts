import DatabaseService from './Services/DatabaseService';
import { Minigame } from './types';

async function testDatabaseService() {
  console.log('🧪 Testing DatabaseService methods...');
  
  const dbService = DatabaseService.getInstance();
  
  // Test 1: Save a game
  console.log('\n1. Testing saveGame...');
  const testGame: Minigame = {
    id: 'test-game-002',
    title: 'Test Science Game',
    description: 'A test game for DatabaseService testing',
    grade: 6,
    subject: 'Science',
    htmlContent: '<div>Test science game content</div>',
    userId: 'user-123',
    isSavedToDB: false
  };
  
  const saveResult = await dbService.saveGame(testGame);
  console.log('Save result:', saveResult);
  
  // Test 2: Get saved games
  console.log('\n2. Testing getSavedGames...');
  const savedGames = await dbService.getSavedGames();
  console.log('Retrieved games:', savedGames.length);
  console.log('Games:', savedGames);
  
  // Test 3: Delete the game
  console.log('\n3. Testing deleteGame...');
  const deleteResult = await dbService.deleteGame('test-game-002');
  console.log('Delete result:', deleteResult);
  
  // Test 4: Verify deletion
  console.log('\n4. Verifying deletion...');
  const gamesAfterDelete = await dbService.getSavedGames();
  console.log('Games after deletion:', gamesAfterDelete.length);
  
  console.log('\n✅ DatabaseService tests completed!');
}

testDatabaseService().catch(console.error);