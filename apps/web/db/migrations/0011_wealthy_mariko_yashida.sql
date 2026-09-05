CREATE TYPE "public"."tour_status" AS ENUM('planifiée', 'en_cours', 'terminée', 'annulée');--> statement-breakpoint
ALTER TABLE "tours" ALTER COLUMN "status" SET DEFAULT 'planifiée'::"public"."tour_status";--> statement-breakpoint
ALTER TABLE "tours" ALTER COLUMN "status" SET DATA TYPE "public"."tour_status" USING "status"::"public"."tour_status";