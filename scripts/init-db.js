const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://uwuchan69:uwuchan69@cluster0.krowk0f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'dewatt';

async function initDatabase() {
  console.log('Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);

  console.log('Creating collections...');
  
  const collections = ['users', 'charging_sessions', 'p2p_orders'];
  
  for (const collection of collections) {
    try {
      await db.createCollection(collection);
      console.log(`✓ Created collection: ${collection}`);
    } catch (error) {
      console.log(`Collection ${collection} already exists`);
    }
  }

  console.log('\nCreating indexes...');
  
  await db.collection('users').createIndex({ wallet: 1 }, { unique: true });
  console.log('✓ Created index on users.wallet');
  
  await db.collection('charging_sessions').createIndex({ chargeId: 1 }, { unique: true });
  await db.collection('charging_sessions').createIndex({ wallet: 1 });
  console.log('✓ Created indexes on charging_sessions');
  
  await db.collection('p2p_orders').createIndex({ status: 1, type: 1 });
  console.log('✓ Created indexes on p2p_orders');

  console.log('\nDatabase initialization complete!');
  await client.close();
}

initDatabase().catch(console.error);
