import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpLeft,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  Clock3,
  Compass,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Folder,
  Gem,
  GraduationCap,
  HelpCircle,
  Heart,
  Layers,
  ListChecks,
  LockKeyhole,
  MessageSquare,
  Plus,
  Route,
  Scale,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  HydratedStudentSavedItemDto,
  StudentApplicationTrackerDto,
  StudentDashboardSummaryDto,
  StudentFinanceInvoiceDto,
  StudentSavedItemDto,
  StudentServiceRequestDto,
} from '../../api/client';
import { StudentDocumentUpload } from './StudentDocumentUpload';
import {
  computeNextPriorityStep,
  resolveDocumentStatusDimensions,
} from './studentAccountBriefLogic';

/**
 * Horizontal swipeable sub-navigation bar with selective Petrol (#0E7C86) scrollbar indicator
 * and official Royal Navy (#142B5F) icons on unselected pills.
 */
export interface SwipeTabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon: LucideIcon;
}

export function HorizontalSwipeTabs<T extends string>({
  items,
  activeId,
  onSelect,
  onChange,
  ariaLabel,
  embedded = false,
}: {
  items: ReadonlyArray<SwipeTabItem<T>>;
  activeId: T;
  onSelect?: (id: T) => void;
  onChange?: (id: T) => void;
  ariaLabel: string;
  embedded?: boolean;
}) {
  const handleSelect = onSelect ?? onChange ?? (() => {});
  const gridColsClass =
    items.length >= 5
      ? 'grid-cols-3 sm:grid-cols-6'
      : items.length === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : items.length === 3
          ? 'grid-cols-3'
          : items.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-4';

  const navContent = (
    <nav aria-label={ariaLabel} className={`grid ${gridColsClass} gap-1.5`}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleSelect(item.id)}
            className="mn-student-subtab-btn inline-flex items-center justify-center gap-1 transition-all cursor-pointer truncate"
          >
            <Icon
              className={`h-3 w-3 shrink-0 ${
                active ? 'text-white' : 'text-[#0E7C86] dark:text-[#38C6D4]'
              }`}
              aria-hidden="true"
            />
            <span className="whitespace-nowrap truncate">
              {item.label}
              {typeof item.count === 'number' ? ` (${item.count})` : ''}
            </span>
          </button>
        );
      })}
    </nav>
  );

  if (embedded) {
    return (
      <div className="mt-2.5 pt-2.5 border-t border-[#142B5F]/8 dark:border-white/8 font-['Cairo',sans-serif]">
        {navContent}
      </div>
    );
  }

  return (
    <div className="-mt-px border-x-0 border-t border-b border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/90 px-2.5 py-2 shadow-2xs font-['Cairo',sans-serif]">
      {navContent}
    </div>
  );
}

/**
 * Shared Umbrella Canopy for primary workspace tabs (ملخصي / فرصي / تعلمي / وضع الزائر).
 * Features Manaratak's signature top cap line spanning right-to-left and descending
 * cleanly on both right and left edges to visually embrace all rounded child cards below.
 */
export function WorkspaceTabCanopy({
  title,
  subtitle,
  icon,
  metaLabel,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  metaLabel?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="relative overflow-hidden rounded-2xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] shadow-[0_4px_16px_rgba(20,43,95,0.045)] dark:shadow-[0_6px_22px_rgba(0,0,0,0.28)] mn-panel font-['Cairo',sans-serif]"
    >
      {/* Architectural U-Cap: continuous top line curving smoothly over both rounded upper corners and descending gently down the right and left sides */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-14 sm:h-16 z-20 rounded-t-2xl border-t-[2.5px] border-x-[2.5px] border-[#142B5F] dark:border-[#38C6D4]"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 28%, rgba(0,0,0,0.58) 64%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 28%, rgba(0,0,0,0.58) 64%, transparent 100%)',
        }}
      />
      {/* Subtle Petrol gradient sheen along the center of the top cap */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 top-0 h-[2.5px] z-20 bg-gradient-to-l from-transparent via-[#0E7C86] dark:via-[#D6A43B]/80 to-transparent"
      />

      <div className="px-3.5 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <SummarySectionIcon icon={icon} size="lg" />
            <div className="inline-flex flex-col items-start min-w-0">
              <h2 className="text-[13.5px] sm:text-[15px] font-extrabold leading-tight text-[#142B5F] dark:text-[#F1F5F9] truncate font-['Cairo',sans-serif]">
                {title}
              </h2>
              <span
                aria-hidden="true"
                className="w-full min-w-[84px] h-[1.5px] mt-0.5 rounded-full bg-[linear-gradient(270deg,rgba(14,124,134,0.7)_0%,rgba(14,124,134,0.32)_72%,transparent_100%)] dark:bg-[linear-gradient(270deg,rgba(56,198,212,0.78)_0%,rgba(56,198,212,0.35)_72%,transparent_100%)]"
              />
            </div>
          </div>

          {(metaLabel || actions) && (
            <div className="flex items-center gap-1.5 shrink-0">
              {metaLabel && (
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0E7C86] dark:text-[#38C6D4] tabular-nums whitespace-nowrap">
                  {metaLabel}
                </span>
              )}
              {actions}
            </div>
          )}
        </div>

        {subtitle && (
          <p className="mt-1.5 text-[10px] sm:text-[11.5px] font-semibold leading-snug text-[#5C707C] dark:text-[#9BB4C7] truncate">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}

/**
 * Calm section container.
 * By default, NO start-of-box vertical stripe is rendered unless `accentStart = 'navy' | 'petrol'` is explicitly set,
 * honoring the user's instruction: "لاتفعل لكل الاقسام خط بداية المربع يعني فقط في البعض".
 */
export function CalmSectionCard({
  id,
  title,
  icon: Icon,
  badge,
  action,
  accentStart,
  children,
}: {
  id?: string;
  title: string;
  icon: LucideIcon;
  badge?: string;
  action?: React.ReactNode;
  accentStart?: 'navy' | 'petrol';
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] py-3 sm:py-3.5 shadow-2xs mn-panel font-['Cairo',sans-serif]"
    >
      {accentStart && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-[3.5px] z-10 ${
            accentStart === 'petrol' ? 'bg-[#0E7C86]' : 'bg-[#142B5F]'
          }`}
        />
      )}

      <div className="flex min-w-0 items-center justify-between gap-2 px-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/45 bg-[#142B5F] text-[#F2CD78]">
            <Icon className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
          </span>
          <h3 className="text-[13px] sm:text-[14px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span className="rounded-md border border-[#0E7C86]/25 bg-[#0E7C86]/10 px-2 py-0.5 text-[9.5px] font-bold text-[#0E7C86] dark:text-[#55CBC5]">
              {badge}
            </span>
          )}
          {action}
        </div>
      </div>

      <div className="mt-3 pt-0.5 px-3.5 sm:px-5">{children}</div>
    </section>
  );
}

/**
 * Official Manaratak Section Header Icon for Summary (ملخصي):
 * Navy (#142B5F) rounded square + subtle Gold top-right corner (#D6A43B) + Light Gold icon (#F2CD78).
 */
export function SummarySectionIcon({
  icon: Icon,
  size = 'md',
}: {
  icon: LucideIcon;
  size?: 'md' | 'lg';
}) {
  const boxSize =
    size === 'lg'
      ? 'w-7 h-7 sm:w-8 sm:h-8'
      : 'w-6.5 h-6.5 sm:w-7.5 sm:h-7.5';
  const iconSize = size === 'lg' ? 'h-3.5 w-3.5 sm:h-4 sm:w-4' : 'h-3.5 w-3.5 sm:h-4 sm:w-4';
  return (
    <span
      aria-hidden="true"
      className={`relative overflow-hidden ${boxSize} rounded-lg bg-[#142B5F] text-[#F2CD78] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(20,43,95,0.2)]`}
    >
      <span className="pointer-events-none absolute top-0 right-0 w-2 h-2 bg-[#D6A43B] rounded-bl-[4px]" />
      <Icon className={`relative z-10 ${iconSize} text-[#F2CD78]`} />
    </span>
  );
}

/**
 * Rounded Manaratak Section Card specifically for child blocks inside «ملخصي».
 * Visually subordinate to the full-bleed «ملخصي ونظرة عامة» umbrella canopy above it.
 */
export function SummarySectionCard({
  id,
  title,
  icon,
  metaLabel,
  action,
  children,
}: {
  id?: string;
  title: string;
  icon: LucideIcon;
  metaLabel?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className="relative overflow-hidden rounded-2xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] px-3 py-3 sm:px-4.5 sm:py-4 shadow-[0_2px_10px_rgba(20,43,95,0.035)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.24)] mn-panel font-['Cairo',sans-serif]"
    >
      {/* Delicate approved top hairline */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#142B5F]/28 dark:via-[#D6A43B]/35 to-transparent"
      />

      <div className="relative z-10 flex min-w-0 items-center justify-between gap-2 mb-2.5 sm:mb-3">
        <div className="flex min-w-0 items-center gap-2">
          <SummarySectionIcon icon={icon} />
          <div className="inline-flex flex-col items-start min-w-0">
            <h3 className="text-[13px] sm:text-[14.5px] font-extrabold leading-tight text-[#142B5F] dark:text-[#F1F5F9] truncate font-['Cairo',sans-serif]">
              {title}
            </h3>
            <span
              aria-hidden="true"
              className="w-full min-w-[68px] h-[1.5px] mt-0.5 rounded-full bg-[linear-gradient(270deg,rgba(14,124,134,0.68)_0%,rgba(14,124,134,0.3)_72%,transparent_100%)] dark:bg-[linear-gradient(270deg,rgba(56,198,212,0.75)_0%,rgba(56,198,212,0.34)_72%,transparent_100%)]"
            />
          </div>
        </div>

        {(metaLabel || action) && (
          <div className="flex items-center gap-1.5 shrink-0">
            {metaLabel && (
              <span className="text-[10px] sm:text-[11px] font-bold text-[#0E7C86] dark:text-[#38C6D4] tabular-nums whitespace-nowrap">
                {metaLabel}
              </span>
            )}
            {action}
          </div>
        )}
      </div>

      <div className="relative z-10">{children}</div>
    </section>
  );
}

/**
 * 1) خطوتي التالية (Focal Priority Action in ملخصي)
 * Uses selective right start-bar (mn-summary-start-bar) + sole Navy-to-Petrol solid CTA in the viewport.
 */
export function NextStepHeroCard({
  trackers = [],
  invoices = [],
  courses,
  dashboard,
  onNavigateTab,
  onNavigate,
}: {
  trackers?: readonly StudentApplicationTrackerDto[];
  invoices?: readonly StudentFinanceInvoiceDto[];
  courses?: StudentDashboardSummaryDto['courseEnrollments'];
  dashboard?: StudentDashboardSummaryDto;
  onNavigateTab?: (tab: 'OPPORTUNITIES' | 'LEARNING' | 'SERVICES' | 'PROFILE') => void;
  onNavigate?: (tab: 'OPPORTUNITIES' | 'LEARNING' | 'SERVICES' | 'PROFILE') => void;
}) {
  const resolvedCourses = courses ?? dashboard?.courseEnrollments ?? [];
  const handleNavigate = onNavigateTab ?? onNavigate ?? (() => {});
  const step = useMemo(
    () => computeNextPriorityStep({ trackers, invoices, courses: resolvedCourses }),
    [trackers, invoices, resolvedCourses],
  );

  return (
    <SummarySectionCard
      title="خطوتي التالية"
      icon={Target}
      metaLabel={
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{step.dateLabel}</span>
        </span>
      }
    >
      <div className="relative overflow-hidden rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 pr-3.5 pl-3 py-2.5 sm:py-3 transition-all duration-200">
        {/* Selective start-of-card accent bar: reserved strictly for top priority & active applications */}
        <span aria-hidden="true" className="mn-summary-start-bar" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
              <Gem className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] sm:text-[12.5px] font-extrabold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                {step.subtitle}
              </h4>
              <p className="mt-0.5 text-[10px] sm:text-[11px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] leading-snug break-words">
                {step.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate(step.targetTab)}
            className="mn-summary-cta-primary self-end sm:self-center shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 text-white px-3 py-1.5 text-[10px] sm:text-[11px] font-bold shadow-[0_2px_8px_rgba(20,43,95,0.18)] transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <span>{step.ctaLabel}</span>
            <ArrowLeft className="h-3 w-3 text-white shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </SummarySectionCard>
  );
}

/**
 * 2) هذا الأسبوع (Calm Grouped Weekly Schedule in ملخصي — NO vertical start bars)
 */
export function ThisWeekScheduleCard({
  trackers = [],
  courses,
  dashboard,
  onOpenCalendar,
  onNavigate,
}: {
  trackers?: readonly StudentApplicationTrackerDto[];
  courses?: StudentDashboardSummaryDto['courseEnrollments'];
  dashboard?: StudentDashboardSummaryDto;
  onOpenCalendar: () => void;
  onNavigate?: (tab: 'OPPORTUNITIES' | 'LEARNING' | 'SERVICES' | 'PROFILE') => void;
}) {
  const resolvedCourses = courses ?? dashboard?.courseEnrollments ?? [];
  const items = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      meta: string;
      tag: string;
      kind: 'SCHOLARSHIP' | 'COURSE';
    }> = [];
    (trackers ?? [])
      .filter((t) => t.status === 'ACTIVE')
      .slice(0, 2)
      .forEach((t) => {
        const name =
          t.owner?.displayName ||
          (typeof t.ownerSnapshot?.displayName === 'string'
            ? t.ownerSnapshot.displayName
            : 'ملف منحة');
        list.push({
          id: `wk-tr-${t.id}`,
          title: name,
          meta: t.stage,
          tag: t.deadlineAt
            ? new Date(t.deadlineAt).toLocaleDateString('ar', {
                month: 'short',
                day: 'numeric',
              })
            : 'متجدد',
          kind: 'SCHOLARSHIP',
        });
      });

    const activeCourse = (resolvedCourses ?? []).find((c) => c.progressPercentage < 100);
    if (activeCourse) {
      list.push({
        id: `wk-cr-${activeCourse.courseId}`,
        title: activeCourse.courseName,
        meta: 'مراجعة درس هذا الأسبوع',
        tag: `${activeCourse.progressPercentage}%`,
        kind: 'COURSE',
      });
    }
    return list.slice(0, 3);
  }, [trackers, resolvedCourses]);

  return (
    <SummarySectionCard
      title="هذا الأسبوع"
      icon={CalendarClock}
      action={
        <button
          type="button"
          onClick={onOpenCalendar}
          className="mn-summary-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>التقويم والمهام</span>
          <ChevronLeft className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" aria-hidden="true" />
        </button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 divide-y divide-[#142B5F]/8 dark:divide-white/8">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate?.(item.kind === 'COURSE' ? 'LEARNING' : 'OPPORTUNITIES')}
            className="mn-summary-list-row w-full flex items-center justify-between gap-2.5 px-2.5 py-2 sm:px-3 sm:py-2.5 text-right hover:bg-white dark:hover:bg-[#142342] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                {item.kind === 'COURSE' ? (
                  <BookOpen className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                ) : (
                  <GraduationCap className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] truncate">
                  {item.title}
                </h4>
                <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-medium leading-snug text-[#5C707C] dark:text-[#9BB4C7] truncate">
                  {item.meta}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] sm:text-[11px] font-bold tabular-nums text-[#0E7C86] dark:text-[#38C6D4] whitespace-nowrap">
                {item.tag}
              </span>
              <ChevronLeft className="h-3.5 w-3.5 text-[#5C707C]/70 dark:text-[#9BB4C7]/70 shrink-0" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
    </SummarySectionCard>
  );
}

/**
 * 5) مناسب لهدفي (Goal-Matched Recommendations in ملخصي — NO start bars, clickable Frost cards)
 */
const STUDENT_GOALS = [
  { id: 'MASTERS_SCHOLARSHIP', label: 'منحة ماجستير ممولة · 2027' },
  { id: 'BACHELOR_ADMISSION', label: 'قبول جامعي بكالوريوس · 2027' },
  { id: 'IELTS_PREP', label: 'تحقيق 7.0 في IELTS الأكاديمي' },
  { id: 'CAREER_INTERNSHIP', label: 'تدريب مهني وخبرة بحثية' },
] as const;

export function GoalMatchedSection(_props?: {
  onNavigate?: (tab: 'OPPORTUNITIES' | 'LEARNING' | 'SERVICES' | 'PROFILE') => void;
}) {
  const [goalIndex, setGoalIndex] = useState(0);
  const currentGoal = STUDENT_GOALS[goalIndex];

  const recommendations = useMemo(() => {
    if (currentGoal.id === 'IELTS_PREP') {
      return [
        {
          id: 'rec-ielts-1',
          title: 'خطة إتقان الكتابة الأكاديمية (Task 1 & 2)',
          reason: 'اختبار دولي · يرفع درجتك في معيار الترابط الأكاديمي',
          href: '/exams',
          kind: 'EXAM' as const,
        },
        {
          id: 'rec-ielts-2',
          title: 'دورة مهارات الكتابة الأكاديمية والبحثية',
          reason: 'دورة تدريبية · مرتبطة بهدفك اللغوي الحالي',
          href: '/courses',
          kind: 'COURSE' as const,
        },
      ];
    }
    return [
      {
        id: 'rec-sch-1',
        title: 'منحة الحكومة الصينية (CSC)',
        reason: 'منحة ممولة · تطابق هدفك ودرجتك المستهدفة',
        href: '/scholarships',
        kind: 'SCHOLARSHIP' as const,
      },
      {
        id: 'rec-sch-2',
        title: 'أداة تقييم أهلية المنح وخطاب الدافع',
        reason: 'أداة ذكية · تحقق من جاهزية ملفك قبل التقديم',
        href: '/tools',
        kind: 'TOOL' as const,
      },
    ];
  }, [currentGoal.id]);

  return (
    <SummarySectionCard
      title="مناسب لهدفي"
      icon={Compass}
      action={
        <button
          type="button"
          onClick={() => setGoalIndex((i) => (i + 1) % STUDENT_GOALS.length)}
          className="mn-summary-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>تغيير الهدف</span>
        </button>
      }
    >
      {/* Calm Current Goal Bar */}
      <div className="mb-2.5 flex items-center justify-between gap-2 rounded-xl border border-[#0E7C86]/20 dark:border-[#38C6D4]/22 bg-[#0E7C86]/[0.05] dark:bg-[#38C6D4]/[0.07] px-3 py-1.5">
        <span className="text-[9.5px] sm:text-[10.5px] font-bold text-[#0E7C86] dark:text-[#38C6D4] shrink-0">
          هدفي الحالي
        </span>
        <span className="text-[10.5px] sm:text-[11.5px] font-extrabold text-[#142B5F] dark:text-[#F1F5F9] truncate">
          {currentGoal.label}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {recommendations.map((rec) => {
          const RecIcon =
            rec.kind === 'TOOL'
              ? Sparkles
              : rec.kind === 'COURSE'
                ? BookOpen
                : rec.kind === 'EXAM'
                  ? FileCheck2
                  : GraduationCap;
          return (
            <Link
              key={rec.id}
              to={rec.href}
              className="group flex items-center justify-between gap-2.5 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 px-2.5 py-2.5 sm:px-3 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                  <RecIcon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] truncate group-hover:text-[#0E7C86] dark:group-hover:text-[#38C6D4] transition-colors">
                    {rec.title}
                  </h4>
                  <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-medium leading-snug text-[#5C707C] dark:text-[#9BB4C7] truncate">
                    {rec.reason}
                  </p>
                </div>
              </div>

              <span className="h-6.5 w-6.5 shrink-0 rounded-full border border-[#0E7C86]/25 dark:border-[#38C6D4]/30 bg-white dark:bg-[#111E38] group-hover:bg-gradient-to-l group-hover:from-[#142B5F] group-hover:to-[#0E7C86] group-hover:border-transparent inline-flex items-center justify-center transition-all">
                <ArrowUpLeft
                  className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4] group-hover:text-white transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </SummarySectionCard>
  );
}

/**
 * Opportunities Sub-View: اكتشف (Curated Scholarships & Programs)
 */
export function OpportunitiesDiscoverPanel() {
  const curated = [
    {
      id: 'disc-csc',
      title: 'منحة الحكومة الصينية (CSC)',
      country: 'الصين',
      degree: 'بكالوريوس · ماجستير · دكتوراه',
      funding: 'تمويل كامل + راتب شهري',
      deadline: '31 مارس 2027',
      match: 'مناسبة لملفك',
      href: '/scholarships/csc-china',
    },
    {
      id: 'disc-chevening',
      title: 'منحة تشيفنينغ البريطانية (Chevening)',
      country: 'المملكة المتحدة',
      degree: 'ماجستير لمدة عام',
      funding: 'تمويل كامل للرسوم والمعيشة',
      deadline: '15 أكتوبر 2027',
      match: 'تغطية شاملة',
      href: '/scholarships/chevening-uk',
    },
    {
      id: 'disc-daad',
      title: 'منحة التبادل الأكاديمي الألماني (DAAD EPOS)',
      country: 'ألمانيا',
      degree: 'ماجستير · دكتوراه',
      funding: 'راتب شهري + تأمين صحي + سفر',
      deadline: '30 سبتمبر 2027',
      match: 'تخصصات هندسية وإدارية',
      href: '/scholarships',
    },
  ];

  return (
    <SummarySectionCard title="فرص مقترحة لملفك" icon={Compass} metaLabel={`${curated.length} فرص`}>
      <div className="grid gap-2 sm:grid-cols-2">
        {curated.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col justify-between rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 px-3 py-2.5 transition-all duration-200"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                    <GraduationCap className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </span>
                  <h4 className="min-w-0 flex-1 text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] truncate">
                    {item.title}
                  </h4>
                </div>
                <span className="shrink-0 text-[9.5px] sm:text-[10px] font-bold tabular-nums text-[#0E7C86] dark:text-[#38C6D4] whitespace-nowrap">
                  {item.deadline}
                </span>
              </div>
              <p className="mt-1.5 text-[9.5px] sm:text-[10.5px] font-medium leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
                {item.country} · {item.degree} — {item.funding}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#142B5F]/8 dark:border-white/8 flex items-center justify-between gap-2">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-[#0E7C86] dark:text-[#38C6D4] truncate">
                {item.match}
              </span>
              <Link
                to={item.href}
                className="mn-workspace-btn-sm shrink-0 inline-flex items-center justify-center gap-1 rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent dark:bg-[#111E38] px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] hover:text-white dark:text-[#EDF5F5] transition-all whitespace-nowrap"
              >
                <span>تفاصيل المنحة</span>
                <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </SummarySectionCard>
  );
}

/**
 * Opportunities Sub-View: قائمتي المختصرة (Shortlist from Saved Scholarships/Universities)
 */
export function OpportunitiesShortlistPanel({
  savedItems = [],
  onSwitchToVault,
  onSwitchToActive,
}: {
  savedItems?: readonly StudentSavedItemDto[];
  trackers?: readonly StudentApplicationTrackerDto[];
  onSwitchToVault?: () => void;
  onSwitchToActive?: () => void;
}) {
  const shortlist = useMemo(
    () =>
      (savedItems ?? []).filter((item) =>
        ['SCHOLARSHIP', 'UNIVERSITY', 'MAJOR'].includes(item.entityType),
      ),
    [savedItems],
  );
  const handleAction = onSwitchToVault ?? onSwitchToActive;

  return (
    <SummarySectionCard
      title="قائمتي المختصرة للفرص"
      icon={Star}
      metaLabel={`${shortlist.length} عنصر`}
      action={
        handleAction ? (
          <button
            type="button"
            onClick={handleAction}
            className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>إدارة التقديمات</span>
            <ChevronLeft className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" aria-hidden="true" />
          </button>
        ) : undefined
      }
    >
      {shortlist.length === 0 ? (
        <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center">
          <p className="text-[11px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
            لم تحفظ منحًا أو جامعات في قائمتك المختصرة بعد.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 divide-y divide-[#142B5F]/8 dark:divide-white/8">
          {shortlist.map((item) => (
            <Link
              key={item.id}
              to={
                item.entityType === 'SCHOLARSHIP'
                  ? `/scholarships/${encodeURIComponent(item.entitySlug || item.entityId)}`
                  : `/universities/${encodeURIComponent(item.entitySlug || item.entityId)}`
              }
              className="group flex items-center justify-between gap-2.5 px-3 py-2.5 hover:bg-white dark:hover:bg-[#142342] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                  <GraduationCap className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] truncate group-hover:text-[#0E7C86] dark:group-hover:text-[#38C6D4] transition-colors">
                    {item.displayName || item.entityId}
                  </h4>
                  <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-medium leading-snug text-[#5C707C] dark:text-[#9BB4C7] truncate">
                    {item.entityType === 'SCHOLARSHIP'
                      ? 'منحة محفوظة للمقارنة والتقديم'
                      : 'جامعة / برنامج محفوظ'}
                  </p>
                </div>
              </div>

              <span className="h-6.5 w-6.5 shrink-0 rounded-full border border-[#0E7C86]/25 dark:border-[#38C6D4]/30 bg-white dark:bg-[#111E38] group-hover:bg-gradient-to-l group-hover:from-[#142B5F] group-hover:to-[#0E7C86] group-hover:border-transparent inline-flex items-center justify-center transition-all">
                <ArrowUpLeft
                  className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4] group-hover:text-white transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      )}
    </SummarySectionCard>
  );
}

/**
 * Opportunities Sub-View: النتائج والعروض + خطواتي بعد القبول (Offers & Post-Acceptance Checklist)
 */
const INITIAL_POST_ACCEPTANCE_STEPS = [
  { id: 'pa-1', label: 'تأكيد قبول العرض الرسمي في بوابة المنحة/الجامعة', done: true },
  { id: 'pa-2', label: 'التحقق من صلاحية جواز السفر (أكثر من 18 شهرًا)', done: true },
  { id: 'pa-3', label: 'تجهيز ملف الفيزا الدراسية وحجز موعد السفارة', done: false },
  { id: 'pa-4', label: 'تأكيد السكن الجامعي واستلام خطاب الإقامة', done: false },
  { id: 'pa-5', label: 'إجراء الفحص الطبي وحجز تذكرة السفر', done: false },
  { id: 'pa-6', label: 'التسجيل النهائي عند الوصول للجامعة', done: false },
];

export function OpportunitiesOffersPanel({
  trackers,
}: {
  trackers: readonly StudentApplicationTrackerDto[];
}) {
  const [steps, setSteps] = useState(INITIAL_POST_ACCEPTANCE_STEPS);
  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  const toggleStep = (id: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  return (
    <div className="space-y-2.5 sm:space-y-3.5">
      <SummarySectionCard
        title="النتائج والعروض المسجلة"
        icon={Award}
        metaLabel={`${trackers.length} ملف`}
      >
        {trackers.length === 0 ? (
          <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center">
            <p className="text-[11px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
              لا توجد نتائج أو عروض مسجلة بعد.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {trackers.map((t) => {
              const name =
                t.owner?.displayName ||
                (typeof t.ownerSnapshot?.displayName === 'string'
                  ? t.ownerSnapshot.displayName
                  : 'منحة مسجلة');
              const isAccepted = t.stage.includes('قبول');
              return (
                <div
                  key={t.id}
                  className="relative overflow-hidden flex items-center justify-between gap-2.5 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 pr-3.5 pl-3 py-2.5 transition-all"
                >
                  {/* Selective start-bar for decision/offer items */}
                  <span aria-hidden="true" className="mn-summary-start-bar" />
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                      <Award className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] truncate">
                        {name}
                      </h4>
                      <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-medium leading-snug text-[#5C707C] dark:text-[#9BB4C7] truncate">
                        المرحلة الحالية: {t.stage}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] sm:text-[10.5px] font-extrabold whitespace-nowrap ${
                      isAccepted
                        ? 'text-[#142B5F] dark:text-[#F2CD78]'
                        : 'text-[#0E7C86] dark:text-[#38C6D4]'
                    }`}
                  >
                    {isAccepted ? 'عرض قبول' : 'قيد المتابعة'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </SummarySectionCard>

      <SummarySectionCard
        title="خطواتي بعد القبول"
        icon={ListChecks}
        metaLabel={`${progress}%`}
      >
        <div className="mb-2.5 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-2.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-2">
            <span className="font-bold text-[#142B5F] dark:text-[#F1F5F9]">
              جاهزية السفر والالتحاق الجامعي
            </span>
            <span className="font-extrabold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]">
              {completedCount} من {steps.length}
            </span>
          </div>
          <div className="h-[4.5px] w-full overflow-hidden rounded-full bg-white dark:bg-[#111E38] border border-[#142B5F]/8 dark:border-white/10" dir="rtl">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] dark:from-[#0E7C86] dark:to-[#38C6D4] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 divide-y divide-[#142B5F]/8 dark:divide-white/8">
          {steps.map((step) => (
            <label
              key={step.id}
              className="flex items-center gap-2.5 px-3 py-2 text-[10.5px] sm:text-[11.5px] hover:bg-white dark:hover:bg-[#142342] transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={step.done}
                onChange={() => toggleStep(step.id)}
                className="h-3.5 w-3.5 shrink-0 rounded accent-[#0E7C86]"
              />
              <span
                className={`font-semibold leading-snug ${
                  step.done
                    ? 'line-through text-[#5C707C] dark:text-[#9BB4C7] opacity-75'
                    : 'text-[#142B5F] dark:text-[#F1F5F9]'
                }`}
              >
                {step.label}
              </span>
            </label>
          ))}
        </div>
      </SummarySectionCard>
    </div>
  );
}

/**
 * Section 10 of Brief: مستنداتي (Personal Document Library with 4 independent status dimensions)
 */
interface PersonalDocItem {
  id: string;
  title: string;
  category: 'IDENTITY' | 'ACADEMIC' | 'LANGUAGE' | 'LETTERS';
  version: string;
  expiresAt: string | null;
  available: boolean;
  consentGranted: boolean;
  verification: 'VERIFIED' | 'NOT_ATTESTED' | 'STALE';
  linkedTo: string[];
}

const INITIAL_PERSONAL_DOCS: PersonalDocItem[] = [
  {
    id: 'doc-passport',
    title: 'جواز السفر الدولي',
    category: 'IDENTITY',
    version: 'v2',
    expiresAt: '2029-05-15T00:00:00Z',
    available: true,
    consentGranted: true,
    verification: 'VERIFIED',
    linkedTo: ['منحة الحكومة الصينية (CSC)'],
  },
  {
    id: 'doc-transcript',
    title: 'كشف الدرجات الأكاديمي (مترجم للإنجليزية)',
    category: 'ACADEMIC',
    version: 'v1',
    expiresAt: null,
    available: true,
    consentGranted: true,
    verification: 'NOT_ATTESTED',
    linkedTo: ['منحة الحكومة الصينية (CSC)', 'منحة تشيفنينغ'],
  },
  {
    id: 'doc-ielts',
    title: 'شهادة اختبار IELTS الأكاديمي',
    category: 'LANGUAGE',
    version: 'v1',
    expiresAt: '2026-12-01T00:00:00Z',
    available: true,
    consentGranted: false,
    verification: 'STALE',
    linkedTo: ['منحة تشيفنينغ'],
  },
  {
    id: 'doc-sop',
    title: 'خطاب الدافع والسيرة الأكاديمية (CV & SOP)',
    category: 'LETTERS',
    version: 'v3',
    expiresAt: null,
    available: true,
    consentGranted: false,
    verification: 'NOT_ATTESTED',
    linkedTo: [],
  },
];

export function StudentDocumentsLibraryPanel(_props?: {
  trackers?: readonly StudentApplicationTrackerDto[];
  onDocumentsChanged?: () => void;
}) {
  const [subFilter, setSubFilter] = useState<'LIBRARY' | 'ATTENTION' | 'SHARES'>('LIBRARY');
  const [docs, setDocs] = useState<PersonalDocItem[]>(INITIAL_PERSONAL_DOCS);

  const visibleDocs = useMemo(() => {
    if (subFilter === 'ATTENTION') {
      return docs.filter((d) => d.verification === 'STALE' || !d.consentGranted);
    }
    if (subFilter === 'SHARES') {
      return docs.filter((d) => d.consentGranted || d.linkedTo.length > 0);
    }
    return docs;
  }, [docs, subFilter]);

  const toggleConsent = (id: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, consentGranted: !d.consentGranted } : d)),
    );
  };

  return (
    <SummarySectionCard
      title="مكتبة مستنداتي الخاصة"
      icon={FileCheck2}
      metaLabel={`${docs.length} مستند`}
    >
      {/* Clean segmented filter bar */}
      <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-1">
        {[
          { id: 'LIBRARY' as const, label: `مكتبتي (${docs.length})` },
          {
            id: 'ATTENTION' as const,
            label: `تحتاج انتباه (${docs.filter((d) => d.verification === 'STALE').length})`,
          },
          {
            id: 'SHARES' as const,
            label: `المشاركات (${docs.filter((d) => d.consentGranted).length})`,
          },
        ].map((tab) => {
          const active = subFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubFilter(tab.id)}
              className={`mn-workspace-btn-sm rounded-lg px-2 text-[10px] sm:text-[11px] font-bold cursor-pointer transition-all truncate ${
                active
                  ? 'bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.16)]'
                  : 'bg-transparent text-[#142B5F] dark:text-[#DCE7F0] hover:bg-white dark:hover:bg-[#142342]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Upload new document */}
      <div className="mb-3">
        <StudentDocumentUpload
          onUploaded={(uploaded) => {
            setDocs((prev) => [
              {
                id: uploaded.id,
                title: uploaded.metadata?.originalFilename || 'مستند جديد مرفوع.pdf',
                category: 'ACADEMIC',
                version: 'v1',
                expiresAt: null,
                available: true,
                consentGranted: false,
                verification: 'NOT_ATTESTED',
                linkedTo: [],
              },
              ...prev,
            ]);
          }}
        />
      </div>

      {/* Documents List with 4 clear status dimensions */}
      <div className="space-y-2.5">
        {visibleDocs.map((doc) => {
          const dims = resolveDocumentStatusDimensions({
            expiresAt: doc.expiresAt,
            available: doc.available,
            consentGranted: doc.consentGranted,
            verification: doc.verification,
          });

          return (
            <article
              key={doc.id}
              className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 p-3 space-y-2.5 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                    <FileText className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                      {doc.title}
                    </h4>
                    <span className="mt-0.5 block text-[9.5px] sm:text-[10px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">
                      الإصدار النشط: {doc.version}
                      {doc.linkedTo.length > 0 ? ` · مرتبط بـ: ${doc.linkedTo.join('، ')}` : ''}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleConsent(doc.id)}
                  className="mn-workspace-btn-sm shrink-0 rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent dark:bg-[#111E38] px-2.5 text-[9.5px] sm:text-[10.5px] font-bold text-[#142B5F] hover:text-white dark:text-[#EDF5F5] transition-all cursor-pointer whitespace-nowrap"
                >
                  {doc.consentGranted ? 'إيقاف المراجعة' : 'تفعيل المراجعة'}
                </button>
              </div>

              {/* 4 Independent Status Dimensions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <div className="rounded-lg border border-[#142B5F]/8 dark:border-white/8 bg-white dark:bg-[#111E38] px-2.5 py-1.5">
                  <span className="block text-[9px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">صلاحية الوثيقة</span>
                  <span className="mt-0.5 block text-[10px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">
                    {dims.validityLabel}
                  </span>
                </div>
                <div className="rounded-lg border border-[#142B5F]/8 dark:border-white/8 bg-white dark:bg-[#111E38] px-2.5 py-1.5">
                  <span className="block text-[9px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">حالة الأصل</span>
                  <span className="mt-0.5 block text-[10px] font-bold text-[#0E7C86] dark:text-[#38C6D4]">
                    {dims.availabilityLabel}
                  </span>
                </div>
                <div className="rounded-lg border border-[#142B5F]/8 dark:border-white/8 bg-white dark:bg-[#111E38] px-2.5 py-1.5">
                  <span className="block text-[9px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">موافقة المراجعة</span>
                  <span className="mt-0.5 block text-[10px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">
                    {doc.consentGranted ? 'مفعلة' : 'غير مفعلة'}
                  </span>
                </div>
                <div className="rounded-lg border border-[#142B5F]/8 dark:border-white/8 bg-white dark:bg-[#111E38] px-2.5 py-1.5">
                  <span className="block text-[9px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">التدقيق الأكاديمي</span>
                  <span className="mt-0.5 block text-[10px] font-bold text-[#0E7C86] dark:text-[#38C6D4]">
                    {dims.verificationLabel}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </SummarySectionCard>
  );
}

/**
 * Section 8 of Brief: تعلمي -> خطتي (Structured Weekly Study Plan) & الاختبارات والتحضير (IELTS/TOEFL)
 */
export function LearningStudyPlanPanel({
  courses,
  dashboard,
}: {
  courses?: StudentDashboardSummaryDto['courseEnrollments'];
  dashboard?: StudentDashboardSummaryDto;
}) {
  const resolvedCourses = courses ?? dashboard?.courseEnrollments ?? [];
  const milestones = [
    {
      id: 'pl-1',
      week: 'الأسبوع ١',
      title: 'إتمام أساسيات الكتابة الأكاديمية وبنية خطاب الدافع',
      progress: 100,
      status: 'مكتمل',
      active: false,
    },
    {
      id: 'pl-2',
      week: 'الأسبوع ٢',
      title:
        resolvedCourses[0]?.courseName || 'مدخل إلى الذكاء الاصطناعي ومهارات البحث العلمي',
      progress: resolvedCourses[0]?.progressPercentage ?? 45,
      status: 'قيد التنفيذ',
      active: true,
    },
    {
      id: 'pl-3',
      week: 'الأسبوع ٣',
      title: 'التدريب العملي على اختبار IELTS الأكاديمي (Reading & Writing)',
      progress: 25,
      status: 'مجدول',
      active: false,
    },
  ];

  return (
    <SummarySectionCard title="خطتي التعليمية الأسبوعية" icon={Target} metaLabel="٣ مراحل">
      <div className="space-y-2">
        {milestones.map((m) => (
          <div
            key={m.id}
            className={`relative overflow-hidden rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 py-2.5 transition-all ${
              m.active ? 'pr-3.5 pl-3' : 'px-3'
            }`}
          >
            {/* Selective start-bar ONLY on the currently active week */}
            {m.active && <span aria-hidden="true" className="mn-summary-start-bar" />}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                  {m.progress >= 100 ? (
                    <Check className="h-3 w-3 text-white" aria-hidden="true" />
                  ) : (
                    <Target className="h-3 w-3 text-white" aria-hidden="true" />
                  )}
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] font-bold text-[#0E7C86] dark:text-[#38C6D4] truncate">
                  {m.week} · {m.status}
                </span>
              </div>
              <span className="shrink-0 text-[10.5px] sm:text-[11.5px] font-extrabold tabular-nums text-[#142B5F] dark:text-[#F2CD78]" dir="ltr">
                {m.progress}%
              </span>
            </div>

            <h4 className="mt-1.5 text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9]">
              {m.title}
            </h4>

            <div className="mt-2 h-[4.5px] w-full overflow-hidden rounded-full bg-white dark:bg-[#111E38] border border-[#142B5F]/8 dark:border-white/10" dir="rtl">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] dark:from-[#0E7C86] dark:to-[#38C6D4] transition-all duration-300"
                style={{ width: `${m.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SummarySectionCard>
  );
}

export function LearningTestPrepPanel() {
  return (
    <SummarySectionCard
      title="سجل التدريب والتحضير للاختبارات الدولية"
      icon={ClipboardList}
      metaLabel="تدريب ذاتي"
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 pr-3.5 pl-3 py-3 transition-all">
          <span aria-hidden="true" className="mn-summary-start-bar" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                <ClipboardList className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              </span>
              <h4 className="text-[10.5px] sm:text-[12px] font-bold text-[#142B5F] dark:text-[#F1F5F9] truncate">
                IELTS Academic (تجريبي)
              </h4>
            </div>
            <span className="shrink-0 text-[10px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]">
              الهدف: 7.0
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
            {[
              { s: 'Listening', v: '7.0' },
              { s: 'Reading', v: '6.5' },
              { s: 'Writing', v: '6.0' },
              { s: 'Speaking', v: '6.5' },
            ].map((sec) => (
              <div
                key={sec.s}
                className="rounded-lg border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] px-1 py-1.5"
              >
                <span className="block text-[8.5px] sm:text-[9px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                  {sec.s}
                </span>
                <strong className="mt-0.5 block text-[11px] font-extrabold tabular-nums text-[#142B5F] dark:text-[#F1F5F9]">
                  {sec.v}
                </strong>
              </div>
            ))}
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#142B5F]/8 dark:border-white/8 flex items-center justify-between gap-2">
            <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] truncate">
              التركيز: رفع Writing إلى 6.5
            </span>
            <Link
              to="/exams"
              className="shrink-0 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#0E7C86] dark:text-[#38C6D4] hover:underline whitespace-nowrap"
            >
              <span>بدء تدريب</span>
              <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 p-3 flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </span>
                <h4 className="text-[10.5px] sm:text-[12px] font-bold text-[#142B5F] dark:text-[#F1F5F9] truncate">
                  الدرجة الرسمية الموثقة
                </h4>
              </div>
              <span className="shrink-0 text-[9.5px] font-bold text-[#0E7C86] dark:text-[#38C6D4]">
                مرتبطة بملفي
              </span>
            </div>
            <p className="mt-2 text-[10px] sm:text-[11px] font-medium text-[#5C707C] dark:text-[#9BB4C7] leading-relaxed">
              الدرجة الرسمية المعتمدة في ملف التقديم منفصلة عن محاولات التدريب، وتُربط مباشرة بشهادة الاختبار في «مستنداتي».
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#142B5F]/8 dark:border-white/8 flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-[10.5px] font-bold text-[#142B5F] dark:text-[#F1F5F9] truncate tabular-nums">
              IELTS 6.5 (صالح حتى ديسمبر 2026)
            </span>
            <Link
              to="/exams"
              className="shrink-0 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#0E7C86] dark:text-[#38C6D4] hover:underline whitespace-nowrap"
            >
              <span>دليل الاختبارات</span>
              <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </SummarySectionCard>
  );
}

/**
 * Section 9 of Brief: محفوظاتي -> المقارنات والقرارات (2-item Mobile Side-by-Side Comparison) & نتائج الأدوات
 */
export function VaultComparisonsPanel(_props?: {
  savedItems?: readonly StudentSavedItemDto[];
  onOpenApplications?: () => void;
}) {
  const [preferredId, setPreferredId] = useState<'csc' | 'chevening'>('csc');

  const rows = [
    { label: 'الدولة والوجهة', csc: 'الصين', chevening: 'المملكة المتحدة' },
    { label: 'التغطية المالية', csc: 'رسوم + سكن + راتب', chevening: 'رسوم + تذاكر + معيشة' },
    { label: 'متطلب اللغة', csc: 'IELTS 6.0 أو HSK', chevening: 'IELTS 6.5 أكاديمي' },
    { label: 'خبرة العمل', csc: 'غير مشروطة', chevening: 'سنتان (2,800 ساعة)' },
    { label: 'نقطة القوة لك', csc: 'معدلك الأكاديمي ممتاز', chevening: 'مدة ماجستير سنة واحدة' },
  ];

  return (
    <CalmSectionCard title="مقارنة الفرص وقراري" icon={Scale} badge="مقارنة ثنائية">
      <div className="overflow-x-auto rounded-xl border border-[var(--mn-border)] dark:border-white/10">
        <table className="w-full text-right text-[11px] font-['Cairo',sans-serif] border-collapse">
          <thead>
            <tr className="bg-[#142B5F] text-white">
              <th className="p-2.5 font-bold text-[#F2CD78] w-[28%] border-l border-white/10">
                المعيار
              </th>
              <th className="p-2.5 font-bold w-[36%] border-l border-white/10">
                منحة الحكومة الصينية (CSC)
              </th>
              <th className="p-2.5 font-bold w-[36%]">منحة تشيفنينغ البريطانية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--mn-border)] dark:divide-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)]">
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="p-2 font-bold text-[#1E293B] dark:text-[#F8FAFC] bg-[var(--mn-surface)] border-l border-[var(--mn-border)] dark:border-white/10">
                  {r.label}
                </td>
                <td className="p-2 font-medium text-[#334155] dark:text-[#CBD5E1] border-l border-[var(--mn-border)] dark:border-white/10">
                  {r.csc}
                </td>
                <td className="p-2 font-medium text-[#334155] dark:text-[#CBD5E1]">
                  {r.chevening}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-2.5">
        <span className="text-[11px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
          الخيار المفضل للتقديم الأول:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPreferredId('csc')}
            className={`rounded-lg border px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${
              preferredId === 'csc'
                ? 'border-[#142B5F] bg-[#142B5F] text-[#F2CD78]'
                : 'border-[var(--mn-border)] bg-[var(--mn-surface)] text-[#334155]'
            }`}
          >
            منحة الصين CSC ✓
          </button>
          <button
            type="button"
            onClick={() => setPreferredId('chevening')}
            className={`rounded-lg border px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${
              preferredId === 'chevening'
                ? 'border-[#142B5F] bg-[#142B5F] text-[#F2CD78]'
                : 'border-[var(--mn-border)] bg-[var(--mn-surface)] text-[#334155]'
            }`}
          >
            منحة تشيفنينغ
          </button>
        </div>
      </div>
    </CalmSectionCard>
  );
}

export function VaultToolsResultsPanel(_props?: {
  savedItems?: readonly StudentSavedItemDto[];
  hydratedSavedItems?: unknown;
}) {
  const tools = [
    {
      slug: 'gpa-calculator',
      title: 'حاسبة المعدل التراكمي (GPA)',
      summary: 'المعدل المحسوب: 3.82 / 4.00 (يعادل 95.5%)',
      date: 'محفوظة في حسابك',
    },
    {
      slug: 'scholarship-recommendation',
      title: 'تقييم أهلية المنح الدراسية',
      summary: 'نسبة التوافق العليا: منح الحكومة الصينية والألمانية (92%)',
      date: 'محفوظة في حسابك',
    },
    {
      slug: 'motivation-letter-generator',
      title: 'مسودة خطاب الدافع الأكاديمي',
      summary: 'نسخة مخصصة لبرنامج ماجستير الذكاء الاصطناعي',
      date: 'محفوظة في حسابك',
    },
    {
      slug: 'university-comparison',
      title: 'مقارنة الجامعات العالمية',
      summary: 'مقارنة جامعة تسينغهوا وجامعة مانشستر',
      date: 'محفوظة في حسابك',
    },
  ];

  return (
    <CalmSectionCard
      title="نتائج أدواتي المحفوظة"
      icon={Sparkles}
      badge={`${tools.length} نتائج`}
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {tools.map((t) => (
          <div
            key={t.slug}
            className="rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-[#0E7C86] dark:text-[#55CBC5]">
                  {t.date}
                </span>
                <LockKeyhole className="h-3.5 w-3.5 text-[#142B5F] dark:text-[#F2CD78]" />
              </div>
              <h4 className="mt-1 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                {t.title}
              </h4>
              <p className="mt-1 text-[11px] font-medium text-[#475569] dark:text-[#CBD5E1]">
                {t.summary}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[var(--mn-border)] flex justify-end">
              <Link
                to="/tools"
                className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#142B5F] dark:text-[#F2CD78] hover:underline"
              >
                <span>فتح الأداة</span>
                <ArrowUpLeft className="h-3 w-3 text-[#0E7C86]" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </CalmSectionCard>
  );
}

/**
 * Section 11 of Brief: خدماتي -> الحجوزات والمواعيد + الملفات المستلمة
 */
export function ServiceDeliverablesPanel({
  requests,
}: {
  requests: readonly StudentServiceRequestDto[];
}) {
  const deliverables = [
    {
      id: 'deliv-1',
      title: 'تقرير المراجعة اللغوية والأكاديمية لخطاب الدافع (SOP)',
      requestCode: requests[0]?.publicId || 'DEMO-REQ-001',
      version: 'النسخة المراجَعة v1',
      status: 'جاهز للتنزيل',
      date: 'أكتوبر 2026',
    },
    {
      id: 'deliv-2',
      title: 'قائمة الجامعات الموصى بها حسب تخصصك ومعدلك',
      requestCode: requests[1]?.publicId || 'DEMO-REQ-002',
      version: 'ملف PDF معتمد',
      status: 'بانتظار إتمام المراجعة',
      date: 'قيد الإعداد',
    },
  ];

  return (
    <CalmSectionCard
      title="الملفات والمخرجات المستلمة"
      icon={FileCheck2}
      badge={`${deliverables.length} ملف`}
    >
      <div className="space-y-2.5">
        {deliverables.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#0E7C86]">
                <span>طلب #{item.requestCode}</span>
                <span>·</span>
                <span>{item.version}</span>
              </div>
              <h4 className="mt-0.5 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                {item.title}
              </h4>
            </div>
            <span className="shrink-0 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-2.5 py-1 text-[10.5px] font-bold text-[#142B5F] dark:text-[#F2CD78]">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </CalmSectionCard>
  );
}

/**
 * Section 12 of Brief: مساري المهني -> فرص العمل والتدريب + تطوير مهاراتي
 */
export function CareerJobsExplorePanel({
  onSelectJob,
}: {
  onSelectJob: (job: { id: string; title: string }) => void;
}) {
  const jobs = [
    {
      id: 'job-ra-ai',
      title: 'مساعد باحث أكاديمي — مختبرات تحليل البيانات والذكاء الاصطناعي',
      org: 'برنامج التدريب البحثي للخريجين',
      type: 'تدريب بحثي عن بُعد / هجين',
      channel: 'تقديم مباشر من حسابك',
    },
    {
      id: 'job-edtech-fellow',
      title: 'زميل تطوير محتوى أكاديمي وإرشاد طلابي',
      org: 'مبادرات التعليم العالي الإقليمية',
      type: 'دوام جزئي مرن',
      channel: 'تقديم مباشر من حسابك',
    },
  ];

  return (
    <CalmSectionCard title="فرص العمل والتدريب المتاحة" icon={BriefcaseBusiness} badge="٢ فرص">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {jobs.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-[#0E7C86] dark:text-[#55CBC5]">
                {item.type} · {item.channel}
              </span>
              <h4 className="mt-1 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC] leading-snug">
                {item.title}
              </h4>
              <p className="mt-0.5 text-[10.5px] font-medium text-[#64748B]">{item.org}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--mn-border)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectJob({ id: item.id, title: item.title })}
                className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/35 px-3 py-1 text-[10.5px] font-bold text-white cursor-pointer"
              >
                <span>التقديم بملفي المهني</span>
                <ArrowLeft className="h-3 w-3 text-[#F2CD78]" />
              </button>
              <Link
                to="/careers"
                className="text-[10.5px] font-bold text-[#0E7C86] hover:underline"
              >
                دليل الوظائف
              </Link>
            </div>
          </article>
        ))}
      </div>
    </CalmSectionCard>
  );
}

export function CareerSkillDevelopmentPanel({
  skillsCount,
}: {
  skillsCount: number;
}) {
  const tracks = [
    {
      id: 'sk-1',
      title: 'صياغة السيرة الذاتية الأكاديمية والمهنية (ATS-Ready)',
      status: skillsCount > 0 ? 'مكتمل جزئياً' : 'مقترح للبدء',
      href: '/tools',
    },
    {
      id: 'sk-2',
      title: 'مهارات المقابلات الشخصية للمنح والزمالات البحثية',
      status: 'دورة تدريبية متاحة',
      href: '/courses',
    },
  ];

  return (
    <CalmSectionCard title="تطوير مهاراتي المهنية" icon={Sparkles} badge="جاهزية المسار">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {tracks.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#0E7C86]">{t.status}</span>
              <h4 className="mt-0.5 text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                {t.title}
              </h4>
            </div>
            <Link
              to={t.href}
              className="shrink-0 rounded-lg border border-[#142B5F]/30 bg-[var(--mn-surface)] px-2.5 py-1 text-[10.5px] font-bold text-[#142B5F] dark:text-[#F2CD78]"
            >
              فتح
            </Link>
          </div>
        ))}
      </div>
    </CalmSectionCard>
  );
}

/**
 * Section 13 of Brief: ملفي الأكاديمي (Qualifications, GPA + Scale, Languages, Study Goal)
 */
export function AcademicProfileSummaryCard() {
  const [qualification, setQualification] = useState('بكالوريوس علوم الحاسوب ونظم المعلومات');
  const [gpa, setGpa] = useState('3.82');
  const [gpaScale, setGpaScale] = useState('4.00');
  const [englishTest, setEnglishTest] = useState('IELTS 6.5');
  const [targetDegree, setTargetDegree] = useState('ماجستير — خريف 2027 (الصين / بريطانيا)');
  const [savedNotice, setSavedNotice] = useState(false);

  return (
    <CalmSectionCard
      title="ملفي الأكاديمي واللغوي"
      icon={GraduationCap}
      badge="يغذي توصيات المنح"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="block text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] mb-1">
            المؤهل الأكاديمي والتخصص
          </span>
          <input
            type="text"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] font-medium text-[#1E293B] dark:text-[#F8FAFC] outline-none focus:border-[#0E7C86]"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="block text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] mb-1">
              المعدل التراكمي
            </span>
            <input
              type="text"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              className="w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC] outline-none focus:border-[#0E7C86]"
            />
          </label>
          <label className="block">
            <span className="block text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] mb-1">
              مقياس المعدل
            </span>
            <select
              value={gpaScale}
              onChange={(e) => setGpaScale(e.target.value)}
              className="w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-2.5 py-2 text-[12px] font-semibold text-[#1E293B] dark:text-[#F8FAFC] outline-none focus:border-[#0E7C86]"
            >
              <option value="4.00">من 4.00</option>
              <option value="5.00">من 5.00</option>
              <option value="100">من 100%</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="block text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] mb-1">
            مستوى اللغة والاختبارات المعتمدة
          </span>
          <input
            type="text"
            value={englishTest}
            onChange={(e) => setEnglishTest(e.target.value)}
            className="w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] font-medium text-[#1E293B] dark:text-[#F8FAFC] outline-none focus:border-[#0E7C86]"
          />
        </label>

        <label className="block">
          <span className="block text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] mb-1">
            الهدف الدراسي والوجهات المفضلة
          </span>
          <input
            type="text"
            value={targetDegree}
            onChange={(e) => setTargetDegree(e.target.value)}
            className="w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] font-medium text-[#1E293B] dark:text-[#F8FAFC] outline-none focus:border-[#0E7C86]"
          />
        </label>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--mn-border)] dark:border-white/10 flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-medium text-[#64748B]">
          {savedNotice
            ? '✓ تم تحديث بيانات ملفك الأكاديمي'
            : 'تُستخدم هذه المعايير لمطابقة المنح وحساب الأهلية تلقائياً.'}
        </span>
        <button
          type="button"
          onClick={() => setSavedNotice(true)}
          className="rounded-xl bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/35 px-3.5 py-1.5 text-[11px] font-bold text-white cursor-pointer"
        >
          تحديث المؤهلات
        </button>
      </div>
    </CalmSectionCard>
  );
}

/**
 * Section 15 of Brief: التقويم والمهام (Unified Calendar & Reminders)
 */
export function StudentCalendarTasksPanel({
  trackers,
}: {
  trackers: readonly StudentApplicationTrackerDto[];
}) {
  const [customTasks, setCustomTasks] = useState([
    { id: 'cal-1', title: 'تصديق ترجمة كشف الدرجات', date: '25 أكتوبر 2026', done: false },
    { id: 'cal-2', title: 'مراجعة مسودة خطاب التوصية مع المشرف', date: '2 نوفمبر 2026', done: true },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setCustomTasks((prev) => [
      { id: `cal-${Date.now()}`, title: newTaskTitle.trim(), date: 'تذكير هذا الأسبوع', done: false },
      ...prev,
    ]);
    setNewTaskTitle('');
  };

  return (
    <CalmSectionCard title="التقويم والمواعيد والمهام" icon={CalendarClock} badge="مواعيدي">
      <form onSubmit={addTask} className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="أضف تذكيرًا أو مهمة شخصية جديدة..."
          className="flex-1 min-h-9 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-3 text-[11.5px] font-medium text-[#1E293B] dark:text-[#F8FAFC] outline-none focus:border-[#0E7C86]"
        />
        <button
          type="submit"
          className="shrink-0 inline-flex min-h-9 items-center gap-1 rounded-xl bg-[#142B5F] px-3 text-[11px] font-bold text-white cursor-pointer border border-[#D6A43B]/35"
        >
          <Plus className="h-3.5 w-3.5 text-[#F2CD78]" />
          <span>إضافة</span>
        </button>
      </form>

      <div className="space-y-2">
        {trackers.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-3 py-2"
          >
            <div className="min-w-0">
              <span className="text-[9.5px] font-bold text-[#0E7C86]">موعد منحة</span>
              <h4 className="text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                {t.owner?.displayName || 'ملف تقديم منحة'}
              </h4>
            </div>
            <span className="shrink-0 rounded-lg border border-[#0E7C86]/25 bg-[#0E7C86]/10 px-2 py-0.5 text-[10px] font-bold text-[#0E7C86]">
              {t.deadlineAt
                ? new Date(t.deadlineAt).toLocaleDateString('ar', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'متجدد'}
            </span>
          </div>
        ))}

        {customTasks.map((task) => (
          <label
            key={task.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-3 py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() =>
                  setCustomTasks((prev) =>
                    prev.map((item) =>
                      item.id === task.id ? { ...item, done: !item.done } : item,
                    ),
                  )
                }
                className="h-4 w-4 rounded accent-[#142B5F]"
              />
              <span
                className={`text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] ${
                  task.done ? 'line-through opacity-65' : ''
                }`}
              >
                {task.title}
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-[#64748B]">
              {task.date}
            </span>
          </label>
        ))}
      </div>
    </CalmSectionCard>
  );
}

/**
 * Section 17 of Brief: الدعم والمساعدة (مركز المساعدة + تذاكري)
 */
export function StudentSupportCenterPanel() {
  const [subTab, setSubTab] = useState<'FAQ' | 'TICKETS'>('FAQ');
  const [tickets, setTickets] = useState([
    {
      id: 'TCK-204',
      subject: 'استفسار حول تصديق الوثائق لمنحة الحكومة الصينية',
      category: 'ملفات التقديم',
      status: 'تم الرد من المستشار',
      updatedAt: 'قبل يومين',
    },
  ]);
  const [subject, setSubject] = useState('');

  const faqs = [
    {
      q: 'ما الفرق بين حفظ المنحة في «محفوظاتي» وفتح «ملف تقديم» في فرصي؟',
      a: 'المحفوظات للاطلاع السريع والمقارنة، بينما ملف التقديم ينشئ لك قائمة مهام وربط مستندات ومواعيد نهائية مخصصة.',
    },
    {
      q: 'هل تُرسل مستنداتي تلقائياً للجامعات عند رفعها؟',
      a: 'لا، مستنداتك خاصة بك تماماً داخل حسابك ولا تُفعل للمراجعة الأكاديمية إلا بموافقتك الصريحة.',
    },
    {
      q: 'كيف أؤكد الحجز المؤقت للاستشارة الأكاديمية؟',
      a: 'من قسم «طلباتي» اختر الطلب ثم راجع الفاتورة المرتبطة لإتمام التأكيد قبل انتهاء مهلة الحجز المؤقت.',
    },
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setTickets((prev) => [
      {
        id: `TCK-${205 + prev.length}`,
        subject: subject.trim(),
        category: 'استفسار أكاديمي',
        status: 'قيد المراجعة',
        updatedAt: 'الآن',
      },
      ...prev,
    ]);
    setSubject('');
  };

  return (
    <CalmSectionCard title="الدعم والمساعدة الطلابية" icon={HelpCircle} badge="خدمة الطلاب">
      <div className="mb-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSubTab('FAQ')}
          className={`rounded-lg border px-3 py-1 text-[11px] font-bold cursor-pointer ${
            subTab === 'FAQ'
              ? 'border-[#142B5F] bg-[#142B5F] text-[#F2CD78]'
              : 'border-[var(--mn-border)] bg-[var(--mn-page)] text-[#334155]'
          }`}
        >
          مركز المساعدة
        </button>
        <button
          type="button"
          onClick={() => setSubTab('TICKETS')}
          className={`rounded-lg border px-3 py-1 text-[11px] font-bold cursor-pointer ${
            subTab === 'TICKETS'
              ? 'border-[#142B5F] bg-[#142B5F] text-[#F2CD78]'
              : 'border-[var(--mn-border)] bg-[var(--mn-page)] text-[#334155]'
          }`}
        >
          تذاكري ({tickets.length})
        </button>
      </div>

      {subTab === 'FAQ' ? (
        <div className="space-y-2">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3"
            >
              <h4 className="text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                {item.q}
              </h4>
              <p className="mt-1 text-[11px] font-medium text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <form onSubmit={handleCreateTicket} className="flex items-center gap-2">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="اكتب عنوان استفسارك أو المشكلة..."
              className="flex-1 min-h-9 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 text-[11.5px] font-medium text-[#1E293B] dark:text-[#F8FAFC] outline-none focus:border-[#0E7C86]"
            />
            <button
              type="submit"
              className="shrink-0 inline-flex min-h-9 items-center gap-1 rounded-xl bg-[#142B5F] px-3 text-[11px] font-bold text-white cursor-pointer border border-[#D6A43B]/35"
            >
              <Send className="h-3.5 w-3.5 text-[#F2CD78]" />
              <span>إرسال تذكرة</span>
            </button>
          </form>

          <div className="space-y-2">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#0E7C86]">
                    #{t.id} · {t.category} · {t.updatedAt}
                  </span>
                  <h4 className="mt-0.5 text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                    {t.subject}
                  </h4>
                </div>
                <span className="shrink-0 rounded-lg border border-[#0E7C86]/25 bg-[#0E7C86]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#0E7C86]">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </CalmSectionCard>
  );
}

/**
 * Section 18 of Brief: البحث في حسابي (Unified Account Search Modal)
 */
export function AccountQuickSearchModal({
  open,
  onClose,
  dashboard,
  trackers = [],
  savedItems,
  courses,
  requests = [],
  onSelectTab,
  onNavigateTab,
}: {
  open: boolean;
  onClose: () => void;
  dashboard?: StudentDashboardSummaryDto;
  trackers?: readonly StudentApplicationTrackerDto[];
  savedItems?: readonly StudentSavedItemDto[];
  courses?: StudentDashboardSummaryDto['courseEnrollments'];
  requests?: readonly StudentServiceRequestDto[];
  onSelectTab?: (
    tab:
      | 'SUMMARY'
      | 'OPPORTUNITIES'
      | 'LEARNING'
      | 'VAULT'
      | 'SERVICES'
      | 'CAREERS'
      | 'NOTIFICATIONS'
      | 'PROFILE',
  ) => void;
  onNavigateTab?: (
    tab:
      | 'SUMMARY'
      | 'OPPORTUNITIES'
      | 'LEARNING'
      | 'VAULT'
      | 'SERVICES'
      | 'CAREERS'
      | 'NOTIFICATIONS'
      | 'PROFILE',
  ) => void;
}) {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const resolvedSaved = savedItems ?? dashboard?.savedItems ?? [];
  const resolvedCourses = courses ?? dashboard?.courseEnrollments ?? [];
  const handleSelectTab = onSelectTab ?? onNavigateTab ?? (() => {});

  const q = query.trim().toLowerCase();
  const matchedTrackers = (trackers ?? []).filter((t) =>
    (t.owner?.displayName || '').toLowerCase().includes(q),
  );
  const matchedCourses = (resolvedCourses ?? []).filter((c) =>
    c.courseName.toLowerCase().includes(q),
  );
  const matchedSaved = (resolvedSaved ?? []).filter((s) =>
    (s.displayName || s.entityId).toLowerCase().includes(q),
  );
  const matchedRequests = (requests ?? []).filter((r) =>
    (r.publicId || r.id).toLowerCase().includes(q),
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="البحث في حسابي"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 p-3 pt-14 backdrop-blur-xs font-['Cairo',sans-serif]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--mn-border)] dark:border-white/15 bg-[var(--mn-surface)] p-3.5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--mn-border)]">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#142B5F] border border-[#D6A43B]/40 text-[#F2CD78]">
              <Search className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
              البحث السريع في حسابي
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-[#64748B] hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5 relative">
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في تقديماتك، دوراتك، مستنداتك، أو طلباتك..."
            className="w-full min-h-9 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] pr-8 pl-3 text-[12px] font-medium text-[#1E293B] dark:text-[#F8FAFC] outline-none focus:border-[#0E7C86]"
          />
          <Search className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0E7C86]" />
        </div>

        <div className="mt-3 max-h-64 overflow-y-auto space-y-1.5">
          {matchedTrackers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                handleSelectTab('OPPORTUNITIES');
                onClose();
              }}
              className="w-full flex items-center justify-between rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-right hover:border-[#0E7C86] cursor-pointer"
            >
              <span className="text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                {t.owner?.displayName || 'ملف تقديم'}
              </span>
              <span className="text-[10px] font-bold text-[#0E7C86]">فرصي</span>
            </button>
          ))}
          {matchedCourses.map((c) => (
            <button
              key={c.courseId}
              type="button"
              onClick={() => {
                handleSelectTab('LEARNING');
                onClose();
              }}
              className="w-full flex items-center justify-between rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-right hover:border-[#0E7C86] cursor-pointer"
            >
              <span className="text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                {c.courseName}
              </span>
              <span className="text-[10px] font-bold text-[#0E7C86]">تعلمي</span>
            </button>
          ))}
          {matchedSaved.slice(0, 3).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                handleSelectTab('VAULT');
                onClose();
              }}
              className="w-full flex items-center justify-between rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-right hover:border-[#0E7C86] cursor-pointer"
            >
              <span className="text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate">
                {s.displayName || s.entityId}
              </span>
              <span className="text-[10px] font-bold text-[#0E7C86]">محفوظاتي</span>
            </button>
          ))}
          {matchedRequests.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                handleSelectTab('SERVICES');
                onClose();
              }}
              className="w-full flex items-center justify-between rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-right hover:border-[#0E7C86] cursor-pointer"
            >
              <span className="text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                طلب خدمة #{r.publicId}
              </span>
              <span className="text-[10px] font-bold text-[#0E7C86]">طلباتي</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
