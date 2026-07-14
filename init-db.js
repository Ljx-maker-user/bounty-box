import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ErOViL8xuND0@ep-shy-glade-aowrd1fw-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function initDB() {
  await client.connect();
  console.log('Connected to database');

  await client.query(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "balance" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

    CREATE TABLE IF NOT EXISTS "Question" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "category" TEXT,
      "bounty" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'open',
      "authorId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "Answer" (
      "id" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "isAccepted" BOOLEAN NOT NULL DEFAULT false,
      "authorId" TEXT NOT NULL,
      "questionId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "Payment" (
      "id" TEXT NOT NULL,
      "amount" INTEGER NOT NULL,
      "type" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "paymentOrderId" TEXT,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
    );
  `);

  console.log('✓ Database tables created successfully!');
  await client.end();
}

initDB().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
