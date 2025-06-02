import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const migrateMongo = require('migrate-mongo');

export async function runMigration(command) {
  try {
    const { db, client } = await migrateMongo.database.connect();

    let result;
    switch (command) {
      case 'status':
        result = await migrateMongo.status(db);
        console.log('Migration status:', result);
        break;
      case 'up':
        result = await migrateMongo.up(db);
        console.log('Migration up result:', result);
        break;
      case 'down':
        result = await migrateMongo.down(db);
        console.log('Migration down result:', result);
        break;
      case 'create':
        // Get the migration name from the command line arguments
        const migrationName = process.argv[3];
        if (!migrationName) {
          throw new Error('Migration name is required for create command');
        }
        result = await migrateMongo.create(migrationName);
        console.log('Migration created:', result);
        break;
      default:
        console.error('Unknown command:', command);
    }

    await client.close();
    return result;
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[2]) {
  runMigration(process.argv[2]).catch(console.error);
}
