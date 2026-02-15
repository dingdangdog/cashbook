-- CreateTable
CREATE TABLE "user_chat_sessions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_chat_messages" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_chat_sessions_userId_idx" ON "user_chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_chat_messages_sessionId_idx" ON "user_chat_messages"("sessionId");

-- AddForeignKey
ALTER TABLE "user_chat_messages" ADD CONSTRAINT "user_chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "user_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
