import { useTranslation as usePublicTemplateTranslation } from '../../../i18n/I18nProvider';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOverlayDialog } from '../useOverlayDialog';
import { PushNotificationItem } from '../types';
import {
  AlertTriangle,
  Bell,
  BellRing,
  BookOpen,
  Building2,
  ChevronLeft,
  Clock,
  GraduationCap,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

interface PushNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onTriggerTestPush: () => void;
  onSelectAction?: (actionType?: string, targetId?: string) => void;
  activeToast: PushNotificationItem | null;
  onDismissToast: () => void;
}

type NotificationFilter = 'all' | 'urgent' | 'opportunity' | 'deadline' | 'course';


const notificationTitle = (value: string) =>
  value.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s:–—-]+/u, '').trim();

const typeIcon = (notification: PushNotificationItem) => {
  if (notification.actionType === 'ai-tools' || notification.type === 'system') return Sparkles;
  if (notification.actionType === 'scholarship') return GraduationCap;
  if (notification.type === 'urgent') return AlertTriangle;
  if (notification.type === 'deadline') return Clock;
  if (notification.type === 'course') return BookOpen;
  if (notification.type === 'opportunity') return notification.title.includes('جامعة') ? Building2 : GraduationCap;
  return Bell;
};

const FILTERS: Array<{ id: NotificationFilter; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'all', label: "public_all", icon: Bell },
  { id: 'urgent', label: "public_urgent", icon: AlertTriangle },
  { id: 'opportunity', label: "public_opportunities", icon: GraduationCap },
  { id: 'deadline', label: "public_deadlines", icon: Clock },
  { id: 'course', label: "public_courses_2", icon: BookOpen },
];

export const PushNotificationCenter: React.FC<PushNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectAction,
  activeToast,
  onDismissToast,
}) => {
  const { t: publicT, dir: publicDir } = usePublicTemplateTranslation();

  useOverlayDialog(isOpen, onClose, 'mn-notification-dialog');
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const filteredNotifications = notifications.filter((notification) => filter === 'all' || notification.type === filter);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const listRef = useRef<HTMLDivElement | null>(null);
  const [scrollMeta, setScrollMeta] = useState({ thumbHeightPct: 35, thumbTopPct: 0, canScroll: true });

  const updateScrollIndicator = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 2) {
      setScrollMeta({ thumbHeightPct: 100, thumbTopPct: 0, canScroll: false });
      return;
    }
    const rawThumbPct = Math.max(22, Math.min(75, (clientHeight / scrollHeight) * 100));
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    const thumbTopPct = progress * (100 - rawThumbPct);
    setScrollMeta({ thumbHeightPct: rawThumbPct, thumbTopPct, canScroll: true });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(updateScrollIndicator, 40);
    return () => window.clearTimeout(timer);
  }, [isOpen, filter, filteredNotifications.length, updateScrollIndicator]);

  return (
    <>
      {activeToast && !isOpen && (() => {
        const ToastIcon = typeIcon(activeToast);
        return (
          <div id="instant-push-toast" className="fixed inset-x-2 top-3 z-[80] mx-auto max-w-md pointer-events-auto font-['Cairo',sans-serif]">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--mn-border-brand)] bg-[var(--mn-surface)] p-3.5 shadow-xl flex items-start gap-3 mn-panel">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2.5 bottom-2.5 right-0 w-[3.5px] rounded-l-full bg-[linear-gradient(180deg,#0E7C86_0%,#142B5F_100%)]"
              />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#142B5F] text-[#F2CD78] shadow-2xs">
                <ToastIcon className="h-4.5 w-4.5 text-[#F2CD78]" />
              </span>
              <button
                type="button"
                className="min-w-0 flex-1 text-start cursor-pointer"
                onClick={() => { onSelectAction?.(activeToast.actionType, activeToast.targetId); onDismissToast(); }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-bold text-[#0E7C86] dark:text-[#21A7B4]">{publicT('public_manaratak_instant_notification')}</span>
                  <span className="text-[10px] font-bold text-[var(--mn-text-muted)]">{activeToast.timestamp}</span>
                </div>
                <h4 className="mt-0.5 text-[12px] font-bold leading-snug text-[var(--mn-heading)]">{notificationTitle(activeToast.title)}</h4>
                <p className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-relaxed text-[var(--mn-text)]">{activeToast.body}</p>
              </button>
              <button
                type="button"
                onClick={onDismissToast}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--mn-text-muted)] hover:bg-[var(--mn-page)] cursor-pointer"
                aria-label={publicT('public_close_notification')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {isOpen && (
        <div
          role="presentation"
          tabIndex={-1}
          onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
          onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
          className="fixed inset-0 z-[80] flex items-start justify-center pt-2 sm:pt-7 pb-4 px-2.5 sm:px-4 bg-black/55 backdrop-blur-xs font-['Cairo',sans-serif]"
          dir={publicDir}
        >
          <div
            id="mn-notification-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={publicT('public_notification_center')}
            tabIndex={-1}
            className="flex max-h-[88vh] w-full max-w-md md:max-w-[560px] flex-col overflow-hidden rounded-2xl border border-[var(--mn-border-brand)] bg-[var(--mn-page)] shadow-2xl transition-all mn-panel"
          >
            {/* Header with Navy-to-Petrol Gradient */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 bg-gradient-to-br from-[#142B5F] via-[#153B75] to-[#0E7C86] text-white border-b border-white/15">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/25 text-white shadow-2xs">
                  <BellRing className="h-4.5 w-4.5 text-white" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-[14px] sm:text-[15px] font-extrabold text-white leading-tight">
                      {publicT('public_notification_center')}
                    </h2>
                    {unreadCount > 0 && (
                      <span className="rounded-lg bg-white/15 border border-white/25 px-2 py-0.5 text-[10.5px] font-bold text-white">
                        {unreadCount} {publicT('public_new')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-white/85 font-bold mt-0.5 truncate">
                    {publicT('public_scholarships_universities_courses_and_important_deadlines')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="px-2.5 py-1 rounded-lg bg-white/12 hover:bg-white/20 border border-white/20 text-[10px] font-bold text-white transition cursor-pointer"
                  >
                    قراءة الكل
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSoundEnabled((value) => !value)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
                  aria-label={soundEnabled ? publicT('public_mute_notifications') : publicT('public_enable_notification_sound')}
                  title={soundEnabled ? publicT('public_notification_sound_enabled') : publicT('public_notification_sound_muted')}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-white" /> : <VolumeX className="h-4 w-4 text-white/75" />}
                </button>
                <button
                  type="button"
                  aria-label={publicT('public_close')}
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Filter Tabs - Clean Navy/Petrol & White pills */}
            <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto border-b border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-2.5 hide-scrollbar">
              {FILTERS.map((item) => {
                const Icon = item.icon;
                const isSelected = filter === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    aria-pressed={isSelected}
                    className={`inline-flex shrink-0 h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-[11px] font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white border-[#142B5F] shadow-2xs'
                        : 'bg-[var(--mn-page)] text-[var(--mn-heading)] border-[var(--mn-border)] hover:border-[#0E7C86]/50'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-[#0E7C86] dark:text-[#21A7B4]'}`} />
                    <span>{publicT(item.label)}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Notifications List with visible right-side scroll bar */}
            <div className="relative flex-1 min-h-0 flex">
              {/* خط السحب المرئي في الجانب الأيمن */}
              {scrollMeta.canScroll && filteredNotifications.length > 0 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3 bottom-3 right-1.5 w-[5px] rounded-full bg-[#142B5F]/15 dark:bg-white/15 z-20 overflow-hidden"
                >
                  <div
                    className="absolute inset-x-0 rounded-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86] dark:from-[#F2CD78] dark:to-[#0E7C86] transition-all duration-75"
                    style={{
                      height: `${scrollMeta.thumbHeightPct}%`,
                      top: `${scrollMeta.thumbTopPct}%`,
                    }}
                  />
                </div>
              )}

              <div
                ref={listRef}
                onScroll={updateScrollIndicator}
                className="flex-1 max-h-[54vh] sm:max-h-[58vh] space-y-2.5 overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar pr-4 pl-3 py-3 sm:pr-5 sm:pl-4 sm:py-4"
              >
                {filteredNotifications.length === 0 ? (
                  <div className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] py-12 px-4 text-center text-xs text-[var(--mn-text-muted)] font-bold">
                    {publicT('public_there_are_currently_no_notifications_in_this_category')}
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const Icon = typeIcon(notification);
                    const isUnread = !notification.read;
                    return (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => {
                          onMarkAsRead(notification.id);
                          if (notification.actionType) {
                            onSelectAction?.(notification.actionType, notification.targetId);
                            onClose();
                          }
                        }}
                        className={`w-full rounded-xl border p-2.5 sm:p-3 pr-3.5 text-start transition-all cursor-pointer relative overflow-hidden group bg-[var(--mn-surface)] shadow-2xs space-y-1.5 ${
                          isUnread
                            ? 'border-[#0E7C86]/45'
                            : 'border-[var(--mn-border)] hover:border-[#0E7C86]/40'
                        }`}
                      >
                        {/* خط الجانب الأيمن على جميع بطاقات الإشعارات */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute top-2 bottom-2 right-0 w-[3.5px] rounded-l-full bg-[linear-gradient(180deg,#0E7C86_0%,#0E7C86_70%,#142B5F_100%)]"
                        />

                        {/* Top Row: Navy Icon with Gold inside + Title (no dot before it) + Timestamp */}
                        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[var(--mn-border)]/80">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-7.5 w-7.5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-[#142B5F] text-[#F2CD78] shadow-2xs">
                              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F2CD78]" />
                            </span>
                            <h4 className="text-[11.5px] sm:text-[12px] font-bold leading-snug text-[var(--mn-heading)] group-hover:text-[#0E7C86] transition-colors truncate">
                              {notificationTitle(notification.title)}
                            </h4>
                          </div>
                          <span className="shrink-0 rounded-md bg-[var(--mn-page)] border border-[var(--mn-border)] px-1.5 py-0.5 text-[9.5px] font-bold text-[var(--mn-text-muted)]">
                            {notification.timestamp}
                          </span>
                        </div>

                        {/* Body Text on the right + Raised Compact View Details button on the bottom-left (no empty space on the right) */}
                        <div className="flex items-end justify-between gap-2 w-full">
                          <p className="flex-1 min-w-0 text-[10.5px] sm:text-[11px] font-bold leading-[1.7] text-[var(--mn-text)] text-start">
                            {notification.body}
                          </p>

                          {notification.actionType && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-[#142B5F] px-2 py-1 !text-[9.5px] sm:!text-[10px] !leading-none font-bold text-[#F2CD78] shadow-2xs group-hover:opacity-95 transition-all mb-0.5">
                              <span>{publicT('public_view_details')}</span>
                              <ChevronLeft className="h-2.5 w-2.5 text-[#F2CD78]" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
