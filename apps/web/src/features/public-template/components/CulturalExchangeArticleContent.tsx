import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRightLeft,
  Award,
  Beaker,
  Bell,
  BookMarked,
  BookOpen,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Coins,
  Compass,
  ExternalLink,
  FileBadge,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Info,
  Landmark,
  Languages,
  Lightbulb,
  ListChecks,
  MapPin,
  MousePointerClick,
  PieChart,
  PlaneTakeoff,
  Scale,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { DetailSectionHeader } from './DetailUi';
import { CulturalExchangeGovernoratesAccordion } from './CulturalExchangeGovernoratesAccordion';

const SubSectionIconBadge: React.FC<{ icon: React.ElementType }> = ({ icon: Icon }) => (
  <div className="w-6 h-6 rounded-md bg-[#0E7C86] border-[1.5px] border-[#142B5F] ring-1 ring-[#142B5F]/40 text-white mn-sub-item-icon flex items-center justify-center shrink-0 shadow-2xs">
    <Icon className="w-3 h-3" />
  </div>
);

export const CulturalExchangeArticleContent: React.FC = () => {
  const [checkGradYear, setCheckGradYear] = useState<string>('2026');
  const [calcHsGrade, setCalcHsGrade] = useState<number>(92);
  const [calcExamGrade, setCalcExamGrade] = useState<number>(85);

  const navItems = [
    { id: 'def-section', title: 'التعريف بمنح التبادل الثقافي والأهلية', icon: Info },
    { id: 'diff-section', title: 'الفرق بين التبادل الثقافي والمنح المستقلة', icon: ArrowRightLeft },
    { id: 'test-section', title: 'اختبار المفاضلة والحاسبة التفاعلية', icon: Calculator },
    { id: 'outside-yemen-section', title: 'مفاضلة خريجي الخارج والدراسات العليا', icon: GraduationCap },
    { id: 'docs-section', title: 'التسجيل والوثائق ومواد الاختبار', icon: FileText },
    { id: 'before-exam-section', title: 'ما قبل اختبار المفاضلة وما بعده', icon: ListChecks },
    { id: 'hungary-scholarship-section', title: 'ملحق منحة الحكومة المجرية', icon: Landmark },
    { id: 'china-scholarship-section', title: 'ملحق منحة الحكومة الصينية', icon: Globe },
    { id: 'pmu-scholarship-section', title: 'ملحق منحة جامعة الأمير محمد بن فهد', icon: Award },
    { id: 'egypt-scholarship-section', title: 'ملحق منح مصر والجزائر وكوبا وباكستان', icon: MapPin },
    { id: 'governorate-quotas-section', title: 'توزيع المقاعد وحصص المحافظات', icon: PieChart },
    { id: 'results-and-appeals-section', title: 'النتائج والتظلمات', icon: ShieldAlert },
    { id: 'post-acceptance-phase-section', title: 'ما بعد القبول والإيفاد والسفر', icon: PlaneTakeoff },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 text-right font-['Cairo',sans-serif]" dir="rtl">
      {/* فهرس التنقل السريع بين الأقسام */}
      <div className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[var(--mn-border)]">
          <DetailSectionHeader
            icon={Compass}
            title="فهرس التنقل السريع بين الأقسام"
            className="mb-0"
          />
          <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-md bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#21A7B4] border border-[#0E7C86]/25">
            13 قسمًا مرجعيًا
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(item.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="group relative flex items-center justify-between p-2.5 rounded-xl bg-[var(--mn-page)] hover:bg-[var(--mn-surface-muted)]/60 border border-[var(--mn-border)] hover:border-[#0E7C86]/50 transition-all duration-200 shadow-2xs text-right font-['Cairo',sans-serif] cursor-pointer overflow-hidden"
              >
                <div className="absolute top-1.5 right-0 bottom-1.5 w-[3px] rounded-l-full bg-[linear-gradient(180deg,#0E7C86_0%,#0E7C86_75%,#142B5F_100%)] opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 pr-1.5 min-w-0 flex-1">
                  <SubSectionIconBadge icon={ItemIcon} />
                  <span className="text-[11.5px] font-bold text-[var(--mn-heading)] group-hover:text-[#0E7C86] transition-colors leading-[1.45] text-right break-words flex-1">
                    {item.title}
                  </span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-[#0E7C86] opacity-60 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all shrink-0 mr-1" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ١. منح التبادل الثقافي واختبار المفاضلة */}
      <div
        id="def-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={GraduationCap}
          title="١. منح التبادل الثقافي واختبار المفاضلة"
          className="mb-1"
        />

        <div className="space-y-2.5">
          <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
            <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
              <strong className="text-[var(--mn-heading)] text-[12px] ml-1.5">منح التبادل الثقافي:</strong>
              هي بعض المنح أو المقاعد الدراسية التي تحصل عليها اليمن من دول أخرى ضمن اتفاقيات التعاون والتبادل الثقافي بين الحكومات. ثم تقوم وزارة التعليم العالي اليمنية بالإعلان عن هذه المنح واستقبال طلبات الطلاب وإجراء اختبار للمفاضلة بينهم.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
            <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
              ويكون اختبار المفاضلة في المواد التي تحددها الوزارة، مثل الكيمياء والرياضيات واللغة الإنجليزية، ثم تتم مقارنة نتائج المتقدمين واختيار الطلاب الأعلى والأقوى في المفاضلة بحسب النظام المعتمد لكل محافظة وعدد المقاعد المتاحة، وبعد ذلك تقوم الوزارة بترشيح الفائزين إلى الدولة أو الجامعة المانحة لاستكمال إجراءات القبول والمنحة.
            </p>
          </div>
        </div>

        {/* من يستطيع دخول اختبار التبادل الثقافي؟ */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-3">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <div className="pr-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={Users} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                من يستطيع دخول اختبار التبادل الثقافي؟
              </h4>
            </div>

            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              اختبار التبادل الثقافي لا يكون مفتوحًا لجميع خريجي الثانوية من أي سنة، وإنما يُحدد عادةً لحديثي التخرج لاخر دفعتين تخرجت وفق السنة التي تُعلنها وزارة التعليم العالي.
            </p>

            <div className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[var(--mn-heading)]">
                <Calendar className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" />
                <span className="text-[11.5px] font-bold">
                  مثال توضيحي (إذا أُقيم الاختبار في بداية عام 2027):
                </span>
              </div>
              <p className="text-[11px] font-bold text-[var(--mn-text-muted)] leading-[1.8]">
                يكون المسموح لهم بالتقديم عادةً هم أحدث دفعتين فقط:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="flex items-center gap-2 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-lg p-2.5 shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-[#0E7C86] shrink-0" />
                  <span className="text-[11.5px] font-bold text-[var(--mn-text)]">
                    خريجو الثانوية لعام <strong className="text-[var(--mn-heading)]">2026</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[var(--mn-page)] border border-[var(--mn-border)] rounded-lg p-2.5 shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-[#0E7C86] shrink-0" />
                  <span className="text-[11.5px] font-bold text-[var(--mn-text)]">
                    خريجو الثانوية لعام <strong className="text-[var(--mn-heading)]">2025</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* فاحص الأهلية التفاعلي */}
            <div className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] p-3 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" />
                <span className="text-[11.5px] font-bold text-[var(--mn-heading)]">
                  فاحص أهليتك بحسب سنة التخرج (دورة 2027 كمثال):
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10.5px] font-bold text-[var(--mn-text-muted)]">سنة تخرجك:</span>
                {['2026', '2025', '2024', '2023'].map((yr) => {
                  const isSelected = checkGradYear === yr;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setCheckGradYear(yr)}
                      className={
                        'px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all border cursor-pointer leading-tight ' +
                        (isSelected
                          ? 'bg-[#142B5F] text-white border-[#142B5F] shadow-2xs'
                          : 'bg-[var(--mn-page)] text-[var(--mn-text)] border-[var(--mn-border)] hover:border-[#0E7C86]/40')
                      }
                    >
                      عام {yr}
                    </button>
                  );
                })}
              </div>

              <div
                className={
                  'p-2.5 rounded-lg text-[11px] font-bold flex items-center gap-2 border transition-all ' +
                  (checkGradYear === '2026' || checkGradYear === '2025'
                    ? 'bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#21A7B4] border-[#0E7C86]/25'
                    : 'bg-[#142B5F]/10 text-[var(--mn-heading)] border-[#142B5F]/25')
                }
              >
                {checkGradYear === '2026' || checkGradYear === '2025' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#0E7C86]" />
                    <span>
                      أنت مؤهل! خريجو سنة {checkGradYear} هم ضمن أحدث دفعتين مقبولتين للمفاضلة العامة وفق المثال.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#142B5F] dark:text-[#7EB6FF]" />
                    <span>
                      غير مشمول بالمفاضلة لحديثي التخرج لعام {checkGradYear}؛ فالشرط يقتصر على آخر دفعتين، ويُنصح بالتقديم على المنح الخارجية المباشرة.
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden p-3 rounded-xl bg-[#0E7C86]/5 border border-[#0E7C86]/25 flex items-start gap-2.5 shadow-2xs">
              <SubSectionIconBadge icon={Lightbulb} />
              <div className="space-y-0.5 flex-1 text-right">
                <span className="text-[11.5px] font-bold text-[var(--mn-heading)] block">
                  بمعنى أبسط:
                </span>
                <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                  كلما جاءت دورة جديدة لاختبار التبادل الثقافي، ننظر إلى أحدث دفعتين من خريجي الثانوية وقت فتح التسجيل. ويجب دائمًا مراجعة إعلان وزارة التعليم العالي الرسمي لذلك العام لاعتماد الدفع المقبولة بدقة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ٢. الفرق بين منح التبادل الثقافي والمنح الخارجية */}
      <div
        id="diff-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={ArrowRightLeft}
          title="٢. الفرق بين منح التبادل الثقافي والمنح الخارجية"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
          <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
            من المهم التفريق بين منح التبادل الثقافي والمنح العامة أو الخارجية؛ لأن الطالب قد يرى منحة حكومية أو جامعية في إحدى الدول ويظن أنها تدخل تلقائيًا ضمن التبادل الثقافي، وهذا غير صحيح.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
          <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
            منح التبادل الثقافي التي نتحدث عنها هنا تشمل عادةً الفرص التي تحصل عليها اليمن من عدد من الدول ضمن اتفاقيات التعاون بين الحكومات، ومن أبرز الدول التي تظهر في هذا المسار: المجر، الصين، الأردن، الجزائر، المغرب، باكستان، وكوبا. هذه المنح تكون مرتبطة بوزارة التعليم العالي اليمنية، حيث تعلن الوزارة عن المقاعد المتاحة، ويقوم الطلاب بالتسجيل لديها، ثم تتم المفاضلة بينهم وفق النظام المعتمد في تلك السنة، وبعد ذلك تختار الوزارة الطلاب الأعلى في المفاضلة وترشحهم إلى الدولة أو الجامعة المانحة لاستكمال إجراءات القبول والمنحة.
          </p>
        </div>

        {/* هل أستطيع التقديم بشكل مستقل؟ */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <div className="pr-1 space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <SubSectionIconBadge icon={HelpCircle} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                هل أستطيع التقديم بشكل مستقل؟
              </h4>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#142B5F]/10 text-[var(--mn-heading)] border border-[#142B5F]/20">
                مثال: الصين ودول التبادل الثقافي
              </span>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              وجود دولة ضمن منح التبادل الثقافي لا يعني أن الطالب لا يستطيع التقديم على أي منحة أخرى موجودة في هذه الدولة.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              النقطة المهمة هي أن نفرّق بين المنحة الحكومية التي تتعاقد عليها وزارة التعليم العالي اليمنية ضمن التبادل الثقافي، وبين المنح الأخرى التي تقدمها الجامعات أو المقاطعات أو الجهات المختلفة داخل الدولة نفسها.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              فالمنح الحكومية التي تكون مخصصة لليمن ضمن اتفاقيات التبادل الثقافي يكون التقديم عليها من خلال وزارة التعليم العالي اليمنية، ويخضع الطالب لإجراءات الوزارة، ومنها اختبار المفاضلة والترشيح بحسب ما تعلنه الوزارة لكل منحة.
            </p>
          </div>
        </div>

        {/* فمثلًا */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={BookOpen} />
              <span className="text-[12px] font-bold text-[var(--mn-heading)]">فمثلًا:</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5 bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-xl p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0E7C86] mt-2 shrink-0" />
                <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                  <strong className="text-[var(--mn-heading)]">منحة الحكومة المجرية:</strong> ضمن مسار التبادل الثقافي تتطلب الدخول في إجراءات المفاضلة والاختبار والترشيح عن طريق الوزارة، ولا يستطيع الطالب تجاوز هذا المسار والتقديم على المقعد الحكومي المخصص للتبادل الثقافي بشكل مستقل.
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-xl p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#142B5F] mt-2 shrink-0" />
                <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                  والأمر نفسه ينطبق على المنح الحكومية المدرجة ضمن التبادل الثقافي في دول مثل{' '}
                  <strong className="text-[var(--mn-heading)]">الأردن وكوبا وغيرها</strong>، بحسب الاتفاقيات والإعلانات المعتمدة في كل عام.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] p-3 space-y-1.5">
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                لكن هذا لا يعني أن الطالب ممنوع من التقديم على منح أخرى في المجر أو الأردن أو كوبا أو غيرها.
              </p>
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                فإذا كانت هناك جامعة داخل الدولة تقدم منحتها الخاصة، أو توجد منحة إقليمية أو منحة من جهة أخرى لا ترتبط بالتبادل الثقافي، فيستطيع الطالب التقديم عليها بصورة مستقلة إذا كان مستوفيًا لشروطها.
              </p>
            </div>
          </div>
        </div>

        {/* الصين حالة مختلفة قليلًا */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-2.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={Compass} />
              <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">
                الصين حالة مختلفة قليلًا:
              </h5>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85]">
              منحة الحكومة الصينية CSC لها أكثر من مسار، وأهم ما يهمنا هنا:
            </p>

            {/* جدول مقارنة مساري الصين بأسلوب الجداول الموحد */}
            <div className="overflow-x-auto rounded-xl border border-[var(--mn-border)] shadow-2xs">
              <table className="w-full text-right border-collapse font-['Cairo',sans-serif]">
                <thead>
                  <tr className="bg-gradient-to-l from-[#153B75] to-[#056579] text-white text-[11px] font-bold">
                    <th className="py-2.5 px-3 border-l border-white/15 w-1/3">المسار</th>
                    <th className="py-2.5 px-3">آلية التقديم وعلاقته بالتبادل الثقافي اليمني</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--mn-border)] text-[11px] font-bold">
                  <tr className="bg-[var(--mn-surface)]">
                    <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-heading)]">
                      الفئة A – Type A
                    </td>
                    <td className="py-2.5 px-3 text-[var(--mn-text)] leading-[1.8] text-justify">
                      وهي المسار المرتبط عادةً بالتعاون الحكومي والجهات المرسلة، وبالنسبة للمقاعد التي تأتي لليمن عن طريق التبادل الثقافي ووزارة التعليم العالي فإن الطالب يدخل اختبار المفاضلة، ثم يتم الترشيح من الوزارة وفق الإجراءات المعلنة.
                    </td>
                  </tr>
                  <tr className="bg-[var(--mn-page)]">
                    <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[#0E7C86] dark:text-[#21A7B4]">
                      الفئة B – Type B
                    </td>
                    <td className="py-2.5 px-3 text-[var(--mn-text)] leading-[1.8] text-justify">
                      وهي مسار يكون التقديم فيه عن طريق الجامعات الصينية المشاركة، ولا يحتاج الطالب فيه إلى الدخول في مفاضلة وزارة التعليم العالي اليمنية الخاصة بالتبادل الثقافي.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 pt-0.5">
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                لكن يجب الانتباه إلى أن فرص البكالوريوس في مسار Type B محدودة جدًا مقارنة بفرص الماجستير والدكتوراه، ولذلك نجد أن هذا المسار أكثر انتشارًا بين طلاب الدراسات العليا.
              </p>
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                والأهم أن الصين لا تقتصر أصلًا على منحة الحكومة الصينية CSC؛ فهناك عدد كبير جدًا من الجامعات الصينية التي تقدم منحًا جامعية، ومنح مقاطعات ومدن، وإعفاءات دراسية ومنحًا جزئية وغيرها، وهذه المنح لا علاقة لها بمقاعد التبادل الثقافي اليمني، ويستطيع الطالب التقديم عليها مباشرة وفق شروط كل جامعة أو جهة مانحة.
              </p>
            </div>
          </div>
        </div>

        {/* مقارنة بين طالبين */}
        <div className="rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 space-y-2.5 shadow-2xs">
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            لذلك يمكن أن نجد طالبين يريدان الدراسة في الدولة نفسها، لكن طريقة التقديم مختلفة تمامًا:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] space-y-1">
              <strong className="text-[var(--mn-heading)] text-[11.5px] block">الطالب الأول:</strong>
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                يتقدم على المنحة الحكومية المخصصة ضمن التبادل الثقافي، فيدخل اختبار المفاضلة وإجراءات الترشيح عن طريق الوزارة.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] space-y-1">
              <strong className="text-[#0E7C86] dark:text-[#21A7B4] text-[11.5px] block">الطالب الثاني:</strong>
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                يتقدم مباشرة على منحة جامعة أو مقاطعة أو برنامج مستقل داخل الدولة نفسها، ولا يدخل في مفاضلة التبادل الثقافي؛ لأن المنحة التي يتقدم عليها ليست هي المنحة الحكومية المخصصة للوزارة.
              </p>
            </div>
          </div>
        </div>

        {/* الخلاصة */}
        <div className="relative overflow-hidden p-3.5 rounded-xl bg-[#0E7C86]/5 border border-[#0E7C86]/25 flex items-start gap-2.5 shadow-2xs">
          <SubSectionIconBadge icon={Lightbulb} />
          <div className="space-y-1.5 flex-1 text-right">
            <strong className="text-[var(--mn-heading)] block text-[12px]">الخلاصة:</strong>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              وجود الدولة ضمن التبادل الثقافي لا يمنعك من البحث عن منح أخرى داخلها. الذي يرتبط بالمفاضلة والترشيح عن طريق الوزارة هو المقعد الحكومي المخصص ضمن اتفاقية التبادل الثقافي، أما منح الجامعات والمقاطعات والبرامج المستقلة فيمكن التقديم عليها مباشرة إذا كانت متاحة وتسمح شروطها بذلك.
            </p>
            <p className="text-[11px] font-bold text-[var(--mn-text-muted)] leading-[1.8] text-justify pt-1.5 border-t border-[#0E7C86]/20">
              وسيتم شرح المنح الصينية ومساراتها وأنواع المنح الجامعية ومنح المقاطعات وطريقة البحث والتقديم عليها بصورة مستقلة في دورة المنح الصينية.
            </p>
          </div>
        </div>

        {/* المزايا المالية الإضافية في التبادل الثقافي */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-2">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <div className="pr-1 space-y-2">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={Coins} />
              <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">
                المزايا المالية الإضافية في التبادل الثقافي:
              </h5>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              من أهم مزايا منح التبادل الثقافي أن الطالب يحصل على مساعدة مالية من وزارة التعليم العالي اليمنية، وتختلف قيمتها بحسب دولة الابتعاث، وذلك إلى جانب الراتب أو المخصصات التي تقدمها الدولة أو المنحة المانحة نفسها. وهذا يعني أن الطالب في بعض منح التبادل الثقافي يجمع بين مخصص المنحة في دولة الدراسة + المساعدة المالية المقدمة من وزارة التعليم العالي اليمنية. وتوضح خدمات قطاع البعثات في الوزارة إجراءات اعتماد وتحويل هذه المستحقات المالية للطلاب الموفدين ضمن منح التبادل الثقافي.
            </p>
          </div>
        </div>

        {/* ثانيًا: المنح الخارجية */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={Globe} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                ثانيًا: المنح الخارجية
              </h4>
            </div>

            <div className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] p-3 space-y-1.5">
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                <strong className="text-[var(--mn-heading)] text-[12px] ml-1">الالتحاق بالمنح الخارجية:</strong>
                يقصد بالمنح الخارجية بقية المنح الدراسية التي لا تدخل ضمن مسار التبادل الثقافي اليمني، ولا تعتمد على ترشيح وزارة التعليم العالي اليمنية. ويكون التقديم فيها مباشرة عبر الجهة المانحة، مثل الحكومة أو الجامعة أو المؤسسة.
              </p>
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                ومن أمثلتها: منحة الحكومة التركية، الروسية، العراقية، الكورية، اليابانية، وغيرها من المنح الحكومية والجامعية حول العالم.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              <div className="flex items-center gap-2.5 bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-xl p-2.5 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#142B5F] shrink-0" />
                <span className="text-[11px] font-bold text-[var(--mn-text)]">
                  تقديم مباشر عبر بوابة الجهة المانحة الرسمية
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-xl p-2.5 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#0E7C86] shrink-0" />
                <span className="text-[11px] font-bold text-[var(--mn-text)]">
                  لا تشترط امتحان مفاضلة وزارة التعليم العالي
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-xl p-2.5 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#142B5F] shrink-0" />
                <span className="text-[11px] font-bold text-[var(--mn-text)]">
                  تخضع لمعايير ومفاضلة الجهة المانحة الدولية
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded-xl p-2.5 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#0E7C86] shrink-0" />
                <span className="text-[11px] font-bold text-[var(--mn-text)]">
                  تشمل منح حكومية، منح جامعية، ومنح مؤسسات
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ٣. فهم طريقة اختبار المفاضلة في الأعوام السابقة والحاسبة التفاعلية */}
      <div
        id="test-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={Calculator}
          title="٣. فهم طريقة اختبار المفاضلة في الأعوام السابقة والحاسبة التفاعلية"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
          <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
            <strong className="text-[var(--mn-heading)] text-[12px] ml-1">لفهم نظام امتحان المفاضلة:</strong>
            نأخذ عام 2025/2026 كنموذج يوضح الطريقة التي كانت تُستخدم للمنافسة على منح التبادل الثقافي عبر أربعة أركان أساسية:
          </p>
        </div>

        {/* جدول الأركان الأربعة بأسلوب جداول التخصصات */}
        <div className="overflow-x-auto rounded-xl border border-[var(--mn-border)] shadow-2xs">
          <table className="w-full text-right border-collapse font-['Cairo',sans-serif]">
            <thead>
              <tr className="bg-gradient-to-l from-[#153B75] to-[#056579] text-white text-[11px] font-bold">
                <th className="py-2.5 px-3 border-l border-white/15 w-12 text-center">#</th>
                <th className="py-2.5 px-3 border-l border-white/15 w-1/3">المعيار الأساسي</th>
                <th className="py-2.5 px-3">التفاصيل المعتمدة في نموذج اختبار المفاضلة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--mn-border)] text-[11px] font-bold">
              <tr className="bg-[var(--mn-surface)]">
                <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-center text-[#0E7C86]">١</td>
                <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-heading)]">
                  المعدل المطلوب للتسجيل
                </td>
                <td className="py-2.5 px-3 text-[var(--mn-text)] leading-[1.8]">
                  كان الحد الأدنى لمعدل الثانوية العامة في بداية الإعلان 90%، ثم خُفّض لاحقًا إلى 85%؛ للدخول في المنافسة وفق معايير الوزارة.
                </td>
              </tr>
              <tr className="bg-[var(--mn-page)]">
                <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-center text-[#0E7C86]">٢</td>
                <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-heading)]">
                  مواد امتحان المفاضلة
                </td>
                <td className="py-2.5 px-3 text-[var(--mn-text)] leading-[1.8]">
                  يُجرى الامتحان في ثلاث مواد علمية رئيسية: <strong className="text-[var(--mn-heading)]">الرياضيات + الكيمياء + اللغة الإنجليزية</strong>.
                </td>
              </tr>
              <tr className="bg-[var(--mn-surface)]">
                <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-center text-[#0E7C86]">٣</td>
                <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-heading)]">
                  طريقة ونظام الامتحان
                </td>
                <td className="py-2.5 px-3 text-[var(--mn-text)] leading-[1.8]">
                  الامتحان بنظام اختيار من متعدد (أتمتة)، مدته ساعتان، ويتم تصحيحه آلياً وإلكترونياً لضمان الشفافية.
                </td>
              </tr>
              <tr className="bg-[var(--mn-page)]">
                <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-center text-[#0E7C86]">٤</td>
                <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-heading)]">
                  مراكز الامتحان المعتمدة
                </td>
                <td className="py-2.5 px-3 text-[var(--mn-text)] leading-[1.8]">
                  يُعقد الامتحان في أربعة مراكز رئيسية: (عدن – تعز – حضرموت – مأرب) بحسب تعليمات وإجراءات الوزارة.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* معادلة الوزن النسبي والحاسبة التفاعلية */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-3">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <div className="pr-1 space-y-3">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={Calculator} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                كيف تُحسب نتيجة المفاضلة؟ (معادلة الوزن النسبي)
              </h4>
            </div>

            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              لم يكن الترتيب يعتمد على معدل الثانوية وحده، بل على المجموع الموزون لمعدل الثانوية مع نتيجة امتحان المفاضلة وفق المعادلة:
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-1 text-[11.5px] font-bold">
              <div className="bg-[var(--mn-surface)] border border-[var(--mn-border)] px-3.5 py-1.5 rounded-lg text-[var(--mn-heading)] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#142B5F]" />
                <span>30% من معدل الثانوية العامة</span>
              </div>
              <span className="text-[#0E7C86] text-base font-bold">+</span>
              <div className="bg-[var(--mn-surface)] border border-[var(--mn-border)] px-3.5 py-1.5 rounded-lg text-[#0E7C86] dark:text-[#21A7B4] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0E7C86]" />
                <span>70% من امتحان المفاضلة</span>
              </div>
            </div>

            {/* الحاسبة التفاعلية */}
            <div className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] p-3 sm:p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--mn-border)] pb-2">
                <span className="text-[11.5px] font-bold text-[var(--mn-heading)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0E7C86]" />
                  حاسبة نتيجة المفاضلة التفاعلية (احسب درجاتك الموزونة):
                </span>
                <span className="text-[10px] font-bold bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#21A7B4] px-2 py-0.5 rounded-md border border-[#0E7C86]/25">
                  معادلة معتمدة
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1.5 bg-[var(--mn-page)] p-2.5 rounded-lg border border-[var(--mn-border)] shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[var(--mn-text)]">معدل الثانوية العامة (30%):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="50"
                        max="100"
                        step="0.5"
                        value={calcHsGrade}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value)));
                          setCalcHsGrade(val);
                        }}
                        className="w-14 px-1 py-0.5 text-center text-[11px] font-bold bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded text-[var(--mn-heading)]"
                      />
                      <span className="text-[var(--mn-heading)] text-[11px]">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="0.5"
                    value={calcHsGrade}
                    onChange={(e) => setCalcHsGrade(Number(e.target.value))}
                    className="w-full accent-[#142B5F] cursor-pointer h-1.5"
                  />
                  <div className="text-[10px] text-[var(--mn-text-muted)] font-bold flex justify-between">
                    <span>المساهمة الفعلية:</span>
                    <strong className="text-[var(--mn-heading)]">{(calcHsGrade * 0.3).toFixed(1)} درجة</strong>
                  </div>
                </div>

                <div className="space-y-1.5 bg-[var(--mn-page)] p-2.5 rounded-lg border border-[var(--mn-border)] shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[var(--mn-text)]">درجة اختبار المفاضلة (70%):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={calcExamGrade}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value)));
                          setCalcExamGrade(val);
                        }}
                        className="w-14 px-1 py-0.5 text-center text-[11px] font-bold bg-[var(--mn-surface)] border border-[var(--mn-border)] rounded text-[#0E7C86] dark:text-[#21A7B4]"
                      />
                      <span className="text-[#0E7C86] dark:text-[#21A7B4] text-[11px]">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={calcExamGrade}
                    onChange={(e) => setCalcExamGrade(Number(e.target.value))}
                    className="w-full accent-[#0E7C86] cursor-pointer h-1.5"
                  />
                  <div className="text-[10px] text-[var(--mn-text-muted)] font-bold flex justify-between">
                    <span>المساهمة الفعلية:</span>
                    <strong className="text-[#0E7C86] dark:text-[#21A7B4]">{(calcExamGrade * 0.7).toFixed(1)} درجة</strong>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-[#142B5F]/5 rounded-lg border border-[#0E7C86]/25 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--mn-text-muted)] block">
                      النتيجة النهائية المركبة:
                    </span>
                    <div className="text-[17px] font-bold text-[var(--mn-heading)] leading-tight">
                      {(calcHsGrade * 0.3 + calcExamGrade * 0.7).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-48 space-y-0.5">
                  <div className="h-2 w-full bg-[var(--mn-border)] rounded-full overflow-hidden flex shadow-inner">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 1"
                      preserveAspectRatio="none"
                      role="img"
                      aria-label={`الثانوية ${(calcHsGrade * 0.3).toFixed(1)}% والاختبار ${(calcExamGrade * 0.7).toFixed(1)}%`}
                    >
                      <rect
                        x={100 - Number((calcHsGrade * 0.3).toFixed(1))}
                        width={(calcHsGrade * 0.3).toFixed(1)}
                        height="1"
                        className="fill-[#142B5F] transition-all duration-300"
                      />
                      <rect
                        x={
                          100 -
                          Number((calcHsGrade * 0.3).toFixed(1)) -
                          Number((calcExamGrade * 0.7).toFixed(1))
                        }
                        width={(calcExamGrade * 0.7).toFixed(1)}
                        height="1"
                        className="fill-[#0E7C86] transition-all duration-300"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between text-[9.5px] text-[var(--mn-text-muted)] font-bold">
                    <span>ثانوية ({(calcHsGrade * 0.3).toFixed(1)}%)</span>
                    <span>اختبار ({(calcExamGrade * 0.7).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden p-3 rounded-xl bg-[#0E7C86]/5 border border-[#0E7C86]/25 flex items-start gap-2.5 shadow-2xs">
              <SubSectionIconBadge icon={Lightbulb} />
              <div className="space-y-0.5 flex-1 text-right">
                <span className="text-[11.5px] font-bold text-[var(--mn-heading)] block">
                  الخلاصة والقاعدة الذهبية:
                </span>
                <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                  امتحان المفاضلة يمتلك الوزن الأكبر (70%) في الترتيب؛ لذلك يمكن لطالب معدله في الثانوية 88% أن يتقدم في الترشيح على طالب معدله 98% إذا حقق نتيجة أقوى في اختبار المفاضلة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ٤. كيف تتم مفاضلة خريجي الثانوية من خارج اليمن وطلاب الدراسات العليا؟ */}
      <div
        id="outside-yemen-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={Globe}
          title="٤. كيف تتم مفاضلة خريجي الثانوية من خارج اليمن؟"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
          <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
            الطلاب اليمنيون الحاصلون على الثانوية من خارج اليمن لا يظهرون ضمن حصة محافظة يمنية مثل عدن أو تعز، وإنما ظهرت لهم في نتائج دورة 2026/2027 فئة مستقلة باسم{' '}
            <strong className="text-[var(--mn-heading)] bg-[#142B5F]/10 px-2 py-0.5 rounded-md font-bold">
              «الخارج»
            </strong>
            ، ويتم التنافس على المقاعد المخصصة لهذه الفئة.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-2.5">
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              في دورة 2026/2027 لم يُجرَ اختبار المفاضلة، ولذلك كانت المفاضلة على أساس{' '}
              <strong className="text-[var(--mn-heading)]">معدل الثانوية العامة</strong>. وعند تساوي المعدلات يُنظر إلى مجموع درجات المواد العلمية في الثانوية، وهي:
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 py-1">
              <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-[var(--mn-surface)] text-[var(--mn-heading)] border border-[var(--mn-border)] shadow-2xs">
                الرياضيات
              </span>
              <span className="text-[#0E7C86] font-bold text-sm">+</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-[var(--mn-surface)] text-[var(--mn-heading)] border border-[var(--mn-border)] shadow-2xs">
                الفيزياء
              </span>
              <span className="text-[#0E7C86] font-bold text-sm">+</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-[var(--mn-surface)] text-[var(--mn-heading)] border border-[var(--mn-border)] shadow-2xs">
                الكيمياء
              </span>
              <span className="text-[#0E7C86] font-bold text-sm">+</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-[var(--mn-surface)] text-[var(--mn-heading)] border border-[var(--mn-border)] shadow-2xs">
                الأحياء
              </span>
            </div>

            <p className="text-[11.5px] font-bold text-[#0E7C86] dark:text-[#21A7B4] leading-[1.85]">
              ثم يُقدَّم الطالب الأعلى في مجموع هذه المواد.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
          <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
            وفي نتائج دورة 2026/2027 ظهرت لفئة الخارج{' '}
            <strong className="text-[var(--mn-heading)]">5 مقاعد بكالوريوس</strong> موزعة بين عدد من الدول، ما يعني أن طالب الخارج كان ينافس ضمن المقاعد المخصصة لفئة الخارج، وليس ضمن ترتيب طلاب أي محافظة داخل اليمن.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-2">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <div className="pr-1 space-y-2">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={HelpCircle} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                ماذا عن السنوات التي يوجد فيها اختبار مفاضلة؟
              </h4>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              إذا عادت الوزارة إلى نظام اختبار المفاضلة، فإن خريجي الثانوية من خارج اليمن لا تتم مفاضلتهم بالمعدل فقط لمجرد أن شهادتهم صادرة من خارج اليمن، بل يدخلون في نظام المفاضلة والاختبار المعتمد لذلك العام مثل بقية المتقدمين، ما لم تعلن الوزارة استثناءً خاصًا.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              وفي السنوات السابقة التي كان فيها الاختبار، كانت المفاضلة تعتمد على{' '}
              <strong className="text-[var(--mn-heading)]">معدل الثانوية + نتيجة اختبار المفاضلة</strong> وفق النسبة التي تحددها الوزارة لكل دورة.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative overflow-hidden p-3 rounded-xl bg-[#0E7C86]/5 border border-[#0E7C86]/25 flex items-start gap-2.5 shadow-2xs">
            <SubSectionIconBadge icon={Lightbulb} />
            <div className="space-y-0.5 flex-1 text-right">
              <span className="text-[11.5px] font-bold text-[var(--mn-heading)] block">الخلاصة:</span>
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                في 2026/2027 كانت مفاضلة خريجي الخارج بالمعدل لأن الاختبار أُلغي في تلك الدورة. أما إذا كان الاختبار موجودًا في دورة أخرى، فيخضع الطالب لنظام الاختبار والمفاضلة المعتمد لذلك العام.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden p-3 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] flex items-start gap-2.5 shadow-2xs">
            <SubSectionIconBadge icon={Info} />
            <div className="space-y-0.5 flex-1 text-right">
              <span className="text-[11.5px] font-bold text-[var(--mn-heading)] block">ملاحظة هامة:</span>
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                عدد المقاعد المخصصة لفئة الخارج ليس ثابتًا كل سنة، وإنما يتغير بحسب المقاعد المتاحة ونتائج كل دورة في إعلان الوزارة.
              </p>
            </div>
          </div>
        </div>

        {/* مفاضلة طلاب الدراسات العليا */}
        <div className="pt-2 border-t border-[var(--mn-border)] space-y-3">
          <DetailSectionHeader
            icon={GraduationCap}
            title="كيف تتم مفاضلة طلاب الدراسات العليا في منح التبادل الثقافي؟"
            className="mb-1"
          />

          <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
            <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
              طلاب الماجستير والدكتوراه لا يدخلون اختبار المفاضلة الخاص بخريجي الثانوية، وإنما تتم المفاضلة بينهم وفق معايير أكاديمية تحددها وزارة التعليم العالي في إعلان كل دورة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
              <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
              <div className="pr-1 space-y-2">
                <div className="flex items-center gap-2">
                  <SubSectionIconBadge icon={GraduationCap} />
                  <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">١. مفاضلة الماجستير</h4>
                </div>
                <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                  عندما تكون المنح متاحة للمنافسة العامة على مستوى المحافظات، تتم مقارنة المتقدمين للماجستير داخل كل محافظة على حدة، ويكون الأساس هو{' '}
                  <strong className="text-[var(--mn-heading)]">معدل البكالوريوس</strong> في نفس التخصص أو التخصص المقبول للمنحة.
                </p>
                <div className="p-2.5 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] text-[10.5px] font-bold text-[var(--mn-text-muted)] leading-[1.8]">
                  <span className="text-[var(--mn-heading)] font-bold ml-1">مثال توضيحي:</span>
                  إذا كان هناك مقعد ماجستير مخصص لمحافظة تعز، يتنافس عليه المتقدمون المؤهلون من تعز، ثم يتم ترتيبهم بحسب المعدل والشروط التي تحددها الوزارة.
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
              <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
              <div className="pr-1 space-y-2">
                <div className="flex items-center gap-2">
                  <SubSectionIconBadge icon={Award} />
                  <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">٢. مفاضلة الدكتوراه</h4>
                </div>
                <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                  في الدكتوراه لا يوجد اختبار مفاضلة أيضًا، وإنما تعتمد الوزارة على المؤهلات الأكاديمية السابقة. ومن الأمثلة على ذلك إعلان منح مصر لدورة 2026/2027، حيث كانت المفاضلة للدكتوراه وفق:
                </p>
                <div className="flex items-center justify-center gap-2 py-1 text-[11px] font-bold">
                  <div className="bg-[var(--mn-surface)] px-2.5 py-1 rounded-lg border border-[var(--mn-border)] text-[var(--mn-heading)] shadow-2xs">
                    70% معدل البكالوريوس
                  </div>
                  <span className="text-[#0E7C86] font-bold">+</span>
                  <div className="bg-[var(--mn-surface)] px-2.5 py-1 rounded-lg border border-[var(--mn-border)] text-[#0E7C86] dark:text-[#21A7B4] shadow-2xs">
                    30% معدل الماجستير
                  </div>
                </div>
                <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] leading-[1.8]">
                  ثم تتم مقارنة المتقدمين بحسب النتيجة الموزونة والشروط المعتمدة لكل مقعد.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
            <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
            <div className="pr-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <SubSectionIconBadge icon={HelpCircle} />
                <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                  هل جميع منح الدراسات العليا مفتوحة للمنافسة العامة؟
                </h4>
              </div>
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                <strong className="text-[var(--mn-heading)]">لا.</strong> يجب الانتباه إلى أن طريقة الترشيح قد تختلف من دورة إلى أخرى؛ ففي بعض الإعلانات تكون المقاعد متاحة للمنافسة العامة وفق المحافظة والمعدل، بينما قد تخصص الوزارة في دورات أخرى بعض أو جميع مقاعد الدراسات العليا لأعضاء هيئة التدريس في الجامعات الحكومية، ويتم الترشيح حينها عبر الجامعات وفق الآلية المعتمدة.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden p-3 rounded-xl bg-[#0E7C86]/5 border border-[#0E7C86]/25 flex items-start gap-2.5 shadow-2xs">
            <SubSectionIconBadge icon={Lightbulb} />
            <div className="space-y-1 flex-1 text-right">
              <span className="text-[11.5px] font-bold text-[var(--mn-heading)] block">
                الخلاصة الميسرة:
              </span>
              <ul className="space-y-1 text-[11px] font-bold text-[var(--mn-text)] leading-[1.8]">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#0E7C86] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--mn-heading)]">البكالوريوس:</strong> قد توجد مفاضلة واختبار بحسب نظام الدورة المعلنة.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#0E7C86] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--mn-heading)]">الماجستير:</strong> لا يوجد اختبار؛ والمفاضلة أكاديمية تعتمد أساساً على معدل البكالوريوس عند فتح المنافسة العامة.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#0E7C86] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--mn-heading)]">الدكتوراه:</strong> لا يوجد اختبار؛ وتعتمد المفاضلة على البكالوريوس والماجستير وفق المعادلة التي تعلنها الوزارة.
                  </span>
                </li>
              </ul>
              <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] pt-1 border-t border-[#0E7C86]/20">
                ملاحظة هامة: يجب دائمًا قراءة إعلان الدورة نفسها؛ لأن طريقة توزيع مقاعد الدراسات العليا والفئات المسموح لها بالمنافسة قد تتغير من سنة إلى أخرى بحسب اتفاقيات التبادل الثقافي الموقعة.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ٥. الوثائق وطريقة التسجيل ومواد الامتحان واستثناء 2026 */}
      <div
        id="docs-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={ClipboardCheck}
          title="٥. الوثائق وطريقة التسجيل ومواد اختبار المفاضلة"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3 sm:p-3.5 pr-4 shadow-2xs">
          <div className="absolute top-2 right-0 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
            <strong className="text-[var(--mn-heading)] ml-1">إجراءات التسجيل:</strong>
            عندما تعلن وزارة التعليم العالي فتح التسجيل لاختبار المفاضلة، تنشر رابطًا إلكترونيًا مخصصًا للتسجيل، ويدخل الطالب إلى الرابط ويعبئ بياناته ويرفع الوثائق المطلوبة.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 sm:p-4 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={ListChecks} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                الوثائق والبيانات المطلوبة للتسجيل:
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'صورة شخصية حديثة للمتقدم.',
                'جواز السفر أو وثيقة الهوية المعتمدة.',
                'شهادة الثانوية العامة أو بيانات المعدل.',
                'رقم الجلوس أو البيانات الدراسية المقررة.',
                'رقم الهاتف وبيانات التواصل الدقيقة.',
                'اختيار مركز الامتحان من المراكز المتاحة.',
                'إثبات دفع رسوم التسجيل أو الرسوم المقررة.',
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] flex items-center gap-2 shadow-2xs"
                >
                  <div className="w-4 h-4 rounded-md bg-[#0E7C86]/15 text-[#0E7C86] flex items-center justify-center shrink-0 border border-[#0E7C86]/30">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.6]">{doc}</span>
                </div>
              ))}
            </div>

            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pt-1">
              وأثناء التسجيل نفسه يعرف الطالب موعد الامتحان ويختار مركز الامتحان من الخيارات التي تتيحها الوزارة. بعد تعبئة البيانات ورفع الوثائق وسداد الرسوم، يعتمد الطالب طلبه ويحتفظ ببيانات التسجيل، ثم يتابع أي تعليمات إضافية تصدرها الوزارة قبل موعد الاختبار.
            </p>
          </div>
        </div>

        {/* مسار وخطوات التسجيل */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <div className="pr-1 space-y-2">
            <span className="text-[var(--mn-heading)] font-bold text-[12px] block">
              مسار وخطوات التسجيل:
            </span>
            <div className="flex flex-wrap items-center justify-start gap-1.5">
              {[
                'إعلان فتح التسجيل',
                'الدخول للرابط المخصص',
                'تعبئة البيانات ورفع الوثائق',
                'اختيار مركز الامتحان',
                'دفع الرسوم واعتماد الطلب',
                'حضور الاختبار بالمركز',
                'صدور النتائج والترشيح',
              ].map((step, idx, arr) => (
                <React.Fragment key={idx}>
                  <div className="bg-[var(--mn-surface)] border border-[var(--mn-border)] px-2.5 py-1 rounded-lg text-[var(--mn-heading)] text-[11px] font-bold shadow-2xs">
                    <span className="text-[#0E7C86] ml-1 font-bold">{idx + 1}.</span>
                    {step}
                  </div>
                  {idx < arr.length - 1 && (
                    <ChevronLeft className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] pt-1">
              تنبيه هام: يجب الانتباه إلى أن الوثائق والرسوم والمواعيد والمراكز المتاحة قد تتغير من سنة إلى أخرى، لذلك يكون إعلان الوزارة الرسمي الخاص بكل دورة هو المرجع النهائي والمعتمد.
            </p>
          </div>
        </div>

        {/* مواد الامتحان والوحدات الداخلة */}
        <div className="pt-2 border-t border-[var(--mn-border)] space-y-3">
          <DetailSectionHeader
            icon={BookMarked}
            title="مواد الامتحان والوحدات الداخلة في امتحان المفاضلة (نظام 2025–2026م)"
            className="mb-1"
          />

          <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
            <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
            <div className="pr-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <SubSectionIconBadge icon={AlertCircle} />
                <span className="text-[12px] font-bold text-[var(--mn-heading)]">
                  ملاحظة هامة حول اعتماد المقررات والمحذوفات:
                </span>
              </div>
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                المواد والوحدات المقررة، وكذلك الأجزاء المحذوفة في اختبار المفاضلة، تكون بحسب مقررات آخر دفعة تخرجت من الثانوية العامة قبل موعد الاختبار. فمثلًا: إذا أُجري اختبار المفاضلة في يناير 2027، فيُعتمد مقرر ومحذوفات العام الدراسي 2025–2026م باعتباره آخر عام تخرجت فيه دفعة من الثانوية قبل الاختبار.
              </p>
            </div>
          </div>

          {/* جدول المواد والوحدات والمحذوفات بأسلوب جداول التخصصات */}
          <div className="overflow-x-auto rounded-xl border border-[var(--mn-border)] shadow-2xs">
            <table className="w-full text-right border-collapse font-['Cairo',sans-serif]">
              <thead>
                <tr className="bg-gradient-to-l from-[#153B75] to-[#056579] text-white text-[11px] font-bold">
                  <th className="py-2.5 px-3 border-l border-white/15 w-1/5">المادة</th>
                  <th className="py-2.5 px-3 border-l border-white/15 w-2/5">الوحدات والدروس المقررة</th>
                  <th className="py-2.5 px-3">الأجزاء والدروس المحذوفة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mn-border)] text-[11px] font-bold">
                <tr className="bg-[var(--mn-surface)]">
                  <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-heading)]">
                    <div className="flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>مادة الرياضيات</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-text)] leading-[1.75]">
                    6 وحدات: الوحدة الأولى (1-1 إلى 6-1)، الوحدة الثانية (1-2 حتى 4-2)، الوحدة الثالثة (1-3 إلى 3-3)، الوحدة الرابعة (1-4 حتى 4-4)، الوحدة السادسة (1-6 إلى 9-6)، الوحدة السابعة (1-7 حتى 4-7).
                  </td>
                  <td className="py-2.5 px-3 text-[var(--mn-text)] leading-[1.75]">
                    • الوحدة 1: التمثيل الهندسي لجمع وطرح الأعداد المركبة، إثبات خواص الجمع والمرافق والصورة القطبية، وإيجاد الجذر التربيعي بالصيغة الجبرية.<br />
                    • الوحدة 3: إثبات المبرهنات الأساسية في الاحتمال.<br />
                    • الوحدة 6: المسائل التطبيقية على القيم القصوى، ودراسة تغير الدالة ورسمها.
                  </td>
                </tr>
                <tr className="bg-[var(--mn-page)]">
                  <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-heading)]">
                    <div className="flex items-center gap-1.5">
                      <Beaker className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>مادة الكيمياء</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-text)] leading-[1.75]">
                    جميع الوحدات داخلة في الامتحان (من الوحدة 1 إلى الوحدة 6) شاملة كافة المفاهيم والمعادلات والقوانين المقررة للصف الثالث الثانوي.
                  </td>
                  <td className="py-2.5 px-3 text-[#0E7C86] dark:text-[#21A7B4]">
                    كاملة بدون أي دروس ملغاة.
                  </td>
                </tr>
                <tr className="bg-[var(--mn-surface)]">
                  <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-heading)]">
                    <div className="flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-[#0E7C86]" />
                      <span>اللغة الإنجليزية</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 border-l border-[var(--mn-border)] text-[var(--mn-text)] leading-[1.75]">
                    • المنهج الأساسي (Coursebook): Units 1–5<br />
                    • Science Reader: الدروس 1–4 & 6<br />
                    • Art Reader: الدروس 2، 4، 6، 10
                  </td>
                  <td className="py-2.5 px-3 text-[var(--mn-text)] leading-[1.75]">
                    ما عدا الوحدات والدروس المذكورة في الكتب الثلاثة المقررة.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* لماذا لم يوجد اختبار مفاضلة في عام 2026؟ */}
        <div className="pt-2 border-t border-[var(--mn-border)] space-y-3">
          <DetailSectionHeader
            icon={ShieldAlert}
            title="لماذا لم يوجد اختبار مفاضلة في عام 2026؟ وكيف تمت المفاضلة؟"
            className="mb-1"
          />

          <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
            <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
            <div className="pr-1 space-y-2">
              <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                <strong className="text-[var(--mn-heading)] ml-1">استثناء عام 2026/2027:</strong>
                في العام الجامعي <strong className="text-[var(--mn-heading)]">2026/2027</strong> ألغت وزارة التعليم العالي اختبار المفاضلة <strong className="text-[var(--mn-heading)]">بصورة استثنائية</strong> بسبب الحرب والأوضاع التي تمر بها اليمن، وما نتج عنها من صعوبة تنقل آلاف الطلاب بين المحافظات للوصول إلى مراكز الاختبار في عدن وتعز وحضرموت ومأرب. وكان هذا الإلغاء خاصًا بذلك العام فقط، ولم يكن قرارًا بإلغاء نظام اختبار المفاضلة نهائيًا.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <SubSectionIconBadge icon={ListChecks} />
                <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                  آلية المفاضلة البديلة المعتمدة لعام 2026/2027:
                </h4>
              </div>

              <ul className="space-y-1.5 text-[11px] font-bold text-[var(--mn-text)] leading-[1.8]">
                <li className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)]">
                  <span className="text-[#0E7C86] font-bold">•</span>
                  <span>
                    اعتمدت الوزارة في منح البكالوريوس على <strong className="text-[var(--mn-heading)]">معدل الثانوية العامة</strong> في ترتيب الطلاب.
                  </span>
                </li>
                <li className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)]">
                  <span className="text-[#0E7C86] font-bold">•</span>
                  <span>
                    إذا تساوى طالبان في المعدل، يتم الرجوع إلى <strong className="text-[var(--mn-heading)]">المجموع العلمي</strong> في مواد (الرياضيات، الفيزياء، الكيمياء، والأحياء) لتحديد الأفضل بينهما.
                  </span>
                </li>
                <li className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)]">
                  <span className="text-[#0E7C86] font-bold">•</span>
                  <span>
                    كانت المفاضلة تتم <strong className="text-[var(--mn-heading)]">داخل كل محافظة على حدة</strong>، وليس بين جميع طلاب اليمن في قائمة واحدة، أي أن الطالب ينافس المتقدمين من محافظته بحسب المقاعد المخصصة لها.
                  </span>
                </li>
              </ul>

              <p className="text-[11px] font-bold text-[var(--mn-text-muted)] leading-[1.8] text-justify pt-1">
                الخلاصة: وبذلك اختلف نظام 2026/2027 عن السنوات التي يوجد فيها اختبار مفاضلة؛ ففي حالة وجود الاختبار تدخل نتيجة امتحان المفاضلة مع معدل الثانوية في حساب الترتيب، أما في عام 2026/2027 فتم الاعتماد على معدل الثانوية العامة، ثم المجموع العلمي عند التساوي.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ٦. ماذا أفعل قبل اختبار المفاضلة وما بعده؟ */}
      <div
        id="before-exam-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={Compass}
          title="٦. ماذا أفعل قبل اختبار المفاضلة وماذا أفعل بعده؟"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={AlertCircle} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                أولًا: قبل الاختبار — الخطأ الشائع الذي يضيع الفرص!
              </h4>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              هناك خطأ يقع فيه كثير من الطلاب، وهو أن ينتظر الطالب أولًا حتى يؤدي اختبار التبادل الثقافي، ثم يبدأ بعد ذلك بالتقديم على المنح التي يريد المنافسة عليها. وهذا قد يتسبب في ضياع بعض الفرص؛ لأن مواعيد التقديم في بعض الدول قد تنتهي قبل موعد اختبار المفاضلة نفسه.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              <strong className="text-[var(--mn-heading)] ml-1">المبادرة المبكرة:</strong>
              لذلك من لحظة إعلان الوزارة عن منح التبادل الثقافي، يجب أن تتابع صفحة وزارة التعليم العالي وإعلانات كل دولة، وتعرف هل توجد دولة تشترط منك أن تقدم في موقعها أو في موقع المنحة قبل موعد الاختبار.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-1.5">
            <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
            <div className="pr-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <SubSectionIconBadge icon={Landmark} />
                <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">مثال توضيحي: منحة المجر</h5>
              </div>
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                إذا كان آخر موعد للتقديم على المنحة المجرية هو 15 يناير، واختبار المفاضلة يوم 20 يناير، فلا تنتظر! سجل في المنحة المجرية قبل 15 يناير، ثم ادخل الاختبار، وإذا فزت ستقوم الوزارة بترشيحك.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-1.5">
            <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
            <div className="pr-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <SubSectionIconBadge icon={Globe} />
                <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">مثال توضيحي: الصين (اختبار CSCA)</h5>
              </div>
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                إذا كان الترشيح يشترط اختبار CSCA والتقديم ينتهي في مارس، فيجب إنهاء اختبار CSCA في إحدى الدورات المبكرة (ديسمبر أو يناير) لتكون النتيجة جاهزة قبل انتهاء موعد المنحة.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden p-3 rounded-xl bg-[#0E7C86]/5 border border-[#0E7C86]/25 flex items-start gap-2.5 shadow-2xs">
          <SubSectionIconBadge icon={CheckCircle2} />
          <div className="space-y-0.5 flex-1 text-right">
            <span className="text-[11.5px] font-bold text-[var(--mn-heading)] block">القاعدة الذهبية:</span>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
              لا تجعل اختبار المفاضلة هو أول خطوة في كل الحالات؛ تابع مواعيد كل دولة من البداية، وقدّم مبكرًا على موقع المنحة نفسه إذا كان إعلانها يتطلب ذلك.
            </p>
          </div>
        </div>

        {/* ماذا أفعل بعد اختبار المفاضلة؟ */}
        <div className="pt-2 border-t border-[var(--mn-border)] space-y-3">
          <div className="flex items-center gap-2">
            <SubSectionIconBadge icon={Bell} />
            <h4 className="text-[12.5px] font-bold text-[var(--mn-heading)]">
              ثانيًا: ماذا أفعل بعد اختبار المفاضلة؟
            </h4>
          </div>

          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            بعد أداء اختبار المفاضلة، لا تنتظر النتيجة فقط، بل استمر في متابعة صفحات وزارة التعليم العالي وإعلاناتها أولًا بأول؛ لأن طريقة استكمال التقديم تختلف من دولة إلى أخرى.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-1.5">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
                <SubSectionIconBadge icon={ExternalLink} />
                <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">المجر والصين</h5>
              </div>
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                لا يكفي التسجيل لدى الوزارة فقط، بل يجب أن تكون قد قدمت في{' '}
                <strong className="text-[var(--mn-heading)]">الموقع الرسمي للمنحة</strong> حسب تعليمات كل دولة، ثم تأتي مرحلة ترشيحك من الوزارة إذا كنت من الفائزين ومستوفيًا للشروط.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-1.5">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
                <SubSectionIconBadge icon={MousePointerClick} />
                <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">بقية دول التبادل الثقافي</h5>
              </div>
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
                مثل (الأردن، الجزائر، المغرب، كوبا، باكستان). عادةً تعلن الوزارة لاحقًا عن{' '}
                <strong className="text-[var(--mn-heading)]">رابط التسجيل الخاص بكل دولة</strong>، ويتقدم الطالب من خلال الرابط ويستكمل إجراءاته المطلوبة.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <span className="text-[11.5px] font-bold text-[var(--mn-heading)] block">
              مهمتك الأساسية بعد الاختبار:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[var(--mn-heading)]">
              {['متابعة النتائج', 'أسماء المرشحين', 'روابط التسجيل', 'تعليمات كل دولة', 'المواعيد النهائية'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="bg-[var(--mn-surface)] border border-[var(--mn-border)] px-2.5 py-1 rounded-lg shadow-2xs"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text-muted)] pt-1 border-t border-[var(--mn-border)]">
              وعدم التأخر عن أي خطوة أو إعلان رسمي تنشره وزارة التعليم العالي.
            </p>
          </div>
        </div>
      </div>

      {/* ٧. ملحق خاص: منحة الحكومة المجرية */}
      <div
        id="hungary-scholarship-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={Landmark}
          title="٧. ملحق خاص: منحة الحكومة المجرية"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-2">
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              <strong className="text-[var(--mn-heading)] ml-1">منحة الحكومة المجرية</strong>
              من أهم منح التبادل الثقافي لليمنيين، ويختلف مسارها قليلًا عن بقية الدول؛ لأن الطالب لا يكتفي بالتسجيل لدى وزارة التعليم العالي اليمنية، بل يجب عليه أيضًا التقديم في موقع المنحة المجرية نفسه.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              ولهذا فإن التقديم على المجر يمر بمسارين مرتبطين ببعض: التسجيل في منصة المنحة المجرية + الترشيح من وزارة التعليم العالي اليمنية. وإذا أهمل الطالب أحد المسارين، فقد يفقد فرصة الترشيح حتى لو كانت نتيجته قوية في المفاضلة.
            </p>
            <div className="p-2.5 rounded-lg bg-[#0E7C86]/8 border border-[#0E7C86]/25 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#0E7C86] shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                <strong className="text-[#0E7C86] dark:text-[#21A7B4] ml-1">ملاحظة حاسمة:</strong>
                فإذا أغلقت المنصة المجرية ولم يكن لديك طلب مسجل فيها، فلن تستطيع وزارة التعليم العالي ترشيحك للمجر لاحقًا، حتى لو حصلت على أعلى نتيجة في اختبار المفاضلة أو كنت الأول على محافظتك.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--mn-border)]">
              <div className="flex items-center gap-2">
                <SubSectionIconBadge icon={Users} />
                <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">كم عدد منح المجر لليمن؟</h4>
              </div>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#142B5F]/10 text-[var(--mn-heading)]">
                62 مقعداً
              </span>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              في دورة 2026/2027 كان العدد 62 مقعدًا موزعة إلى:
            </p>
            <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
              <div className="p-2 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] text-[var(--mn-heading)]">
                <span className="block text-[13px] font-bold">47</span>
                <span>مقعد بكالوريوس</span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] text-[#0E7C86] dark:text-[#21A7B4]">
                <span className="block text-[13px] font-bold">15</span>
                <span>مقعد ماجستير</span>
              </div>
            </div>
            <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] leading-[1.7] text-justify">
              وهذا العدد ليس ثابتًا كل عام، فقد يزيد أو ينقص بحسب الحصة المخصصة لليمن في كل دورة.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--mn-border)]">
              <div className="flex items-center gap-2">
                <SubSectionIconBadge icon={Calendar} />
                <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">متى يبدأ التقديم؟</h4>
              </div>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#0E7C86]/10 text-[#0E7C86]">
                قبل المفاضلة
              </span>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              يبدأ التقديم على منحة الحكومة المجرية عادة قبل موعد اختبار المفاضلة اليمني، ولهذا يجب على الطالب الانتباه إلى موعد إغلاق المنصة المجرية وعدم انتظار الاختبار.
            </p>
            <div className="p-2 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] space-y-1 text-[10.5px] font-bold">
              <div className="flex justify-between">
                <span className="text-[var(--mn-heading)]">إعلان وزارة التعليم العالي:</span>
                <strong className="text-[var(--mn-text)]">20 نوفمبر 2025</strong>
              </div>
              <div className="flex justify-between border-t border-[var(--mn-border)] pt-1">
                <span className="text-[var(--mn-heading)]">آخر موعد في منصة المنحة:</span>
                <strong className="text-[var(--mn-text)]">15 يناير 2026</strong>
              </div>
            </div>
            <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] leading-[1.7] text-justify">
              ثم استكملت الوزارة اليمنية بعد ذلك إجراءات التسجيل والترشيح. لذلك إذا كنت تريد المنافسة على منحة المجر، يجب أن تقدم في الموقع الرسمي للمنحة المجرية قبل موعد الإغلاق، حتى لو كان اختبار المفاضلة اليمني سيأتي بعد ذلك.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={MousePointerClick} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">كيف يتم التقديم؟</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            يدخل الطالب إلى منصة منحة الحكومة المجرية وينشئ طلبه، ثم يختار البرامج والجامعات التي يريدها، ويسمح له باختيار برنامجين دراسيين كحد أقصى بحسب البرامج المتاحة لليمن في تلك الدورة.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            بعد ذلك يكمل الطالب أيضًا إجراءات التسجيل التي تطلبها وزارة التعليم العالي اليمنية حتى يدخل في المفاضلة والترشيح للمقاعد المخصصة لليمن.
          </p>
          <div className="p-2 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] text-center text-[11px] font-bold text-[var(--mn-heading)]">
            إذن التسجيل في الموقع المجري وحده لا يكفي، وكذلك التسجيل لدى الوزارة وحده لا يكفي؛ يجب استكمال المسارين.
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={FileBadge} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">ما الوثائق المطلوبة؟</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            عند التقديم في منصة المنحة المجرية يرفع الطالب الوثائق المطلوبة بحسب الدرجة العلمية والتخصص والجامعة، وتشمل عادة: جواز السفر أو البطاقة الشخصية + شهادة المؤهل الدراسي + كشف الدرجات + إثبات اللغة + خطاب الدافع + الصورة الشخصية، مع ترجمة الوثائق إلى اللغة المطلوبة عند الحاجة.
          </p>
          <div className="p-3 bg-[var(--mn-surface)] rounded-lg border border-[var(--mn-border)] space-y-1.5 text-[10.5px] font-bold text-[var(--mn-text-muted)] leading-[1.75] text-justify">
            <p>
              وإذا لم يكن جواز السفر جاهزًا وقت التقديم، يمكن للطالب التقديم باستخدام البطاقة الشخصية السارية مع رفع تعهد باستكمال جواز السفر لاحقًا، وكان آخر موعد لاستكمال الجواز في دورة 2026/2027 هو 1 أغسطس 2026.
            </p>
            <p>
              وكذلك إذا كان الطالب ينتظر صدور شهادة اللغة الإنجليزية أو نتيجة اختبار اللغة، فيمكنه رفع التعهد المطلوب وقت التقديم ثم استكمال إثبات اللغة لاحقًا، وكان آخر موعد لذلك في تلك الدورة 1 أغسطس 2026.
            </p>
            <p>
              وفي بعض الحالات، إذا كان الطالب في السنة الأخيرة ولم تصدر شهادته النهائية بعد، يسمح له البرنامج برفع التعهد والمستندات المتاحة ثم استكمال الشهادة النهائية في الموعد المحدد للوثائق المؤجلة.
            </p>
          </div>
          <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] leading-[1.75] text-justify">
            وقد تطلب بعض الجامعات أو التخصصات مستندات إضافية، لذلك بعد اختيار البرنامج يجب فتح صفحته وقراءة متطلباته بالتحديد، وعدم الاعتماد على قائمة عامة فقط.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={GraduationCap} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">ماذا يحدث بعد التقديم والترشيح؟</h4>
          </div>
          <div className="space-y-2 text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            <p>
              بعد إرسال الطلب في المنصة المجرية، يتم أولًا فحص الطلب والتأكد من اكتمال البيانات والوثائق، ثم تأتي مرحلة الترشيح من الجانب اليمني بحسب نتائج المفاضلة وعدد المقاعد المتاحة.
            </p>
            <p>
              إذا رشحتك وزارة التعليم العالي، ينتقل ملفك بعد ذلك إلى الجامعة أو الجامعات المجرية التي اخترتها، وهنا تبدأ مرحلة التقييم الأكاديمي.
            </p>
            <p>
              وقد تطلب منك الجامعة مقابلة شخصية، أو اختبار قبول، أو اختبار لغة، أو مستندات إضافية بحسب الجامعة والتخصص.
            </p>
            <p className="text-[var(--mn-heading)]">
              لذلك ترشيحك من وزارة التعليم العالي لا يعني أنك حصلت على المنحة النهائية؛ بل يجب أيضًا أن تقبلك الجامعة المجرية.
            </p>
            <p>
              وإذا لم تُقبل في خيارك الأول، فقد يستمر النظر في الخيار الثاني إذا كان متاحًا ضمن طلبك وترشيحك. أما إذا تم رفضك في الخيارين معًا، فلا يوجد تعويض تلقائي من وزارة التعليم العالي بجامعة أو تخصص آخر، وينتهي ترشيحك لهذه الدورة ما لم يصدر إجراء رسمي مختلف.
            </p>
            <p className="text-[#0E7C86] dark:text-[#21A7B4]">
              بعد اجتياز التقييم الجامعي واستكمال بقية مراحل البرنامج، تصدر النتيجة النهائية للمنحة من الجانب المجري.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={Coins} />
              <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">ما تمويل ومزايا المنحة؟</h5>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              تغطي منحة الحكومة المجرية الرسوم الدراسية كاملة طوال مدة الدراسة. كما يحصل طلاب البكالوريوس والماجستير والبرامج ذات المرحلة الواحدة على راتب شهري قدره 43,700 فورنت مجري، أي حوالي 137 دولارًا تقريبًا وقت إعداد هذا الشرح، ويتغير ما يعادله بالدولار حسب سعر الصرف.
            </p>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              وتوفر المنحة أيضًا سكنًا جامعيًا مجانيًا، وإذا لم يتوفر السكن يحصل الطالب على بدل سكن قدره 40,000 فورنت مجري شهريًا، إضافة إلى التأمين الصحي.
            </p>
            <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] leading-[1.75] text-justify">
              لكن الراتب وبدل السكن لا يعنيان بالضرورة أن جميع تكاليف المعيشة ستكون مغطاة بالكامل، وقد يحتاج الطالب إلى مبلغ إضافي بحسب المدينة ونمط معيشته.
            </p>
            <p className="text-[10.5px] font-bold text-[var(--mn-heading)] leading-[1.75] text-justify">
              وبالنسبة للطلاب اليمنيين الموفدين عبر وزارة التعليم العالي، توجد أيضًا مخصصات مالية من الوزارة اليمنية إلى جانب مزايا المنحة المجرية، وفق نظام الإيفاد والاعتمادات المالية المعمول بها.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={PlaneTakeoff} />
              <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">ماذا بعد القبول النهائي؟</h5>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              بعد صدور القبول النهائي، يبدأ الطالب بإجراءات قبول المنحة، واستخراج التأشيرة، وتجهيز وثائق السفر، واستكمال إجراءات الإيفاد والمخصصات المالية لدى وزارة التعليم العالي اليمنية، ثم السفر إلى المجر والتسجيل في الجامعة.
            </p>
            <div className="p-2.5 rounded-lg bg-[#0E7C86]/8 border border-[#0E7C86]/25 space-y-1 mt-2">
              <span className="text-[11px] font-bold text-[var(--mn-heading)] block">
                القاعدة الأهم في منحة المجر:
              </span>
              <p className="text-[10.5px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                قدّم في المنصة المجرية مبكرًا، ثم أكمل مسار وزارة التعليم العالي، ولا تعتبر الترشيح من الوزارة قبولًا نهائيًا حتى تجتاز تقييم الجامعة وتصدر النتيجة النهائية للمنحة.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ٨. ملحق خاص: منحة الحكومة الصينية */}
      <div
        id="china-scholarship-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={Globe}
          title="٨. ملحق خاص: منحة الحكومة الصينية"
          className="mb-1"
        />

        <div className="border-r-2 border-[#142B5F] pr-3.5 py-2.5 bg-[#142B5F]/5 rounded-l-lg space-y-1.5">
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.9] text-justify">
            <strong className="text-[var(--mn-heading)] ml-1">منحة الحكومة الصينية</strong>
            تختلف عن كثير من منح التبادل الثقافي؛ لأن التقديم عليها لا يقتصر على التسجيل لدى وزارة التعليم العالي اليمنية فقط، بل يمر بمسارين مرتبطين ببعض: التسجيل في منصة منحة الحكومة الصينية{' '}
            <span className="font-mono text-[var(--mn-heading)]">CampusChina</span> ضمن مسار{' '}
            <span className="font-mono text-[var(--mn-heading)]">Type A</span>، ثم استكمال الترشيح عبر وزارة التعليم العالي اليمنية. لذلك إذا كنت تريد المنافسة على المنحة الصينية، يجب أن تكمل التسجيل في المنصة الصينية أولًا وتحفظ بيانات طلبك، ثم تتابع إعلان الوزارة اليمنية وتكمل المرحلة الخاصة بها.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--mn-border)]">
              <div className="flex items-center gap-2">
                <SubSectionIconBadge icon={Users} />
                <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">عدد المقاعد المتاحة لعام 2026</h4>
              </div>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#142B5F]/10 text-[var(--mn-heading)]">
                عام 2026
              </span>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              <strong className="text-[var(--mn-heading)]">عدد المقاعد المتاحة لعام 2026:</strong> 10 مقاعد بكالوريوس و22 ماجستير.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--mn-border)]">
              <div className="flex items-center gap-2">
                <SubSectionIconBadge icon={Calendar} />
                <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">مواعيد التقديم</h4>
              </div>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#0E7C86]/10 text-[#0E7C86]">
                فبراير إلى مارس
              </span>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              <strong className="text-[var(--mn-heading)]">آخر موعد للتقديم في كل سنة:</strong> فبراير إلى مارس.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={MousePointerClick} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">طريقة التسجيل</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            يبدأ الطالب بالتسجيل في منصة <span className="font-mono">CampusChina</span> ضمن مسار <span className="font-mono">Type A</span>، وبالنسبة لليمن يستخدم <strong className="text-[var(--mn-heading)]">Agency Number: 8861</strong>. وبعد إكمال الطلب يجب حفظ استمارة الطلب بصيغة PDF ورقم الطلب؛ لأن وزارة التعليم العالي قد تطلبهما عند فتح مرحلة التسجيل والترشيح لديها.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            وفي دورة 2026/2027 بدأ التسجيل في المنصة الصينية أولًا، ثم فتحت الوزارة بعد ذلك المرحلة الخاصة بها للطلاب الذين أتموا التسجيل الخارجي. لذلك لا تنتظر رابط الوزارة إذا كان التسجيل الصيني قد بدأ، بل أنجز تسجيلك في المنصة أولًا ثم أكمل تسجيل الوزارة عندما تعلن عنه.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[#0E7C86]/30 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--mn-border)]">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={FileBadge} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">اختبار CSCA لطلاب البكالوريوس</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0E7C86]/10 text-[#0E7C86]">
              خاص بالبكالوريوس
            </span>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            طلاب البكالوريوس عليهم الانتباه إلى اختبار CSCA؛ لأنه مختلف عن اختبار المفاضلة اليمني. اختبار المفاضلة تستخدمه وزارة التعليم العالي لترتيب واختيار المرشحين داخل اليمن، بينما CSCA اختبار صيني يدخل ضمن متطلبات التقديم والقبول للبكالوريوس.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            لذلك من الأفضل أن يؤدي الطالب الاختبار مبكرًا، مثل ديسمبر أو يناير، حتى تكون النتيجة جاهزة قبل إغلاق التقديم على منحة الحكومة الصينية، ولا ينتظر حتى شهر مارس ثم يبدأ بإجراءات الاختبار.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            وفي الدورة السابقة كان عدد الطلاب الذين تم ترشيحهم للصين قليلًا، حوالي 10 طلاب فقط، وكان من أبرز الأسباب أن عددًا كبيرًا من الطلاب لم يكن قد أدى اختبار CSCA المطلوب، وبالتالي لم تكن ملفاتهم مكتملة للمنافسة على الترشيح.
          </p>
          <p className="text-[11px] font-bold text-[var(--mn-text-muted)] leading-[1.8] text-justify">
            وتختلف مواد CSCA حسب التخصص، ومن المواد التي قد تدخل فيه الرياضيات والكيمياء والفيزياء واللغة الصينية بحسب البرنامج والجامعة. ويمكن للطالب تحميل شرح أوسع عن اختبار CSCA من قسم الملفات في المحاضرة الأولى.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={FileBadge} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">الوثائق المطلوبة</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            تشمل الوثائق المطلوبة عادة جواز سفر ساري المفعول، الشهادة الدراسية، كشف الدرجات، ترجمة وتصديق الوثائق المطلوبة، إثبات اللغة، استمارة الطلب من CampusChina، نتيجة CSCA لطلاب البكالوريوس، خطة الدراسة، الفحص الطبي، والسجل الجنائي.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            وبالنسبة للماجستير والدكتوراه تُطلب عادة أيضًا رسالتا توصية أكاديمية، وقد تطلب بعض الجامعات مستندات إضافية بحسب التخصص والبرنامج.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            ويجب الانتباه أيضًا إلى لغة الدراسة؛ فبعض البرامج تكون باللغة الصينية وتطلب مستوى معينًا في اللغة مثل HSK، وقد يحتاج الطالب في بعض الحالات إلى دراسة سنة لغة تحضيرية قبل بدء التخصص. لذلك عند اختيار الجامعة والتخصص، راجع لغة البرنامج ومتطلبات اللغة المطلوبة له قبل إرسال الطلب.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={GraduationCap} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">ماذا يحدث بعد الترشيح؟</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            بعد أن ترشحك وزارة التعليم العالي، لا يعني ذلك أنك حصلت على المنحة النهائية. ينتقل الملف بعد ذلك إلى الجانب الصيني والجامعة المعنية لمراجعته والتأكد من استيفاء شروط القبول والمنحة.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            لذلك يجب التفريق بين ترشيح الوزارة والقبول النهائي؛ فالترشيح يعني أنك اجتزت مرحلة الاختيار في اليمن، أما المنحة فلا تصبح نهائية إلا بعد موافقة الجانب الصيني وصدور نتيجة القبول.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={Coins} />
              <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">تغطية المنحة</h5>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              تغطي منحة الحكومة الصينية الرسوم الدراسية كاملة + السكن الجامعي أو بدل السكن + التأمين الطبي + راتب شهري للمعيشة.
            </p>
            <div className="bg-[var(--mn-surface)] p-2.5 rounded-xl border border-[var(--mn-border)] space-y-1 text-[11px] font-bold text-[var(--mn-text)]">
              <p>ويبلغ الراتب عادة:</p>
              <ul className="list-disc list-inside space-y-1 pr-1">
                <li>
                  <strong className="text-[var(--mn-heading)]">البكالوريوس:</strong> 2,500 يوان شهريًا، أي حوالي 373 دولارًا.
                </li>
                <li>
                  <strong className="text-[var(--mn-heading)]">الماجستير:</strong> 3,000 يوان شهريًا، أي حوالي 447 دولارًا.
                </li>
              </ul>
              <p className="text-[10.5px] text-[var(--mn-text-muted)] pt-0.5">
                وتتغير القيمة بالدولار بحسب سعر الصرف.
              </p>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text-muted)] leading-[1.75] text-justify">
              وبالنسبة للطلاب اليمنيين الموفدين عبر وزارة التعليم العالي، توجد أيضًا مخصصات مالية من الوزارة اليمنية إلى جانب مزايا المنحة الصينية، وفق نظام الإيفاد والاعتمادات المالية وإجراءات الصرف المعتمدة.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={PlaneTakeoff} />
              <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">ماذا بعد القبول النهائي؟</h5>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              بعد صدور القبول النهائي، يستلم الطالب خطاب القبول ووثائق المنحة المطلوبة للتأشيرة، ثم يستكمل إجراءات السفر والتسجيل في الجامعة والسكن.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              كما يتابع الطالب اليمني مع وزارة التعليم العالي لاستكمال قرار الإيفاد والإجراءات المالية والمخصصات الخاصة به.
            </p>
          </div>
        </div>
      </div>

      {/* ٩. ملحق خاص: منحة جامعة الأمير محمد بن فهد */}
      <div
        id="pmu-scholarship-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={Award}
          title="٩. ملحق خاص: منحة جامعة الأمير محمد بن فهد"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify pr-1">
            في دورة 2026/2027 أعلنت وزارة التعليم العالي اليمنية عن منحتين دراسيتين ممولتين بالكامل في{' '}
            <strong className="text-[var(--mn-heading)]">جامعة الأمير محمد بن فهد</strong> بالسعودية ضمن برنامج المنح العالمية، بالتعاون مع اتحاد الجامعات العربية. ويختلف هذا المسار عن المجر والصين؛ لأنه يبدأ بالتقديم في جامعة الأمير محمد بن فهد نفسها، ثم يكمل الطالب المرحلة الثانية لدى وزارة التعليم العالي اليمنية.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={MousePointerClick} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">طريقة وموعد التسجيل</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            التقديم هنا <strong className="text-[var(--mn-heading)]">يبدأ من الجامعة نفسها أولًا</strong>. يدخل الطالب إلى موقع جامعة الأمير محمد بن فهد، ويملأ طلب القبول والمنحة ويرفع المستندات المطلوبة، وبعد إتمام التسجيل في الجامعة ينتقل إلى المرحلة الثانية ويسجل في رابط وزارة التعليم العالي اليمنية.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            في دورة 2026/2027 فتحت الوزارة المرحلة الثانية يوم 4 فبراير 2026، وكان آخر موعد لاستقبال الطلبات عبر روابط الوزارة 12 فبراير 2026. أما بوابة الجامعة نفسها فلم أجد في الإعلان الرسمي لهذه الدورة تاريخ إغلاق مستقلًا منشورًا، لذلك يجب دائمًا متابعة موقع الجامعة والوزارة معًا وعدم انتظار رابط الوزارة حتى تبدأ التقديم في الجامعة.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={FileBadge} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">شروط ووثائق التقديم</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            يبدأ الطالب بطلب إلكتروني للجامعة، ومن المتطلبات الأساسية للطلاب الدوليين: شهادة الثانوية، جواز السفر، صورتان شخصيتان، ونتيجة SAT أو ما يعادلها بحسب مسار القبول. وللدخول المباشر إلى البرنامج الأكاديمي تشترط الجامعة إثبات اللغة، مثل IELTS بدرجة 6.0 على الأقل وبحد أدنى 5.5 في الكتابة أو ما يعادله، كما يخضع الطالب لمقابلة مع مكتب القبول.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            أما برنامج المنح العالمية نفسه فينظر كذلك إلى المستوى الأكاديمي والتميز والأنشطة والإنجازات. وبالنسبة لفئة المنحة الكاملة للطلاب الدوليين المتميزين، يذكر دليل البرنامج معدل ثانوية لا يقل عن 85% مع استيفاء شروط القبول وإجراء مقابلة، ويمكن دعم الملف بالجوائز والأنشطة والاختبارات أو ملف الإنجازات.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={GraduationCap} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">ماذا يحدث بعد التقديم؟</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            بعد أن يكمل الطالب طلب الجامعة ثم تسجيل وزارة التعليم العالي، تدخل الطلبات في مرحلة المفاضلة والترشيح. وفي 1 مارس 2026 أعلنت الوزارة أسماء الفائزين في منح المجر والصين ومنحتي جامعة الأمير محمد بن فهد، لكنها أكدت أن ترشيح الوزارة لا يضمن القبول النهائي إذا لم توافق الجامعة على ملف الطالب.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            لذلك ترشيحك من الوزارة يعني أنك فزت بمرحلة الترشيح اليمني، ثم يجب استكمال إجراءات الجامعة والحصول على قبولها النهائي قبل اكتمال المنحة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={Coins} />
              <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">تغطية المنحة</h5>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              وزارة التعليم العالي اليمنية وصفت المقعدين بأنهما منحتان ممولتان بالكامل. وبحسب دليل برنامج المنح العالمية الذي أحالت إليه الوزارة، فإن فئة التغطية الكاملة للطلاب الدوليين المتميزين تشمل:
            </p>
            <div className="bg-[var(--mn-surface)] p-2.5 rounded-xl border border-[var(--mn-border)] text-[11px] font-bold text-[var(--mn-text)] leading-[1.85]">
              إعفاء كامل من الرسوم الدراسية والكتب + سكن جامعي مجاني + مواصلات + تأمين صحي + راتب شهري قدره 800 دولار + تذكرة طيران اقتصادية ذهابًا وعودة مرة كل سنة، إضافة إلى حافز يصل إلى 1,000 دولار لكل فصل دراسي عند تحقيق التميز الأكاديمي أو في الأنشطة.
            </div>
            <p className="text-[10.5px] font-bold text-[var(--mn-text-muted)] leading-[1.75] text-justify">
              والأفضل للطالب عند صدور قبوله النهائي أن يراجع خطاب المنحة الخاص به للتأكد من الحزمة الممنوحة له؛ لأن برنامج جامعة الأمير محمد بن فهد يضم أكثر من فئة للمنح، والجامعة توضح أن نوع وقيمة الدعم يتحددان وفق تقييم لجنة المنح.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={PlaneTakeoff} />
              <h5 className="text-[12px] font-bold text-[var(--mn-heading)]">ماذا بعد القبول النهائي؟</h5>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              بعد موافقة الجامعة وصدور القبول النهائي، يكمل الطالب إجراءات القبول والتأشيرة والسكن والسفر مع الجامعة، ثم يتابع مع وزارة التعليم العالي اليمنية إجراءات الابتعاث المطلوبة.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              والجامعة توضح أن مكتب القبول الدولي يساعد الطلاب المقبولين في إجراءات التأشيرة والسكن وبدء الدراسة.
            </p>
            <div className="p-2.5 rounded-lg bg-[#0E7C86]/8 border border-[#0E7C86]/25 space-y-1 mt-1">
              <span className="text-[11px] font-bold text-[var(--mn-heading)] block">
                ملخص وقاعدة منحة جامعة الأمير محمد بن فهد:
              </span>
              <p className="text-[10.5px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify">
                التقديم يبدأ من بوابة الجامعة أولاً ثم التسجيل في رابط وزارة التعليم العالي اليمنية، وترشيح الوزارة خطوة أولى مشروطة بموافقة وقبول الجامعة النهائي للحصول على حزمة المنحة الشاملة.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ١٠. ملحق خاص: منح مصر والجزائر وكوبا وباكستان */}
      <div
        id="egypt-scholarship-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-4"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={MapPin}
          title="١٠. ملحق خاص: منح مصر والجزائر وكوبا وباكستان"
          className="mb-1"
        />

        {/* أولًا: المنح الدراسية في مصر */}
        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2.5">
          <div className="flex items-center gap-2 pb-1.5 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={Landmark} />
            <h4 className="text-[12.5px] font-bold text-[var(--mn-heading)]">أولًا: المنح الدراسية في مصر</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            في دورة 2026/2027 أعلنت وزارة التعليم العالي اليمنية عن مسارين مختلفين للدراسة في <strong className="text-[var(--mn-heading)]">مصر</strong>، ويجب على الطالب التفريق بينهما لأن التمويل والتخصصات ليست واحدة:
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            <strong className="text-[var(--mn-heading)]">المسار الأول هو منح التبادل الثقافي الشاملة:</strong> وكانت مخصصة للتخصصات النوعية مثل الطب البشري وطب الأسنان وبقية العلوم الصحية باستثناء التمريض والعلاج الطبيعي، والهندسة، وعلوم الحاسوب والذكاء الاصطناعي، والعلوم الأساسية. وقد وصفت الوزارة هذه المنح رسميًا بأنها منح شاملة، لكن الإعلان نفسه لم يفصل جميع بنود التمويل بندًا بندًا.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            <strong className="text-[var(--mn-heading)]">أما المسار الثاني فهو المقاعد الدراسية المجانية:</strong> وكانت مخصصة للتخصصات الأدبية والإنسانية والاجتماعية والاقتصادية والإدارية. والمقعد المجاني هنا يعني إعفاءً من الرسوم الدراسية فقط، ولا تتحمل الوزارة بقية تكاليف الطالب المالية.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            <strong className="text-[var(--mn-heading)]">طريقة وموعد التسجيل:</strong> في هذه الدورة كان التقديم يتم مباشرة عبر روابط وزارة التعليم العالي اليمنية، ولم يكن مطلوبًا من الطالب أن يفتح طلبًا مستقلًا في منصة مصرية قبل المفاضلة. بدأ الإعلان في 9 أبريل 2026، وكان الموعد النهائي أولًا 20 أبريل. وبعد حدوث مشكلة تقنية في روابط Google Forms، نقلت الوزارة التسجيل إلى منصتها الإلكترونية ومددت الموعد النهائي حتى 22 أبريل 2026. والطلاب الذين سبق أن سجلوا بصورة صحيحة لم يُطلب منهم إعادة التسجيل بعد نقل النظام.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            <strong className="text-[var(--mn-heading)]">شروط التقديم والمفاضلة:</strong> للبكالوريوس كان يشترط أن يكون الطالب من خريجي العام الدراسي 2024/2025، وألا يتجاوز عمره 22 عامًا بحسب شروط بلد الابتعاث. وكانت المفاضلة تعتمد على معدل الثانوية العامة، وعند تساوي الطلاب يتم الرجوع إلى مجموع درجات الرياضيات والفيزياء والكيمياء والأحياء. أما الماجستير فكان الحد العمري 30 عامًا، وتتم المفاضلة بحسب معدل البكالوريوس في نفس التخصص العلمي. وبالنسبة للدكتوراه كان الحد العمري 32 عامًا، وتحسب المفاضلة بنسبة 70% من معدل البكالوريوس + 30% من معدل الماجستير في نفس التخصص. كما كان على المتقدمين للدراسات العليا استكمال تصديق الشهادات أو معادلتها لدى الوزارة قبل التقديم.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            <strong className="text-[var(--mn-heading)]">ماذا يحدث بعد التقديم؟</strong> بعد إغلاق التسجيل تقوم الوزارة بالمفاضلة بين المتقدمين بحسب الرغبات والمقاعد المتاحة من الجانب المصري. وفي دورة 2026/2027 أعلنت الوزارة النتائج النهائية يوم 18 مايو 2026 لمنح التبادل الثقافي والمقاعد المجانية. وأهم نقطة للطالب هنا: منحة التبادل الثقافي الشاملة ليست هي المقعد المجاني؛ الأولى منحة شاملة بحسب وصف الوزارة، أما الثانية فهي إعفاء من الرسوم الدراسية فقط وتبقى بقية تكاليف الطالب عليه.
          </p>
        </div>

        {/* ثانيًا: الدراسة في الجزائر */}
        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2.5">
          <div className="flex items-center gap-2 pb-1.5 border-b border-[var(--mn-border)]">
            <SubSectionIconBadge icon={Landmark} />
            <h4 className="text-[12.5px] font-bold text-[var(--mn-heading)]">ثانيًا: الدراسة في الجزائر</h4>
          </div>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            في دورة 2026/2027 ظهر للجزائر <strong className="text-[var(--mn-heading)]">38 مقعد بكالوريوس</strong> ضمن البيانات المدققة، منها <strong className="text-[var(--mn-heading)]">10 مقاعد للطب البشري</strong>. وهذه الأرقام تخص تلك الدورة فقط، وقد يتغير عدد المقاعد والتخصصات من سنة إلى أخرى.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            <strong className="text-[var(--mn-heading)]">موعد وطريقة التسجيل:</strong> الجزائر كانت ضمن جولة يونيو 2026، وكان التقديم الأولي للطالب اليمني يتم من خلال بوابة وزارة التعليم العالي اليمنية <span className="font-mono text-[var(--mn-heading)]">portal.moheye.net</span>. ولم يكن مطلوبًا في المرحلة الأولى أن ينشئ الطالب حسابًا في منصة جزائرية قبل دخول المفاضلة. لذلك الجزائر تشبه الأردن في طريقة البداية: عندما تفتح الوزارة التسجيل، ترسل الرابط، ويسجل الطالب بياناته ورغباته ووثائقه من خلاله، ثم ينتظر نتيجة المفاضلة والترشيح. وبما أن إعلان هذه المجموعة جاء في 14 يونيو 2026، فمن المناسب أن يبدأ الطالب بمتابعة إعلانات الوزارة من بداية يونيو، مع الانتباه إلى أن الموعد قد يتغير في كل سنة.
          </p>
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            <strong className="text-[var(--mn-heading)]">ماذا عن منصة Study in Algeria؟</strong> توجد فعلًا منصة رسمية باسم Study in Algeria، وتُستخدم كذلك للطلاب الدوليين الذين يتقدمون مباشرة إلى الجامعات الجزائرية، لكن هذا مسار مختلف عن مقعد التبادل الثقافي اليمني. إذا أعلنت وزارة التعليم العالي اليمنية المنحة وطلبت منك في البداية التسجيل في بوابتها فقط، نفذ ما ورد في الإعلان ولا تفتح تسجيلًا آخر من نفسك. وإذا طلب الجانب الجزائري بعد ترشيحك استكمال تسجيل إلكتروني أو رفع مستندات في منصة معينة، تقوم بذلك حينها حسب التعليمات الرسمية. وبعد الفوز في مفاضلة الوزارة تبدأ إجراءات الاستكمال والقبول مع الجانب الجزائري، ويجب أن تتذكر أن الفوز في المفاضلة يعني الترشيح، وليس القبول الجامعي النهائي تلقائيًا.
          </p>
        </div>

        {/* ثالثًا: منحة كوبا ورابعًا: الدراسة في باكستان */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={Landmark} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">ثالثًا: منحة كوبا</h4>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              في دورة 2026/2027 ظهر لكوبا <strong className="text-[var(--mn-heading)]">10 مقاعد بكالوريوس</strong>، وجميعها في <strong className="text-[var(--mn-heading)]">الطب البشري</strong>. وهذه الأرقام تخص تلك الدورة فقط، وقد يتغير عدد المقاعد من سنة إلى أخرى.
            </p>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              كوبا كانت ضمن جولة يونيو 2026، وكان التسجيل الأولي يتم من خلال الرابط الذي تنشره وزارة التعليم العالي اليمنية. ولا توجد في مرحلة التقديم الأولى منصة كوبية منفصلة يجب على الطالب التسجيل فيها بنفسه مثل المجر أو الصين. ويتضمن المسار سنة لدراسة اللغة الإسبانية قبل الدراسة أو ضمن بداية البرنامج بحسب الترتيبات المعتمدة. وبعد الفوز بالترشيح، يتابع الطالب تعليمات وزارة التعليم العالي والجانب الكوبي والجامعة التي يتم توجيهه إليها.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={Landmark} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">رابعًا: الدراسة في باكستان</h4>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              باكستان كانت أيضًا ضمن جولة يونيو 2026، وكان التقديم الأولي عن طريق بوابة وزارة التعليم العالي اليمنية، ولم يكن مطلوبًا من الطالب في البداية أن يسجل بنفسه في موقع باكستاني قبل المفاضلة. لكن باكستان كانت مختلفة قليلًا في دورة 2026؛ فعند إعلان نتائج 2 يوليو، لم تعلن الوزارة الترشيحات الخاصة بها مباشرة، بل أجلتها حتى يصل التأكيد النهائي من الجانب الباكستاني.
            </p>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              توجد في باكستان منح أخرى مستقلة، ومن أشهرها منح العلامة محمد إقبال، لكن لا يعني ذلك أن كل إعلان تبادل ثقافي يمني خاص بباكستان هو نفس هذه المنحة. الخلاصة في كوبا وباكستان: لا تبحث عن منصة خارجية وتسجل فيها من نفسك قبل المفاضلة؛ ابدأ من رابط الوزارة اليمنية، وبعد الفوز اتبع تعليمات الدولة والجامعة لاستكمال القبول.
            </p>
          </div>
        </div>
      </div>

      {/* ١١. كيف يتم توزيع حصص المحافظات وجدول الـ 22 محافظة */}
      <div
        id="governorate-quotas-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={Scale}
          title="١١. كيف يتم توزيع حصص المحافظات؟ (وبيانات الـ 22 محافظة + فئة الخارج)"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-2">
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              من المهم أن تعرف أن وزارة التعليم العالي لا تقسم مقاعد كل دولة بالتساوي بين المحافظات، ولا يوجد عدد ثابت يتكرر كل عام لكل محافظة. وتوزيع الحصص يكون إجمالًا على أساس{' '}
              <strong className="text-[var(--mn-heading)]">50% للمحافظات الجنوبية والشرقية</strong>، و
              <strong className="text-[var(--mn-heading)]">50% لبقية المحافظات</strong>، ثم تتوزع المقاعد داخل كل مجموعة بحسب حصص المحافظات والمقاعد المتاحة خلال موسم المنح.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              وفي نتائج دورة 2026/2027 ظهر 205 مقاعد بكالوريوس؛ منها 200 مقعد لطلاب محافظات اليمن و5 مقاعد لفئة الخارج. وعند تجميع عدن ولحج وأبين وحضرموت وشبوة والضالع والمهرة وسقطرى حصلت هذه المحافظات على 101 مقعدًا، مقابل 99 مقعدًا لبقية المحافظات داخل اليمن؛ أي ما يقارب 50.5% مقابل 49.5%. وهذا يوضح عمليًا تطبيق التوازن العام بين المجموعتين في تلك الدورة.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              لكن قاعدة 50/50 لا تعني أن كل دولة وحدها يجب أن توزع مقاعدها بالنصف. فقد تحصل إحدى المجموعتين على مقاعد أكثر في دولة، ثم يُعوَّض الفرق في دولة أخرى خلال نفس موسم المنح. فمثلًا في النتائج التي تم تحليلها كان توزيع الجزائر 22 مقعدًا مقابل 16، بينما في المغرب انعكس الوضع تقريبًا وأصبح 15 مقابل 21. لذلك يجب النظر إلى إجمالي الموسم وليس إلى كل دولة بمفردها. كذلك لا تحصل كل محافظة على العدد نفسه؛ فلا يصح أن نقول مثلًا: «تعز لها دائمًا خمسة مقاعد طب» أو «عدن لها دائمًا عدد محدد»؛ فهذه الأعداد تتغير من دورة إلى أخرى.
            </p>
          </div>
        </div>

        {/* كيف تتم المنافسة داخل المحافظة نفسها؟ */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <div className="pr-1 space-y-2">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={Users} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">
                كيف تتم المنافسة داخل المحافظة نفسها؟
              </h4>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              وبعد تحديد حصة المحافظة تبدأ المنافسة بين طلاب المحافظة نفسها. وهنا لا يعتمد الاختيار على المعدل أو الترتيب وحده، بل على: ترتيب الطالب داخل محافظته + رغباته المسجلة + الدولة التي اختارها + التخصص المطلوب + عدد المقاعد المتاحة في الدولة والتخصص.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              <strong className="text-[var(--mn-heading)]">مثال توضيحي:</strong> إذا كان لمحافظة تعز مقعدان للطب، وكان الطالب الأول والثاني في الترتيب قد اختارا الطب، فقد يمتلئ المقعدان قبل الوصول إلى الطالب الثالث. لكن إذا كان الطالب الأول اختار الهندسة، والطالب الثاني اختار الطب، والطالب الثالث اختار الطب، فقد يحصل الطالبان الثاني والثالث على مقعدي الطب. ومثال آخر: قد يكون ترتيبك الرابع في محافظتك ومع ذلك تحصل على التخصص الذي تريده؛ لأن الطلاب الثلاثة الذين قبلك اختاروا دولًا أو تخصصات مختلفة. وفي المقابل قد يكون ترتيبك الثاني ولا تحصل على الطب إذا لم يكن هناك إلا مقعد واحد متاح وتم منحه للطالب الذي قبلك. لذلك ترتيب الطالب مهم، لكنه ليس العامل الوحيد الذي يحدد الدولة والتخصص الذي سيُرشح إليه.
            </p>
          </div>
        </div>

        {/* ملاحظة مهمة قبل جدول المحافظات */}
        <div className="p-3 rounded-xl bg-[#0E7C86]/5 border border-[#0E7C86]/25 flex items-start gap-2.5 shadow-2xs">
          <SubSectionIconBadge icon={AlertCircle} />
          <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.8] text-justify flex-1">
            <strong className="text-[var(--mn-heading)] ml-1">ملاحظة مهمة:</strong>
            الأعداد المعروضة هي مثال من توزيع مقاعد دورة 2026/2027 فقط وليست أعدادًا ثابتة للمحافظات. فقد يختلف عدد المقاعد من سنة إلى أخرى؛ فمثلًا إذا ظهرت المحويت بـ4 مقاعد في 2026، فقد حصلت في سنوات سابقة على نحو 7–10 مقاعد. لذلك استخدم هذه الأرقام لفهم طريقة التوزيع فقط.
          </p>
        </div>

        <CulturalExchangeGovernoratesAccordion />
      </div>

      {/* ١٢. النتائج والتظلمات: الترشيح ليس قبولًا نهائيًا */}
      <div
        id="results-and-appeals-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={ShieldAlert}
          title="١٢. النتائج والتظلمات: الترشيح ليس قبولًا نهائيًا"
          className="mb-1"
        />

        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2.5">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#142B5F] to-[#0E7C86]" />
          <div className="pr-1 space-y-2.5">
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              بعد إعلان نتائج المفاضلة يجب أن يفرّق الطالب بين الفوز في مفاضلة الوزارة، والقبول من الجامعة أو الدولة، واكتمال إجراءات الإيفاد والسفر؛ فهذه مراحل مختلفة ولا تنتقل من واحدة إلى الأخرى تلقائيًا:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] border-r-2 border-r-[#142B5F]">
                <strong className="text-[var(--mn-heading)] text-[11.5px] block mb-1">
                  1. فائز في مفاضلة الوزارة = مرشح:
                </strong>
                <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.75]">
                  تم اختيارك ضمن المقاعد المتاحة وإرسال اسمك للجهة المانحة.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] border-r-2 border-r-[#0E7C86]">
                <strong className="text-[var(--mn-heading)] text-[11.5px] block mb-1">
                  2. قبول من الجامعة أو الدولة = مقبول نهائيًا:
                </strong>
                <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.75]">
                  وافقت الجهة المانحة أو الجامعة على ملفك وأصدرت القبول المطلوب.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] border-r-2 border-r-[#142B5F]">
                <strong className="text-[#0E7C86] dark:text-[#21A7B4] text-[11.5px] block mb-1">
                  3. اكتمال الإيفاد والسفر:
                </strong>
                <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.75]">
                  استكملت إجراءات الوزارة والتأشيرة والوثائق وأصبحت جاهزًا للسفر.
                </p>
              </div>
            </div>

            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              ولهذا فإن ظهور اسم الطالب في نتائج الوزارة لا يعني أن المنحة أصبحت نهائية؛ فقد يبقى عليه قبول الجامعة، أو مراجعة الوثائق، أو مقابلة، أو اختبار، أو إجراءات أخرى بحسب الدولة والبرنامج. وإذا لم تقبل الجامعة ملف الطالب أو ألغت الدولة المقعد، فلا يعني الترشيح بالضرورة أن الوزارة ستوفر له جامعة أو دولة بديلة.
            </p>
          </div>
        </div>

        {/* التظلمات */}
        <div className="relative overflow-hidden rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] p-3.5 pr-4.5 shadow-2xs space-y-2">
          <div className="absolute top-2.5 right-0 bottom-2.5 w-[3px] rounded-l-full bg-gradient-to-b from-[#0E7C86] to-[#142B5F]" />
          <div className="pr-1 space-y-2">
            <div className="flex items-center gap-2">
              <SubSectionIconBadge icon={AlertCircle} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">التظلمات</h4>
            </div>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              عند إعلان النتائج تفتح الوزارة عادة باب التظلمات لمدة محددة. لذلك يجب على الطالب مراجعة النتيجة فور صدورها وعدم تأجيلها إلى ما بعد انتهاء فترة التظلم.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              إذا لاحظ الطالب خطأ في معدله، أو محافظته، أو ترتيبه، أو رغباته، أو أي بيانات أثرت في النتيجة، فعليه تقديم التظلم خلال المدة التي تحددها الوزارة.
            </p>
            <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              ويُنصح بالاحتفاظ منذ بداية التقديم بـ رقم الطلب، ونسخة PDF من الاستمارة، ولقطات للرغبات، ورسائل التأكيد، وأي مستند يثبت البيانات التي تم التسجيل بها؛ لأنها قد تكون مهمة عند الاعتراض أو مراجعة النتيجة.
            </p>
            <p className="text-[11px] font-bold text-[var(--mn-heading)] pt-1 border-t border-[var(--mn-border)]">
              ملاحظة: وبعد البت في التظلمات يصبح الترشيح نهائيًا من جانب الوزارة، ثم تبدأ إجراءات القبول لدى الدولة أو الجامعة المانحة.
            </p>
          </div>
        </div>
      </div>

      {/* ١٣. ما بعد القبول: الإيفاد، التمويل، التأشيرة والتذكرة والسفر */}
      <div
        id="post-acceptance-phase-section"
        className="relative bg-[var(--mn-surface)] rounded-2xl p-3.5 sm:p-5 border border-[var(--mn-border-brand)] shadow-md shadow-[var(--mn-shadow-ink)]/60 overflow-hidden space-y-3.5"
      >
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-section-line)] to-transparent" />
        <DetailSectionHeader
          icon={PlaneTakeoff}
          title="١٣. ما بعد القبول: الإيفاد، التمويل، التأشيرة والتذكرة والسفر"
          className="mb-1"
        />

        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)]">
          <p className="text-[11.5px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
            بعد الحصول على القبول النهائي تبدأ مرحلة جديدة تختلف عن مرحلة المفاضلة والترشيح، وهي استكمال إجراءات الإيفاد والسفر.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={FileText} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">قبل السفر</h4>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              يبدأ الطالب باستكمال الوثائق المطلوبة من الوزارة والدولة المانحة والجامعة، ثم إجراءات التأشيرة، والفحص الطبي إن طُلب، والتصديقات، وخطاب الإيفاد وأي معاملات مالية أو إدارية مرتبطة بالبعثة.
            </p>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              وفي منح التبادل الثقافي يتحمل الطالب غالبًا في البداية تكاليف استخراج التأشيرة وتذكرة السفر والمصاريف الشخصية الأولية، ولا ينبغي شراء التذكرة أو تحمل التزامات مالية كبيرة قبل صدور القبول النهائي ومعرفة تعليمات التأشيرة والسفر بشكل واضح.
            </p>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              كما يجب على الطالب معرفة ما الذي تغطيه الدولة المانحة وما الذي تغطيه وزارة التعليم العالي اليمنية؛ لأن التمويل يختلف من دولة إلى أخرى. فقد تقدم الدولة المانحة الرسوم الدراسية والسكن والراتب أو بعض هذه المزايا، بينما توجد للطلاب الموفدين عبر الوزارة مخصصات مالية وفق نظام الإيفاد والاعتمادات المتاحة، وقد تبدأ إجراءات صرفها بعد استكمال الإيفاد والوصول، لذلك لا ينبغي أن يسافر الطالب وهو يعتمد على استلامها فورًا.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-[var(--mn-border)]">
              <SubSectionIconBadge icon={MapPin} />
              <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">بعد الوصول</h4>
            </div>
            <p className="text-[11px] font-bold text-[var(--mn-text)] leading-[1.85] text-justify">
              بعد وصول الطالب إلى بلد الدراسة يبدأ في:
            </p>
            <ul className="space-y-1.5 text-[11px] font-bold text-[var(--mn-text)] leading-[1.8]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#0E7C86] font-bold">•</span>
                <span>استكمال التسجيل الجامعي والإقامة والتأمين.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#0E7C86] font-bold">•</span>
                <span>الالتحاق بسنة لغة أو برنامج تحضيري إذا كان جزءًا من المنحة أو القبول، مثل اللغة الإسبانية في مسار كوبا.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#0E7C86] font-bold">•</span>
                <span>اجتياز أي اختبارات قبول أو تحديد مستوى تبقى مطلوبة بعد الوصول بحسب الجامعة والبرنامج.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#0E7C86] font-bold">•</span>
                <span>المحافظة على الانتظام الأكاديمي والحصول على شهادة قيد حديثة عند الحاجة، لأن بعض إجراءات المخصصات أو التجديد قد تعتمد عليها.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#0E7C86] font-bold">•</span>
                <span>متابعة الملحقية الثقافية أو السفارة والجهات المختصة في أي إجراءات تستلزمها الوزارة أثناء الدراسة.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* الخلاصة للعملية بالكامل */}
        <div className="p-3.5 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] space-y-2">
          <div className="flex items-center gap-2">
            <SubSectionIconBadge icon={Sparkles} />
            <h4 className="text-[12px] font-bold text-[var(--mn-heading)]">الخلاصة للعملية بالكامل</h4>
          </div>
          <div className="bg-[var(--mn-surface)] rounded-lg p-2.5 border border-[var(--mn-border)] font-bold inline-flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-1.5 w-full text-center">
            <span className="text-[11px] font-bold text-[var(--mn-heading)]">الفوز في المفاضلة</span>
            <ArrowLeft className="text-[#0E7C86] w-3.5 h-3.5 mx-0.5 shrink-0" />
            <span className="text-[11px] font-bold text-[var(--mn-heading)]">الترشيح</span>
            <ArrowLeft className="text-[#0E7C86] w-3.5 h-3.5 mx-0.5 shrink-0" />
            <span className="text-[11px] font-bold text-[var(--mn-heading)]">قبول الجامعة أو الدولة</span>
            <ArrowLeft className="text-[#0E7C86] w-3.5 h-3.5 mx-0.5 shrink-0" />
            <span className="text-[11px] font-bold text-[var(--mn-heading)]">استكمال الإيفاد والتأشيرة</span>
            <ArrowLeft className="text-[#0E7C86] w-3.5 h-3.5 mx-0.5 shrink-0" />
            <span className="text-[11px] font-bold text-[var(--mn-heading)]">السفر</span>
            <ArrowLeft className="text-[#0E7C86] w-3.5 h-3.5 mx-0.5 shrink-0" />
            <span className="text-[11px] font-bold text-[#0E7C86] dark:text-[#21A7B4]">التسجيل والدراسة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
