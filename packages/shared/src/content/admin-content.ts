export const ADMIN_CONTENT_CATEGORIES = [
  'gazzetta',
  'referendum',
  'cittadini',
  'conversazioni',
  'eventi',
  'lavoro',
  'marketplace',
  'task',
  'conoscenze',
  'generale',
] as const;

export type AdminContentCategory = (typeof ADMIN_CONTENT_CATEGORIES)[number];

export const ADMIN_CONTENT_STATUSES = ['draft', 'active', 'disabled'] as const;

export type AdminContentStatus = (typeof ADMIN_CONTENT_STATUSES)[number];

export const ADMIN_CONTENT_CATEGORY_LABELS: Record<AdminContentCategory, string> = {
  gazzetta: 'Gazzetta / News',
  referendum: 'Referendum',
  cittadini: 'Cittadini',
  conversazioni: 'Conversazioni',
  eventi: 'Eventi',
  lavoro: 'Lavoro',
  marketplace: 'Marketplace',
  task: 'Task',
  conoscenze: 'Conoscenze',
  generale: 'Generale',
};

export interface AdminContentMetadata {
  tone?: string;
  character?: string;
  disposition?: string;
  profession?: string;
  eventType?: string;
  minLevel?: number;
  tags?: string[];
  gazzettaCategory?: string;
  optionALabel?: string;
  optionBLabel?: string;
  [key: string]: string | number | string[] | undefined;
}

export interface AdminContentEntryDto {
  contentId: string;
  category: AdminContentCategory;
  status: AdminContentStatus;
  title: string;
  body: string;
  rawText: string;
  metadata: AdminContentMetadata;
  createdByAccountId: string;
  updatedByAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function isAdminContentCategory(value: string): value is AdminContentCategory {
  return (ADMIN_CONTENT_CATEGORIES as readonly string[]).includes(value);
}

export function isAdminContentStatus(value: string): value is AdminContentStatus {
  return (ADMIN_CONTENT_STATUSES as readonly string[]).includes(value);
}
