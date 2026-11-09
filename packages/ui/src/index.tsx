import React from 'react';

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode;
  defaultTheme?: string;
}) {
  return <>{children}</>;
}

export function RTLProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const AppShell = ({
  header,
  children,
  footer,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => (
  <div className="flex flex-col min-h-screen">
    {header}
    <main className="flex-1">{children}</main>
    {footer}
  </div>
);

export function Button({
  children,
  className = '',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function CmsRichText({
  body,
  className = 'cms-rich-text',
}: {
  body?: string;
  className?: string;
}) {
  if (!body) return null;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

export interface PublicExam {
  id: string;
  publicId?: string;
  slug?: string;
  ownerId?: string;
  name: string;
  nameEn?: string;
  category?: string;
  description?: string;
  tags?: string[];
  providerName?: string;
  testCode?: string;
  language?: string;
  scoreRange?: string;
  passingScore?: string;
  validity?: string;
  duration?: string;
  questionCount?: string;
  feeSummary?: string;
  recognitionSummary?: string;
  verificationLabel?: string;
  officialLinks?: Array<{ title: string; url: string }>;
  localization?: {
    ar?: { name?: string; description?: string; category?: string };
    en?: { name?: string; description?: string; category?: string };
  };
}

export function mapInternationalTestToExam(dto: any): any {
  if (!dto) return null;
  const isAr = dto.locale !== 'en';
  return {
    id: dto.slug || dto.id || dto.publicId,
    publicId: dto.publicId,
    slug: dto.slug,
    ownerId: dto.ownerId,
    name: dto.name || (isAr ? dto.nameAr : dto.nameEn) || dto.title || '',
    nameEn: dto.nameEn || dto.name || '',
    category: dto.category || (isAr ? dto.categoryAr : dto.categoryEn) || 'اختبار دولي',
    description: dto.description || (isAr ? dto.descriptionAr : dto.descriptionEn) || '',
    tags: dto.tags || [],
    providerName: dto.providerName || dto.provider,
    testCode: dto.testCode || dto.code,
    language: dto.language,
    scoreRange: dto.scoreRange,
    passingScore: dto.passingScore,
    validity: dto.validity,
    duration: dto.duration,
    questionCount: dto.questionCount,
    feeSummary: dto.feeSummary,
    recognitionSummary: dto.recognitionSummary,
    verificationLabel: dto.verificationLabel,
    officialLinks: dto.officialLinks || [],
    ...dto,
  };
}

export function ExamDetails({
  exam,
  onClose,
  favoriteControl,
  relatedArticles,
}: {
  exam: any;
  onClose: () => void;
  favoriteControl?: React.ReactNode;
  relatedArticles?: React.ReactNode;
}) {
  if (!exam) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        dir="rtl"
      >
        <div className="flex items-start justify-between gap-4 border-b pb-4 dark:border-slate-800">
          <div>
            <div className="inline-block rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-[#0E7C86] dark:bg-teal-950/50">
              {exam.category || 'اختبار دولي'}
            </div>
            <h2 className="mt-2 text-xl font-black text-[#142B5F] dark:text-white">
              {exam.name || exam.nameAr || exam.title}
            </h2>
            {exam.nameEn && (
              <p className="text-xs text-slate-500 font-medium">{exam.nameEn}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {favoriteControl}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-300">
          {exam.description && (
            <p className="leading-relaxed">{exam.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {exam.providerName && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400">الجهة المنظمة</div>
                <div className="mt-1 font-bold text-[#142B5F] dark:text-teal-400">{exam.providerName}</div>
              </div>
            )}
            {exam.testCode && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400">رمز الاختبار</div>
                <div className="mt-1 font-bold text-[#142B5F] dark:text-teal-400">{exam.testCode}</div>
              </div>
            )}
            {exam.duration && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400">المدة</div>
                <div className="mt-1 font-bold text-[#142B5F] dark:text-teal-400">{exam.duration}</div>
              </div>
            )}
            {exam.scoreRange && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400">نطاق الدرجات</div>
                <div className="mt-1 font-bold text-[#142B5F] dark:text-teal-400">{exam.scoreRange}</div>
              </div>
            )}
            {exam.passingScore && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400">درجة الاجتياز</div>
                <div className="mt-1 font-bold text-[#142B5F] dark:text-teal-400">{exam.passingScore}</div>
              </div>
            )}
            {exam.feeSummary && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400">الرسوم</div>
                <div className="mt-1 font-bold text-[#142B5F] dark:text-teal-400">{exam.feeSummary}</div>
              </div>
            )}
          </div>

          {exam.recognitionSummary && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              <span className="font-bold">الاعتراف والاعتماد: </span>
              {exam.recognitionSummary}
            </div>
          )}

          {relatedArticles}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#0E7C86] px-5 py-2 text-sm font-bold text-white hover:bg-[#0c6b74] cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
