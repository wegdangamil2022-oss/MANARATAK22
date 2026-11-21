import { type ReactNode } from 'react';
import { User, Home, Route, BookOpen, Heart, GraduationCap, ClipboardList, Bell, Settings2, ClipboardCheck, Mail, UserPlus, LogIn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './student-workspace.css';

/**
 * Original student dashboard chrome shared by preview and the authenticated P15 page.
 * The header is presentation only: no private API request or persistence is performed here.
 */
export type StudentWorkspaceTab = 'SUMMARY' | 'OPPORTUNITIES' | 'LEARNING' | 'VAULT' | 'SERVICES' | 'CAREERS' | 'NOTIFICATIONS' | 'PROFILE';
const tabs: Array<{ id: StudentWorkspaceTab; label: string; icon: LucideIcon }> = [
  { id: 'SUMMARY', label: 'ملخصي', icon: Home },
  { id: 'OPPORTUNITIES', label: 'فرصي', icon: Route },
  { id: 'LEARNING', label: 'تعلمي', icon: BookOpen },
  { id: 'VAULT', label: 'محفوظاتي', icon: Heart },
  { id: 'CAREERS', label: 'مساري', icon: GraduationCap },
  { id: 'SERVICES', label: 'طلباتي', icon: ClipboardList },
  { id: 'NOTIFICATIONS', label: 'إشعاراتي', icon: Bell },
  { id: 'PROFILE', label: 'إعداداتي', icon: User },
];


type Props = {
  children: ReactNode;
  activeTab: StudentWorkspaceTab;
  onTabChange: (tab: StudentWorkspaceTab) => void;
  displayName?: string;
  email?: string;
  countryName?: string;
  countryFlag?: string;
  cityName?: string;
  timezone?: string | null;
  previewMode?: boolean;
  accessibility?: { textScale?: unknown; reduceMotion?: unknown; highContrast?: unknown };
  readinessPercent?: number;
  completedRequirementsCount?: number;
  totalRequirementsCount?: number;
  activeApplicationsCount?: number;
  activeServiceRequestsCount?: number;
  isGuest?: boolean;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  onTogglePreviewAccount?: () => void;
};

export function StudentWorkspaceShell({
  children,
  activeTab: tab,
  onTabChange,
  displayName,
  email,
  accessibility = {},
  readinessPercent = 80,
  completedRequirementsCount = 8,
  totalRequirementsCount = 10,
  activeApplicationsCount = 2,
  activeServiceRequestsCount = 2,
  isGuest = false,
  onOpenLogin,
  onOpenSignup,
  onTogglePreviewAccount,
}: Props) {
  const safePercent = Math.min(100, Math.max(0, Math.round(readinessPercent)));
  const totalActiveCount = activeApplicationsCount + activeServiceRequestsCount;
  // The name, not the platform locale, determines the profile-image alignment.
  // Keep RTL for Arabic or mixed-script names; pure Latin names use LTR.
  const studentName = (displayName || '').trim();
  const isLatinName = /[A-Za-z]/.test(studentName) && !/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(studentName);

  return (
    <main
      dir="rtl"
      data-text-scale={String(accessibility.textScale || 'DEFAULT')}
      data-reduce-motion={String(Boolean(accessibility.reduceMotion))}
      data-high-contrast={String(Boolean(accessibility.highContrast))}
      className="mn-student-workspace w-full max-w-4xl mx-auto px-3 sm:px-6 pb-28 sm:pb-16 text-right font-['Cairo',sans-serif] min-h-screen text-[var(--mn-text)]"
    >
      {/* Full-bleed student identity hero: official Manaratak Navy-to-Petrol gradient */}
      <section
        aria-label="بطاقة هوية الطالب"
        className="mn-student-identity-header bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] mn-inverse relative isolate -mx-3 sm:-mx-6 mt-0 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-0 shadow-none text-white"
      >
        {/* Subtle decorative background accents (matching Scholarships/Majors Hero) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-2.5 left-5 grid grid-cols-5 gap-1.5 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-[#F2CD78]" />
            ))}
          </div>

          <div className="absolute -top-12 -left-12 h-52 w-52 rounded-full border border-[#D6A43B]/20" />
          <div className="absolute -top-6 -left-6 h-68 w-68 rounded-full border border-[#38C6D4]/15" />

          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 400 200"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M-50,45 Q110,-20 255,58 T550,35"
              stroke="#F2CD78"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M-20,135 Q160,55 310,145 T600,105"
              stroke="#38C6D4"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>

        <div className="relative z-10 px-3 pt-2.5 pb-3 sm:px-5 sm:pt-4 sm:pb-4">
          {isGuest ? (
            <>
              {/* Guest Top Row */}
              <div dir="rtl" className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
                <div className="flex flex-1 items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="relative w-[44px] h-[44px] sm:w-14 sm:h-14 rounded-full border-[1.5px] border-[#F2CD78]/70 bg-[#142B5F] shrink-0 flex items-center justify-center shadow-xs">
                    <User className="w-5 h-5 sm:w-7 sm:h-7 text-[#F2CD78]" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <h1 className="text-[14.5px] sm:text-[17px] font-bold text-white leading-tight font-['Cairo',sans-serif] focus:outline-none">
                      مرحبًا بك في <span className="text-[#F2CD78]">منارتك</span>
                    </h1>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-[#DDEFF2] truncate">
                      مساحتك الأكاديمية لإدارة الفرص والطلبات
                    </p>
                  </div>
                </div>

                {onTogglePreviewAccount && (
                  <button
                    type="button"
                    onClick={onTogglePreviewAccount}
                    title="التنقل لمعاينة حساب الطالب الحقيقي"
                    className="shrink-0 !min-h-[32px] h-[32px] sm:!min-h-[36px] sm:h-[36px] px-2.5 py-1 rounded-xl bg-white/12 hover:bg-white/20 border border-white/22 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#F2CD78] shrink-0" />
                    <span>حساب الطالب</span>
                  </button>
                )}
              </div>

              <div className="my-2.5 sm:my-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Guest Info Box: clean white card matching Manaratak hero boxes */}
              <div className="rounded-xl border border-[#142B5F]/14 dark:border-white/12 bg-white dark:bg-[#111E38] px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_4px_14px_rgba(14,30,64,0.12)] text-right mn-panel">
                <p className="text-[10.5px] sm:text-[12px] font-semibold text-[#142B5F] dark:text-[#EDF5F5] leading-relaxed">
                  أنشئ حسابًا مجانيًا لحفظ فرصك، وإدارة طلباتك، ومتابعة مسارك الدراسي.
                </p>
              </div>

              {/* Guest Action Row */}
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={onOpenSignup}
                  className="!min-h-[34px] h-[34px] sm:!min-h-[38px] sm:h-[38px] rounded-xl bg-white hover:bg-[#F6F8FA] dark:bg-[#111E38] dark:hover:bg-[#162747] text-[#142B5F] dark:text-[#EDF5F5] border border-[#142B5F]/15 dark:border-[#38C6D4]/35 shadow-xs text-[11px] sm:text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 mn-panel"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
                  <span className="text-[#142B5F] dark:text-[#EDF5F5] font-bold">إنشاء حساب</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="!min-h-[34px] h-[34px] sm:!min-h-[38px] sm:h-[38px] rounded-xl bg-white/12 hover:bg-white/20 text-white border border-white/22 text-[11px] sm:text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#F2CD78] shrink-0" />
                  <span>تسجيل الدخول</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Student Top Row: Avatar + White Name + Calm Frosted Controls */}
              <div dir={isLatinName ? 'ltr' : 'rtl'} className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onTabChange('PROFILE')}
                  title="عرض وتعديل ملفي"
                  className="flex flex-1 items-center gap-2.5 sm:gap-3 min-w-0 text-start cursor-pointer group/profile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38C6D4]"
                >
                  <div className="relative w-[44px] h-[44px] sm:w-14 sm:h-14 rounded-full border-[1.5px] border-[#F2CD78]/70 bg-[#142B5F] shrink-0 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.18)] group-hover/profile:scale-[1.03] transition-transform">
                    <User className="w-5 h-5 sm:w-7 sm:h-7 text-[#F2CD78]" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 dir={isLatinName ? 'ltr' : 'rtl'} className="text-[14.5px] sm:text-[17px] font-bold text-white leading-tight [overflow-wrap:anywhere] group-hover/profile:text-[#F2CD78] transition-colors font-['Cairo',sans-serif] focus:outline-none">
                      {displayName || 'حساب الطالب'}
                    </h1>
                    <div className="mt-0.5 flex items-center gap-1 min-w-0">
                      <Mail className="h-3 w-3 shrink-0 text-[#38C6D4]" />
                      <span dir="ltr" className="min-w-0 truncate text-[10px] sm:text-[11px] font-medium text-[#DDEFF2] font-['Cairo',sans-serif]">
                        {email || 'لم يُضف بريد إلكتروني'}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onTogglePreviewAccount && (
                    <button
                      type="button"
                      onClick={onTogglePreviewAccount}
                      title="التنقل لمعاينة وضع الزائر"
                      className="!min-h-[32px] h-[32px] sm:!min-h-[36px] sm:h-[36px] px-2.5 py-1 rounded-xl bg-white/12 hover:bg-white/20 border border-white/22 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>وضع الزائر</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onTabChange('PROFILE')}
                    title="ملفي وإعداداتي"
                    aria-label="فتح ملفي وإعداداتي"
                    className="shrink-0 !min-w-[32px] w-[32px] !min-h-[32px] h-[32px] sm:!min-w-[36px] sm:w-[36px] sm:!min-h-[36px] sm:h-[36px] rounded-xl bg-white/12 hover:bg-white/20 border border-white/22 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer focus-visible:outline focus-visible:outline-offset-2"
                  >
                    <Settings2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#F2CD78]" />
                  </button>
                </div>
              </div>

              <div className="my-2 sm:my-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Compact Interactive White Hero Stat Boxes (matching Manaratak directory hero cards) */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 items-stretch">
                <button
                  type="button"
                  onClick={() => onTabChange('PROFILE')}
                  title="استكمال جاهزية ملفي الأكاديمي ومتطلبات التقديم"
                  className="min-w-0 rounded-xl border border-[#142B5F]/14 dark:border-white/12 bg-white dark:bg-[#111E38] hover:bg-[#F6F8FA] dark:hover:bg-[#162747] hover:border-[#0E7C86]/50 dark:hover:border-[#38C6D4]/45 px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_4px_14px_rgba(14,30,64,0.12)] text-right transition-all active:scale-[0.985] cursor-pointer flex flex-col justify-between mn-panel"
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 text-[10.5px] sm:text-[11.5px] text-[#142B5F] dark:text-[#EDF5F5] min-w-0">
                      <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" />
                      <span className="truncate font-bold">جاهزية ملفي</span>
                    </div>
                    <span className="text-[10.5px] sm:text-xs font-extrabold text-[#142B5F] dark:text-[#F2CD78] tabular-nums shrink-0">
                      {safePercent}%
                    </span>
                  </div>
                  <div className="my-1.5 h-[5px] w-full rounded-full bg-[#F6F8FA] dark:bg-[#0B1529] border border-[#142B5F]/8 dark:border-white/10 overflow-hidden" dir="rtl">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] dark:from-[#0E7C86] dark:to-[#38C6D4] transition-all duration-300"
                      style={{ width: `${safePercent}%` }}
                    />
                  </div>
                  <p className="text-[9.5px] sm:text-[10.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] truncate">
                    {completedRequirementsCount} من {totalRequirementsCount} متطلبات مكتملة
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('OPPORTUNITIES')}
                  title="متابعة تقديماتي على المنح وطلباتي النشطة"
                  className="min-w-0 rounded-xl border border-[#142B5F]/14 dark:border-white/12 bg-white dark:bg-[#111E38] hover:bg-[#F6F8FA] dark:hover:bg-[#162747] hover:border-[#0E7C86]/50 dark:hover:border-[#38C6D4]/45 px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_4px_14px_rgba(14,30,64,0.12)] text-right transition-all active:scale-[0.985] cursor-pointer flex flex-col justify-between mn-panel"
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 text-[10.5px] sm:text-[11.5px] text-[#142B5F] dark:text-[#EDF5F5] min-w-0">
                      <Route className="h-3.5 w-3.5 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" />
                      <span className="truncate font-bold">تقديماتي وطلباتي</span>
                    </div>
                    <span className="rounded-full bg-[#DDEFF2]/90 dark:bg-[#0E7C86]/25 border border-[#0E7C86]/18 dark:border-[#38C6D4]/30 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#0E7C86] dark:text-[#38C6D4] tabular-nums shrink-0 leading-none">
                      {totalActiveCount} نشطة
                    </span>
                  </div>
                  <div className="mt-1.5 rounded-lg bg-[#F6F8FA] dark:bg-[#0B1529]/85 border border-[#142B5F]/8 dark:border-white/8 px-2 py-1">
                    <p className="text-[9.5px] sm:text-[10.5px] font-bold text-[#142B5F] dark:text-[#DCE7F0] leading-snug whitespace-nowrap truncate">
                      {activeApplicationsCount} منح · {activeServiceRequestsCount} طلبات
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
        {/* Thin subtle Gold baseline matching all Manaratak Hero sections */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[1.5px] bg-gradient-to-r from-[#D6A43B]/45 via-[#F2CD78] to-[#D6A43B]/45" />
      </section>

      {/* Compact inline 8-tab student navigation: Manaratak Frost + Active Navy-Petrol Gradient */}
      <div
        role="navigation"
        aria-label="أقسام حساب الطالب"
        className="mn-student-nav relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] mt-0 px-1.5 py-1.5 sm:px-2 sm:py-2.5 rounded-none bg-white dark:bg-[#111E38] border-x-0 border-t-0 border-b border-[#142B5F]/10 dark:border-white/10 shadow-none grid grid-cols-4 gap-1 sm:gap-2 mn-panel"
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              title={item.id === 'PROFILE' ? 'إعداداتي وملفي الشخصي' : item.label}
              onClick={() => onTabChange(item.id)}
              className={`mn-student-nav-tile w-full min-w-0 min-h-[38px] sm:min-h-[46px] rounded-xl border px-1.5 py-1.5 sm:px-2.5 sm:py-2 flex flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C86] ${
                active
                  ? 'border-transparent bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-xs font-bold'
                  : 'border-[#142B5F]/12 bg-[#F6F8FA] text-[#142B5F] dark:border-white/12 dark:bg-[#0B1529]/85 dark:text-[#DCE7F0] hover:border-[#0E7C86]/45 hover:bg-white dark:hover:border-[#38C6D4]/45 dark:hover:bg-[#162747] font-semibold'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${active ? 'text-white' : 'text-[#0E7C86] dark:text-[#38C6D4]'}`} />
              <span className="text-[11px] sm:text-[12px] font-['Cairo',sans-serif] leading-[1.3] text-center whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>

      {children}
    </main>
  );
}
