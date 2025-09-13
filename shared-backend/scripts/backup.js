const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

/**
 * Database Backup Script
 */

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch-db';
const BACKUP_DIR = './backups';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupDatabase() {
  const client = new MongoClient(DB_URI);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    
    const backup = {
      timestamp: new Date().toISOString(),
      collections: {}
    };
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await db.collection(collectionName).find({}).toArray();
      backup.collections[collectionName] = data;
      console.log(`Backed up ${data.length} documents from ${collectionName}`);
    }
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`Backup completed: ${backupFile}`);
    
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await client.close();
  }
}

// Run backup
if (require.main === module) {
  backupDatabase();
}

module.exports = { backupDatabase };
