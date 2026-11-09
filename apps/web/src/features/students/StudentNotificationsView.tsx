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
      {/* Compact inline section header + filter bar directly below the 8-button navigation */}
      <section
        aria-label="إشعاراتي والتنبيهات"
        className="mn-student-notifications-hero relative overflow-hidden rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-2xs mn-panel dark:border-white/10 font-['Cairo',sans-serif]"
      >
        {/* Signature gold accent on right edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[4px] z-10 bg-gradient-to-b from-[#E5B54F] via-[#D6A43B] to-[#B78622]"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 pr-4 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/35 bg-[#142B5F]">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F2CD78]" aria-hidden="true" />
            </span>
            <h2 className="mn-student-notifications-heading text-[13.5px] sm:text-[14px] font-bold leading-tight text-[var(--mn-heading)] font-['Cairo',sans-serif]">
              إشعاراتي والتنبيهات
            </h2>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] px-2.5 py-1 text-[11.5px] font-bold font-['Cairo',sans-serif] text-[var(--mn-heading)] hover:border-[#D6A43B] transition-colors cursor-pointer dark:bg-[var(--mn-surface-elevated)]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#D6A43B]" aria-hidden="true" />
            <span>تحديث الإشعارات</span>
          </button>
        </div>

        {/* 3 Filter tabs attached to the bottom of the compact header card */}
        <nav
          aria-label="تصفية الإشعارات"
          className="grid grid-cols-3 divide-x divide-x-reverse divide-[var(--mn-border)] border-t border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:divide-white/10 dark:border-white/10 overflow-hidden rounded-b-2xl"
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
                className={`flex min-h-10 items-center justify-center gap-1.5 px-2 py-1.5 text-center transition-all cursor-pointer font-['Cairo',sans-serif] font-bold ${
                  isSelected
                    ? 'bg-[#142B5F] text-[#F2CD78] shadow-inner'
                    : 'bg-transparent text-[var(--mn-heading)] hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
                }`}
              >
                <span className="text-[11.5px] sm:text-[12px] font-bold leading-[1.4]">
                  {stat.label} ({stat.number})
                </span>
              </button>
            );
          })}
        </nav>
      </section>

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
        <div className="rounded-2xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-8 text-center mn-panel shadow-2xs font-['Cairo',sans-serif]">
          <div className="w-12 h-12 rounded-2xl bg-[#142B5F] dark:bg-[#0c1a3b] border border-[#D6A43B]/40 flex items-center justify-center text-[#E5B54F] mx-auto mb-3 shadow-xs">
            <Bell className="w-6 h-6 text-[#E5B54F]" />
          </div>
          <h3 className="text-[14px] font-bold text-[var(--mn-heading)] font-['Cairo',sans-serif]">
            {unreadOnly ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات حالياً في حسابك'}
          </h3>
          <p className="mt-1.5 text-[11px] leading-[1.8] text-[var(--mn-text-muted)] max-w-sm mx-auto font-['Cairo',sans-serif]">
            {unreadOnly
              ? 'أحسنت! لقد اطلعت على جميع إشعاراتك، يمكنك الانتقال إلى «جميع الإشعارات» لمراجعة السجل السابق.'
              : 'عند حدوث أي مستجدات حول طلباتك، مواعيد المنح أو تحديثات الدورات ستصلك الإشعارات هنا فوراً.'}
          </p>
          {unreadOnly && (
            <button
              type="button"
              onClick={() => setUnreadOnly(false)}
              className="mt-4 inline-flex min-h-9 items-center justify-center rounded-xl bg-[#142B5F] hover:bg-[#1a3675] px-4 py-1.5 text-[12px] font-bold text-white transition-colors border border-[#D6A43B]/30 cursor-pointer dark:bg-[#D6A43B] dark:text-[#142B5F]"
            >
              <span>عرض جميع الإشعارات</span>
            </button>
          )}
        </div>
      ) : (
        /* Notifications List Section */
        <section
          aria-label="سجل الإشعارات"
          className="mn-student-notifications-section relative -mx-[2px] w-[calc(100%+4px)] min-w-0 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3.5 shadow-2xs mn-panel dark:border-white/10 sm:mx-0 sm:w-full sm:p-4 font-['Cairo',sans-serif] overflow-hidden"
        >
          {/* Signature gold right accent line */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[3.5px] bg-gradient-to-b from-[#B78622] via-[#D6A43B] to-[#E5B54F]" />

          <div className="mb-3.5 flex min-w-0 flex-wrap items-center justify-between gap-2 pr-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#D6A43B]/30 bg-[#142B5F] dark:bg-[#0c1a3b]">
                <Bell className="h-4 w-4 text-[#E5B54F]" aria-hidden="true" />
              </span>
              <h3 className="mn-student-notifications-heading min-w-0 text-[14px] font-bold leading-[1.22] font-['Cairo',sans-serif] text-[var(--mn-heading)]">
                سجل التنبيهات المستلمة
              </h3>
            </div>
            <span className="text-[12px] font-bold text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
              {visible.length} إشعار
            </span>
          </div>

          <div className="space-y-3 pr-1">
            {visible.map((item) => {
              const href = studentNotificationLink(item.actionUrl);
              const occurred = new Date(item.occurredAt);
              const isUnread = !item.readAt && !readIds.has(item.id);

              return (
                <article
                  key={item.id}
                  className={`relative overflow-hidden rounded-xl border p-3.5 sm:p-4 transition-all font-['Cairo',sans-serif] ${
                    isUnread
                      ? 'border-[#D6A43B]/50 bg-[var(--mn-page)] ring-1 ring-[#D6A43B]/20 shadow-xs dark:bg-[var(--mn-surface-elevated)]'
                      : 'border-[var(--mn-border)] bg-[var(--mn-page)] opacity-90 hover:opacity-100 dark:border-white/10 dark:bg-[var(--mn-surface-elevated)]'
                  }`}
                >
                  {/* Subtle right accent on unread items */}
                  {isUnread && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 right-0 w-[3px] bg-gradient-to-b from-[#E5B54F] via-[#D6A43B] to-[#B78622]"
                    />
                  )}

                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#142B5F] dark:bg-[#0c1a3b] border border-[#D6A43B]/30 flex items-center justify-center text-[#E5B54F] shrink-0">
                        <Bell className="w-4 h-4 text-[#E5B54F]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13.5px] font-bold leading-[1.5] text-[var(--mn-heading)] break-words font-['Cairo',sans-serif]">
                          {item.title}
                        </h4>
                        <div className="text-[11px] text-[var(--mn-text-muted)] mt-0.5 flex items-center gap-1 font-['Cairo',sans-serif]">
                          <Clock3 className="w-3 h-3 text-[var(--mn-text-muted)]" />
                          <time>{Number.isNaN(occurred.getTime()) ? '—' : occurred.toLocaleString('ar')}</time>
                        </div>
                      </div>
                    </div>

                    {isUnread ? (
                      <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 dark:text-teal-300">
                        غير مقروء
                      </span>
                    ) : (
                      <span className="rounded-full border border-[var(--mn-border)] bg-[var(--mn-surface)] px-2.5 py-0.5 text-[10.5px] font-semibold text-[var(--mn-text-muted)]">
                        مقروء
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 whitespace-pre-wrap break-words text-[12px] font-medium leading-[1.8] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
                    {item.message}
                  </p>

                  <div className="mt-3.5 pt-2.5 border-t border-[var(--mn-border)] dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-[12px] font-['Cairo',sans-serif]">
                    {isUnread ? (
                      <button
                        type="button"
                        disabled={Boolean(reading)}
                        onClick={() => void markRead(item.id)}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 py-1 text-[12px] font-bold text-[#142B5F] hover:border-[#D6A43B] transition-colors cursor-pointer disabled:opacity-50 dark:text-[#E5B54F]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A43B]" />
                        <span>{reading === item.id ? 'جارٍ الحفظ…' : 'تحديد كمقروء'}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--mn-text-muted)]">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>تم الاطلاع</span>
                      </span>
                    )}

                    {href && (
                      <Link
                        to={href}
                        className="ms-auto inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-[#142B5F] hover:bg-[#1a3675] px-3.5 py-1 text-[12px] font-bold text-white shadow-2xs transition-colors border border-[#D6A43B]/30 dark:bg-[#D6A43B] dark:text-[#142B5F]"
                      >
                        <span>عرض التفاصيل</span>
                        <ArrowUpLeft className="h-3.5 w-3.5 text-[#E5B54F] dark:text-[#142B5F]" />
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
