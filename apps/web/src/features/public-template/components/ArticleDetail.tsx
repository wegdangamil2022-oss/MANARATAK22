import React from 'react';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Heart,
  Info,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { GOLDEN_ARTICLES, GoldenArticleRecord } from '../data/articleData';
import type { PublicArticle } from '../types';
import { DetailBackButton, DetailSectionHeader } from './DetailUi';
import { CulturalExchangeArticleContent } from './CulturalExchangeArticleContent';

interface ArticleDetailProps {
  article?: PublicArticle;
  articleId?: string;
  articleSlug?: string;
  searchAnchor?: string;
  searchTerm?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onBack: () => void;
  onSelectRelated?: (slug: string) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onOpenScholarship?: (id: string) => void;
  onOpenUniversity?: (id: string) => void;
  onOpenCountry?: (id: string) => void;
  onOpenMajor?: (id: string) => void;
  onOpenExam?: (id: string) => void;
  onOpenCourse?: (id: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article: propArticle,
  articleId,
  articleSlug,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectRelated,
  isSaved = false,
  onToggleSave,
}) => {
  const targetId = propArticle?.id || articleId;
  const targetSlug = propArticle?.slug || articleSlug;
  const article: GoldenArticleRecord | PublicArticle =
    GOLDEN_ARTICLES.find(
      (a) => a.id === targetId || a.slug === targetSlug,
    ) ||
    propArticle ||
    GOLDEN_ARTICLES[0];

  const savedState = isFavorite ?? isSaved;
  const handleToggleBookmark = onToggleFavorite || onToggleSave;

  const isCulturalExchange =
    article.id === 'art_cultural_exchange' ||
    article.slug === 'yemen-cultural-exchange-scholarships-guide';

  const relatedArticles = GOLDEN_ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

  const subtitleEn =
    'titleEn' in article && article.titleEn
      ? article.titleEn
      : isCulturalExchange
        ? 'Comprehensive Guide to Cultural Exchange Scholarships & Differentiation Exam'
        : 'Official Academic & Scholarship Guide';

  const authorityAr = isCulturalExchange
    ? 'وزارة التعليم العالي والبحث العلمي — قطاع البعثات والعلاقات الثقافية'
    : `${article.authorNameAr} — ${article.authorRoleAr}`;

  const authorityEn = isCulturalExchange
    ? 'Ministry of Higher Education & Scientific Research - Cultural Exchange Sector'
    : 'Official Academic Editorial & Verification Team';

  return (
    <div
      className="w-full max-w-md mx-auto pt-0 pb-12 text-start font-['Cairo',sans-serif] animate-in fade-in duration-200 bg-[var(--mn-surface-muted)] min-h-screen mn-panel mn-scholarship-detail"
      dir="rtl"
    >
      {/* 1. TOP HERO CONTAINER (Compact horizontal layout matching ScholarshipDetailModal, UniversityDetailModal & MajorDetailModal) */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute top-2 left-2 z-30 flex flex-col items-center gap-1.5 scale-80 origin-top-left">
          <DetailBackButton onBack={onBack} mode="back" />
          {handleToggleBookmark && (
            <button
              type="button"
              onClick={() => handleToggleBookmark(article.id)}
              className="mn-detail-close transition-all active:scale-95 cursor-pointer"
              aria-label={savedState ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              title={savedState ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  savedState
                    ? 'fill-[#0E7C86] text-[#0E7C86] dark:fill-[#38C6D4] dark:text-[#38C6D4]'
                    : 'text-[var(--mn-heading)]'
                }`}
              />
            </button>
          )}
        </div>

        {/* SVG background with vibrant 3-stop navy-to-petrol gradient and subtle gold waves */}
        <div className="relative w-full h-[115px] sm:h-[120px]">
          <svg
            viewBox="0 0 500 115"
            preserveAspectRatio="none"
            className="w-full h-full absolute inset-0 block"
          >
            <defs>
              <linearGradient id="articleHeroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#142B5F" />
                <stop offset="52%" stopColor="#153B75" />
                <stop offset="100%" stopColor="#0E7C86" />
              </linearGradient>
            </defs>

            {/* Main base background */}
            <path d="M 0,0 L 500,0 L 500,90 Q 250,112 0,90 Z" fill="url(#articleHeroGrad)" />

            {/* Decorative Gold Waves */}
            <g opacity="0.25">
              <path
                d="M -50,30 Q 120,-10 260,35 T 550,20"
                stroke="var(--mn-accent)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M -30,60 Q 150,20 320,55 T 560,35"
                stroke="var(--mn-accent)"
                strokeWidth="1"
                fill="none"
              />

              {/* Gold Sparkle Dots */}
              <circle cx="35" cy="25" r="1.5" fill="var(--mn-accent)" />
              <circle cx="50" cy="18" r="1" fill="var(--mn-accent)" />
              <circle cx="42" cy="38" r="1.2" fill="var(--mn-accent)" />
              <circle cx="445" cy="22" r="1.5" fill="var(--mn-accent)" />
              <circle cx="460" cy="35" r="1" fill="var(--mn-accent)" />
              <circle cx="430" cy="42" r="1.2" fill="var(--mn-accent)" />
            </g>

            {/* Gold accent border following the bottom curve */}
            <path
              d="M 0,90 Q 250,112 500,90"
              fill="none"
              stroke="var(--mn-accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>

          {/* Hero Content: Horizontal Row (Glowing Gold Emblem Right -> Arrow -> Title Left) */}
          <div
            className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 pt-1 pb-4 z-10"
            dir="rtl"
          >
            {/* Right Side: Official Logo/Emblem Pairing (Navy + Gold) + Interactive Arrow */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-11 h-11 rounded-full border-2 border-[#F2CD78] flex items-center justify-center p-1.5 shadow-[0_0_12px_rgba(214,164,59,0.45)] bg-gradient-to-br from-[#142B5F] to-[#0E7C86] shrink-0">
                <BookOpen className="w-5 h-5 text-[#F2CD78]" />
              </div>

              <ArrowLeft className="w-4 h-4 text-[#F2CD78] shrink-0 opacity-95 drop-shadow-[0_0_4px_rgba(214,164,59,0.4)]" />
            </div>

            {/* Left Side (in RTL): Article Title & English Subtitle */}
            <div className="flex flex-col text-start min-w-0 flex-1 pr-1.5 pl-8">
              <h1 className="text-[13.5px] sm:text-[14.5px] font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
                {article.titleAr}
              </h1>
              <p
                className="text-[10px] sm:text-[10.5px] font-bold text-[#F2CD78] font-['Cairo',sans-serif] mt-0.5 tracking-wider truncate"
                dir="ltr"
              >
                {subtitleEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-0 space-y-2.5 z-20 relative -mt-2.5 sm:-mt-3">
        {/* 2. AUTHORITY / EDITORIAL CARD */}
        <div
          className="relative w-full bg-[var(--mn-surface)] rounded-none py-3.5 px-3.5 sm:px-4 border-y border-[var(--mn-border)] shadow-md shadow-[var(--mn-shadow-ink)]/60 flex items-center gap-3 overflow-hidden mn-panel"
          dir="rtl"
        >
          {/* Top Navy / Gold Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#142B5F] dark:via-[#D6A43B] to-transparent" />

          {/* Navy Circle with Gold Building Icon */}
          <div className="w-9 h-9 rounded-full bg-[#142B5F] flex items-center justify-center shrink-0 shadow-xs border border-[#D6A43B]/75">
            <Building2 className="w-4 h-4 text-[#F2CD78]" />
          </div>

          {/* Vertical Divider Line */}
          <div className="w-[1.5px] h-7 bg-[var(--mn-border)] shrink-0 rounded-full" />

          {/* Authority Text */}
          <div className="space-y-0.5 min-w-0 flex-1 text-start">
            <h2 className="text-[11px] sm:text-xs font-bold text-[var(--mn-heading)] leading-tight">
              {authorityAr}
            </h2>
            <p className="text-[9px] font-medium text-[var(--mn-text-muted)] font-['Cairo',sans-serif] truncate">
              {authorityEn}
            </p>
          </div>
        </div>

        {/* 3. 2-COLUMN X 2-ROW QUICK INFO GRID WITH DIAMOND CONNECTORS */}
        <div className="px-2 sm:px-2.5 space-y-2 pt-0.5" dir="rtl">
          {/* ROW 1: تصنيف المقال | نطاق الدليل */}
          <div className="flex items-center gap-2">
            {/* Right Card: تصنيف المقال */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[var(--mn-border)] shadow-sm flex items-center gap-2 min-w-0 mn-panel">
              <div className="w-8 h-8 rounded-full bg-[#142B5F]/10 border-2 border-[#142B5F] text-[#142B5F] dark:bg-[#F2CD78]/15 dark:border-[#F2CD78] dark:text-[#F2CD78] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-current" />
              </div>
              <div className="flex flex-col min-w-0 text-start flex-1">
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--mn-heading)] leading-tight truncate">
                  تصنيف الدليل
                </span>
                <span className="text-[9.5px] font-bold text-[var(--mn-text-muted)] leading-tight truncate mt-0.5">
                  {article.categoryAr}
                </span>
              </div>
            </div>

            {/* Diamond Connector */}
            <div className="w-1.5 h-1.5 rotate-45 bg-[#D6A43B] shadow-[0_0_5px_rgba(214,164,59,0.5)] shrink-0" />

            {/* Left Card: نطاق الدليل */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[var(--mn-border)] shadow-sm flex items-center gap-2 min-w-0 mn-panel">
              <div className="w-8 h-8 rounded-full bg-[#142B5F]/10 border-2 border-[#142B5F] text-[#142B5F] dark:bg-[#F2CD78]/15 dark:border-[#F2CD78] dark:text-[#F2CD78] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-current" />
              </div>
              <div className="flex flex-col min-w-0 text-start flex-1">
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--mn-heading)] leading-tight truncate">
                  الدولة / النطاق
                </span>
                <span className="text-[9.5px] font-bold text-[var(--mn-text-muted)] leading-tight truncate mt-0.5">
                  {article.countryAr}
                </span>
              </div>
            </div>
          </div>

          {/* ROW 2: وقت القراءة | آخر تحديث */}
          <div className="flex items-center gap-2">
            {/* Right Card: وقت القراءة */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[var(--mn-border)] shadow-sm flex items-center gap-2 min-w-0 mn-panel">
              <div className="w-8 h-8 rounded-full bg-[#142B5F]/10 border-2 border-[#142B5F] text-[#142B5F] dark:bg-[#F2CD78]/15 dark:border-[#F2CD78] dark:text-[#F2CD78] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-current" />
              </div>
              <div className="flex flex-col min-w-0 text-start flex-1">
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--mn-heading)] leading-tight truncate">
                  وقت القراءة
                </span>
                <span className="text-[9.5px] font-bold text-[var(--mn-text-muted)] leading-tight truncate mt-0.5">
                  {article.readingTime}
                </span>
              </div>
            </div>

            {/* Diamond Connector */}
            <div className="w-1.5 h-1.5 rotate-45 bg-[#D6A43B] shadow-[0_0_5px_rgba(214,164,59,0.5)] shrink-0" />

            {/* Left Card: آخر تحديث */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[var(--mn-border)] shadow-sm flex items-center gap-2 min-w-0 mn-panel">
              <div className="w-8 h-8 rounded-full bg-[#142B5F]/10 border-2 border-[#142B5F] text-[#142B5F] dark:bg-[#F2CD78]/15 dark:border-[#F2CD78] dark:text-[#F2CD78] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-current" />
              </div>
              <div className="flex flex-col min-w-0 text-start flex-1">
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--mn-heading)] leading-tight truncate">
                  تاريخ التحديث
                </span>
                <span className="text-[9.5px] font-bold text-[var(--mn-text-muted)] leading-tight truncate mt-0.5">
                  {article.updatedAt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. MAIN CONTENT SECTIONS */}
        <div className="px-2 sm:px-2.5 space-y-3 pt-1">
          {/* Key Takeaways Card (أبرز النقاط الجوهرية في هذا الدليل) */}
          {article.keyTakeawaysAr && article.keyTakeawaysAr.length > 0 && (
            <div className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3">
              <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
              <DetailSectionHeader
                icon={Sparkles}
                title="أبرز المحاور والنقاط الجوهرية في هذا الدليل"
                className="mb-1"
              />
              <div className="grid grid-cols-1 gap-2">
                {article.keyTakeawaysAr.map((point, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 pr-4 flex items-start gap-2.5 shadow-2xs"
                  >
                    <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
                    <div className="w-5 h-5 rounded-md bg-[#0E7C86] border border-[#142B5F] text-white mn-sub-item-icon flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify flex-1">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Body Template: Full Cultural Exchange Guide OR Standard Unified Article Sections */}
          {isCulturalExchange ? (
            <CulturalExchangeArticleContent />
          ) : (
            <div className="space-y-3.5">
              {article.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3"
                >
                  <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
                  <DetailSectionHeader
                    icon={BookOpen}
                    title={`${idx + 1}. ${sec.headingAr}`}
                    className="mb-1"
                  />

                  <div className="space-y-2.5">
                    {sec.paragraphsAr.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs"
                      >
                        <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
                        <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
                          {p}
                        </p>
                      </div>
                    ))}
                  </div>

                  {sec.bulletsAr && sec.bulletsAr.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {sec.bulletsAr.map((b, bIdx) => (
                        <div
                          key={bIdx}
                          className="p-2.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] flex items-start gap-2 shadow-2xs"
                        >
                          <div className="w-5 h-5 rounded-md bg-[#0E7C86] border border-[#142B5F] text-white mn-sub-item-icon flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                          <span className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.75]">
                            {b}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.calloutAr && (
                    <div className="p-3 rounded-xl bg-[#0E7C86]/8 border border-[#0E7C86]/25 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#0E7C86] border-[1.5px] border-[#142B5F] ring-1 ring-[#142B5F]/40 text-white mn-sub-item-icon flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-3 h-3" />
                      </div>
                      <p className="text-[11px] font-bold text-[var(--mn-heading)] leading-[1.8] text-justify flex-1">
                        {sec.calloutAr}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5">
              <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
              <DetailSectionHeader
                icon={FileText}
                title="أدلة ومقالات ذات صلة"
                className="mb-1"
              />

              <div className="grid grid-cols-1 gap-2.5">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated && onSelectRelated(rel.slug)}
                    className="group relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] hover:border-[#0E7C86]/50 p-3 pr-4 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
                  >
                    <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-[linear-gradient(180deg,#0E7C86_0%,#0E7C86_75%,#142B5F_100%)]" />
                    <div className="space-y-1 pr-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-[#142B5F]/10 text-[var(--mn-heading)]">
                          {rel.categoryAr}
                        </span>
                        <span className="text-[10px] font-bold text-[#0E7C86]">
                          {rel.readingTime}
                        </span>
                      </div>
                      <h4 className="text-[12px] font-bold text-[var(--mn-heading)] group-hover:text-[#0E7C86] transition-colors line-clamp-2 leading-[1.6]">
                        {rel.titleAr}
                      </h4>
                      <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] line-clamp-2 leading-[1.65]">
                        {rel.excerptAr}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
