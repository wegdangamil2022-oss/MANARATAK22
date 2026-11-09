import { useTranslation as usePublicTemplateTranslation } from '../../../i18n/I18nProvider';
import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Clock3,
  FileCheck2,
  FileText,
  Newspaper,
  RotateCcw,
  Search,
  Tag,
  UserRound,
  X,
  Sparkles,
} from 'lucide-react';
import { PublicArticle } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { PublicFilterSelectModal } from './DetailUi';

type ArticleType = PublicArticle['contentType'];

const TYPE_STYLE: Record<ArticleType, { icon: React.ReactNode; label: string; className: string }> =
  {
    STUDY_GUIDE: {
      icon: <BookOpenText className="h-4 w-4" />,
      label: "public_study_guide",
      className:
        'bg-[var(--mn-surface-muted)] text-[var(--mn-link)] border-[var(--mn-border-brand)] mn-panel ',
    },
    ARTICLE: {
      icon: <Newspaper className="h-4 w-4" />,
      label: "public_article",
      className: 'bg-[var(--mn-page)] text-[var(--mn-text)] border-[var(--mn-border)] mn-panel ',
    },
    NEWS: {
      icon: <Clock3 className="h-4 w-4" />,
      label: "public_news",
      className:
        'bg-[var(--mn-gold-surface)] text-[var(--mn-accent-text)] border-[var(--mn-border-gold)] mn-panel ',
    },
    CHECKLIST: {
      icon: <FileCheck2 className="h-4 w-4" />,
      label: "public_checklist",
      className:
        'bg-[var(--mn-success-soft)] text-[var(--mn-success-text)] border-[var(--mn-success-border)]',
    },
    FAQ: {
      icon: <FileText className="h-4 w-4" />,
      label: "public_frequently_asked_questions",
      className: 'bg-[var(--mn-page)] text-[var(--mn-text)] border-[var(--mn-border)] mn-panel',
    },
    LANDING_PAGE: {
      icon: <FileText className="h-4 w-4" />,
      label: "public_landing_page",
      className:
        'bg-[var(--mn-surface-muted)] text-[var(--mn-text)] border-[var(--mn-border)] mn-panel',
    },
    STATIC_PAGE: {
      icon: <FileText className="h-4 w-4" />,
      label: "public_static_page",
      className:
        'bg-[var(--mn-surface-muted)] text-[var(--mn-text)] border-[var(--mn-border)] mn-panel',
    },
  };

const ARTICLE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'الكل' },
  { value: 'STUDY_GUIDE', label: 'أدلة' },
  { value: 'ARTICLE', label: 'مقالات' },
  { value: 'NEWS', label: 'أخبار' },
  { value: 'CHECKLIST', label: 'قوائم تحقق' },
] as const;

interface ArticlesSearchPageProps {
  articles: PublicArticle[];
  onBack?: () => void;
  onSelectArticle?: (article: PublicArticle) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const ArticlesSearchPage: React.FC<ArticlesSearchPageProps> = ({
  articles,
  onBack,
  onSelectArticle,
  favoriteIds = [],
  onToggleFavorite,
}) => {
  const { t: publicT, dir: publicDir } = usePublicTemplateTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | ArticleType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [activeFilterModal, setActiveFilterModal] = useState<'type' | 'category' | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((article) => {
      if (article.categoryAr) set.add(article.categoryAr);
    });
    return ['الكل', ...Array.from(set)];
  }, [articles]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return articles.filter((article) => {
      if (selectedType !== 'ALL' && article.contentType !== selectedType) return false;
      if (selectedCategory !== 'الكل' && article.categoryAr !== selectedCategory) return false;
      if (!q) return true;
      return [article.titleAr, article.titleEn, article.categoryAr, article.author]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [articles, searchQuery, selectedType, selectedCategory]);

  const activeFiltersCount =
    (selectedType !== 'ALL' ? 1 : 0) +
    (selectedCategory !== 'الكل' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedCategory('الكل');
  };

  const selectedTypeLabel =
    ARTICLE_FILTER_OPTIONS.find((item) => item.value === selectedType)?.label ?? 'الكل';

  return (
    <main
      dir={publicDir}
      className="min-h-screen bg-[var(--mn-page)] pb-16 font-['Cairo',sans-serif] mn-panel "
    >
      {/* ========================================================================= */}
      {/* HERO SECTION - UNIFIED NAVY-PETROL-TURQUOISE WITH SEPARATE FILTER TILES   */}
      {/* ========================================================================= */}
      <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-3 overflow-hidden shadow-xs mn-inverse ">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-8 h-8 bg-black/25 hover:bg-black/40 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-30 cursor-pointer text-white shadow-xs active:scale-95"
            aria-label={publicT('public_back')}
            title={publicT('public_back')}
          >
            <ChevronLeft className="w-4 h-4 rotate-180 text-white" />
          </button>
        )}

        {/* Background Decorative Gold Waves, Dot Grid & Silhouettes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-3 left-5 grid grid-cols-5 gap-1.5 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-[var(--mn-accent)] mn-gold " />
            ))}
          </div>
          <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full border border-[var(--mn-accent)]/25 pointer-events-none" />
          <div className="absolute -top-6 -left-6 w-72 h-72 rounded-full border border-[var(--mn-accent)]/15 pointer-events-none" />
          <svg
            className="absolute bottom-0 inset-x-0 w-full h-12 opacity-30"
            viewBox="0 0 500 80"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M-20,70 Q250,-20 520,70"
              stroke="var(--mn-accent)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="max-w-md sm:max-w-xl mx-auto text-center relative z-10 space-y-2 pt-1">
          <div className="flex justify-center">
            <Sparkles className="h-5 w-5 text-[var(--mn-accent-text)] drop-shadow-[0_0_8px_rgba(214,164,59,0.8)]" aria-hidden="true" />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white font-['Cairo',sans-serif] tracking-tight leading-tight">
              {publicT('public_articles_and_study_guides')}
            </h1>

            {/* Small Gold Horizontal Divider */}
            <div className="flex justify-center pt-1 pb-0.5">
              <div className="w-10 h-0.5 bg-[var(--mn-accent)] rounded-full mn-gold " />
            </div>

            <p className="text-[11px] sm:text-xs text-white font-medium font-['Cairo',sans-serif] leading-relaxed max-w-md mx-auto truncate">
              {publicT('public_practical_guides_and_editorial_articles_to_help_you')}
            </p>
          </div>

          <div className="pt-1 max-w-sm sm:max-w-md mx-auto px-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={publicT('public_search_by_article_title_or_topic')}
                className="w-full py-2.5 pl-4 pr-10 bg-[var(--mn-surface)] text-[var(--mn-heading)] rounded-full text-[12px] font-bold placeholder:text-[var(--mn-text-muted)] placeholder:text-[12px] placeholder:font-bold placeholder:font-['Cairo',sans-serif] focus:outline-none shadow-md border border-[var(--mn-border)] focus:border-[var(--mn-accent)] transition-all text-center font-['Cairo',sans-serif] mn-panel "
              />
              <Search className="w-4 h-4 text-[var(--mn-accent-text)] absolute right-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-[var(--mn-text-muted)] hover:text-[var(--mn-text)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex justify-center mt-2 relative z-10">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-[var(--mn-danger-text)] hover:text-[var(--mn-danger-text)] bg-[var(--mn-surface-elevated)]/95 px-2.5 py-0.5 rounded-full shadow-xs transition-colors flex items-center gap-1 cursor-pointer font-['Cairo',sans-serif] mn-panel "
            >
              <RotateCcw className="w-3 h-3" />
              <span>{publicT('public_reset_filters')}{activeFiltersCount})</span>
            </button>
          </div>
        )}

        {/* 2 SEPARATE FLOATING FILTER TILES INSIDE HERO */}
        <div className="max-w-lg mx-auto mn-inline-gutter mt-2.5 relative z-20 pb-0">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {/* Tile 1: نوع المحتوى */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveFilterModal('type');
                }
              }}
              onClick={() => setActiveFilterModal('type')}
              className="relative bg-[var(--mn-surface)] hover:bg-[var(--mn-surface-muted)] border-1.5 border-[#142B5F]/50 dark:border-[#D6A43B]/60 hover:border-[#142B5F] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all h-[58px] sm:h-[64px] cursor-pointer mn-panel font-['Cairo',sans-serif]"
              title="اختر نوع المحتوى"
            >
              <div className="flex items-center justify-center gap-1 text-[var(--mn-heading)] dark:text-[var(--mn-accent-soft)] font-bold text-[11px] sm:text-xs font-['Cairo',sans-serif] w-full">
                <BookOpenText className="w-3.5 h-3.5 text-[#142B5F] dark:text-[#D6A43B] shrink-0" />
                <span className="truncate font-['Cairo',sans-serif]">
                  {selectedType === 'ALL' ? 'نوع المحتوى' : publicT(selectedTypeLabel)}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--mn-text-muted)] dark:text-[var(--mn-accent-soft)] mt-0.5" />
            </div>

            {/* Tile 2: التصنيف المعرفي */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveFilterModal('category');
                }
              }}
              onClick={() => setActiveFilterModal('category')}
              className="relative bg-[var(--mn-surface)] hover:bg-[var(--mn-surface-muted)] border-1.5 border-[#142B5F]/50 dark:border-[#D6A43B]/60 hover:border-[#142B5F] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all h-[58px] sm:h-[64px] cursor-pointer mn-panel font-['Cairo',sans-serif]"
              title="اختر التصنيف"
            >
              <div className="flex items-center justify-center gap-1 text-[var(--mn-heading)] dark:text-[var(--mn-accent-soft)] font-bold text-[11px] sm:text-xs font-['Cairo',sans-serif] w-full">
                <Tag className="w-3.5 h-3.5 text-[#142B5F] dark:text-[#D6A43B] shrink-0" />
                <span className="truncate font-['Cairo',sans-serif]">
                  {selectedCategory === 'الكل' ? 'التصنيف المعرفي' : selectedCategory}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--mn-text-muted)] dark:text-[var(--mn-accent-soft)] mt-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Gold Divider Ribbon Line */}
      <div className="w-full h-0.5 bg-gradient-to-r from-[var(--mn-accent-text)] via-[var(--mn-accent-soft)] to-[var(--mn-accent-text)] shadow-xs mb-1" />

      <div className="relative z-10 mx-auto pt-3 max-w-xl space-y-3 mn-inline-gutter">
        <div className="flex items-center justify-between px-1 text-[10px] font-bold text-[var(--mn-text-muted)] sm:text-[11px]">
          <span>{filtered.length}{' '}{publicT('public_knowledge_resources')}</span>
          <span>{publicT('public_newest_first')}</span>
        </div>

        <section className="space-y-3">
          {filtered.map((article, index) => {
            const typeStyle = TYPE_STYLE[article.contentType];
            return (
              <article
                key={article.id}
                className="relative group overflow-hidden rounded-3xl border border-[#142B5F] dark:border-[#D6A43B]/60 hover:border-[#142B5F] bg-[var(--mn-surface)] shadow-sm transition hover:shadow-md mn-panel "
              >
                {onToggleFavorite && (
                  <FavoriteButton
                    active={favoriteIds.includes(article.id)}
                    onToggle={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(article.id);
                    }}
                    className="absolute left-3 top-3 z-20"
                  />
                )}
                <div className="grid grid-cols-[88px_1fr] gap-0 sm:grid-cols-[116px_1fr]">
                  <div className="relative min-h-[156px] overflow-hidden bg-gradient-to-br from-[var(--mn-primary)] via-[var(--mn-primary)] to-[var(--mn-primary)] p-3 text-white sm:min-h-[172px] mn-inverse ">
                    <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full border border-[var(--mn-border-gold)]" />
                    <div className="absolute -bottom-10 -right-8 h-24 w-24 rounded-full bg-[var(--mn-accent)]/10" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[var(--mn-accent-text)]">
                        {typeStyle.icon}
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-[var(--mn-accent-text)]">
                          MANARATAK
                        </span>
                        <span className="mt-0.5 block text-[9px] font-bold leading-4 text-[var(--mn-on-dark-muted)]">{publicT('public_knowledge_and_guidance')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 p-3 sm:p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${typeStyle.className}`}
                      >
                        {typeStyle.icon}
                        {article.contentTypeLabelAr}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mn-surface)] px-2 py-1 text-[9px] font-bold text-[var(--mn-accent-text)] mn-panel ">
                        <Tag className="h-2.5 w-2.5" />
                        {article.categoryAr}
                      </span>
                      {index === 0 && (
                        <span className="rounded-full bg-[var(--mn-primary)]/7 px-2 py-1 text-[9px] font-bold text-[var(--mn-heading)]">{publicT('public_featured')}</span>
                      )}
                    </div>

                    <h2 className="line-clamp-2 text-[13px] font-bold leading-6 text-[var(--mn-heading)] sm:text-[14px]">
                      {article.titleAr}
                    </h2>
                    <p
                      className="mt-0.5 line-clamp-1 text-left text-[9px] font-semibold text-[var(--mn-text-muted)]"
                      dir="ltr"
                    >
                      {article.titleEn}
                    </p>

                    {article.excerptAr && (
                      <p className="mt-2 line-clamp-2 text-[10px] font-medium leading-5 text-[var(--mn-text-muted)] sm:text-[11px]">
                        {article.excerptAr}
                      </p>
                    )}

                    {article.linkedEntities && article.linkedEntities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {article.linkedEntities.slice(0, 3).map((entity) => (
                          <span
                            key={`${entity.type}-${entity.name}`}
                            className="rounded-lg border border-[var(--mn-border-brand)] bg-[var(--mn-surface-muted)]/60 px-1.5 py-1 text-[8px] font-semibold text-[var(--mn-heading)]"
                          >
                            {entity.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--mn-border)] pt-2.5">
                      <div className="min-w-0 space-y-0.5 text-[8px] font-bold text-[var(--mn-text-muted)] sm:text-[9px]">
                        <span className="flex items-center gap-1 truncate">
                          <UserRound className="h-2.5 w-2.5" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-2.5 w-2.5" />
                          {article.updatedAt}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectArticle?.(article)}
                        className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl bg-[var(--mn-primary)] px-3 text-[10px] font-bold text-white shadow-sm transition hover:bg-[var(--mn-primary-hover)] active:scale-[0.99] mn-inverse hover:mn-inverse"
                      >{publicT('public_read_article')}<ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <PublicFilterSelectModal
        isOpen={activeFilterModal === 'type'}
        title="اختر نوع المحتوى"
        icon={BookOpenText}
        selectedValue={selectedType}
        onSelect={(val) => setSelectedType(val as 'ALL' | ArticleType)}
        onClose={() => setActiveFilterModal(null)}
        dir={publicDir}
        options={ARTICLE_FILTER_OPTIONS.map((item) => ({
          value: item.value,
          label: publicT(item.label),
        }))}
      />

      <PublicFilterSelectModal
        isOpen={activeFilterModal === 'category'}
        title="اختر التصنيف"
        icon={Tag}
        selectedValue={selectedCategory}
        onSelect={(val) => setSelectedCategory(val)}
        onClose={() => setActiveFilterModal(null)}
        dir={publicDir}
        options={categories.map((cat) => ({
          value: cat,
          label: cat === 'الكل' ? 'جميع التصنيفات' : cat,
        }))}
      />
    </main>
  );
};
