import { PreviewStudentApiClient } from './studentWorkspacePreviewApi';
const ApiClient = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? PreviewStudentApiClient : LiveApiClient;
import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, RefreshCw, CheckCircle2, Check, Clock3, ArrowUpLeft, Sparkles } from 'lucide-react';
import { ApiClient as LiveApiClient, type StudentNotificationProjectionDto } from '../../api/client';

export function studentNotificationLink(value?: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value))
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
  const [unreadOnly, setUnreadOnly] = useState(false);
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
      if (alive.current) setError(cause instanceof Error ? cause.message : 'تعذر حفظ حالة القراءة');
    } finally {
      busy.current = false;
      if (alive.current) setReading(null);
    }
  };

  const unreadCount = useMemo(
    () => items.filter((item) => !item.readAt && !readIds.has(item.id)).length,
    [items, readIds]
  );
  const totalCount = items.length;
  const readCount = totalCount - unreadCount;

  const visible = unreadOnly
    ? items.filter((item) => !item.readAt && !readIds.has(item.id))
    : items;

  return (
    <div className="mn-student-notifications-page mt-0 space-y-4 font-['Cairo',sans-serif]">
      {/* Header box attached directly to the 8-tab bar above and stretched edge-to-edge right & left */}
      <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mt-px">
        <section
          aria-label="إشعاراتي والتنبيهات"
          className="mn-student-notifications-hero relative overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] shadow-2xs mn-panel font-['Cairo',sans-serif]"
        >
          {/* Royal Navy (#142B5F) vertical line on the right edge before the box */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[4px] z-10 bg-[#142B5F]"
          />

          <div className="px-3.5 pt-3.5 pb-3.5 pr-4 sm:px-5 sm:pt-4 sm:pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#D6A43B]/45 bg-[#142B5F]">
                  <Bell className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />
                </span>
                <h2 className="mn-student-notifications-heading text-[14px] sm:text-[15px] font-bold leading-tight text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                  إشعاراتي والتنبيهات
                </h2>
              </div>

              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2.5 py-1 text-[11.5px] font-semibold font-['Cairo',sans-serif] text-[#334155] dark:text-[#E2E8F0] hover:border-[#D6A43B] transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#D6A43B]" aria-hidden="true" />
                <span>تحديث الإشعارات</span>
              </button>
            </div>

            <p className="mt-2.5 text-[11.5px] sm:text-[12px] font-medium leading-[1.75] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
              اطّلع على آخر التنبيهات المهمة وتحديثات ملفات التقديم والمواعيد النهائية والفواتير الخاصة بحسابك.
            </p>
          </div>
        </section>

        {/* 3 Filter tabs outside the header box, attached from the top and stretched edge-to-edge */}
        <nav
          aria-label="تصفية الإشعارات"
          className="-mt-px grid grid-cols-3 divide-x divide-x-reverse divide-[var(--mn-border)] dark:divide-white/10 rounded-b-2xl border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] overflow-hidden shadow-2xs"
        >
          {[
            { label: 'جميع الإشعارات', number: totalCount, filterValue: false, key: 'all' },
            { label: 'غير المقروءة', number: unreadCount, filterValue: true, key: 'unread' },
            { label: 'المقروءة', number: readCount, filterValue: false, key: 'read' },
          ].map((stat) => {
            const isSelected = stat.key === 'unread' ? unreadOnly : (!unreadOnly && stat.key === 'all');
            return (
              <button
                key={stat.key}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${stat.label}: ${stat.number}`}
                onClick={() => setUnreadOnly(stat.filterValue)}
                className={`flex min-h-12 items-center justify-center gap-1.5 px-2 py-2 text-center transition-all cursor-pointer font-['Cairo',sans-serif] ${
                  isSelected
                    ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white shadow-inner font-bold'
                    : 'bg-transparent text-[#1E293B] dark:text-[#F1F5F9] font-semibold hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
                }`}
              >
                <span className="whitespace-normal break-words text-[11px] sm:text-[12px] leading-[1.35]">
                  {stat.label} ({stat.number})
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[12px] font-bold text-red-700 dark:text-red-400 font-['Cairo',sans-serif]">
          {error}
        </p>
      )}

      {!available ? (
        <div role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center mn-panel font-['Cairo',sans-serif]">
          <p className="text-[13px] font-bold text-amber-900 dark:text-amber-200">
            تعذر تحميل الإشعارات حالياً. يرجى إعادة المحاولة.
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#142B5F] px-4 py-1.5 text-[12px] font-bold text-white shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#E5B54F]" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      ) : !visible.length ? (
        <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-6 sm:p-8 text-center mn-panel shadow-2xs font-['Cairo',sans-serif] overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#142B5F] border border-[#D6A43B]/45 flex items-center justify-center text-[#F2CD78] mx-auto mb-2.5 shadow-xs">
            <Bell className="w-5 h-5 text-[#F2CD78]" />
          </div>
          <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
            {unreadOnly ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات حالياً في حسابك'}
          </h3>
          <p className="mt-1.5 text-[11.5px] leading-[1.8] text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto font-['Cairo',sans-serif]">
            {unreadOnly
              ? 'أحسنت! لقد اطلعت على جميع إشعاراتك، يمكنك الانتقال إلى «جميع الإشعارات» لمراجعة السجل السابق.'
              : 'عند حدوث أي مستجدات حول طلباتك، مواعيد المنح أو تحديثات الدورات ستصلك الإشعارات هنا فوراً.'}
          </p>
          {unreadOnly && (
            <button
              type="button"
              onClick={() => setUnreadOnly(false)}
              className="mt-4 inline-flex min-h-9 items-center justify-center rounded-xl bg-[#142B5F] hover:bg-[#1a3675] px-4 py-1.5 text-[12px] font-bold text-white transition-colors border border-[#D6A43B]/35 cursor-pointer"
            >
              <span>عرض جميع الإشعارات</span>
            </button>
          )}
        </div>
      ) : (
        /* Notifications List Section */
        <section
          aria-label="سجل الإشعارات"
          className="mn-student-notifications-section relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] min-w-0 rounded-none border-x-0 border-t border-b border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-2xs mn-panel dark:border-white/10 font-['Cairo',sans-serif] overflow-hidden"
        >
          <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/35 bg-[#142B5F] [&>svg]:h-3.5 [&>svg]:w-3.5">
                <Bell className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
              </span>
              <h3 className="min-w-0 text-[12.5px] sm:text-[13px] font-bold leading-[1.3] font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
                سجل التنبيهات المستلمة
              </h3>
            </div>
            <span className="rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2 py-0.5 text-[11px] font-semibold text-[#334155] dark:text-[#E2E8F0] font-['Cairo',sans-serif]">
              {visible.length} إشعار
            </span>
          </div>

          <div className="space-y-3">
            {visible.map((item) => {
              const href = studentNotificationLink(item.actionUrl);
              const occurred = new Date(item.occurredAt);
              const isUnread = !item.readAt && !readIds.has(item.id);

              return (
                <article
                  key={item.id}
                  className={`relative overflow-hidden rounded-xl border p-3 sm:p-3.5 transition-all font-['Cairo',sans-serif] ${
                    isUnread
                      ? 'border-[#0E7C86]/40 bg-[var(--mn-page)] shadow-2xs dark:bg-[var(--mn-surface-elevated)]'
                      : 'border-[var(--mn-border)] bg-[var(--mn-page)] opacity-95 hover:opacity-100 dark:border-white/10 dark:bg-[var(--mn-surface-elevated)]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#142B5F] border border-[#D6A43B]/35 flex items-center justify-center shrink-0">
                        <Bell className="w-3.5 h-3.5 text-[#F2CD78]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[12px] sm:text-[12.5px] font-bold leading-[1.45] text-[#1E293B] dark:text-[#F8FAFC] break-words font-['Cairo',sans-serif]">
                          {item.title}
                        </h4>
                        <div className="text-[10.5px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5 flex items-center gap-1 font-['Cairo',sans-serif]">
                          <Clock3 className="w-3 h-3 text-[#0E7C86]" />
                          <time>{Number.isNaN(occurred.getTime()) ? '—' : occurred.toLocaleString('ar')}</time>
                        </div>
                      </div>
                    </div>

                    {isUnread ? (
                      <span className="rounded-lg border border-[#0E7C86]/30 bg-[#0E7C86]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0E7C86] dark:text-[#55CBC5]">
                        غير مقروء
                      </span>
                    ) : (
                      <span className="rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        مقروء
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 whitespace-pre-wrap break-words text-[12px] font-medium leading-[1.8] text-[#475569] dark:text-[#CBD5E1] font-['Cairo',sans-serif]">
                    {item.message}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[var(--mn-border)] dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-[12px] font-['Cairo',sans-serif]">
                    {isUnread ? (
                      <button
                        type="button"
                        disabled={Boolean(reading)}
                        onClick={() => void markRead(item.id)}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 py-1 text-[12px] font-bold text-[#1E293B] hover:border-[#0E7C86] transition-colors cursor-pointer disabled:opacity-50 dark:text-[#F8FAFC]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7C86]" />
                        <span>{reading === item.id ? 'جارٍ الحفظ…' : 'تحديد كمقروء'}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                        <Check className="w-3.5 h-3.5 text-[#0E7C86]" />
                        <span>تم الاطلاع</span>
                      </span>
                    )}

                    {href && (
                      <Link
                        to={href}
                        className="ms-auto inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-[#142B5F] hover:bg-[#1a3675] px-3.5 py-1 text-[12px] font-bold text-white shadow-2xs transition-colors border border-[#D6A43B]/35"
                      >
                        <span>عرض التفاصيل</span>
                        <ArrowUpLeft className="h-3.5 w-3.5 text-[#F2CD78]" />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
