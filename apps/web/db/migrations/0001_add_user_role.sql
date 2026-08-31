CREATE TYPE "public"."role" AS ENUM('admin', 'supervisor', 'agent');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'agent' NOT NULL;