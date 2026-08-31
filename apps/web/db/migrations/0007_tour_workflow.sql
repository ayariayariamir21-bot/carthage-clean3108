ALTER TABLE "tours" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "cancellation_reason" text;