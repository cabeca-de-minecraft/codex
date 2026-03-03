-- AlterTable
ALTER TABLE "Chat" ADD COLUMN "conversationId" TEXT;

-- CreateIndex
CREATE INDEX "Chat_userId_conversationId_createdAt_idx" ON "Chat"("userId", "conversationId", "createdAt");
