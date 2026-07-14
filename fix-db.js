import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ErOViL8xuND0@ep-shy-glade-aowrd1fw-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixDB() {
  await client.connect();
  console.log('Connected to database');

  // Add missing tags column
  await client.query(`
    ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "tags" TEXT;
  `);

  console.log('✓ Added tags column to Question table');
  await client.end();
}

fixDB().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
