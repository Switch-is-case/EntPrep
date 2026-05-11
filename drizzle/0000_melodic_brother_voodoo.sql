CREATE TABLE "explanations" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"user_answer" integer,
	"lang" varchar(5) NOT NULL,
	"explanation_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"subject" varchar(100) NOT NULL,
	"total_attempted" integer DEFAULT 0 NOT NULL,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_skipped" integer DEFAULT 0 NOT NULL,
	"last_score" integer DEFAULT 0 NOT NULL,
	"best_score" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" varchar(100) NOT NULL,
	"question_text_ru" text NOT NULL,
	"question_text_kz" text NOT NULL,
	"question_text_en" text NOT NULL,
	"options_ru" jsonb NOT NULL,
	"options_kz" jsonb NOT NULL,
	"options_en" jsonb NOT NULL,
	"correct_answer" integer NOT NULL,
	"difficulty" varchar(20) DEFAULT 'medium' NOT NULL,
	"topic" varchar(255),
	"image_url" text,
	"option_images" jsonb
);
--> statement-breakpoint
CREATE TABLE "test_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" integer NOT NULL,
	"selected_answer" integer,
	"is_correct" boolean,
	"is_skipped" boolean DEFAULT false NOT NULL,
	"time_spent" integer
);
--> statement-breakpoint
CREATE TABLE "test_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"test_type" varchar(50) NOT NULL,
	"subjects" jsonb NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"skipped_answers" integer DEFAULT 0 NOT NULL,
	"wrong_answers" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"results" jsonb,
	"ai_recommendations" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_ru" varchar(255) NOT NULL,
	"name_kz" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"city_ru" varchar(100) NOT NULL,
	"city_kz" varchar(100) NOT NULL,
	"city_en" varchar(100) NOT NULL,
	"description_ru" text,
	"description_kz" text,
	"description_en" text,
	"logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "university_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"university_id" integer NOT NULL,
	"name_ru" varchar(255) NOT NULL,
	"name_kz" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"passing_score" integer NOT NULL,
	"description_ru" text,
	"description_kz" text,
	"description_en" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"language" varchar(5) DEFAULT 'ru' NOT NULL,
	"profile_subject_1" varchar(100),
	"profile_subject_2" varchar(100),
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "explanations" ADD CONSTRAINT "explanations_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_session_id_test_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."test_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_programs" ADD CONSTRAINT "university_programs_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;