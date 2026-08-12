-- World Depth Expansion: more jobs, marketplace, businesses, municipality chronicle

CREATE TABLE IF NOT EXISTS "businesses" (
  "business_id" text PRIMARY KEY,
  "name" text NOT NULL,
  "sector" text NOT NULL,
  "description" text NOT NULL,
  "owner_citizen_id" text REFERENCES "citizens"("citizen_id") ON DELETE SET NULL,
  "treasury_minor" bigint NOT NULL DEFAULT 0,
  "employee_count" integer NOT NULL DEFAULT 0,
  "enabled" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "municipality_chronicle" (
  "entry_id" text PRIMARY KEY,
  "recorded_at_game_ms" bigint NOT NULL,
  "category" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "idempotency_key" text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS "municipality_chronicle_recorded_idx"
  ON "municipality_chronicle" ("recorded_at_game_ms" DESC);

-- Businesses
INSERT INTO "businesses" ("business_id", "name", "sector", "description", "employee_count")
VALUES
  ('biz_comune', 'Comune Virtuale', 'public', 'Amministrazione comunale e servizi al cittadino.', 12),
  ('biz_spedizioni', 'Spedizioni Rapide', 'logistics', 'Corrieri e consegne in tutta la città.', 8),
  ('biz_bar_centro', 'Bar del Comune', 'hospitality', 'Caffè, cornetti e pettegolezzi mattutini.', 4),
  ('biz_supermarket', 'Supermercato Centro', 'retail', 'Generi alimentari e prodotti di prima necessità.', 15),
  ('biz_officina_nord', 'Officina Meccanica Nord', 'services', 'Riparazioni auto e biciclette.', 6),
  ('biz_panificio', 'Panificio Rossi', 'food', 'Pane, focacce e dolci del quartiere.', 5),
  ('biz_scuola', 'Istituto Comunale', 'education', 'Scuola primaria e servizi educativi.', 20),
  ('biz_ambulatorio', 'Ambulatorio San Marco', 'health', 'Visite, cure e file interminabili.', 10)
ON CONFLICT ("business_id") DO NOTHING;

-- Additional job offers
INSERT INTO "job_offers" ("offer_id", "title", "employer", "description", "occupation_code", "salary_hint_minor")
VALUES
  ('job_supermarket_v1', 'Commesso supermercato', 'Supermercato Centro', 'Scaffali, casse e sorrisi obbligatori.', 4, 1400),
  ('job_gardener_v1', 'Giardiniere comunale', 'Comune Virtuale', 'Verde pubblico, potatura e pazienza.', 5, 1350),
  ('job_mechanic_v1', 'Meccanico officina', 'Officina Meccanica Nord', 'Motori, freni e diagnosi ottimiste.', 6, 1900),
  ('job_teacher_v1', 'Supplente scuola', 'Istituto Comunale', 'Lezioni, compiti e corridoio rumoroso.', 7, 2200),
  ('job_nurse_v1', 'Assistente ambulatorio', 'Ambulatorio San Marco', 'Accoglienza pazienti e pratiche.', 8, 2000),
  ('job_baker_v1', 'Fornaio', 'Panificio Rossi', 'Impasti mattutini e clienti affamati.', 9, 1600),
  ('job_cleaner_v1', 'Addetto pulizie', 'Comune Virtuale', 'Uffici, corridoi e dignità silenziosa.', 10, 1300)
ON CONFLICT ("offer_id") DO NOTHING;

-- Marketplace expansion
INSERT INTO "marketplace_catalog" ("item_id", "name", "description", "category", "price_minor", "effect_key")
VALUES
  ('item_smartphone_v1', 'Smartphone ricondizionato', 'Per restare connessi. La batteria dura fino a quando serve.', 'technology', 450, 'asset_technology'),
  ('item_sofa_v1', 'Divano usato', 'Comodo abbastanza da procrastinare responsabilmente.', 'home', 320, 'asset_home'),
  ('item_scooter_v1', 'Monopattino elettrico', 'Veloce in centro. Meno veloce in salita.', 'mobility', 890, 'asset_mobility'),
  ('item_laptop_v1', 'Portatile base', 'Per lavoro, studio o serie infinite.', 'technology', 1200, 'asset_technology'),
  ('item_grocery_box_v1', 'Spesa settimanale', 'Generi alimentari per una settimana tipo.', 'food', 45, null),
  ('item_jacket_v1', 'Giacca invernale', 'Calda, pratica, leggermente fuori moda.', 'personal', 120, null),
  ('item_books_v1', 'Libri di seconda mano', 'Tre romanzi e un saggio che prometti di finire.', 'leisure', 65, null),
  ('item_gym_v1', 'Abbonamento palestra', 'Un mese di buoni propositi.', 'leisure', 180, 'leisure_hint'),
  ('item_insurance_v1', 'Assicurazione base', 'Non evita i guai. Li rende più gestibili.', 'services', 250, null),
  ('item_watch_v1', 'Orologio da polso', 'Segna le ore. Non segna le priorità.', 'valuables', 380, 'asset_valuables'),
  ('item_plants_v1', 'Piante da appartamento', 'Verde domestico. Richiede acqua e ottimismo.', 'home', 55, null),
  ('item_radio_v1', 'Radio portatile', 'Notizie, musica e staticità nostalgica.', 'leisure', 75, null),
  ('item_desk_v1', 'Scrivania compatta', 'Per lavorare da casa con dignità.', 'home', 210, 'asset_home'),
  ('item_helmet_v1', 'Casco bici', 'Protezione consigliata. Stile discutibile.', 'mobility', 48, null)
ON CONFLICT ("item_id") DO NOTHING;
