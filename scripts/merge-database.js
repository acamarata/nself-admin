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
    
    // Add wizard state if missing
    const wizardState = configCollection.findOne({ key: 'wizard_state' });
    if (!wizardState) {
      configCollection.insert({
        key: 'wizard_state',
        value: {
          projectName: 'my_project',
          environment: 'dev',
          domain: 'localhost',
          adminEmail: '',
          databaseName: 'my_database',
          databasePassword: 'postgres_dev_password',
          hasuraAdminSecret: 'hasura-admin-secret-dev',
          jwtSecret: 'development-secret-key-minimum-32-characters-long',
          backupEnabled: false,
          backupSchedule: '0 2 * * *',
          postgres: { version: '16-alpine', port: 5432, maxConnections: 100, poolingEnabled: 'auto' },
          hasura: { version: 'v2.44.0', consoleEnabled: true, devMode: true, cors: '*' },
          nginx: { sslMode: 'local', httpPort: 80, httpsPort: 443 },
          auth: { jwtExpiresIn: 900, refreshExpiresIn: 2592000, smtpHost: 'mailpit', smtpPort: 1025, smtpSender: 'noreply@localhost' },
          storage: { accessKey: 'storage-access-key-dev', secretKey: 'storage-secret-key-dev', bucket: 'nself', region: 'us-east-1' },
          optionalServices: {
            redis: false,
            mail: { enabled: false, provider: 'auto' },
            monitoring: false,
            search: { enabled: false, provider: 'auto' },
            mlflow: false,
            adminUI: true
          },
          userServices: [
            { name: 'service_1', framework: 'nest', port: 4000, route: '' },
            { name: 'service_2', framework: 'nest', port: 4001, route: '' }
          ],
          frontendApps: [
            { name: 'app_1', displayName: 'App 1', tablePrefix: 'app1_', port: 3001, subdomain: 'app1', framework: 'nextjs', deployment: 'local', enabled: true },
            { name: 'app_2', displayName: 'App 2', tablePrefix: 'app2_', port: 3002, subdomain: 'app2', framework: 'nextjs', deployment: 'local', enabled: true }
          ]
        },
        updatedAt: new Date()
      });
      console.log('Wizard state added');
    }
    
    // Add wizard step if missing
    const wizardStep = configCollection.findOne({ key: 'wizard_step' });
    if (!wizardStep) {
      configCollection.insert({
        key: 'wizard_step',
        value: 'review',
        updatedAt: new Date()
      });
      console.log('Wizard step added');
    }
    
    // Force save
    db.saveDatabase(() => {
      console.log('Database saved');
      process.exit(0);
    });
  }
});