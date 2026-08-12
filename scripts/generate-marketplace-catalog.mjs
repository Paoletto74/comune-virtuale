#!/usr/bin/env node
/* eslint-env node */
/**
 * Generates the definitive 500-product Comune Virtuale marketplace catalog.
 * Run: node scripts/generate-marketplace-catalog.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const TIER_RANGES = {
  ECONOMICO: [3, 80],
  MEDIO: [80, 800],
  ALTO: [800, 8000],
  PREMIUM: [8000, 80000],
  LUSSO: [80000, 800000],
  'SUPER-LUSSO': [800000, 25000000],
};

const CATEGORY_FOLDERS = {
  consumables: 'beni-di-consumo',
  vehicles: 'veicoli',
  housing: 'abitazioni',
  luxury: 'beni-di-lusso',
};

const CATEGORY_LABELS = {
  consumables: 'Beni di consumo',
  vehicles: 'Veicoli',
  housing: 'Abitazioni',
  luxury: 'Beni di lusso',
};

const ID_PREFIX = {
  consumables: 'cv_cons',
  vehicles: 'cv_veic',
  housing: 'cv_abit',
  luxury: 'cv_luss',
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

const TIER_ORDER = ['ECONOMICO', 'MEDIO', 'ALTO', 'PREMIUM', 'LUSSO', 'SUPER-LUSSO'];

const CONSUMABLE_SUBCAT_MAX_TIER = {
  alimentari: 'PREMIUM',
  bevande: 'PREMIUM',
  pasti: 'PREMIUM',
  'prodotti quotidiani': 'MEDIO',
  'beni per la casa': 'ALTO',
  'prodotti personali': 'MEDIO',
  'consumabili utili': 'MEDIO',
  'beni utili quotidiani': 'ALTO',
};

function clampTier(tier, maxTier) {
  const tierIdx = TIER_ORDER.indexOf(tier);
  const maxIdx = TIER_ORDER.indexOf(maxTier);
  return TIER_ORDER[Math.min(tierIdx, maxIdx)] ?? tier;
}

function tierProgress(slotIndex, slotCount) {
  return slotCount <= 1 ? 0.5 : slotIndex / (slotCount - 1);
}

function tierForProduct(categoryId, subcategory, slotIndex, slotCount) {
  const t = tierProgress(slotIndex, slotCount);

  if (categoryId === 'consumables') {
    if (t < 0.35) return clampTier('ECONOMICO', CONSUMABLE_SUBCAT_MAX_TIER[subcategory] ?? 'PREMIUM');
    if (t < 0.55) return clampTier('MEDIO', CONSUMABLE_SUBCAT_MAX_TIER[subcategory] ?? 'PREMIUM');
    if (t < 0.75) return clampTier('ALTO', CONSUMABLE_SUBCAT_MAX_TIER[subcategory] ?? 'PREMIUM');
    return clampTier('PREMIUM', CONSUMABLE_SUBCAT_MAX_TIER[subcategory] ?? 'PREMIUM');
  }

  if (categoryId === 'vehicles') {
    const econSubs = ['veicoli economici', 'city car', 'motocicli'];
    const midSubs = ['berline', 'familiari', 'veicoli commerciali'];
    const highSubs = ['suv', 'sportive', 'coupé e cabrio'];
    if (econSubs.includes(subcategory)) {
      if (t < 0.5) return 'ECONOMICO';
      if (t < 0.85) return 'MEDIO';
      return 'ALTO';
    }
    if (midSubs.includes(subcategory)) {
      if (t < 0.4) return 'MEDIO';
      if (t < 0.75) return 'ALTO';
      return 'PREMIUM';
    }
    if (highSubs.includes(subcategory)) {
      if (t < 0.3) return 'ALTO';
      if (t < 0.7) return 'PREMIUM';
      return 'LUSSO';
    }
    if (t < 0.4) return 'PREMIUM';
    if (t < 0.75) return 'LUSSO';
    return 'SUPER-LUSSO';
  }

  if (categoryId === 'housing') {
    const rentSubs = ['camere', 'monolocali'];
    const midSubs = ['bilocali', 'appartamenti'];
    const highSubs = ['attici', 'case'];
    const luxSubs = ['ville', 'ville con piscina'];
    if (rentSubs.includes(subcategory)) {
      return t < 0.6 ? 'ECONOMICO' : 'MEDIO';
    }
    if (midSubs.includes(subcategory)) {
      if (t < 0.4) return 'MEDIO';
      if (t < 0.8) return 'ALTO';
      return 'PREMIUM';
    }
    if (highSubs.includes(subcategory)) {
      if (t < 0.5) return 'ALTO';
      if (t < 0.85) return 'PREMIUM';
      return 'LUSSO';
    }
    if (luxSubs.includes(subcategory)) {
      if (t < 0.4) return 'PREMIUM';
      if (t < 0.75) return 'LUSSO';
      return 'SUPER-LUSSO';
    }
    if (t < 0.35) return 'LUSSO';
    return 'SUPER-LUSSO';
  }

  if (t < 0.25) return 'ALTO';
  if (t < 0.5) return 'PREMIUM';
  if (t < 0.75) return 'LUSSO';
  return 'SUPER-LUSSO';
}

function priceForSlot(tier, slotIndex, slotCount) {
  const [min, max] = TIER_RANGES[tier];
  const t = tierProgress(slotIndex, slotCount);
  return Math.round(min + (max - min) * t);
}

function imageKeyFor(categoryId, subcategory) {
  if (categoryId === 'consumables') {
    if (subcategory === 'bevande') return 'drink';
    if (subcategory === 'beni sportivi') return 'sport';
    return 'food';
  }
  if (categoryId === 'vehicles') return 'vehicle';
  if (categoryId === 'housing') return 'home';
  if (subcategory === 'orologi fittizi' || subcategory === 'elettronica di prestigio') return 'tech';
  if (subcategory === 'libri e cultura') return 'book';
  return 'luxury';
}

function essentialFor(categoryId, subcategory, tier) {
  if (categoryId === 'consumables') {
    if (subcategory === 'alimentari') return 'Alimentare';
    if (subcategory === 'bevande') return 'Bevanda';
    if (subcategory === 'pasti') return 'Pasto';
    if (subcategory === 'beni per la casa') return 'Casa';
    return 'Consumabile';
  }
  if (categoryId === 'housing') {
    if (tier === 'ECONOMICO' || tier === 'MEDIO') return 'Affitto';
    return 'Proprietà';
  }
  if (categoryId === 'vehicles') return 'Veicolo';
  return 'Lusso';
}

const CONSUMABLE_SUBCATS = [
  ['alimentari', 25, [
    'Pane integrale del Forno Vecchio', 'Farina di grano antico', 'Riso venere biologico', 'Pasta di semola dorata',
    'Olio extravergine delle Colline', 'Miele di castagno selvatico', 'Formaggio stagionato della Valle', 'Yogurt artigianale al miele',
    'Uova fresche del podere', 'Latte intero del mattino', 'Burro di malga', 'Sale marino integrale',
    'Zucchero di canna grezzo', 'Ceci secchi del mercato', 'Lenticchie di montagna', 'Pomodori pelati rustici',
    'Passata di pomodoro antica', 'Confettura di albicocche', 'Marmellata di arance amare', 'Cereali croccanti al miele',
    'Muesli delle valli', 'Frutta secca mista', 'Noci sgusciate a mano', 'Mandorle tostate lente', 'Cioccolato fondente artigianale',
  ]],
  ['bevande', 20, [
    'Acqua minerale delle sorgenti', 'Succo di arancia rossa', 'Succo di mela del frutteto', 'Tè verde delle colline',
    'Tè nero speziato', 'Infuso di camomilla', 'Caffè macinato del torrefattore', 'Caffè in capsule compatibili',
    'Bevanda energetica leggera', 'Limonata artigianale', 'Spuma bianca del Comune', 'Gassosa alla frutta',
    'Vino rosso da tavola', 'Vino bianco secco', 'Prosecco delle colline', 'Birra artigianale bionda',
    'Birra scura del birrificio', 'Sidro di mele antico', 'Latte di mandorla fresco', 'Bevanda ai cereali',
  ]],
  ['pasti', 20, [
    'Pranzo completo del mercato', 'Cena pronta della trattoria', 'Zuppa calda del giorno', 'Insalata mista fresca',
    'Panino gourmet del fornaio', 'Pizza margherita da asporto', 'Pizza speciale del quartiere', 'Pasta al sugo della nonna',
    'Risotto allo zafferano', 'Polenta con formaggio', 'Spezzatino di verdure', 'Grigliata mista del rosticciere',
    'Menu vegano del giorno', 'Menu proteico per sportivi', 'Colazione continentale', 'Brunch domenicale',
    'Merenda dolce da bar', 'Menu bambini allegro', 'Box pranzo ufficio', 'Cena romantica per due',
  ]],
  ['prodotti quotidiani', 15, [
    'Detergente multiuso', 'Sapone liquido neutro', 'Carta igienica confezione famiglia', 'Fazzoletti di carta morbidi',
    'Spugne per piatti', 'Sacchetti biodegradabili', 'Panni microfibra', 'Candeggina delicata',
    'Ammorbidente al talco', 'Pile stilo AA', 'Pile stilo AAA', 'Lampadina LED calda',
    'Accendino ricaricabile', 'Accendino classico', 'Kit cucina monouso',
  ]],
  ['beni per la casa', 15, [
    'Set pentole base', 'Set coltelli da cucina', 'Set piatti per quattro', 'Set bicchieri resistenti',
    'Tovaglioli di stoffa', 'Tappeto antiscivolo', 'Tende oscuranti', 'Cuscini decorativi',
    'Coperta in microfibra', 'Appendiabiti in legno', 'Cestino per biancheria', 'Organizer da scrivania',
    'Porta spezie a muro', 'Barattoli vetro ermetici', 'Set contenitori alimentari',
  ]],
  ['prodotti personali', 15, [
    'Shampoo delicato', 'Balsamo nutriente', 'Gel doccia fresco', 'Crema idratante viso',
    'Crema mani riparatrice', 'Deodorante roll-on', 'Spazzolino da denti', 'Dentifricio menta',
    'Rasoio monouso', 'Rasoio ricaricabile', 'Assorbenti confezione', 'Cerotti assortiti',
    'Profumo leggero quotidiano', 'Lozione dopobarba', 'Kit igiene viaggio',
  ]],
  ['consumabili utili', 10, [
    'Pile ricaricabili', 'Cartucce stampante compatibili', 'Toner compatibile', 'Carta A4 risma',
    'Quaderno a righe', 'Penna a sfera blu', 'Evidenziatori colorati', 'Gomma da cancellare',
    'Matita HB', 'Nastro adesivo trasparente',
  ]],
  ['beni utili quotidiani', 5, [
    'Ombrello pieghevole', 'Borraccia termica', 'Lunch box ermetico', 'Borsa riutilizzabile robusta', 'Trolley leggero da spesa',
  ]],
];

const VEHICLE_SUBCATS = [
  ['veicoli economici', 15, 'Eco', ['Piccolo', 'Compact', 'Urban', 'City', 'Mini', 'Base', 'Start', 'Light', 'Smart', 'Entry', 'Pratico', 'Essential', 'Daily', 'Run', 'Go']],
  ['city car', 15, 'Città', ['Micro', 'Nano', 'Zip', 'Pop', 'Twist', 'Flash', 'Hop', 'Dash', 'Quick', 'Rapid', 'Swift', 'Brio', 'Vivo', 'Lively', 'Agile']],
  ['berline', 15, 'Berlina', ['Class', 'Comfort', 'Elegance', 'Prestige', 'Linea', 'Aura', 'Nova', 'Sigma', 'Delta', 'Orizonte', 'Prime', 'Select', 'Grand', 'Royal', 'Noble']],
  ['familiari', 12, 'Family', ['Space', 'Room', 'Tour', 'Cargo', 'Life', 'Home', 'Plus', 'Maxi', 'Wide', 'Long', 'Comfort', 'Travel']],
  ['suv', 12, 'Trail', ['Cross', 'Peak', 'Ridge', 'Summit', 'Highland', 'Forest', 'Dune', 'Rock', 'Stone', 'Wild', 'Open', 'Range']],
  ['sportive', 12, 'Sport', ['GT', 'RS', 'Turbo', 'Velocity', 'Thunder', 'Bolt', 'Pulse', 'Rush', 'Storm', 'Blaze', 'Flash', 'Drive']],
  ['coupé e cabrio', 10, 'Style', ['Coupé', 'Cabrio', 'Roadster', 'Spider', 'Open', 'Sky', 'Sun', 'Aero', 'Curve', 'Line']],
  ['veicoli commerciali', 10, 'Work', ['Van', 'Box', 'Cargo', 'Trans', 'Fleet', 'Load', 'Carry', 'Move', 'Haul', 'Deliver']],
  ['motocicli', 14, 'Moto', ['Scooter', 'City', 'Road', 'Trail', 'Classic', 'Neo', 'Pulse', 'Rider', 'Swift', 'Free', 'Wind', 'Rapid', 'Urban', 'Lite']],
  ['veicoli di prestigio', 10, 'Prestige', ['Elite', 'Supreme', 'Imperial', 'Crown', 'Legacy', 'Heritage', 'Signature', 'Private', 'Grand', 'Royal']],
];

const HOUSING_SUBCATS = [
  ['camere', 12, 'Camera', ['Singola', 'Condivisa', 'Studenti', 'Centro', 'Tranquilla', 'Luminosa', 'Compatta', 'Essenziale', 'Pratica', 'Economica', 'Standard', 'Base']],
  ['monolocali', 15, 'Monolocale', ['Centro', 'Periferia', 'Ristrutturato', 'Moderno', 'Luminoso', 'Quiet', 'Smart', 'Open', 'Mini', 'Studio', 'Urban', 'Compact', 'Fresh', 'New', 'Classic']],
  ['bilocali', 15, 'Bilocale', ['Balcone', 'Terrazzo', 'Giardino', 'Centro', 'Semicentro', 'Ristrutturato', 'Arredato', 'Vuoto', 'Moderno', 'Classico', 'Family', 'Quiet', 'Open', 'Corner', 'View']],
  ['appartamenti', 18, 'Appartamento', ['Tre locali', 'Quattro locali', 'Centro storico', 'Semicentro', 'Periferia', 'Ristrutturato', 'Signorile', 'Moderno', 'Family', 'Panorama', 'Corner', 'Garden', 'Terrace', 'Open', 'Smart', 'Classic', 'Prestige', 'Comfort']],
  ['attici', 12, 'Attico', ['Panoramico', 'Terrazzo', 'Skyline', 'Lux', 'Open', 'Modern', 'Classic', 'Corner', 'View', 'Sunset', 'Dawn', 'Elite']],
  ['case', 15, 'Casa', ['Indipendente', 'Schiera', 'Bifamiliare', 'Giardino', 'Corte', 'Collina', 'Borgo', 'Moderna', 'Rustica', 'Ristrutturata', 'Family', 'Quiet', 'Green', 'Corner', 'Classic']],
  ['ville', 15, 'Villa', ['Collinare', 'Panoramica', 'Moderna', 'Classica', 'Signorile', 'Giardino', 'Parco', 'Bosco', 'Lago', 'Quiet', 'Prestige', 'Family', 'Open', 'Green', 'View']],
  ['ville con piscina', 10, 'Villa Piscina', ['Estiva', 'Tropicale', 'Collinare', 'Panoramica', 'Moderna', 'Prestige', 'Resort', 'Private', 'Garden', 'Elite']],
  ['tenute', 8, 'Tenuta', ['Agricola', 'Vigna', 'Uliveto', 'Campagna', 'Storica', 'Signorile', 'Ampia', 'Private']],
  ['grandi possedimenti', 5, 'Possedimento', ['Parco', 'Tenuta Reale', 'Domain', 'Estate', 'Heritage']],
];

const LUXURY_SUBCATS = [
  ['gioielli', 20, 'Gioiello', ['Anello', 'Collana', 'Bracciale', 'Orecchini', 'Pendente', 'Gemme', 'Perle', 'Oro', 'Argento', 'Platino', 'Vintage', 'Moderno', 'Heritage', 'Signature', 'Private', 'Royal', 'Imperial', 'Elite', 'Rare', 'Unique']],
  ['orologi fittizi', 18, 'Orologio', ['Classico', 'Sport', 'Automatico', 'Cronografo', 'Heritage', 'Limited', 'Platinum', 'Gold', 'Steel', 'Ceramic', 'Pilot', 'Diver', 'Moon', 'Star', 'Royal', 'Imperial', 'Elite', 'Private']],
  ['opere d\'arte', 18, 'Opera', ['Contemporanea', 'Moderna', 'Classica', 'Scultura', 'Tela', 'Mixed', 'Gallery', 'Private', 'Rare', 'Heritage', 'Limited', 'Signature', 'Urban', 'Abstract', 'Portrait', 'Landscape', 'Vision', 'Master']],
  ['collezionismo', 15, 'Collezione', ['Monete', 'Francobolli', 'Vini', 'Whisky', 'Sigari', 'Poster', 'Vinili', 'Comics', 'Cards', 'Antique', 'Rare', 'Limited', 'Vintage', 'Private', 'Heritage']],
  ['imbarcazioni', 15, 'Barca', ['Open', 'Day', 'Cabin', 'Fishing', 'Sport', 'Classic', 'Modern', 'Coastal', 'Lake', 'River', 'Speed', 'Cruise', 'Family', 'Prestige', 'Elite']],
  ['yacht', 12, 'Yacht', ['Fly', 'Sport', 'Classic', 'Modern', 'Explorer', 'Lux', 'Prestige', 'Private', 'Royal', 'Imperial', 'Signature', 'Heritage']],
  ['motoscafi', 10, 'Motoscafo', ['Speed', 'Open', 'Sport', 'Lux', 'Coastal', 'Prestige', 'Elite', 'Private', 'Royal', 'Signature']],
  ['oggetti rarissimi', 10, 'Raro', ['Antico', 'Unico', 'Limited', 'Private', 'Heritage', 'Museum', 'Gallery', 'Imperial', 'Royal', 'Legend']],
  ['beni eccezionali', 7, 'Eccezionale', ['Masterpiece', 'Unique', 'Imperial', 'Royal', 'Heritage', 'Private', 'Legend']],
];

const FICTIONAL_BRANDS = ['Velox', 'Aurora', 'Domus', 'Nordica', 'Solare', 'Meridio', 'Altair', 'Vento', 'Lumen', 'Civitas', 'Armonia', 'Titania', 'Orione', 'Zenit', 'Avanti'];

function describeConsumable(name, subcategory) {
  const templates = {
    alimentari: `Prodotto alimentare genuino: ${name.toLowerCase()}. Ideale per la spesa quotidiana nel Comune.`,
    bevande: `${name}: bevanda selezionata per idratarsi o brindare senza eccessi di budget.`,
    pasti: `${name} — pasto pronto per chi ha poco tempo e molta fame da gestire.`,
    'prodotti quotidiani': `${name} per mantenere casa e routine in ordine senza drammi.`,
    'beni per la casa': `${name} per rendere l'abitazione più pratica e accogliente.`,
    'prodotti personali': `${name} per cura personale e igiene quotidiana nel Comune.`,
    'consumabili utili': `${name} — consumabile utile per studio, lavoro o piccole emergenze.`,
    'beni utili quotidiani': `${name} per affrontare la giornata con un minimo di preparazione.`,
  };
  return templates[subcategory] ?? `${name} — bene di consumo per la vita quotidiana.`;
}

function describeVehicle(brand, model, subcategory) {
  return `${brand} ${model}: veicolo fittizio della categoria ${subcategory}. Prestazioni e comfort adeguati alla fascia economica.`;
}

function describeHousing(type, variant, subcategory, tier) {
  if (tier === 'ECONOMICO' || tier === 'MEDIO') {
    return `${type} ${variant}: soluzione abitativa modesta in affitto, adatta a chi cerca stabilità economica.`;
  }
  return `${type} ${variant}: proprietà fittizia di categoria ${subcategory}, con potenziale patrimoniale nel Comune Virtuale.`;
}

function describeLuxury(type, variant, subcategory) {
  return `${type} ${variant}: bene di lusso fittizio (${subcategory}) per chi punta a status, collezione o investimento di prestigio.`;
}

function buildConsumables() {
  const products = [];
  let idx = 0;
  for (const [subcategory, count, names] of CONSUMABLE_SUBCATS) {
    for (let i = 0; i < count; i++) {
      const name = names[i];
      const tier = tierForProduct('consumables', subcategory, i, count);
      const price = priceForSlot(tier, i, count);
      const slugBase = slugify(name);
      const slug = `${slugBase}-${String(i + 1).padStart(2, '0')}`;
      products.push({
        itemId: `${ID_PREFIX.consumables}_${String(idx + 1).padStart(3, '0')}`,
        name,
        slug,
        categoryId: 'consumables',
        categoryLabel: CATEGORY_LABELS.consumables,
        subcategory,
        economicTier: tier,
        imagePath: `/products/${CATEGORY_FOLDERS.consumables}/${slug}.webp`,
        priceMinor: price,
        description: describeConsumable(name, subcategory),
        imageKey: imageKeyFor('consumables', subcategory),
        essential: essentialFor('consumables', subcategory, tier),
        isFood: ['alimentari', 'bevande', 'pasti'].includes(subcategory),
        isConsumable: true,
      });
      idx++;
    }
  }
  return products;
}

function buildVehicles() {
  const products = [];
  let idx = 0;
  for (const [subcategory, count, family, variants] of VEHICLE_SUBCATS) {
    for (let i = 0; i < count; i++) {
      const brand = FICTIONAL_BRANDS[i % FICTIONAL_BRANDS.length];
      const variant = variants[i % variants.length];
      const name = `${brand} ${family} ${variant}`;
      const tier = tierForProduct('vehicles', subcategory, i, count);
      const price = priceForSlot(tier, i, count);
      const slug = slugify(`${brand}-${family}-${variant}-${i + 1}`);
      products.push({
        itemId: `${ID_PREFIX.vehicles}_${String(idx + 1).padStart(3, '0')}`,
        name,
        slug,
        categoryId: 'vehicles',
        categoryLabel: CATEGORY_LABELS.vehicles,
        subcategory,
        economicTier: tier,
        imagePath: `/products/${CATEGORY_FOLDERS.vehicles}/${slug}.webp`,
        priceMinor: price,
        description: describeVehicle(brand, `${family} ${variant}`, subcategory),
        imageKey: imageKeyFor('vehicles', subcategory),
        essential: essentialFor('vehicles', subcategory, tier),
        isFood: false,
        isConsumable: false,
      });
      idx++;
    }
  }
  return products;
}

function buildHousing() {
  const products = [];
  let idx = 0;
  for (const [subcategory, count, type, variants] of HOUSING_SUBCATS) {
    for (let i = 0; i < count; i++) {
      const variant = variants[i % variants.length];
      const name = `${type} ${variant}`;
      const tier = tierForProduct('housing', subcategory, i, count);
      const price = priceForSlot(tier, i, count);
      const slug = slugify(`${type}-${variant}-${i + 1}`);
      products.push({
        itemId: `${ID_PREFIX.housing}_${String(idx + 1).padStart(3, '0')}`,
        name,
        slug,
        categoryId: 'housing',
        categoryLabel: CATEGORY_LABELS.housing,
        subcategory,
        economicTier: tier,
        imagePath: `/products/${CATEGORY_FOLDERS.housing}/${slug}.webp`,
        priceMinor: price,
        description: describeHousing(type, variant, subcategory, tier),
        imageKey: imageKeyFor('housing', subcategory),
        essential: essentialFor('housing', subcategory, tier),
        isFood: false,
        isConsumable: false,
        isRentable: tier === 'ECONOMICO' || tier === 'MEDIO',
      });
      idx++;
    }
  }
  return products;
}

function buildLuxury() {
  const products = [];
  let idx = 0;
  for (const [subcategory, count, type, variants] of LUXURY_SUBCATS) {
    for (let i = 0; i < count; i++) {
      const variant = variants[i % variants.length];
      const name = `${type} ${variant} Meridio`;
      const tier = tierForProduct('luxury', subcategory, i, count);
      const price = priceForSlot(tier, i, count);
      const slug = slugify(`${type}-${variant}-meridio-${i + 1}`);
      products.push({
        itemId: `${ID_PREFIX.luxury}_${String(idx + 1).padStart(3, '0')}`,
        name,
        slug,
        categoryId: 'luxury',
        categoryLabel: CATEGORY_LABELS.luxury,
        subcategory,
        economicTier: tier,
        imagePath: `/products/${CATEGORY_FOLDERS.luxury}/${slug}.webp`,
        priceMinor: price,
        description: describeLuxury(type, variant, subcategory),
        imageKey: imageKeyFor('luxury', subcategory),
        essential: essentialFor('luxury', subcategory, tier),
        isFood: false,
        isConsumable: false,
      });
      idx++;
    }
  }
  return products;
}

function ensureUniqueSlugs(products) {
  const seen = new Set();
  return products.map((product) => {
    let slug = product.slug;
    let n = 2;
    while (seen.has(slug)) {
      slug = `${product.slug}-${n}`;
      n++;
    }
    seen.add(slug);
    return { ...product, slug, imagePath: product.imagePath.replace(/[^/]+\.webp$/, `${slug}.webp`) };
  });
}

const catalog = ensureUniqueSlugs([
  ...buildConsumables(),
  ...buildVehicles(),
  ...buildHousing(),
  ...buildLuxury(),
]);

if (catalog.length !== 500) {
  throw new Error(`Expected 500 products, got ${catalog.length}`);
}

const counts = {};
for (const p of catalog) {
  counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
}
for (const cat of Object.keys(CATEGORY_LABELS)) {
  if (counts[cat] !== 125) {
    throw new Error(`Category ${cat}: expected 125, got ${counts[cat] ?? 0}`);
  }
}

const ids = new Set(catalog.map((p) => p.itemId));
const names = new Set(catalog.map((p) => p.name));
const slugs = new Set(catalog.map((p) => p.slug));
if (ids.size !== 500 || names.size !== 500 || slugs.size !== 500) {
  throw new Error(`Uniqueness failed: ids=${ids.size} names=${names.size} slugs=${slugs.size}`);
}

// JSON catalog
const jsonPath = resolve(ROOT, 'content/marketplace/marketplace_main_v1/products.catalog.json');
mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, JSON.stringify({ version: 1, productCount: 500, products: catalog }, null, 2));

// Generated TS pool
const tsPath = resolve(ROOT, 'apps/backend/src/slice/marketplace-catalog-pool.generated.ts');
const tsLines = [
  '/** AUTO-GENERATED — do not edit. Run: node scripts/generate-marketplace-catalog.mjs */',
  "import type { MarketplaceCatalogItemDef } from './marketplace-catalog-constants.js';",
  '',
  'export const MARKETPLACE_CATALOG_POOL: readonly MarketplaceCatalogItemDef[] = [',
  ...catalog.map((p) => {
    const extras = [];
    if (p.isFood) extras.push('isFood: true');
    if (p.isConsumable) extras.push('isConsumable: true');
    if (p.isRentable) extras.push('isRentable: true');
    const extraStr = extras.length ? `, ${extras.join(', ')}` : '';
    return `  { itemId: '${p.itemId}', slug: '${p.slug}', name: ${JSON.stringify(p.name)}, description: ${JSON.stringify(p.description)}, categoryId: '${p.categoryId}', subcategory: ${JSON.stringify(p.subcategory)}, economicTier: '${p.economicTier}', imagePath: '${p.imagePath}', priceMinor: ${p.priceMinor}n, imageKey: '${p.imageKey}', essential: ${JSON.stringify(p.essential)}${extraStr} },`;
  }),
  '];',
  '',
  'export const MARKETPLACE_CATALOG_PRODUCT_COUNT = 500 as const;',
  '',
];
writeFileSync(tsPath, tsLines.join('\n'));

// Markdown catalog
const mdPath = resolve(ROOT, 'MARKETPLACE-PRODUCT-CATALOG.md');
const md = [
  '# Marketplace Product Catalog — Comune Virtuale',
  '',
  'Catalogo master ufficiale: **500 prodotti** originali e fittizi.',
  '',
  '| Categoria | Conteggio |',
  '|-----------|-----------|',
  ...Object.values(CATEGORY_LABELS).map((label) => `| ${label} | 125 |`),
  '',
  '---',
  '',
  ...catalog.map((p) => [
    `## ${p.itemId} — ${p.name}`,
    '',
    `- **Categoria:** ${p.categoryLabel}`,
    `- **Sottocategoria:** ${p.subcategory}`,
    `- **Fascia economica:** ${p.economicTier}`,
    `- **Slug:** \`${p.slug}\``,
    `- **Image path:** \`${p.imagePath}\``,
    `- **Prezzo:** ${p.priceMinor} (minor units)`,
    `- **Descrizione:** ${p.description}`,
    '',
  ].join('\n')),
].join('\n');
writeFileSync(mdPath, md);

// SQL migration
const sqlPath = resolve(ROOT, 'apps/backend/drizzle/0018_marketplace_catalog_master.sql');
const legacyCategory = {
  consumables: 'food',
  vehicles: 'mobility',
  housing: 'home',
  luxury: 'valuables',
};
const sql = [
  '-- Master marketplace catalog — 500 products',
  ...catalog.map((p) =>
    `INSERT INTO marketplace_catalog (item_id, name, description, category, price_minor, effect_key, enabled)
VALUES ('${p.itemId}', ${sqlQuote(p.name)}, ${sqlQuote(p.description)}, '${legacyCategory[p.categoryId]}', ${p.priceMinor}, NULL, true)
ON CONFLICT (item_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_minor = EXCLUDED.price_minor,
  enabled = EXCLUDED.enabled;`,
  ),
].join('\n\n');
writeFileSync(sqlPath, sql);

// Create image folder placeholders
for (const folder of Object.values(CATEGORY_FOLDERS)) {
  mkdirSync(resolve(ROOT, `apps/frontend/public/products/${folder}`), { recursive: true });
}

function sqlQuote(value) {
  return `'${value.replace(/'/g, "''")}'`;
}
