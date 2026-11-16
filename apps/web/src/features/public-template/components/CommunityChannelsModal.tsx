import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation as usePublicTemplateTranslation } from '../../../i18n/I18nProvider';
import { useOverlayDialog } from '../useOverlayDialog';
import {
  ArrowUpLeft,
  Compass,
  Globe,
  GraduationCap,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Send,
  X,
} from 'lucide-react';

interface CommunityChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChannelCategoryFilter =
  | 'all'
  | 'whatsapp-channels'
  | 'telegram-channels'
  | 'telegram-groups'
  | 'whatsapp-groups';

interface CommunityChannelItem {
  id: string;
  category: Exclude<ChannelCategoryFilter, 'all'>;
  platform: 'whatsapp' | 'telegram';
  kind: 'channel' | 'group';
  title: string;
  flag?: string;
  isPostgrad?: boolean;
  url: string;
}

const COMMUNITY_CHANNELS: CommunityChannelItem[] = [
  // أولاً: قنوات المنح الدراسية – واتساب (3)
  {
    id: 'wa-ch-official',
    category: 'whatsapp-channels',
    platform: 'whatsapp',
    kind: 'channel',
    title: 'القناة الرسمية للمنح الدراسية',
    url: 'https://whatsapp.com/channel/0029VaGWhVm7DAWsfEJacd2m',
  },
  {
    id: 'wa-ch-china',
    category: 'whatsapp-channels',
    platform: 'whatsapp',
    kind: 'channel',
    title: 'القناة الرسمية للمنح الدراسية في الصين',
    flag: '🇨🇳',
    url: 'https://whatsapp.com/channel/0029Vb6q3JE2v1InIv8ow63M',
  },
  {
    id: 'wa-ch-europe',
    category: 'whatsapp-channels',
    platform: 'whatsapp',
    kind: 'channel',
    title: 'قناة المنح الدراسية في أوروبا',
    flag: '🇪🇺',
    url: 'https://whatsapp.com/channel/0029VbCLqxFI1rcjndPJ021t',
  },

  // ثانياً: قنوات المنح الدراسية – تليجرام (6)
  {
    id: 'tg-ch-official',
    category: 'telegram-channels',
    platform: 'telegram',
    kind: 'channel',
    title: 'القناة الرسمية للمنح الدراسية',
    url: 'https://t.me/UUOOOOOOUU',
  },
  {
    id: 'tg-ch-china',
    category: 'telegram-channels',
    platform: 'telegram',
    kind: 'channel',
    title: 'القناة الرسمية للمنح الدراسية في الصين',
    flag: '🇨🇳',
    url: 'https://t.me/StudyinChiiina2026',
  },
  {
    id: 'tg-ch-china-bachelor',
    category: 'telegram-channels',
    platform: 'telegram',
    kind: 'channel',
    title: 'قناة منح البكالوريوس في الصين',
    flag: '🇨🇳',
    url: 'https://t.me/chineseuniversitiess',
  },
  {
    id: 'tg-ch-europe',
    category: 'telegram-channels',
    platform: 'telegram',
    kind: 'channel',
    title: 'قناة المنح الدراسية في أوروبا',
    flag: '🇪🇺',
    url: 'https://t.me/UUOOOOOOUO',
  },
  {
    id: 'tg-ch-postgrad',
    category: 'telegram-channels',
    platform: 'telegram',
    kind: 'channel',
    title: 'قناة المنح الدراسية للدراسات العليا',
    isPostgrad: true,
    url: 'https://t.me/UU22UUU2',
  },
  {
    id: 'tg-ch-csca',
    category: 'telegram-channels',
    platform: 'telegram',
    kind: 'channel',
    title: 'قناة اختبار CSCA للقبول بالجامعات الصينية',
    flag: '🇨🇳',
    url: 'https://t.me/cscaexami',
  },

  // ثالثاً: قروبات مناقشة المنح الدراسية – تليجرام (8)
  {
    id: 'tg-grp-china',
    category: 'telegram-groups',
    platform: 'telegram',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في الصين',
    flag: '🇨🇳',
    url: 'https://t.me/studychina26',
  },
  {
    id: 'tg-grp-europe',
    category: 'telegram-groups',
    platform: 'telegram',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في أوروبا',
    flag: '🇪🇺',
    url: 'https://t.me/StudyinEurope3',
  },
  {
    id: 'tg-grp-turkey',
    category: 'telegram-groups',
    platform: 'telegram',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في تركيا',
    flag: '🇹🇷',
    url: 'https://t.me/Ul_Ul_lU',
  },
  {
    id: 'tg-grp-russia',
    category: 'telegram-groups',
    platform: 'telegram',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في روسيا',
    flag: '🇷🇺',
    url: 'https://t.me/UU2UUUU2',
  },
  {
    id: 'tg-grp-saudi',
    category: 'telegram-groups',
    platform: 'telegram',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في السعودية',
    flag: '🇸🇦',
    url: 'https://t.me/StudyinSaudiArabia2',
  },
  {
    id: 'tg-grp-iraq',
    category: 'telegram-groups',
    platform: 'telegram',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في العراق',
    flag: '🇮🇶',
    url: 'https://t.me/StudyinIraq2026',
  },
  {
    id: 'tg-grp-indonesia',
    category: 'telegram-groups',
    platform: 'telegram',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في إندونيسيا',
    flag: '🇮🇩',
    url: 'https://t.me/studyinindonesia2',
  },
  {
    id: 'tg-grp-yemen',
    category: 'telegram-groups',
    platform: 'telegram',
    kind: 'group',
    title: 'قروب مناقشة منح التبادل الثقافي في اليمن',
    flag: '🇾🇪',
    url: 'https://t.me/UUU202UUU',
  },

  // رابعاً: قروبات مناقشة المنح الدراسية – واتساب (5)
  {
    id: 'wa-grp-china',
    category: 'whatsapp-groups',
    platform: 'whatsapp',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في الصين',
    flag: '🇨🇳',
    url: 'https://chat.whatsapp.com/JwaVKH7Wn787HeD0nQC8rC',
  },
  {
    id: 'wa-grp-turkey',
    category: 'whatsapp-groups',
    platform: 'whatsapp',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في تركيا',
    flag: '🇹🇷',
    url: 'https://chat.whatsapp.com/DKegN0GqZJl4FhfdALBXME',
  },
  {
    id: 'wa-grp-russia',
    category: 'whatsapp-groups',
    platform: 'whatsapp',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في روسيا',
    flag: '🇷🇺',
    url: 'https://chat.whatsapp.com/DyBi0MBVkX95kga3LPCy2b',
  },
  {
    id: 'wa-grp-yemen',
    category: 'whatsapp-groups',
    platform: 'whatsapp',
    kind: 'group',
    title: 'قروب مناقشة منح التبادل الثقافي في اليمن',
    flag: '🇾🇪',
    url: 'https://chat.whatsapp.com/CcpkW8SrhjJEdWiSPtOcXk',
  },
  {
    id: 'wa-grp-iraq',
    category: 'whatsapp-groups',
    platform: 'whatsapp',
    kind: 'group',
    title: 'قروب مناقشة المنح الدراسية في العراق',
    flag: '🇮🇶',
    url: 'https://chat.whatsapp.com/JvHhhfi9OkfA1OhnhEQUq9',
  },
];

const CATEGORY_SECTIONS: Array<{
  id: Exclude<ChannelCategoryFilter, 'all'>;
  title: string;
  badge: string;
}> = [
  {
    id: 'whatsapp-channels',
    title: 'أولاً: قنوات المنح الدراسية – واتساب',
    badge: '3 قنوات',
  },
  {
    id: 'telegram-channels',
    title: 'ثانياً: قنوات المنح الدراسية – تليجرام',
    badge: '6 قنوات',
  },
  {
    id: 'telegram-groups',
    title: 'ثالثاً: قروبات مناقشة المنح الدراسية – تليجرام',
    badge: '8 قروبات',
  },
  {
    id: 'whatsapp-groups',
    title: 'رابعاً: قروبات مناقشة المنح الدراسية – واتساب',
    badge: '5 قروبات',
  },
];

const FILTERS: Array<{
  id: ChannelCategoryFilter;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'all', label: 'الكل', count: 22, icon: Compass },
  { id: 'whatsapp-channels', label: 'قنوات واتساب', count: 3, icon: Megaphone },
  { id: 'telegram-channels', label: 'قنوات تليجرام', count: 6, icon: Send },
  { id: 'telegram-groups', label: 'قروبات تليجرام', count: 8, icon: MessagesSquare },
  { id: 'whatsapp-groups', label: 'قروبات واتساب', count: 5, icon: MessageCircle },
];

export const CommunityChannelsModal: React.FC<CommunityChannelsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { dir: publicDir } = usePublicTemplateTranslation();
  useOverlayDialog(isOpen, onClose, 'mn-channels-dialog');

  const [filter, setFilter] = useState<ChannelCategoryFilter>('all');
  const filteredItems = COMMUNITY_CHANNELS.filter(
    (item) => filter === 'all' || item.category === filter,
  );

  const listRef = useRef<HTMLDivElement | null>(null);
  const [scrollMeta, setScrollMeta] = useState({
    thumbHeightPct: 28,
    thumbTopPct: 0,
    canScroll: true,
  });

  const updateScrollIndicator = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 2) {
      setScrollMeta({ thumbHeightPct: 100, thumbTopPct: 0, canScroll: false });
      return;
    }
    const rawThumbPct = Math.max(20, Math.min(75, (clientHeight / scrollHeight) * 100));
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    const thumbTopPct = progress * (100 - rawThumbPct);
    setScrollMeta({ thumbHeightPct: rawThumbPct, thumbTopPct, canScroll: true });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
    const timer = window.setTimeout(updateScrollIndicator, 40);
    return () => window.clearTimeout(timer);
  }, [isOpen, filter, filteredItems.length, updateScrollIndicator]);

  if (!isOpen) return null;

  const renderSquareTile = (item: CommunityChannelItem) => {
    const TypeIcon = item.kind === 'channel' ? Megaphone : MessagesSquare;
    const platformName = item.platform === 'whatsapp' ? 'واتساب' : 'تليجرام';

    return (
      <a
        key={item.id}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col justify-between rounded-2xl border border-[var(--mn-border)] hover:border-[#0E7C86] bg-[var(--mn-surface)] p-3 sm:p-3.5 min-h-[118px] sm:min-h-[124px] shadow-2xs hover:shadow-md transition-all cursor-pointer overflow-hidden"
      >
        {/* شريط علوي نيلي بترولي يمنح المربع هوية بصرية جذابة */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[3.5px] bg-gradient-to-l from-[#142B5F] via-[#0E7C86] to-[#142B5F]"
        />

        {/* الصف العلوي داخل المربع: أيقونة نيلي بداخلها ذهبي + علم الدولة فقط بدون نص */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#142B5F] text-[#F2CD78] shadow-2xs group-hover:scale-105 transition-transform">
            <TypeIcon className="h-4 w-4 text-[#F2CD78]" />
          </span>

          {item.flag ? (
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#142B5F]/6 dark:bg-white/10 border border-[#142B5F]/12 dark:border-white/15 text-[15px] leading-none shadow-2xs"
            >
              {item.flag}
            </span>
          ) : item.isPostgrad ? (
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#142B5F]/6 dark:bg-white/10 border border-[#142B5F]/12 dark:border-white/15 text-[#142B5F] dark:text-[#F2CD78]"
            >
              <GraduationCap className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#142B5F]/6 dark:bg-white/10 border border-[#142B5F]/12 dark:border-white/15 text-[#0E7C86] dark:text-[#21A7B4]"
            >
              <Globe className="h-3.5 w-3.5" />
            </span>
          )}
        </div>

        {/* وسط المربع: اسم القناة أو القروب فقط بخط بارز وواضح */}
        <h4 className="my-2 text-[11.5px] sm:text-[12.5px] font-extrabold leading-[1.45] text-[var(--mn-heading)] group-hover:text-[#0E7C86] transition-colors text-start line-clamp-2">
          {item.title}
        </h4>

        {/* أسفل المربع: المنصة + زر "انضم" المختصر */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[var(--mn-border)]/70">
          <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-bold text-[var(--mn-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0E7C86]" />
            <span>{platformName}</span>
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#142B5F] px-2.5 py-1 text-[10px] leading-none font-extrabold text-[#F2CD78] shadow-2xs group-hover:bg-[#0E7C86] group-hover:text-white transition-colors">
            <span>انضم</span>
            <ArrowUpLeft className="h-3 w-3" />
          </span>
        </div>
      </a>
    );
  };

  return (
    <div
      role="presentation"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-start justify-center pt-2 sm:pt-7 pb-4 px-2.5 sm:px-4 bg-black/55 backdrop-blur-xs font-['Cairo',sans-serif]"
      dir={publicDir}
    >
      <div
        id="mn-channels-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="قنوات ومجتمعات منارتك"
        tabIndex={-1}
        className="flex max-h-[88vh] w-full max-w-md md:max-w-[580px] flex-col overflow-hidden rounded-2xl border border-[var(--mn-border-brand)] bg-[var(--mn-page)] shadow-2xl transition-all mn-panel"
      >
        {/* القسم الأعلى: الهيدر النيلي البترولي */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 bg-gradient-to-br from-[#142B5F] via-[#153B75] to-[#0E7C86] text-white border-b border-white/15">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/25 text-white shadow-2xs">
              <Megaphone className="h-4.5 w-4.5 text-white" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[14px] sm:text-[15px] font-extrabold text-white leading-tight">
                  قنوات ومجتمعات منارتك
                </h2>
                <span className="rounded-lg bg-white/15 border border-white/25 px-2 py-0.5 text-[10.5px] font-bold text-white">
                  22 قناة وقروب
                </span>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-white/85 font-bold mt-0.5 truncate">
                القنوات الرسمية وقروبات النقاش عبر واتساب وتليجرام
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              aria-label="إغلاق"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* شريط التبويبات العلوي السريع */}
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
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isSelected ? 'text-white' : 'text-[#0E7C86] dark:text-[#21A7B4]'
                  }`}
                />
                <span>{item.label}</span>
                <span
                  className={`rounded-md px-1.5 py-0.2 text-[9.5px] font-extrabold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#142B5F]/8 dark:bg-white/10 text-[#142B5F] dark:text-[#F2CD78]'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* شبكة المربعات القابلة للسحب مع خط السحب الجانبي الأيمن */}
        <div className="relative flex-1 min-h-0 flex">
          {scrollMeta.canScroll && filteredItems.length > 0 && (
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
            className="flex-1 max-h-[56vh] sm:max-h-[60vh] overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar pr-4 pl-3 py-3.5 sm:pr-5 sm:pl-4 sm:py-4"
          >
            {filter === 'all' ? (
              <div className="space-y-4">
                {CATEGORY_SECTIONS.map((section) => {
                  const sectionItems = COMMUNITY_CHANNELS.filter(
                    (item) => item.category === section.id,
                  );
                  return (
                    <div key={section.id} className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#142B5F] dark:bg-[#F2CD78]" />
                          <h3 className="text-[11.5px] sm:text-[12px] font-extrabold text-[var(--mn-heading)]">
                            {section.title}
                          </h3>
                        </div>
                        <span className="rounded-md bg-[#142B5F]/8 dark:bg-white/10 px-2 py-0.5 text-[9.5px] font-bold text-[#142B5F] dark:text-[#F2CD78]">
                          {section.badge}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        {sectionItems.map((item) => renderSquareTile(item))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {filteredItems.map((item) => renderSquareTile(item))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
