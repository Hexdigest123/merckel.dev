CREATE TABLE "api_cache" (
	"key" varchar(128) PRIMARY KEY NOT NULL,
	"data" text NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
