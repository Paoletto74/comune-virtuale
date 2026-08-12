-- Master marketplace catalog — 500 products

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_001', 'Pane integrale del Forno Vecchio', 'Prodotto alimentare genuino: pane integrale del forno vecchio. Ideale per la spesa quotidiana nel Comune.', 'food', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_002', 'Farina di grano antico', 'Prodotto alimentare genuino: farina di grano antico. Ideale per la spesa quotidiana nel Comune.', 'food', 6, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_003', 'Riso venere biologico', 'Prodotto alimentare genuino: riso venere biologico. Ideale per la spesa quotidiana nel Comune.', 'food', 9, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_004', 'Pasta di semola dorata', 'Prodotto alimentare genuino: pasta di semola dorata. Ideale per la spesa quotidiana nel Comune.', 'food', 13, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_005', 'Olio extravergine delle Colline', 'Prodotto alimentare genuino: olio extravergine delle colline. Ideale per la spesa quotidiana nel Comune.', 'food', 16, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_006', 'Miele di castagno selvatico', 'Prodotto alimentare genuino: miele di castagno selvatico. Ideale per la spesa quotidiana nel Comune.', 'food', 19, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_007', 'Formaggio stagionato della Valle', 'Prodotto alimentare genuino: formaggio stagionato della valle. Ideale per la spesa quotidiana nel Comune.', 'food', 22, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_008', 'Yogurt artigianale al miele', 'Prodotto alimentare genuino: yogurt artigianale al miele. Ideale per la spesa quotidiana nel Comune.', 'food', 25, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_009', 'Uova fresche del podere', 'Prodotto alimentare genuino: uova fresche del podere. Ideale per la spesa quotidiana nel Comune.', 'food', 29, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_010', 'Latte intero del mattino', 'Prodotto alimentare genuino: latte intero del mattino. Ideale per la spesa quotidiana nel Comune.', 'food', 350, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_011', 'Burro di malga', 'Prodotto alimentare genuino: burro di malga. Ideale per la spesa quotidiana nel Comune.', 'food', 380, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_012', 'Sale marino integrale', 'Prodotto alimentare genuino: sale marino integrale. Ideale per la spesa quotidiana nel Comune.', 'food', 410, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_013', 'Zucchero di canna grezzo', 'Prodotto alimentare genuino: zucchero di canna grezzo. Ideale per la spesa quotidiana nel Comune.', 'food', 440, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_014', 'Ceci secchi del mercato', 'Prodotto alimentare genuino: ceci secchi del mercato. Ideale per la spesa quotidiana nel Comune.', 'food', 470, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_015', 'Lenticchie di montagna', 'Prodotto alimentare genuino: lenticchie di montagna. Ideale per la spesa quotidiana nel Comune.', 'food', 5000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_016', 'Pomodori pelati rustici', 'Prodotto alimentare genuino: pomodori pelati rustici. Ideale per la spesa quotidiana nel Comune.', 'food', 5300, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_017', 'Passata di pomodoro antica', 'Prodotto alimentare genuino: passata di pomodoro antica. Ideale per la spesa quotidiana nel Comune.', 'food', 5600, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_018', 'Confettura di albicocche', 'Prodotto alimentare genuino: confettura di albicocche. Ideale per la spesa quotidiana nel Comune.', 'food', 5900, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_019', 'Marmellata di arance amare', 'Prodotto alimentare genuino: marmellata di arance amare. Ideale per la spesa quotidiana nel Comune.', 'food', 62000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_020', 'Cereali croccanti al miele', 'Prodotto alimentare genuino: cereali croccanti al miele. Ideale per la spesa quotidiana nel Comune.', 'food', 65000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_021', 'Muesli delle valli', 'Prodotto alimentare genuino: muesli delle valli. Ideale per la spesa quotidiana nel Comune.', 'food', 68000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_022', 'Frutta secca mista', 'Prodotto alimentare genuino: frutta secca mista. Ideale per la spesa quotidiana nel Comune.', 'food', 71000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_023', 'Noci sgusciate a mano', 'Prodotto alimentare genuino: noci sgusciate a mano. Ideale per la spesa quotidiana nel Comune.', 'food', 74000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_024', 'Mandorle tostate lente', 'Prodotto alimentare genuino: mandorle tostate lente. Ideale per la spesa quotidiana nel Comune.', 'food', 77000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_025', 'Cioccolato fondente artigianale', 'Prodotto alimentare genuino: cioccolato fondente artigianale. Ideale per la spesa quotidiana nel Comune.', 'food', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_026', 'Acqua minerale delle sorgenti', 'Acqua minerale delle sorgenti: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_027', 'Succo di arancia rossa', 'Succo di arancia rossa: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 7, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_028', 'Succo di mela del frutteto', 'Succo di mela del frutteto: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 11, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_029', 'Tè verde delle colline', 'Tè verde delle colline: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 15, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_030', 'Tè nero speziato', 'Tè nero speziato: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 19, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_031', 'Infuso di camomilla', 'Infuso di camomilla: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 23, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_032', 'Caffè macinato del torrefattore', 'Caffè macinato del torrefattore: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 27, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_033', 'Caffè in capsule compatibili', 'Caffè in capsule compatibili: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 345, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_034', 'Bevanda energetica leggera', 'Bevanda energetica leggera: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 383, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_035', 'Limonata artigianale', 'Limonata artigianale: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 421, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_036', 'Spuma bianca del Comune', 'Spuma bianca del Comune: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 459, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_037', 'Gassosa alla frutta', 'Gassosa alla frutta: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 4968, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_038', 'Vino rosso da tavola', 'Vino rosso da tavola: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 5347, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_039', 'Vino bianco secco', 'Vino bianco secco: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 5726, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_040', 'Prosecco delle colline', 'Prosecco delle colline: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 6105, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_041', 'Birra artigianale bionda', 'Birra artigianale bionda: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 64842, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_042', 'Birra scura del birrificio', 'Birra scura del birrificio: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 68632, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_043', 'Sidro di mele antico', 'Sidro di mele antico: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 72421, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_044', 'Latte di mandorla fresco', 'Latte di mandorla fresco: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 76211, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_045', 'Bevanda ai cereali', 'Bevanda ai cereali: bevanda selezionata per idratarsi o brindare senza eccessi di budget.', 'food', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_046', 'Pranzo completo del mercato', 'Pranzo completo del mercato — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_047', 'Cena pronta della trattoria', 'Cena pronta della trattoria — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 7, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_048', 'Zuppa calda del giorno', 'Zuppa calda del giorno — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 11, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_049', 'Insalata mista fresca', 'Insalata mista fresca — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 15, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_050', 'Panino gourmet del fornaio', 'Panino gourmet del fornaio — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 19, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_051', 'Pizza margherita da asporto', 'Pizza margherita da asporto — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 23, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_052', 'Pizza speciale del quartiere', 'Pizza speciale del quartiere — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 27, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_053', 'Pasta al sugo della nonna', 'Pasta al sugo della nonna — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 345, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_054', 'Risotto allo zafferano', 'Risotto allo zafferano — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 383, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_055', 'Polenta con formaggio', 'Polenta con formaggio — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 421, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_056', 'Spezzatino di verdure', 'Spezzatino di verdure — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 459, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_057', 'Grigliata mista del rosticciere', 'Grigliata mista del rosticciere — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 4968, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_058', 'Menu vegano del giorno', 'Menu vegano del giorno — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 5347, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_059', 'Menu proteico per sportivi', 'Menu proteico per sportivi — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 5726, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_060', 'Colazione continentale', 'Colazione continentale — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 6105, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_061', 'Brunch domenicale', 'Brunch domenicale — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 64842, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_062', 'Merenda dolce da bar', 'Merenda dolce da bar — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 68632, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_063', 'Menu bambini allegro', 'Menu bambini allegro — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 72421, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_064', 'Box pranzo ufficio', 'Box pranzo ufficio — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 76211, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_065', 'Cena romantica per due', 'Cena romantica per due — pasto pronto per chi ha poco tempo e molta fame da gestire.', 'food', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_066', 'Detergente multiuso', 'Detergente multiuso per mantenere casa e routine in ordine senza drammi.', 'food', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_067', 'Sapone liquido neutro', 'Sapone liquido neutro per mantenere casa e routine in ordine senza drammi.', 'food', 9, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_068', 'Carta igienica confezione famiglia', 'Carta igienica confezione famiglia per mantenere casa e routine in ordine senza drammi.', 'food', 14, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_069', 'Fazzoletti di carta morbidi', 'Fazzoletti di carta morbidi per mantenere casa e routine in ordine senza drammi.', 'food', 20, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_070', 'Spugne per piatti', 'Spugne per piatti per mantenere casa e routine in ordine senza drammi.', 'food', 25, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_071', 'Sacchetti biodegradabili', 'Sacchetti biodegradabili per mantenere casa e routine in ordine senza drammi.', 'food', 337, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_072', 'Panni microfibra', 'Panni microfibra per mantenere casa e routine in ordine senza drammi.', 'food', 389, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_073', 'Candeggina delicata', 'Candeggina delicata per mantenere casa e routine in ordine senza drammi.', 'food', 440, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_074', 'Ammorbidente al talco', 'Ammorbidente al talco per mantenere casa e routine in ordine senza drammi.', 'food', 491, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_075', 'Pile stilo AA', 'Pile stilo AA per mantenere casa e routine in ordine senza drammi.', 'food', 543, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_076', 'Pile stilo AAA', 'Pile stilo AAA per mantenere casa e routine in ordine senza drammi.', 'food', 594, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_077', 'Lampadina LED calda', 'Lampadina LED calda per mantenere casa e routine in ordine senza drammi.', 'food', 646, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_078', 'Accendino ricaricabile', 'Accendino ricaricabile per mantenere casa e routine in ordine senza drammi.', 'food', 697, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_079', 'Accendino classico', 'Accendino classico per mantenere casa e routine in ordine senza drammi.', 'food', 749, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_080', 'Kit cucina monouso', 'Kit cucina monouso per mantenere casa e routine in ordine senza drammi.', 'food', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_081', 'Set pentole base', 'Set pentole base per rendere l''abitazione più pratica e accogliente.', 'food', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_082', 'Set coltelli da cucina', 'Set coltelli da cucina per rendere l''abitazione più pratica e accogliente.', 'food', 9, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_083', 'Set piatti per quattro', 'Set piatti per quattro per rendere l''abitazione più pratica e accogliente.', 'food', 14, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_084', 'Set bicchieri resistenti', 'Set bicchieri resistenti per rendere l''abitazione più pratica e accogliente.', 'food', 20, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_085', 'Tovaglioli di stoffa', 'Tovaglioli di stoffa per rendere l''abitazione più pratica e accogliente.', 'food', 25, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_086', 'Tappeto antiscivolo', 'Tappeto antiscivolo per rendere l''abitazione più pratica e accogliente.', 'food', 337, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_087', 'Tende oscuranti', 'Tende oscuranti per rendere l''abitazione più pratica e accogliente.', 'food', 389, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_088', 'Cuscini decorativi', 'Cuscini decorativi per rendere l''abitazione più pratica e accogliente.', 'food', 440, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_089', 'Coperta in microfibra', 'Coperta in microfibra per rendere l''abitazione più pratica e accogliente.', 'food', 4914, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_090', 'Appendiabiti in legno', 'Appendiabiti in legno per rendere l''abitazione più pratica e accogliente.', 'food', 5429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_091', 'Cestino per biancheria', 'Cestino per biancheria per rendere l''abitazione più pratica e accogliente.', 'food', 5943, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_092', 'Organizer da scrivania', 'Organizer da scrivania per rendere l''abitazione più pratica e accogliente.', 'food', 6457, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_093', 'Porta spezie a muro', 'Porta spezie a muro per rendere l''abitazione più pratica e accogliente.', 'food', 6971, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_094', 'Barattoli vetro ermetici', 'Barattoli vetro ermetici per rendere l''abitazione più pratica e accogliente.', 'food', 7486, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_095', 'Set contenitori alimentari', 'Set contenitori alimentari per rendere l''abitazione più pratica e accogliente.', 'food', 8000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_096', 'Shampoo delicato', 'Shampoo delicato per cura personale e igiene quotidiana nel Comune.', 'food', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_097', 'Balsamo nutriente', 'Balsamo nutriente per cura personale e igiene quotidiana nel Comune.', 'food', 9, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_098', 'Gel doccia fresco', 'Gel doccia fresco per cura personale e igiene quotidiana nel Comune.', 'food', 14, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_099', 'Crema idratante viso', 'Crema idratante viso per cura personale e igiene quotidiana nel Comune.', 'food', 20, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_100', 'Crema mani riparatrice', 'Crema mani riparatrice per cura personale e igiene quotidiana nel Comune.', 'food', 25, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_101', 'Deodorante roll-on', 'Deodorante roll-on per cura personale e igiene quotidiana nel Comune.', 'food', 337, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_102', 'Spazzolino da denti', 'Spazzolino da denti per cura personale e igiene quotidiana nel Comune.', 'food', 389, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_103', 'Dentifricio menta', 'Dentifricio menta per cura personale e igiene quotidiana nel Comune.', 'food', 440, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_104', 'Rasoio monouso', 'Rasoio monouso per cura personale e igiene quotidiana nel Comune.', 'food', 491, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_105', 'Rasoio ricaricabile', 'Rasoio ricaricabile per cura personale e igiene quotidiana nel Comune.', 'food', 543, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_106', 'Assorbenti confezione', 'Assorbenti confezione per cura personale e igiene quotidiana nel Comune.', 'food', 594, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_107', 'Cerotti assortiti', 'Cerotti assortiti per cura personale e igiene quotidiana nel Comune.', 'food', 646, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_108', 'Profumo leggero quotidiano', 'Profumo leggero quotidiano per cura personale e igiene quotidiana nel Comune.', 'food', 697, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_109', 'Lozione dopobarba', 'Lozione dopobarba per cura personale e igiene quotidiana nel Comune.', 'food', 749, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_110', 'Kit igiene viaggio', 'Kit igiene viaggio per cura personale e igiene quotidiana nel Comune.', 'food', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_111', 'Pile ricaricabili', 'Pile ricaricabili — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_112', 'Cartucce stampante compatibili', 'Cartucce stampante compatibili — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 12, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_113', 'Toner compatibile', 'Toner compatibile — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 20, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_114', 'Carta A4 risma', 'Carta A4 risma — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 29, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_115', 'Quaderno a righe', 'Quaderno a righe — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 400, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_116', 'Penna a sfera blu', 'Penna a sfera blu — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 480, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_117', 'Evidenziatori colorati', 'Evidenziatori colorati — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 560, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_118', 'Gomma da cancellare', 'Gomma da cancellare — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 640, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_119', 'Matita HB', 'Matita HB — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 720, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_120', 'Nastro adesivo trasparente', 'Nastro adesivo trasparente — consumabile utile per studio, lavoro o piccole emergenze.', 'food', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_121', 'Ombrello pieghevole', 'Ombrello pieghevole per affrontare la giornata con un minimo di preparazione.', 'food', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_122', 'Borraccia termica', 'Borraccia termica per affrontare la giornata con un minimo di preparazione.', 'food', 22, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_123', 'Lunch box ermetico', 'Lunch box ermetico per affrontare la giornata con un minimo di preparazione.', 'food', 440, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_124', 'Borsa riutilizzabile robusta', 'Borsa riutilizzabile robusta per affrontare la giornata con un minimo di preparazione.', 'food', 6200, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_cons_125', 'Trolley leggero da spesa', 'Trolley leggero da spesa per affrontare la giornata con un minimo di preparazione.', 'food', 8000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_001', 'Velox Eco Piccolo', 'Velox Eco Piccolo: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_002', 'Aurora Eco Compact', 'Aurora Eco Compact: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 9, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_003', 'Domus Eco Urban', 'Domus Eco Urban: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 14, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_004', 'Nordica Eco City', 'Nordica Eco City: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 20, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_005', 'Solare Eco Mini', 'Solare Eco Mini: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 25, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_006', 'Meridio Eco Base', 'Meridio Eco Base: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 31, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_007', 'Altair Eco Start', 'Altair Eco Start: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 36, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_008', 'Vento Eco Light', 'Vento Eco Light: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 440, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_009', 'Lumen Eco Smart', 'Lumen Eco Smart: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 491, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_010', 'Civitas Eco Entry', 'Civitas Eco Entry: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 543, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_011', 'Armonia Eco Pratico', 'Armonia Eco Pratico: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 594, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_012', 'Titania Eco Essential', 'Titania Eco Essential: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 646, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_013', 'Orione Eco Daily', 'Orione Eco Daily: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 6971, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_014', 'Zenit Eco Run', 'Zenit Eco Run: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 7486, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_015', 'Avanti Eco Go', 'Avanti Eco Go: veicolo fittizio della categoria veicoli economici. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 8000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_016', 'Velox Città Micro', 'Velox Città Micro: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_017', 'Aurora Città Nano', 'Aurora Città Nano: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 9, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_018', 'Domus Città Zip', 'Domus Città Zip: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 14, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_019', 'Nordica Città Pop', 'Nordica Città Pop: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 20, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_020', 'Solare Città Twist', 'Solare Città Twist: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 25, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_021', 'Meridio Città Flash', 'Meridio Città Flash: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 31, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_022', 'Altair Città Hop', 'Altair Città Hop: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 36, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_023', 'Vento Città Dash', 'Vento Città Dash: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 440, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_024', 'Lumen Città Quick', 'Lumen Città Quick: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 491, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_025', 'Civitas Città Rapid', 'Civitas Città Rapid: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 543, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_026', 'Armonia Città Swift', 'Armonia Città Swift: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 594, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_027', 'Titania Città Brio', 'Titania Città Brio: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 646, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_028', 'Orione Città Vivo', 'Orione Città Vivo: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 6971, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_029', 'Zenit Città Lively', 'Zenit Città Lively: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 7486, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_030', 'Avanti Città Agile', 'Avanti Città Agile: veicolo fittizio della categoria city car. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 8000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_031', 'Velox Berlina Class', 'Velox Berlina Class: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 80, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_032', 'Aurora Berlina Comfort', 'Aurora Berlina Comfort: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 131, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_033', 'Domus Berlina Elegance', 'Domus Berlina Elegance: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 183, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_034', 'Nordica Berlina Prestige', 'Nordica Berlina Prestige: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 234, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_035', 'Solare Berlina Linea', 'Solare Berlina Linea: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_036', 'Meridio Berlina Aura', 'Meridio Berlina Aura: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 337, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_037', 'Altair Berlina Nova', 'Altair Berlina Nova: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 3886, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_038', 'Vento Berlina Sigma', 'Vento Berlina Sigma: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 4400, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_039', 'Lumen Berlina Delta', 'Lumen Berlina Delta: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 4914, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_040', 'Civitas Berlina Orizonte', 'Civitas Berlina Orizonte: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 5429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_041', 'Armonia Berlina Prime', 'Armonia Berlina Prime: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 5943, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_042', 'Titania Berlina Select', 'Titania Berlina Select: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 64571, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_043', 'Orione Berlina Grand', 'Orione Berlina Grand: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 69714, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_044', 'Zenit Berlina Royal', 'Zenit Berlina Royal: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 74857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_045', 'Avanti Berlina Noble', 'Avanti Berlina Noble: veicolo fittizio della categoria berline. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_046', 'Velox Family Space', 'Velox Family Space: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 80, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_047', 'Aurora Family Room', 'Aurora Family Room: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 145, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_048', 'Domus Family Tour', 'Domus Family Tour: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 211, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_049', 'Nordica Family Cargo', 'Nordica Family Cargo: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 276, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_050', 'Solare Family Life', 'Solare Family Life: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 342, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_051', 'Meridio Family Home', 'Meridio Family Home: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 4073, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_052', 'Altair Family Plus', 'Altair Family Plus: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 4727, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_053', 'Vento Family Maxi', 'Vento Family Maxi: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 5382, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_054', 'Lumen Family Wide', 'Lumen Family Wide: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 6036, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_055', 'Civitas Family Long', 'Civitas Family Long: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 66909, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_056', 'Armonia Family Comfort', 'Armonia Family Comfort: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 73455, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_057', 'Titania Family Travel', 'Titania Family Travel: veicolo fittizio della categoria familiari. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_058', 'Velox Trail Cross', 'Velox Trail Cross: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_059', 'Aurora Trail Peak', 'Aurora Trail Peak: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 1455, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_060', 'Domus Trail Ridge', 'Domus Trail Ridge: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 2109, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_061', 'Nordica Trail Summit', 'Nordica Trail Summit: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 2764, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_062', 'Solare Trail Highland', 'Solare Trail Highland: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 34182, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_063', 'Meridio Trail Forest', 'Meridio Trail Forest: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 40727, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_064', 'Altair Trail Dune', 'Altair Trail Dune: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 47273, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_065', 'Vento Trail Rock', 'Vento Trail Rock: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 53818, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_066', 'Lumen Trail Stone', 'Lumen Trail Stone: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 603636, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_067', 'Civitas Trail Wild', 'Civitas Trail Wild: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 669091, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_068', 'Armonia Trail Open', 'Armonia Trail Open: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 734545, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_069', 'Titania Trail Range', 'Titania Trail Range: veicolo fittizio della categoria suv. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 800000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_070', 'Velox Sport GT', 'Velox Sport GT: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_071', 'Aurora Sport RS', 'Aurora Sport RS: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 1455, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_072', 'Domus Sport Turbo', 'Domus Sport Turbo: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 2109, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_073', 'Nordica Sport Velocity', 'Nordica Sport Velocity: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 2764, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_074', 'Solare Sport Thunder', 'Solare Sport Thunder: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 34182, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_075', 'Meridio Sport Bolt', 'Meridio Sport Bolt: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 40727, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_076', 'Altair Sport Pulse', 'Altair Sport Pulse: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 47273, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_077', 'Vento Sport Rush', 'Vento Sport Rush: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 53818, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_078', 'Lumen Sport Storm', 'Lumen Sport Storm: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 603636, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_079', 'Civitas Sport Blaze', 'Civitas Sport Blaze: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 669091, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_080', 'Armonia Sport Flash', 'Armonia Sport Flash: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 734545, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_081', 'Titania Sport Drive', 'Titania Sport Drive: veicolo fittizio della categoria sportive. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 800000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_082', 'Velox Style Coupé', 'Velox Style Coupé: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_083', 'Aurora Style Cabrio', 'Aurora Style Cabrio: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 1600, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_084', 'Domus Style Roadster', 'Domus Style Roadster: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 2400, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_085', 'Nordica Style Spider', 'Nordica Style Spider: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 32000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_086', 'Solare Style Open', 'Solare Style Open: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 40000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_087', 'Meridio Style Sky', 'Meridio Style Sky: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 48000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_088', 'Altair Style Sun', 'Altair Style Sun: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 56000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_089', 'Vento Style Aero', 'Vento Style Aero: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 640000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_090', 'Lumen Style Curve', 'Lumen Style Curve: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 720000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_091', 'Civitas Style Line', 'Civitas Style Line: veicolo fittizio della categoria coupé e cabrio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 800000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_092', 'Velox Work Van', 'Velox Work Van: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 80, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_093', 'Aurora Work Box', 'Aurora Work Box: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 160, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_094', 'Domus Work Cargo', 'Domus Work Cargo: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 240, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_095', 'Nordica Work Trans', 'Nordica Work Trans: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 320, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_096', 'Solare Work Fleet', 'Solare Work Fleet: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 4000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_097', 'Meridio Work Load', 'Meridio Work Load: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 4800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_098', 'Altair Work Carry', 'Altair Work Carry: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 5600, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_099', 'Vento Work Move', 'Vento Work Move: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 64000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_100', 'Lumen Work Haul', 'Lumen Work Haul: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 72000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_101', 'Civitas Work Deliver', 'Civitas Work Deliver: veicolo fittizio della categoria veicoli commerciali. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_102', 'Velox Moto Scooter', 'Velox Moto Scooter: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_103', 'Aurora Moto City', 'Aurora Moto City: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 9, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_104', 'Domus Moto Road', 'Domus Moto Road: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 15, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_105', 'Nordica Moto Trail', 'Nordica Moto Trail: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 21, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_106', 'Solare Moto Classic', 'Solare Moto Classic: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 27, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_107', 'Meridio Moto Neo', 'Meridio Moto Neo: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 33, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_108', 'Altair Moto Pulse', 'Altair Moto Pulse: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 39, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_109', 'Vento Moto Rider', 'Vento Moto Rider: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 468, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_110', 'Lumen Moto Swift', 'Lumen Moto Swift: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 523, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_111', 'Civitas Moto Free', 'Civitas Moto Free: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 578, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_112', 'Armonia Moto Wind', 'Armonia Moto Wind: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 634, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_113', 'Titania Moto Rapid', 'Titania Moto Rapid: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 689, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_114', 'Orione Moto Urban', 'Orione Moto Urban: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 7446, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_115', 'Zenit Moto Lite', 'Zenit Moto Lite: veicolo fittizio della categoria motocicli. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 8000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_116', 'Velox Prestige Elite', 'Velox Prestige Elite: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 8000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_117', 'Aurora Prestige Supreme', 'Aurora Prestige Supreme: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 16000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_118', 'Domus Prestige Imperial', 'Domus Prestige Imperial: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 24000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_119', 'Nordica Prestige Crown', 'Nordica Prestige Crown: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 32000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_120', 'Solare Prestige Legacy', 'Solare Prestige Legacy: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 400000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_121', 'Meridio Prestige Heritage', 'Meridio Prestige Heritage: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 480000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_122', 'Altair Prestige Signature', 'Altair Prestige Signature: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 560000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_123', 'Vento Prestige Private', 'Vento Prestige Private: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 19622222, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_124', 'Lumen Prestige Grand', 'Lumen Prestige Grand: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 22311111, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_veic_125', 'Civitas Prestige Royal', 'Civitas Prestige Royal: veicolo fittizio della categoria veicoli di prestigio. Prestazioni e comfort adeguati alla fascia economica.', 'mobility', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_001', 'Camera Singola', 'Camera Singola: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_002', 'Camera Condivisa', 'Camera Condivisa: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 10, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_003', 'Camera Studenti', 'Camera Studenti: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 17, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_004', 'Camera Centro', 'Camera Centro: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 24, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_005', 'Camera Tranquilla', 'Camera Tranquilla: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 31, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_006', 'Camera Luminosa', 'Camera Luminosa: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 38, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_007', 'Camera Compatta', 'Camera Compatta: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 45, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_008', 'Camera Essenziale', 'Camera Essenziale: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 538, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_009', 'Camera Pratica', 'Camera Pratica: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 604, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_010', 'Camera Economica', 'Camera Economica: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 669, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_011', 'Camera Standard', 'Camera Standard: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 735, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_012', 'Camera Base', 'Camera Base: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_013', 'Monolocale Centro', 'Monolocale Centro: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 3, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_014', 'Monolocale Periferia', 'Monolocale Periferia: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 9, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_015', 'Monolocale Ristrutturato', 'Monolocale Ristrutturato: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 14, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_016', 'Monolocale Moderno', 'Monolocale Moderno: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 20, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_017', 'Monolocale Luminoso', 'Monolocale Luminoso: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 25, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_018', 'Monolocale Quiet', 'Monolocale Quiet: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 31, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_019', 'Monolocale Smart', 'Monolocale Smart: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 36, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_020', 'Monolocale Open', 'Monolocale Open: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 42, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_021', 'Monolocale Mini', 'Monolocale Mini: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 47, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_022', 'Monolocale Studio', 'Monolocale Studio: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 543, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_023', 'Monolocale Urban', 'Monolocale Urban: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 594, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_024', 'Monolocale Compact', 'Monolocale Compact: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 646, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_025', 'Monolocale Fresh', 'Monolocale Fresh: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 697, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_026', 'Monolocale New', 'Monolocale New: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 749, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_027', 'Monolocale Classic', 'Monolocale Classic: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_028', 'Bilocale Balcone', 'Bilocale Balcone: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 80, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_029', 'Bilocale Terrazzo', 'Bilocale Terrazzo: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 131, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_030', 'Bilocale Giardino', 'Bilocale Giardino: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 183, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_031', 'Bilocale Centro', 'Bilocale Centro: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 234, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_032', 'Bilocale Semicentro', 'Bilocale Semicentro: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_033', 'Bilocale Ristrutturato', 'Bilocale Ristrutturato: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 337, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_034', 'Bilocale Arredato', 'Bilocale Arredato: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 3886, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_035', 'Bilocale Vuoto', 'Bilocale Vuoto: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 4400, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_036', 'Bilocale Moderno', 'Bilocale Moderno: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 4914, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_037', 'Bilocale Classico', 'Bilocale Classico: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 5429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_038', 'Bilocale Family', 'Bilocale Family: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 5943, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_039', 'Bilocale Quiet', 'Bilocale Quiet: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 6457, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_040', 'Bilocale Open', 'Bilocale Open: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 69714, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_041', 'Bilocale Corner', 'Bilocale Corner: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 74857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_042', 'Bilocale View', 'Bilocale View: proprietà fittizia di categoria bilocali, con potenziale patrimoniale nel Comune Virtuale.', 'home', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_043', 'Appartamento Tre locali', 'Appartamento Tre locali: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 80, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_044', 'Appartamento Quattro locali', 'Appartamento Quattro locali: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 122, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_045', 'Appartamento Centro storico', 'Appartamento Centro storico: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 165, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_046', 'Appartamento Semicentro', 'Appartamento Semicentro: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 207, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_047', 'Appartamento Periferia', 'Appartamento Periferia: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 249, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_048', 'Appartamento Ristrutturato', 'Appartamento Ristrutturato: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 292, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_049', 'Appartamento Signorile', 'Appartamento Signorile: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.', 'home', 334, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_050', 'Appartamento Moderno', 'Appartamento Moderno: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 3765, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_051', 'Appartamento Family', 'Appartamento Family: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 4188, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_052', 'Appartamento Panorama', 'Appartamento Panorama: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 4612, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_053', 'Appartamento Corner', 'Appartamento Corner: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 5035, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_054', 'Appartamento Garden', 'Appartamento Garden: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 5459, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_055', 'Appartamento Terrace', 'Appartamento Terrace: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 5882, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_056', 'Appartamento Open', 'Appartamento Open: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 6306, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_057', 'Appartamento Smart', 'Appartamento Smart: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 67294, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_058', 'Appartamento Classic', 'Appartamento Classic: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 71529, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_059', 'Appartamento Prestige', 'Appartamento Prestige: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 75765, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_060', 'Appartamento Comfort', 'Appartamento Comfort: proprietà fittizia di categoria appartamenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_061', 'Attico Panoramico', 'Attico Panoramico: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_062', 'Attico Terrazzo', 'Attico Terrazzo: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 1455, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_063', 'Attico Skyline', 'Attico Skyline: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 2109, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_064', 'Attico Lux', 'Attico Lux: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 2764, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_065', 'Attico Open', 'Attico Open: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 3418, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_066', 'Attico Modern', 'Attico Modern: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 4073, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_067', 'Attico Classic', 'Attico Classic: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 47273, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_068', 'Attico Corner', 'Attico Corner: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 53818, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_069', 'Attico View', 'Attico View: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 60364, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_070', 'Attico Sunset', 'Attico Sunset: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 66909, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_071', 'Attico Dawn', 'Attico Dawn: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 734545, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_072', 'Attico Elite', 'Attico Elite: proprietà fittizia di categoria attici, con potenziale patrimoniale nel Comune Virtuale.', 'home', 800000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_073', 'Casa Indipendente', 'Casa Indipendente: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_074', 'Casa Schiera', 'Casa Schiera: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 1314, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_075', 'Casa Bifamiliare', 'Casa Bifamiliare: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 1829, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_076', 'Casa Giardino', 'Casa Giardino: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 2343, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_077', 'Casa Corte', 'Casa Corte: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 2857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_078', 'Casa Collina', 'Casa Collina: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 3371, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_079', 'Casa Borgo', 'Casa Borgo: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 3886, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_080', 'Casa Moderna', 'Casa Moderna: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 44000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_081', 'Casa Rustica', 'Casa Rustica: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 49143, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_082', 'Casa Ristrutturata', 'Casa Ristrutturata: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 54286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_083', 'Casa Family', 'Casa Family: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 59429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_084', 'Casa Quiet', 'Casa Quiet: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 64571, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_085', 'Casa Green', 'Casa Green: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 697143, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_086', 'Casa Corner', 'Casa Corner: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 748571, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_087', 'Casa Classic', 'Casa Classic: proprietà fittizia di categoria case, con potenziale patrimoniale nel Comune Virtuale.', 'home', 800000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_088', 'Villa Collinare', 'Villa Collinare: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 8000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_089', 'Villa Panoramica', 'Villa Panoramica: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 13143, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_090', 'Villa Moderna', 'Villa Moderna: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 18286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_091', 'Villa Classica', 'Villa Classica: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 23429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_092', 'Villa Signorile', 'Villa Signorile: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 28571, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_093', 'Villa Giardino', 'Villa Giardino: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 33714, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_094', 'Villa Parco', 'Villa Parco: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 388571, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_095', 'Villa Bosco', 'Villa Bosco: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 440000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_096', 'Villa Lago', 'Villa Lago: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 491429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_097', 'Villa Quiet', 'Villa Quiet: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 542857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_098', 'Villa Prestige', 'Villa Prestige: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 594286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_099', 'Villa Family', 'Villa Family: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 19814286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_100', 'Villa Open', 'Villa Open: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 21542857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_101', 'Villa Green', 'Villa Green: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 23271429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_102', 'Villa View', 'Villa View: proprietà fittizia di categoria ville, con potenziale patrimoniale nel Comune Virtuale.', 'home', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_103', 'Villa Piscina Estiva', 'Villa Piscina Estiva: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 8000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_104', 'Villa Piscina Tropicale', 'Villa Piscina Tropicale: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 16000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_105', 'Villa Piscina Collinare', 'Villa Piscina Collinare: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 24000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_106', 'Villa Piscina Panoramica', 'Villa Piscina Panoramica: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 32000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_107', 'Villa Piscina Moderna', 'Villa Piscina Moderna: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 400000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_108', 'Villa Piscina Prestige', 'Villa Piscina Prestige: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 480000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_109', 'Villa Piscina Resort', 'Villa Piscina Resort: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 560000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_110', 'Villa Piscina Private', 'Villa Piscina Private: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 19622222, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_111', 'Villa Piscina Garden', 'Villa Piscina Garden: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 22311111, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_112', 'Villa Piscina Elite', 'Villa Piscina Elite: proprietà fittizia di categoria ville con piscina, con potenziale patrimoniale nel Comune Virtuale.', 'home', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_113', 'Tenuta Agricola', 'Tenuta Agricola: proprietà fittizia di categoria tenute, con potenziale patrimoniale nel Comune Virtuale.', 'home', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_114', 'Tenuta Vigna', 'Tenuta Vigna: proprietà fittizia di categoria tenute, con potenziale patrimoniale nel Comune Virtuale.', 'home', 182857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_115', 'Tenuta Uliveto', 'Tenuta Uliveto: proprietà fittizia di categoria tenute, con potenziale patrimoniale nel Comune Virtuale.', 'home', 285714, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_116', 'Tenuta Campagna', 'Tenuta Campagna: proprietà fittizia di categoria tenute, con potenziale patrimoniale nel Comune Virtuale.', 'home', 11171429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_117', 'Tenuta Storica', 'Tenuta Storica: proprietà fittizia di categoria tenute, con potenziale patrimoniale nel Comune Virtuale.', 'home', 14628571, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_118', 'Tenuta Signorile', 'Tenuta Signorile: proprietà fittizia di categoria tenute, con potenziale patrimoniale nel Comune Virtuale.', 'home', 18085714, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_119', 'Tenuta Ampia', 'Tenuta Ampia: proprietà fittizia di categoria tenute, con potenziale patrimoniale nel Comune Virtuale.', 'home', 21542857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_120', 'Tenuta Private', 'Tenuta Private: proprietà fittizia di categoria tenute, con potenziale patrimoniale nel Comune Virtuale.', 'home', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_121', 'Possedimento Parco', 'Possedimento Parco: proprietà fittizia di categoria grandi possedimenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 80000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_122', 'Possedimento Tenuta Reale', 'Possedimento Tenuta Reale: proprietà fittizia di categoria grandi possedimenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 260000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_123', 'Possedimento Domain', 'Possedimento Domain: proprietà fittizia di categoria grandi possedimenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 12900000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_124', 'Possedimento Estate', 'Possedimento Estate: proprietà fittizia di categoria grandi possedimenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 18950000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_abit_125', 'Possedimento Heritage', 'Possedimento Heritage: proprietà fittizia di categoria grandi possedimenti, con potenziale patrimoniale nel Comune Virtuale.', 'home', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_001', 'Gioiello Anello Meridio', 'Gioiello Anello: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_002', 'Gioiello Collana Meridio', 'Gioiello Collana: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1179, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_003', 'Gioiello Bracciale Meridio', 'Gioiello Bracciale: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1558, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_004', 'Gioiello Orecchini Meridio', 'Gioiello Orecchini: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1937, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_005', 'Gioiello Pendente Meridio', 'Gioiello Pendente: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2316, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_006', 'Gioiello Gemme Meridio', 'Gioiello Gemme: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 26947, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_007', 'Gioiello Perle Meridio', 'Gioiello Perle: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 30737, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_008', 'Gioiello Oro Meridio', 'Gioiello Oro: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 34526, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_009', 'Gioiello Argento Meridio', 'Gioiello Argento: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 38316, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_010', 'Gioiello Platino Meridio', 'Gioiello Platino: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 42105, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_011', 'Gioiello Vintage Meridio', 'Gioiello Vintage: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 458947, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_012', 'Gioiello Moderno Meridio', 'Gioiello Moderno: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 496842, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_013', 'Gioiello Heritage Meridio', 'Gioiello Heritage: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 534737, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_014', 'Gioiello Signature Meridio', 'Gioiello Signature: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 572632, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_015', 'Gioiello Private Meridio', 'Gioiello Private: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 610526, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_016', 'Gioiello Royal Meridio', 'Gioiello Royal: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 19905263, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_017', 'Gioiello Imperial Meridio', 'Gioiello Imperial: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 21178947, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_018', 'Gioiello Elite Meridio', 'Gioiello Elite: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 22452632, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_019', 'Gioiello Rare Meridio', 'Gioiello Rare: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 23726316, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_020', 'Gioiello Unique Meridio', 'Gioiello Unique: bene di lusso fittizio (gioielli) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_021', 'Orologio Classico Meridio', 'Orologio Classico: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_022', 'Orologio Sport Meridio', 'Orologio Sport: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1224, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_023', 'Orologio Automatico Meridio', 'Orologio Automatico: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1647, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_024', 'Orologio Cronografo Meridio', 'Orologio Cronografo: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2071, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_025', 'Orologio Heritage Meridio', 'Orologio Heritage: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2494, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_026', 'Orologio Limited Meridio', 'Orologio Limited: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 29176, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_027', 'Orologio Platinum Meridio', 'Orologio Platinum: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 33412, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_028', 'Orologio Gold Meridio', 'Orologio Gold: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 37647, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_029', 'Orologio Steel Meridio', 'Orologio Steel: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 41882, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_030', 'Orologio Ceramic Meridio', 'Orologio Ceramic: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 461176, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_031', 'Orologio Pilot Meridio', 'Orologio Pilot: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 503529, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_032', 'Orologio Diver Meridio', 'Orologio Diver: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 545882, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_033', 'Orologio Moon Meridio', 'Orologio Moon: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 588235, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_034', 'Orologio Star Meridio', 'Orologio Star: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 19305882, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_035', 'Orologio Royal Meridio', 'Orologio Royal: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 20729412, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_036', 'Orologio Imperial Meridio', 'Orologio Imperial: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 22152941, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_037', 'Orologio Elite Meridio', 'Orologio Elite: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 23576471, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_038', 'Orologio Private Meridio', 'Orologio Private: bene di lusso fittizio (orologi fittizi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_039', 'Opera Contemporanea Meridio', 'Opera Contemporanea: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_040', 'Opera Moderna Meridio', 'Opera Moderna: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1224, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_041', 'Opera Classica Meridio', 'Opera Classica: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1647, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_042', 'Opera Scultura Meridio', 'Opera Scultura: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2071, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_043', 'Opera Tela Meridio', 'Opera Tela: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2494, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_044', 'Opera Mixed Meridio', 'Opera Mixed: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 29176, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_045', 'Opera Gallery Meridio', 'Opera Gallery: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 33412, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_046', 'Opera Private Meridio', 'Opera Private: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 37647, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_047', 'Opera Rare Meridio', 'Opera Rare: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 41882, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_048', 'Opera Heritage Meridio', 'Opera Heritage: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 461176, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_049', 'Opera Limited Meridio', 'Opera Limited: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 503529, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_050', 'Opera Signature Meridio', 'Opera Signature: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 545882, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_051', 'Opera Urban Meridio', 'Opera Urban: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 588235, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_052', 'Opera Abstract Meridio', 'Opera Abstract: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 19305882, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_053', 'Opera Portrait Meridio', 'Opera Portrait: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 20729412, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_054', 'Opera Landscape Meridio', 'Opera Landscape: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 22152941, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_055', 'Opera Vision Meridio', 'Opera Vision: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 23576471, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_056', 'Opera Master Meridio', 'Opera Master: bene di lusso fittizio (opere d''arte) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_057', 'Collezione Monete Meridio', 'Collezione Monete: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_058', 'Collezione Francobolli Meridio', 'Collezione Francobolli: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1314, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_059', 'Collezione Vini Meridio', 'Collezione Vini: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1829, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_060', 'Collezione Whisky Meridio', 'Collezione Whisky: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2343, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_061', 'Collezione Sigari Meridio', 'Collezione Sigari: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 28571, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_062', 'Collezione Poster Meridio', 'Collezione Poster: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 33714, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_063', 'Collezione Vinili Meridio', 'Collezione Vinili: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 38857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_064', 'Collezione Comics Meridio', 'Collezione Comics: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 440000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_065', 'Collezione Cards Meridio', 'Collezione Cards: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 491429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_066', 'Collezione Antique Meridio', 'Collezione Antique: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 542857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_067', 'Collezione Rare Meridio', 'Collezione Rare: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 594286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_068', 'Collezione Limited Meridio', 'Collezione Limited: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 19814286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_069', 'Collezione Vintage Meridio', 'Collezione Vintage: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 21542857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_070', 'Collezione Private Meridio', 'Collezione Private: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 23271429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_071', 'Collezione Heritage Meridio', 'Collezione Heritage: bene di lusso fittizio (collezionismo) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_072', 'Barca Open Meridio', 'Barca Open: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_073', 'Barca Day Meridio', 'Barca Day: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1314, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_074', 'Barca Cabin Meridio', 'Barca Cabin: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1829, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_075', 'Barca Fishing Meridio', 'Barca Fishing: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2343, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_076', 'Barca Sport Meridio', 'Barca Sport: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 28571, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_077', 'Barca Classic Meridio', 'Barca Classic: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 33714, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_078', 'Barca Modern Meridio', 'Barca Modern: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 38857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_079', 'Barca Coastal Meridio', 'Barca Coastal: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 440000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_080', 'Barca Lake Meridio', 'Barca Lake: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 491429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_081', 'Barca River Meridio', 'Barca River: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 542857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_082', 'Barca Speed Meridio', 'Barca Speed: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 594286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_083', 'Barca Cruise Meridio', 'Barca Cruise: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 19814286, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_084', 'Barca Family Meridio', 'Barca Family: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 21542857, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_085', 'Barca Prestige Meridio', 'Barca Prestige: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 23271429, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_086', 'Barca Elite Meridio', 'Barca Elite: bene di lusso fittizio (imbarcazioni) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_087', 'Yacht Fly Meridio', 'Yacht Fly: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_088', 'Yacht Sport Meridio', 'Yacht Sport: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1455, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_089', 'Yacht Classic Meridio', 'Yacht Classic: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2109, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_090', 'Yacht Modern Meridio', 'Yacht Modern: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 27636, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_091', 'Yacht Explorer Meridio', 'Yacht Explorer: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 34182, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_092', 'Yacht Lux Meridio', 'Yacht Lux: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 40727, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_093', 'Yacht Prestige Meridio', 'Yacht Prestige: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 472727, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_094', 'Yacht Private Meridio', 'Yacht Private: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 538182, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_095', 'Yacht Royal Meridio', 'Yacht Royal: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 603636, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_096', 'Yacht Imperial Meridio', 'Yacht Imperial: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 20600000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_097', 'Yacht Signature Meridio', 'Yacht Signature: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 22800000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_098', 'Yacht Heritage Meridio', 'Yacht Heritage: bene di lusso fittizio (yacht) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_099', 'Motoscafo Speed Meridio', 'Motoscafo Speed: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_100', 'Motoscafo Open Meridio', 'Motoscafo Open: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1600, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_101', 'Motoscafo Sport Meridio', 'Motoscafo Sport: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2400, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_102', 'Motoscafo Lux Meridio', 'Motoscafo Lux: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 32000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_103', 'Motoscafo Coastal Meridio', 'Motoscafo Coastal: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 40000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_104', 'Motoscafo Prestige Meridio', 'Motoscafo Prestige: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 480000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_105', 'Motoscafo Elite Meridio', 'Motoscafo Elite: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 560000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_106', 'Motoscafo Private Meridio', 'Motoscafo Private: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 19622222, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_107', 'Motoscafo Royal Meridio', 'Motoscafo Royal: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 22311111, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_108', 'Motoscafo Signature Meridio', 'Motoscafo Signature: bene di lusso fittizio (motoscafi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_109', 'Raro Antico Meridio', 'Raro Antico: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_110', 'Raro Unico Meridio', 'Raro Unico: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 1600, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_111', 'Raro Limited Meridio', 'Raro Limited: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2400, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_112', 'Raro Private Meridio', 'Raro Private: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 32000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_113', 'Raro Heritage Meridio', 'Raro Heritage: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 40000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_114', 'Raro Museum Meridio', 'Raro Museum: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 480000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_115', 'Raro Gallery Meridio', 'Raro Gallery: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 560000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_116', 'Raro Imperial Meridio', 'Raro Imperial: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 19622222, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_117', 'Raro Royal Meridio', 'Raro Royal: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 22311111, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_118', 'Raro Legend Meridio', 'Raro Legend: bene di lusso fittizio (oggetti rarissimi) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_119', 'Eccezionale Masterpiece Meridio', 'Eccezionale Masterpiece: bene di lusso fittizio (beni eccezionali) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 800, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_120', 'Eccezionale Unique Meridio', 'Eccezionale Unique: bene di lusso fittizio (beni eccezionali) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 2000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_121', 'Eccezionale Imperial Meridio', 'Eccezionale Imperial: bene di lusso fittizio (beni eccezionali) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 32000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_122', 'Eccezionale Royal Meridio', 'Eccezionale Royal: bene di lusso fittizio (beni eccezionali) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 440000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_123', 'Eccezionale Heritage Meridio', 'Eccezionale Heritage: bene di lusso fittizio (beni eccezionali) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 560000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_124', 'Eccezionale Private Meridio', 'Eccezionale Private: bene di lusso fittizio (beni eccezionali) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 20966667, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;

INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('cv_luss_125', 'Eccezionale Legend Meridio', 'Eccezionale Legend: bene di lusso fittizio (beni eccezionali) per chi punta a status, collezione o investimento di prestigio.', 'valuables', 25000000, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;