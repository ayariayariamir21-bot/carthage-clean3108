ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "hire_date" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "team" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "default_zone_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_default_zone_id_zones_id_fk" FOREIGN KEY ("default_zone_id") REFERENCES "public"."zones"("id") ON DELETE set null ON UPDATE no action;