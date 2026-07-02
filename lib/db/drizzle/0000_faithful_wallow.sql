CREATE TABLE "admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer,
	"action" text NOT NULL,
	"target_id" integer,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"success" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"prenom" text NOT NULL,
	"nom" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"telephone" text,
	"territoire" text NOT NULL,
	"type_porteur" text NOT NULL,
	"organisation" text,
	"avatar_data_url" text,
	"role" text DEFAULT 'user' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"last_login_ip" text,
	"last_login_country" text,
	"last_login_country_code" text,
	"last_login_at" timestamp with time zone,
	"mobile_auth_token" text,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"totp_secret" text,
	"totp_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "dossiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"reference" text NOT NULL,
	"titre" text NOT NULL,
	"territoire" text NOT NULL,
	"dispositif" text NOT NULL,
	"secteur" text NOT NULL,
	"statut" text DEFAULT 'brouillon' NOT NULL,
	"description" text,
	"montant_demande" numeric(12, 2) DEFAULT '0' NOT NULL,
	"montant_apport" numeric(12, 2) DEFAULT '0',
	"justification_budget" text,
	"date_debut" text,
	"duree_projet" text,
	"progression_etape" integer DEFAULT 1 NOT NULL,
	"total_etapes" integer DEFAULT 5 NOT NULL,
	"expert_designe" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dossiers_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"dossier_id" integer NOT NULL,
	"type" text NOT NULL,
	"nom" text NOT NULL,
	"filename" text,
	"statut" text DEFAULT 'manquant' NOT NULL,
	"obligatoire" boolean DEFAULT true NOT NULL,
	"uploaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" "bytea",
	"mime_type" text,
	"original_name" text,
	"expires_at" timestamp with time zone,
	"envois" integer DEFAULT 0 NOT NULL,
	"envoye_at" timestamp with time zone,
	"dernier_motif_rejet" text,
	"dernier_rejet_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"dossier_id" integer NOT NULL,
	"expediteur" text NOT NULL,
	"expediteur_role" text DEFAULT 'system' NOT NULL,
	"contenu" text NOT NULL,
	"lu" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "frais_lignes" (
	"id" serial PRIMARY KEY NOT NULL,
	"frais_id" integer NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"montant_ht" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "frais" (
	"id" serial PRIMARY KEY NOT NULL,
	"dossier_id" integer NOT NULL,
	"reference" text NOT NULL,
	"montant_ht" numeric(12, 2) DEFAULT '380' NOT NULL,
	"montant_tva" numeric(12, 2) DEFAULT '76' NOT NULL,
	"montant_ttc" numeric(12, 2) DEFAULT '456' NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"echeance" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "frais_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"territoire" text NOT NULL,
	"type_projet" text DEFAULT '' NOT NULL,
	"note" integer DEFAULT 5 NOT NULL,
	"texte" text NOT NULL,
	"montant" text,
	"dispositif" text,
	"date" text DEFAULT '' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code" text NOT NULL,
	"ip_address" text NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "dossier_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"dossier_id" integer NOT NULL,
	"phase" integer NOT NULL,
	"action" text NOT NULL,
	"label" text NOT NULL,
	"note" text,
	"document_type" text,
	"document_url" text,
	"declenchee_par" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virements" (
	"id" serial PRIMARY KEY NOT NULL,
	"dossier_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"statut" text DEFAULT 'en_attente' NOT NULL,
	"etape_courante" integer DEFAULT 1 NOT NULL,
	"iban" text NOT NULL,
	"bic" text NOT NULL,
	"titulaire" text NOT NULL,
	"montant" numeric(12, 2) NOT NULL,
	"code_email_1" text,
	"code_email_2" text,
	"code_email_3" text,
	"code_email_4" text,
	"code_financier_1" text,
	"code_financier_2" text,
	"code_financier_3" text,
	"code_financier_4" text,
	"etape1_completed_at" timestamp with time zone,
	"etape2_completed_at" timestamp with time zone,
	"etape3_completed_at" timestamp with time zone,
	"etape4_completed_at" timestamp with time zone,
	"email_code_validated_at_1" timestamp with time zone,
	"email_code_validated_at_2" timestamp with time zone,
	"email_code_validated_at_3" timestamp with time zone,
	"email_code_validated_at_4" timestamp with time zone,
	"code_email_sent_at" timestamp with time zone,
	"code_financier_sent_at_2" timestamp with time zone,
	"code_financier_sent_at_3" timestamp with time zone,
	"code_financier_sent_at_4" timestamp with time zone,
	"paiement_montant_2" numeric(12, 2),
	"paiement_montant_3" numeric(12, 2),
	"paiement_montant_4" numeric(12, 2),
	"paiement_demande_at_2" timestamp with time zone,
	"paiement_demande_at_3" timestamp with time zone,
	"paiement_demande_at_4" timestamp with time zone,
	"paiement_confirme_at_2" timestamp with time zone,
	"paiement_confirme_at_3" timestamp with time zone,
	"paiement_confirme_at_4" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coordonnees_bancaires" (
	"id" serial PRIMARY KEY NOT NULL,
	"beneficiaire" text DEFAULT '' NOT NULL,
	"iban" text DEFAULT '' NOT NULL,
	"bic" text DEFAULT '' NOT NULL,
	"banque" text DEFAULT '' NOT NULL,
	"domiciliation" text DEFAULT '' NOT NULL,
	"libelle_virement" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"is_eu" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"max_amount_eur" numeric(12, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frais_lignes" ADD CONSTRAINT "frais_lignes_frais_id_frais_id_fk" FOREIGN KEY ("frais_id") REFERENCES "public"."frais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frais" ADD CONSTRAINT "frais_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossier_events" ADD CONSTRAINT "dossier_events_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virements" ADD CONSTRAINT "virements_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virements" ADD CONSTRAINT "virements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_country_code_countries_code_fk" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("code") ON DELETE no action ON UPDATE no action;