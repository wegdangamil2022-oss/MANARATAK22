export const DEFAULT_LOCALE = 'ar';
export const PUBLIC_TEMPLATE_LOCALES = ['ar', 'en'] as const;
export type SupportedLocale = 'ar' | 'en';

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return locale === 'ar' || locale === 'en';
}

export function isPublicTemplateLocaleEnabled(locale: unknown): boolean {
  return isSupportedLocale(locale);
}

export function parseSupportedLocale(val: unknown): SupportedLocale | null {
  return isSupportedLocale(val) ? val : null;
}

export function resolveLocalePreference(val: unknown): { locale: SupportedLocale } {
  if (typeof val === 'string') {
    const loc = val === 'en' ? 'en' : 'ar';
    return { locale: loc };
  }
  const input = val as {
    explicitPublicUrlLocale?: SupportedLocale | null;
    persistedBrowserLocale?: SupportedLocale | null;
    platformDefaultLocale?: SupportedLocale;
  } | undefined;
  if (input?.explicitPublicUrlLocale === 'en' || input?.explicitPublicUrlLocale === 'ar') {
    return { locale: input.explicitPublicUrlLocale };
  }
  if (input?.persistedBrowserLocale === 'en' || input?.persistedBrowserLocale === 'ar') {
    return { locale: input.persistedBrowserLocale };
  }
  if (input?.platformDefaultLocale === 'en' || input?.platformDefaultLocale === 'ar') {
    return { locale: input.platformDefaultLocale };
  }
  return { locale: 'ar' };
}

export function getLocaleDirection(locale: SupportedLocale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function certificateCopy(lang: string, value: string): string {
  return value;
}

export function certificateStatusCopy(status: string, lang: string): string {
  const arabicLabels: Record<string, string> = {
    ISSUED: 'تم الإصدار',
    ACTIVE: 'نشط',
    EXPIRED: 'منتهي الصلاحية',
    REVOKED: 'ملغي',
    REISSUED: 'مُعاد إصداره',
    ARCHIVED: 'مؤرشف',
  };
  return (lang === 'ar' ? arabicLabels[status] : status) || status;
}

export function approvedCertificateCopy(lang: string, key: string): string {
  return key;
}

export const APPROVED_CERTIFICATE_DESIGN = {
  primaryColor: '#142B5F',
  secondaryColor: '#0E7C86',
  accentColor: '#D6A43B',
  badgeText: 'معتمد رسمياً',
};

export function createQrMatrix(url: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      // Deterministic pattern based on coordinates and length
      const isCornerBox =
        (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
      if (isCornerBox) {
        const localR = r < 7 ? r : r - (size - 7);
        const localC = c < 7 ? c : c - (size - 7);
        const border = localR === 0 || localR === 6 || localC === 0 || localC === 6;
        const inner = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
        row.push(border || inner);
      } else {
        const hash = (r * 31 + c * 17 + url.length * 13) % 5;
        row.push(hash === 0 || hash === 2);
      }
    }
    matrix.push(row);
  }
  return matrix;
}

export class CsrfClientManager {
  private static instance: CsrfClientManager;
  private token: string | null = null;
  private baseUrl?: string;
  private constructor(baseUrl?: string) {
    this.baseUrl = baseUrl;
  }

  static getInstance(baseUrl?: string): CsrfClientManager {
    if (!CsrfClientManager.instance) {
      CsrfClientManager.instance = new CsrfClientManager(baseUrl);
    }
    return CsrfClientManager.instance;
  }

  async fetchWithCsrf(input: string | URL | Request, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    if (this.token && !headers.has('X-CSRF-Token')) {
      headers.set('X-CSRF-Token', this.token);
    }
    const response = await fetch(input, {
      ...init,
      headers,
      credentials: init?.credentials ?? 'include',
    });
    const newToken = response.headers.get('X-CSRF-Token');
    if (newToken) {
      this.token = newToken;
    }
    return response;
  }

  clearToken(): void {
    this.token = null;
  }
}

export const ADMIN_SECTIONS = [
  ['/dashboard', 'admin:dashboard:view'],
  ['/scholarships', 'admin:scholarships:manage'],
  ['/universities', 'admin:universities:manage'],
  ['/majors', 'admin:majors:manage'],
  ['/international-tests', 'admin:international-tests:manage'],
  ['/courses', 'admin:courses:manage'],
  ['/services', 'admin:services:manage'],
  ['/certificates', 'admin:certificates:view'],
  ['/student-tools', 'admin:student-tools:manage'],
  ['/cms', 'admin:cms:view'],
  ['/careers', 'admin:careers:manage'],
  ['/study-destinations', 'admin:study-destinations:read'],
  ['/settings/reference-data', 'admin:reference-data:manage'],
  ['/settings', 'admin:settings:manage'],
  ['/finance', 'admin:finance:manage'],
  ['/identities', 'admin:identities:manage'],
  ['/authorizations', 'admin:authorizations:manage'],
  ['/audit', 'admin:audit:view'],
  ['/assets', 'admin:assets:manage'],
  ['/academic-taxonomy', 'admin:taxonomy:manage'],
  ['/translations', 'admin:translations:manage'],
  ['/review-queue', 'admin:review-queue:view'],
  ['/health', 'admin:health:view'],
  ['/notifications', 'admin:notifications:manage'],
  ['/imports/universities', 'admin:imports:manage'],
  ['/imports/scholarships', 'admin:imports:manage'],
  ['/imports', 'admin:imports:manage'],
  ['/ai-governance', 'admin:ai:manage'],
  ['/security', 'admin:security:manage'],
  ['/support', 'admin:support:manage'],
  ['/integrity', 'admin:integrity:manage'],
] as const;

export function firstAllowedAdminPath(permissions?: string[]): string | null {
  if (!permissions || permissions.length === 0) return '/dashboard';
  if (
    permissions.includes('*') ||
    permissions.includes('admin:*') ||
    permissions.includes('admin:all')
  ) {
    return '/dashboard';
  }
  for (const [path, perm] of ADMIN_SECTIONS) {
    if (permissions.includes(perm)) return path;
  }
  return '/dashboard';
}

export function canAccessAdminPath(path: string, permissions?: string[]): boolean {
  if (!permissions || permissions.length === 0) return true;
  if (
    permissions.includes('*') ||
    permissions.includes('admin:*') ||
    permissions.includes('admin:all')
  ) {
    return true;
  }
  const match = ADMIN_SECTIONS.find(([sec]) => path === sec || path.startsWith(`${sec}/`));
  if (!match) return true;
  return permissions.includes(match[1]);
}

export interface AdminPermissionEntry {
  key: string;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  domain: string;
  risk: 'STANDARD' | 'ELEVATED' | 'CRITICAL';
}

export const ADMIN_PERMISSION_CATALOG: AdminPermissionEntry[] = [
  { key: 'admin:dashboard:view', domain: 'dashboard', risk: 'STANDARD', labelAr: 'عرض لوحة التحكم', labelEn: 'View Dashboard', descriptionAr: 'الاطلاع على المؤشرات والإحصائيات العامة', descriptionEn: 'View general metrics and overview' },
  { key: 'admin:scholarships:manage', domain: 'scholarships', risk: 'ELEVATED', labelAr: 'إدارة المنح', labelEn: 'Manage Scholarships', descriptionAr: 'إضافة وتعديل وحذف المنح الدراسية', descriptionEn: 'Create, update and manage scholarships' },
  { key: 'admin:universities:manage', domain: 'universities', risk: 'ELEVATED', labelAr: 'إدارة الجامعات', labelEn: 'Manage Universities', descriptionAr: 'إدارة بيانات الجامعات والبرامج', descriptionEn: 'Manage university profiles and programs' },
  { key: 'admin:majors:manage', domain: 'majors', risk: 'STANDARD', labelAr: 'إدارة التخصصات', labelEn: 'Manage Majors', descriptionAr: 'إدارة التخصصات الأكاديمية والمسارات', descriptionEn: 'Manage academic majors and branches' },
  { key: 'admin:international-tests:manage', domain: 'international-tests', risk: 'STANDARD', labelAr: 'إدارة الاختبارات الدولية', labelEn: 'Manage Tests', descriptionAr: 'إدارة الاختبارات المعيارية والقبول', descriptionEn: 'Manage standardized international tests' },
  { key: 'admin:courses:manage', domain: 'courses', risk: 'STANDARD', labelAr: 'إدارة الدورات', labelEn: 'Manage Courses', descriptionAr: 'إدارة المحتوى التدريبي والدورات', descriptionEn: 'Manage courses and educational content' },
  { key: 'admin:services:manage', domain: 'services', risk: 'STANDARD', labelAr: 'إدارة الخدمات', labelEn: 'Manage Services', descriptionAr: 'إدارة الخدمات الطلابية والطلبات', descriptionEn: 'Manage student services and requests' },
  { key: 'admin:certificates:view', domain: 'certificates', risk: 'STANDARD', labelAr: 'عرض الشهادات', labelEn: 'View Certificates', descriptionAr: 'التحقق واستعراض سجل الشهادات الصادرة', descriptionEn: 'View and verify certificates' },
  { key: 'admin:certificates:issue', domain: 'certificates', risk: 'CRITICAL', labelAr: 'إصدار الشهادات', labelEn: 'Issue Certificates', descriptionAr: 'إصدار وتوقيع شهادات الإنجاز', descriptionEn: 'Issue and sign student certificates' },
  { key: 'admin:student-tools:manage', domain: 'student-tools', risk: 'STANDARD', labelAr: 'إدارة أدوات الطلاب', labelEn: 'Manage Tools', descriptionAr: 'إدارة حاسبات المعدل والأدوات الأكاديمية', descriptionEn: 'Manage student tools and calculators' },
  { key: 'admin:cms:view', domain: 'cms', risk: 'STANDARD', labelAr: 'عرض المحتوى التحريري', labelEn: 'View CMS Content', descriptionAr: 'استعراض المقالات والأخبار', descriptionEn: 'View articles and CMS items' },
  { key: 'admin:cms:manage', domain: 'cms', risk: 'ELEVATED', labelAr: 'إدارة ونشر المحتوى', labelEn: 'Manage CMS Content', descriptionAr: 'تحرير ونشر المقالات والأدلة', descriptionEn: 'Edit and publish CMS articles' },
  { key: 'admin:careers:manage', domain: 'careers', risk: 'STANDARD', labelAr: 'إدارة المسارات المهنية', labelEn: 'Manage Careers', descriptionAr: 'إدارة الوظائف وفرص العمل', descriptionEn: 'Manage job postings and career guides' },
  { key: 'admin:study-destinations:read', domain: 'study-destinations', risk: 'STANDARD', labelAr: 'استعراض وجهات الدراسة', labelEn: 'Read Destinations', descriptionAr: 'الاطلاع على أدلة الدول والوجهات', descriptionEn: 'Browse study destinations' },
  { key: 'admin:reference-data:manage', domain: 'reference-data', risk: 'ELEVATED', labelAr: 'إدارة البيانات المرجعية', labelEn: 'Manage Reference Data', descriptionAr: 'إدارة الدول والمدن والعملات واللغات', descriptionEn: 'Manage countries, cities, currencies' },
  { key: 'admin:settings:manage', domain: 'settings', risk: 'CRITICAL', labelAr: 'إدارة إعدادات النظام', labelEn: 'Manage Settings', descriptionAr: 'تعديل الإعدادات العامة والسياسات', descriptionEn: 'Modify system configurations' },
  { key: 'admin:finance:manage', domain: 'finance', risk: 'CRITICAL', labelAr: 'إدارة العمليات المالية', labelEn: 'Manage Finance', descriptionAr: 'إدارة الفواتير والمدفوعات والمحافظ', descriptionEn: 'Manage invoices, wallets, and ledger' },
  { key: 'admin:identities:manage', domain: 'identities', risk: 'CRITICAL', labelAr: 'إدارة الحسابات والمستخدمين', labelEn: 'Manage Users', descriptionAr: 'إدارة مستخدمي النظام والصلاحيات', descriptionEn: 'Manage user identities and access' },
  { key: 'admin:authorizations:manage', domain: 'authorizations', risk: 'CRITICAL', labelAr: 'إدارة الأدوار والصلاحيات', labelEn: 'Manage Roles', descriptionAr: 'تحديد الأدوار وسياسات الوصول', descriptionEn: 'Manage roles and authorization policies' },
  { key: 'admin:audit:view', domain: 'audit', risk: 'STANDARD', labelAr: 'عرض سجل التدقيق', labelEn: 'View Audit Logs', descriptionAr: 'متابعة سجل العمليات والأنشطة', descriptionEn: 'Inspect security and audit trail logs' },
  { key: 'admin:assets:manage', domain: 'assets', risk: 'STANDARD', labelAr: 'إدارة الملفات والوسائط', labelEn: 'Manage Assets', descriptionAr: 'رفع وإدارة الصور والمستندات', descriptionEn: 'Manage files and media assets' },
  { key: 'admin:taxonomy:manage', domain: 'academic-taxonomy', risk: 'ELEVATED', labelAr: 'إدارة التصنيف الأكاديمي', labelEn: 'Manage Taxonomy', descriptionAr: 'إدارة تصنيف ISCED-F والدرجات', descriptionEn: 'Manage academic taxonomy and classification' },
  { key: 'admin:translations:manage', domain: 'translations', risk: 'STANDARD', labelAr: 'مساحة الترجمة والتعريب', labelEn: 'Manage Translations', descriptionAr: 'إدارة الترجمة الثنائية للمحتوى', descriptionEn: 'Manage translations and bilingual content' },
  { key: 'admin:review-queue:view', domain: 'review-queue', risk: 'STANDARD', labelAr: 'قائمة المراجعة والاعتماد', labelEn: 'View Review Queue', descriptionAr: 'متابعة العناصر المعلقة للاعتماد', descriptionEn: 'View approval queue items' },
  { key: 'admin:health:view', domain: 'health', risk: 'STANDARD', labelAr: 'مراقبة الجاهزية والنظام', labelEn: 'View System Health', descriptionAr: 'التحقق من حالة الخدمات والخوادم', descriptionEn: 'Monitor server and service health' },
  { key: 'admin:notifications:manage', domain: 'notifications', risk: 'STANDARD', labelAr: 'إدارة الإشعارات', labelEn: 'Manage Notifications', descriptionAr: 'إرسال وتتبع الإشعارات والتنبيهات', descriptionEn: 'Manage and broadcast notifications' },
  { key: 'admin:imports:manage', domain: 'imports', risk: 'ELEVATED', labelAr: 'إدارة الاستيراد الآلي', labelEn: 'Manage Imports', descriptionAr: 'استيراد البيانات المجمعة من ملفات', descriptionEn: 'Process bulk file and catalog imports' },
  { key: 'admin:ai:manage', domain: 'ai-governance', risk: 'ELEVATED', labelAr: 'حوكمة الذكاء الاصطناعي', labelEn: 'AI Governance', descriptionAr: 'مراقبة السياسات ونماذج الذكاء الاصطناعي', descriptionEn: 'Manage AI policies and rate limits' },
  { key: 'admin:security:manage', domain: 'security', risk: 'CRITICAL', labelAr: 'إدارة الأمان والجلسات', labelEn: 'Manage Security', descriptionAr: 'إدارة التحقق الثنائي وسياسات الأمان', descriptionEn: 'Manage security policies and MFA' },
  { key: 'admin:support:manage', domain: 'support', risk: 'STANDARD', labelAr: 'دعم الطلاب والخدمات', labelEn: 'Student Support', descriptionAr: 'إدارة طلبات الدعم والتواصل', descriptionEn: 'Manage support tickets and inquiries' },
  { key: 'admin:integrity:manage', domain: 'integrity', risk: 'STANDARD', labelAr: 'فحص تكامل النظام', labelEn: 'Cross-Module Integrity', descriptionAr: 'فحص الروابط والمراجع عبر الوحدات', descriptionEn: 'Verify integrity across all modules' },
];

export const KNOWN_ADMIN_PERMISSIONS = ADMIN_PERMISSION_CATALOG.map((p) => p.key);

export const TRANSLATION_OWNER_CAPABILITIES = [
  { domain: 'scholarships', labelAr: 'المنح الدراسية', labelEn: 'Scholarships', enabled: true },
  { domain: 'universities', labelAr: 'الجامعات', labelEn: 'Universities', enabled: true },
  { domain: 'majors', labelAr: 'التخصصات', labelEn: 'Majors', enabled: true },
  { domain: 'courses', labelAr: 'الدورات', labelEn: 'Courses', enabled: true },
  { domain: 'services', labelAr: 'الخدمات', labelEn: 'Services', enabled: true },
  { domain: 'cms', labelAr: 'المحتوى التحريري', labelEn: 'CMS Content', enabled: true },
];

export type TranslationDomainKey = 'scholarships' | 'universities' | 'majors' | 'courses' | 'services' | 'cms';

export const TRANSLATION_CONTENT_MODE = {
  BILINGUAL: 'BILINGUAL',
  ARABIC_PRIMARY: 'ARABIC_PRIMARY',
  ENGLISH_PRIMARY: 'ENGLISH_PRIMARY',
} as const;

export function canAuthorDomainTranslations(domain: string, permissions?: string[]): boolean {
  return true;
}

export function resolveSourceLocaleEvidence(item: any): any {
  return { sourceLocale: 'ar', complete: true };
}

export const AUDIT_QUERY_CATALOG = [
  { code: 'AUTH_LOGIN', labelAr: 'تسجيل دخول', labelEn: 'User Login' },
  { code: 'AUTH_LOGOUT', labelAr: 'تسجيل خروج', labelEn: 'User Logout' },
  { code: 'CONTENT_PUBLISH', labelAr: 'نشر محتوى', labelEn: 'Content Published' },
  { code: 'RECORD_MUTATION', labelAr: 'تعديل سجل', labelEn: 'Record Modified' },
];

export function auditCodeLabel(code: string, lang = 'ar'): string {
  const found = AUDIT_QUERY_CATALOG.find((c) => c.code === code);
  return found ? (lang === 'ar' ? found.labelAr : found.labelEn) : code;
}

export async function readXlsxWorkbook(data: any): Promise<any> {
  return { sheetNames: ['Sheet1'], sheets: { Sheet1: [] } };
}

export function spreadsheetRowsToObjects(sheet: any): any[] {
  return [];
}
