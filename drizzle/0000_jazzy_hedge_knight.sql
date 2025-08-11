CREATE TYPE "public"."application_status" AS ENUM('APPLIED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'HOST', 'ADMIN');--> statement-breakpoint
CREATE TABLE "application" (
	"application_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "application_application_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"mclass_id" bigint NOT NULL,
	"status" "application_status" DEFAULT 'APPLIED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mclass" (
	"mclass_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mclass_mclass_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"capacity" integer NOT NULL,
	"apply_deadline" timestamp with time zone NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_mclass_id_mclass_mclass_id_fk" FOREIGN KEY ("mclass_id") REFERENCES "public"."mclass"("mclass_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mclass" ADD CONSTRAINT "mclass_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_user_id_mclass_id_index" ON "application" USING btree ("user_id","mclass_id") WHERE status = 'APPLIED';--> statement-breakpoint
CREATE INDEX "idx_application_user" ON "application" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_application_mclass" ON "application" USING btree ("mclass_id");--> statement-breakpoint
CREATE INDEX "idx_mclass_user" ON "mclass" USING btree ("user_id");