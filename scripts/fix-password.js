const Loki = require('lokijs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'nadmin.db');

// Initialize database
const db = new Loki(dbPath, {
  autoload: true,
  autosave: true,
  autosaveInterval: 4000,
  persistenceMethod: 'fs',
  autoloadCallback: () => {
    console.log('Database loaded');
    
    // Get config collection
    let configCollection = db.getCollection('config');
    if (!configCollection) {
      configCollection = db.addCollection('config', {
        unique: ['key'],
        indices: ['key']
      });
    }
    
    // Check if password exists
    const passwordItem = configCollection.findOne({ key: 'admin_password_hash' });
    
    if (!passwordItem) {
      // Add the password hash from the conflict file
      // This is the hash for 'admin' password
      configCollection.insert({
        key: 'admin_password_hash',
        value: '$2b$12$auVg3XJrZoE1EuVsdGmdKeo5rNfFRrTzVqKFWBR.I9XbE9WYJS.im',
        updatedAt: new Date()
      });
      
      console.log('Password hash added to database');
      
      // Force save
      db.saveDatabase(() => {
        console.log('Database saved');
        process.exit(0);
      });
    } else {
      console.log('Password already exists in database');
      process.exit(0);
    }
  }
});