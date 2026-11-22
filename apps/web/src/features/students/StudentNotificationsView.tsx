import { PreviewStudentApiClient } from './studentWorkspacePreviewApi';
const ApiClient =
  import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype'
    ? PreviewStudentApiClient
    : LiveApiClient;
import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  RefreshCw,
  CheckCircle2,
  Check,
  Clock3,
  ArrowUpLeft,
  ListChecks,
} from 'lucide-react';
import {
  ApiClient as LiveApiClient,
  type StudentNotificationProjectionDto,
} from '../../api/client';
import {
  filterStudentNotifications,
  isNotificationRead,
  type NotificationFilterMode,
} from './studentAccountBriefLogic';
import {
  HorizontalSwipeTabs,
  SummarySectionCard,
  WorkspaceTabCanopy,
} from './StudentExpandedSections';

export function studentNotificationLink(value?: string | null): string | null {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return null;
  return value;
}

export function StudentNotificationsView({
  items,
  available,
  onRefresh,
}: {
  items: StudentNotificationProjectionDto[];
  available: boolean;
  onRefresh: () => void;
}) {
  const [filterMode, setFilterMode] = useState<NotificationFilterMode>('ALL');
  const [reading, setReading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const busy = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const markRead = async (id: string) => {
    if (busy.current || !available) return;
    busy.current = true;
    setReading(id);
    setError(null);
    try {
      await ApiClient.markStudentNotificationRead(id);
      if (alive.current) {
        setReadIds((current) => new Set([...current, id]));
        onRefresh();
      }
    } catch (cause) {
      if (alive.current)
        setError(cause instanceof Error ? cause.message : 'تعذر حفظ حالة القراءة');
    } finally {
      busy.current = false;
      if (alive.current) setReading(null);
    }
  };

  const markAllRead = async () => {
    if (busy.current || !available) return;
    const unreadItems = items.filter((item) => !isNotificationRead(item, readIds));
    if (!unreadItems.length) return;
    busy.current = true;
    setReading('ALL');
    setError(null);
    try {
      await Promise.allSettled(
        unreadItems.map((item) => ApiClient.markStudentNotificationRead(item.id)),
      );
      if (alive.current) {
        setReadIds((current) => new Set([...current, ...unreadItems.map((i) => i.id)]));
        onRefresh();
      }
    } catch (cause) {
      if (alive.current)
        setError(cause instanceof Error ? cause.message : 'تعذر تحديث الإشعارات');
    } finally {
      busy.current = false;
      if (alive.current) setReading(null);
    }
  };

  const unreadCount = useMemo(
    () => items.filter((item) => !isNotificationRead(item, readIds)).length,
    [items, readIds],
  );
  const totalCount = items.length;
  const readCount = totalCount - unreadCount;

  const visible = useMemo(
    () => filterStudentNotifications(items, filterMode, readIds),
    [items, filterMode, readIds],
  );

  return (
    <div className="mn-student-notifications-page mt-0 space-y-2.5 sm:space-y-3.5 font-['Cairo',sans-serif]">
      {/* Parent Umbrella Canopy with curved top+side U-cap and embedded 3 filter tabs */}
      <WorkspaceTabCanopy
        title="إشعاراتي والتنبيهات"
        subtitle="متابعة التحديثات الأكاديمية وتنبيهات المنح والدورات"
        icon={Bell}
        actions={
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={Boolean(reading)}
                onClick={() => void markAllRead()}
                className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-[#F6F8FA] hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent dark:bg-[#0B1529]/80 px-2 text-[9.5px] sm:text-[10.5px] font-bold text-[#142B5F] hover:text-white dark:text-[#EDF5F5] transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <CheckCircle2 className="h-3 w-3 shrink-0 text-[#0E7C86] dark:text-[#38C6D4] group-hover:text-white" aria-hidden="true" />
                <span>قراءة الكل</span>
              </button>
            )}
            <button
              type="button"
              onClick={onRefresh}
              aria-label="تحديث الإشعارات"
              className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2 text-[9.5px] sm:text-[10.5px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="h-3 w-3 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
              <span>تحديث</span>
            </button>
          </div>
        }
      >
        <HorizontalSwipeTabs
          embedded
          ariaLabel="تصفية الإشعارات"
          activeId={filterMode}
          onSelect={setFilterMode}
          items={[
            { id: 'ALL', label: 'الكل', count: totalCount, icon: ListChecks },
            { id: 'UNREAD', label: 'غير مقروءة', count: unreadCount, icon: Bell },
            { id: 'READ', label: 'مقروءة', count: readCount, icon: CheckCircle2 },
          ]}
        />
      </WorkspaceTabCanopy>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#142B5F]/15 dark:border-white/12 bg-white dark:bg-[#111E38] px-3 py-2.5 text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9]"
        >
          {error}
        </div>
      )}

      {!available ? (
        <SummarySectionCard title="سجل التنبيهات" icon={Bell}>
          <div
            role="alert"
            className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center"
          >
            <p className="text-[11px] sm:text-[12px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">
              تعذر تحميل الإشعارات حالياً. يرجى إعادة المحاولة.
            </p>
            <button
              type="button"
              onClick={onRefresh}
              className="mn-workspace-btn-sm mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-3.5 text-[10.5px] font-bold text-white shadow-2xs cursor-pointer"
            >
              <RefreshCw className="h-3 w-3 text-white" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </SummarySectionCard>
      ) : !visible.length ? (
        <SummarySectionCard title="سجل التنبيهات" icon={Bell} metaLabel="0 إشعار">
          <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
            <span className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
              <Bell className="w-4 h-4 text-white" />
            </span>
            <h4 className="text-[11.5px] sm:text-[12.5px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">
              {filterMode === 'UNREAD'
                ? 'لا توجد إشعارات غير مقروءة'
                : filterMode === 'READ'
                  ? 'لا توجد إشعارات مقروءة بعد'
                  : 'لا توجد إشعارات حالياً في حسابك'}
            </h4>
            {filterMode !== 'ALL' && (
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className="mn-workspace-btn-sm mt-2.5 inline-flex items-center justify-center rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-3.5 text-[10.5px] font-bold text-white transition-opacity cursor-pointer"
              >
                <span>عرض جميع الإشعارات</span>
              </button>
            )}
          </div>
        </SummarySectionCard>
      ) : (
        <SummarySectionCard
          title="سجل التنبيهات"
          icon={Bell}
          metaLabel={`${visible.length} إشعار`}
        >
          <div className="space-y-2">
            {visible.map((item) => {
              const href = studentNotificationLink(item.actionUrl);
              const occurred = new Date(item.occurredAt);
              const isUnread = !isNotificationRead(item, readIds);

              return (
                <article
                  key={item.id}
                  className={`relative overflow-hidden rounded-xl border py-2.5 transition-all font-['Cairo',sans-serif] ${
                    isUnread
                      ? 'border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 pr-3.5 pl-3'
                      : 'border-[#142B5F]/10 dark:border-white/8 bg-[#F6F8FA]/80 hover:bg-white dark:bg-[#0B1529]/60 dark:hover:bg-[#142342] px-3'
                  }`}
                >
                  {/* Selective Manaratak start-bar ONLY on unread notifications */}
                  {isUnread && <span aria-hidden="true" className="mn-summary-start-bar" />}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <span className="mt-0.5 grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                        <Bell className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                            {item.title}
                          </h4>
                          <span
                            className={`shrink-0 text-[9.5px] sm:text-[10px] font-bold whitespace-nowrap ${
                              isUnread
                                ? 'text-[#0E7C86] dark:text-[#38C6D4]'
                                : 'text-[#5C707C] dark:text-[#9BB4C7]'
                            }`}
                          >
                            {isUnread ? 'جديد' : 'مقروء'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#142B5F]/8 dark:border-white/8 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] tabular-nums whitespace-nowrap">
                      <Clock3 className="w-3 h-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                      <time>
                        {Number.isNaN(occurred.getTime())
                          ? '—'
                          : occurred.toLocaleDateString('ar', {
                              month: 'short',
                              day: 'numeric',
                            })}
                      </time>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isUnread ? (
                        <button
                          type="button"
                          disabled={Boolean(reading)}
                          onClick={() => void markRead(item.id)}
                          className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-white hover:bg-[#F6F8FA] dark:bg-[#111E38] dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                          <span>{reading === item.id ? 'جارٍ الحفظ…' : 'تحديد كمقروء'}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                          <Check className="w-3 h-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                          <span>تم الاطلاع</span>
                        </span>
                      )}

                      {href && (
                        <Link
                          to={href}
                          className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-2.5 text-[10px] font-bold text-white shadow-2xs transition-opacity whitespace-nowrap"
                        >
                          <span>التفاصيل</span>
                          <ArrowUpLeft className="h-3 w-3 text-white shrink-0" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </SummarySectionCard>
      )}
    </div>
  );
}
