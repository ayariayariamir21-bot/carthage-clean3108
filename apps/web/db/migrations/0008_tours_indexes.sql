CREATE INDEX "tours_date_idx" ON "tours" USING btree ("date");--> statement-breakpoint
CREATE INDEX "tours_status_idx" ON "tours" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tours_zone_id_idx" ON "tours" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "tours_created_by_idx" ON "tours" USING btree ("created_by");