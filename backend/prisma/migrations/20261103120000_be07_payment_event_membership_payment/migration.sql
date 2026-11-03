-- BE-07 / P-B07-2 (A) + Q-15
--  1) PaymentEvent — idempotencija obrade plaćanja po (provider, externalId)
--  2) Payment dobija membershipId (Payment red za članstvo, tačan prihod)

-- AlterTable: Payment.orderId više nije obavezan (članstvo nema TicketOrder)
ALTER TABLE "Payment" ALTER COLUMN "orderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "membershipId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_membershipId_key" ON "Payment"("membershipId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentEvent_refId_idx" ON "PaymentEvent"("refId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_provider_externalId_key" ON "PaymentEvent"("provider", "externalId");
