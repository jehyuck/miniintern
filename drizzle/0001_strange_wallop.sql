DROP INDEX "application_user_id_mclass_id_index";--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_active_application" ON "application" USING btree ("user_id","mclass_id") WHERE status = 'APPLIED';