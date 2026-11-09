import { useTranslation as usePublicTemplateTranslation } from '../../../i18n/I18nProvider';
import React from 'react';
import {
  ArrowUpLeft,
  Sparkles,
  Scale,
  FilePenLine,
  Calculator,
  ShieldCheck,
  FileCheck2,
  Award,
} from 'lucide-react';

interface AIToolsBannerProps {
  dataMode?: 'api' | 'prototype';
  onOpenAiTools: (toolKey?: string) => void;
}

const TOOL_PAIRS = [
  // Column 1: 3 cards stacked vertically
  [
    {
      id: 'university-comparison',
      title: 'public_compare_universities',
      subtitle: 'public_compare_university_information_before_deciding',
      icon: Scale,
    },
    {
      id: 'motivation-letter-generator',
      title: 'public_motivation_letter_generator',
      subtitle: 'public_create_an_organized_draft_for_review',
      icon: FilePenLine,
    },
    {
      id: 'gpa-calculator',
      title: 'public_gpa_calculator',
      subtitle: 'public_calculate_and_convert_your_academic_gpa',
      icon: Calculator,
    },
  ],
  // Column 2: 3 cards stacked vertically
  [
    {
      id: 'scholarship-eligibility-checker',
      title: 'public_scholarship_eligibility_analyzer',
      subtitle: 'public_assess_how_your_qualifications_match_the_requirements',
      icon: ShieldCheck,
    },
    {
      id: 'cv-builder',
      title: 'public_academic_cv_builder',
      subtitle: 'public_build_a_standard_academic_cv',
      icon: FileCheck2,
    },
    {
      id: 'recommendation-assistant',
      title: 'public_recommendation_letter_assistant',
      subtitle: 'public_prepare_recommendation_templates_and_talking_points_for_your',
      icon: Award,
    },
  ],
];

export const AIToolsBanner: React.FC<AIToolsBannerProps> = ({ onOpenAiTools, dataMode = 'api' }) => {
  const { t: publicT, dir: publicDir } = usePublicTemplateTranslation();

  return (
    <section id="ai-tools-section" className="px-0 py-2.5 w-full">
      <div className="relative rounded-3xl px-2.5 py-3.5 sm:px-3.5 sm:py-4 bg-gradient-to-b from-[var(--mn-surface)] to-[var(--mn-page)]/80 border border-[var(--mn-border)] shadow-sm overflow-hidden mn-panel">
        {/* Elegant top gradient border line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#142B5F] dark:via-[#D6A43B] to-transparent" />

        <div className="relative z-10">
          <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center mb-1">
              <h3 className="text-[15px] sm:text-base font-bold text-[#142B5F] dark:text-[#D6A43B] inline-flex items-center justify-center gap-2 leading-tight font-['Cairo',sans-serif]">
                <span className="mn-detail-section-icon mn-icon-mix02 shrink-0">
                  <span className="pointer-events-none absolute top-0 right-0 w-2.5 h-2.5 bg-[#D6A43B] rounded-bl-md" />
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 text-[#F2CD78]" />
                </span>
                <span className="inline-flex flex-col items-center">
                  <span>{publicT('public_manaratak_tools')}</span>
                  <span className="w-full min-w-[115px] h-[2.5px] mt-1 rounded-full bg-[linear-gradient(90deg,transparent_0%,#D6A43B_18%,#D6A43B_82%,transparent_100%)]" />
                </span>
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[var(--mn-text)] font-semibold leading-relaxed max-w-lg mx-auto font-['Cairo',sans-serif]">
              {publicT('public_smart_tools_and_calculators_for_comparison_planning_applications')}
            </p>
          </div>

          {/* Horizontal Scrollable Container with 2-by-3 Stacked Tools */}
          {dataMode !== 'prototype' && (
            <p id="home-tools-preview-note" role="note" className="mb-2 text-center text-[10px] font-medium text-[var(--mn-text-muted)]">
              {publicT('public_home_tools_preview_notice')}
            </p>
          )}
          <div className="relative w-full">
            <div className="flex overflow-x-auto gap-2 sm:gap-2.5 pb-1.5 pt-0.5 no-scrollbar snap-x snap-mandatory scroll-smooth" dir={publicDir}>
              {TOOL_PAIRS.map((pair, colIdx) => (
                <div key={colIdx} className="flex-none w-[250px] sm:w-[275px] space-y-2 snap-start">
                  {pair.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onOpenAiTools(tool.id)}
                        disabled={dataMode !== 'prototype'}
                        aria-describedby={dataMode !== 'prototype' ? 'home-tools-preview-note' : undefined}
                        className="w-full text-start rounded-xl border border-[#142B5F]/30 dark:border-[#D6A43B]/45 hover:border-[#142B5F] bg-[var(--mn-surface)] px-2.5 py-2.5 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:cursor-default disabled:opacity-80 min-w-0 mn-panel group flex items-center gap-2.5"
                      >
                        {/* تدرج الأعماق نيلي بترولي الأفق مع حلقة ذهبية خفيفة وأيقونة بيضاء داخلها */}
                        <div className="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-xl bg-[linear-gradient(135deg,#142B5F_0%,#142B5F_62%,#0E7C86_100%)] border border-[#D6A43B]/60 ring-1 ring-[#F2CD78]/25 shrink-0 shadow-2xs flex items-center justify-center relative overflow-hidden">
                          <ToolIcon className="w-4.5 h-4.5 text-white stroke-[2] relative z-10" />
                        </div>

                        {/* Tool Name & Subtitle */}
                        <div className="min-w-0 flex-1 flex flex-col justify-center items-start">
                          <h4 className="w-full truncate text-[12px] sm:text-[12.5px] font-extrabold text-[var(--mn-heading)] leading-snug font-['Cairo',sans-serif] group-hover:text-[#0E7C86] dark:group-hover:text-[#F2CD78] transition-colors">
                            {publicT(tool.title)}
                          </h4>
                          <p className="w-full mt-0.5 text-[10px] sm:text-[10.5px] text-[var(--mn-text-muted)] leading-tight font-medium font-['Cairo',sans-serif] line-clamp-1">
                            {publicT(tool.subtitle)}
                          </p>
                        </div>

                        {/* Navigation Arrow Badge */}
                        <div className="w-6 h-6 rounded-full bg-[#142B5F] border border-[#D6A43B]/60 flex items-center justify-center shrink-0 self-center transition-all group-hover:scale-105 shadow-2xs">
                          <ArrowUpLeft className="w-3 h-3 text-[#F2CD78] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Geometric Full-Width View All Button */}
          <div className="mt-3 w-full">
            <button
              id="btn-view-all-ai-tools"
              onClick={() => onOpenAiTools()}
              className="group relative w-full overflow-hidden rounded-xl px-3.5 py-2.5 bg-[var(--mn-page)] hover:bg-[#142B5F]/[0.04] dark:hover:bg-[#D6A43B]/10 border border-[#142B5F]/30 dark:border-[#D6A43B]/45 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] font-['Cairo',sans-serif] shadow-2xs cursor-pointer mn-panel"
            >
              <span className="pointer-events-none absolute top-0 right-0 w-5 h-3.5 border-t-[2.5px] border-r-[2.5px] border-[#0E7C86] dark:border-[#D6A43B] rounded-tr-xl" />
              <span className="pointer-events-none absolute bottom-0 left-0 w-5 h-3.5 border-b-[2.5px] border-l-[2.5px] border-[#142B5F] dark:border-[#D6A43B]/80 rounded-bl-xl" />
              <span className="inline-flex items-center justify-center gap-1.5">
                <span className="text-[12px] sm:text-[13px] font-extrabold text-[#142B5F] dark:text-[#F2CD78] text-center">{publicT('public_browse_manaratak_tools')}</span>
                <ArrowUpLeft className="w-4 h-4 -mt-1 text-[#0E7C86] dark:text-[#F2CD78] stroke-[2.5] shrink-0 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
