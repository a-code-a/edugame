const fetch = require('node-fetch');

async function testDeleteEndpoint() {
  const API_BASE_URL = 'http://localhost:5000/api';
  const USER_ID = 'user-123';
  
  try {
    // First, create a test game
    console.log('Creating test game...');
    const createResponse = await fetch(`${API_BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userId': USER_ID,
      },
      body: JSON.stringify({
        id: 'test-delete-game-001',
        title: 'Test Game for Delete',
        description: 'Test game to verify delete functionality',
        grade: 5,
        subject: 'Math',
        htmlContent: '<div>Test content</div>',
        userId: USER_ID,
      }),
    });
    
    if (createResponse.ok) {
      const createdGame = await createResponse.json();
      console.log('✅ Game created successfully:', createdGame.id);
      
      // Now delete the game
      console.log('Deleting test game...');
      const deleteResponse = await fetch(`${API_BASE_URL}/games/test-delete-game-001`, {
        method: 'DELETE',
        headers: {
          'userId': USER_ID,
        },
      });
      
      if (deleteResponse.ok) {
        const result = await deleteResponse.json();
        console.log('✅ Game deleted successfully:', result);
        
        // Verify the game is actually deleted
        console.log('Verifying deletion...');
        const verifyResponse = await fetch(`${API_BASE_URL}/games?userId=${USER_ID}`, {
          method: 'GET',
          headers: {
            'userId': USER_ID,
          },
        });
        
        if (verifyResponse.ok) {
          const games = await verifyResponse.json();
          const gameStillExists = games.some(game => game.id === 'test-delete-game-001');
          if (!gameStillExists) {
            console.log('✅ Game successfully removed from database');
          } else {
            console.log('❌ Game still exists in database');
          }
        }
      } else {
        const error = await deleteResponse.json();
        console.log('❌ Delete failed:', error);
      }
    } else {
      const error = await createResponse.json();
      console.log('❌ Create failed:', error);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testDeleteEndpoint();