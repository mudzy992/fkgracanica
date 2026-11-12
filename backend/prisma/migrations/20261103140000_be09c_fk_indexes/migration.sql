-- BE-09c/P-B09c-7: indeksi na FK kolone koje PostgreSQL ne indeksira automatski.
-- Bez njih upiti po klubu (Match.homeClubId/awayClubId), autoru vijesti,
-- korisniku komentara i narudžbini ulaznica rade seq scan na rastućim tabelama.

-- CreateIndex
CREATE INDEX "CmsMenuItem_pageId_idx" ON "CmsMenuItem"("pageId");

-- CreateIndex
CREATE INDEX "CmsMenuItem_parentId_idx" ON "CmsMenuItem"("parentId");

-- CreateIndex
CREATE INDEX "News_authorId_idx" ON "News"("authorId");

-- CreateIndex
CREATE INDEX "News_galleryId_idx" ON "News"("galleryId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Match_homeClubId_idx" ON "Match"("homeClubId");

-- CreateIndex
CREATE INDEX "Match_awayClubId_idx" ON "Match"("awayClubId");

-- CreateIndex
CREATE INDEX "MatchEvent_playerId_idx" ON "MatchEvent"("playerId");

-- CreateIndex
CREATE INDEX "MatchEvent_relatedPlayerId_idx" ON "MatchEvent"("relatedPlayerId");

-- CreateIndex
CREATE INDEX "MatchEvent_createdById_idx" ON "MatchEvent"("createdById");

-- CreateIndex
CREATE INDEX "LiveComment_userId_idx" ON "LiveComment"("userId");

-- CreateIndex
CREATE INDEX "Ticket_orderId_idx" ON "Ticket"("orderId");

-- CreateIndex
CREATE INDEX "ContactMessage_userId_idx" ON "ContactMessage"("userId");

-- CreateIndex
CREATE INDEX "AppRelease_createdById_idx" ON "AppRelease"("createdById");
