import { PreviewStudentApiClient } from './studentWorkspacePreviewApi';
const ApiClient = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? PreviewStudentApiClient : LiveApiClient;
import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react';
import { ApiClient as LiveApiClient, type StudentOwnedAssetDto } from '../../api/client';
import { useTranslation } from '../../i18n/I18nProvider';
import {
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  UsersRound,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
} from 'lucide-react';

type Profile = { headline?: string; summary?: string; skills: string[]; resumeAssetId?: string; version?: number; };
type Alumni = { displayName: string; graduationYear?: number; employerName?: string; visibility: 'PRIVATE' | 'ALUMNI_ONLY' | 'PUBLIC'; consentRevokedAt?: string; version?: number; };
type Application = { id: string; publicId: string; status: string; version: number; jobSnapshot: { title?: string }; decisionMetadata?: { studentMessage?: string }; };

export function StudentCareerWorkspace() {
  const { language, dir } = useTranslation();
  const c = (ar: string, en: string) => (language === 'ar' ? ar : en);
  const [profile, setProfile] = useState<Profile>({ skills: [] });
  const [alumni, setAlumni] = useState<Alumni>({ displayName: '', visibility: 'PRIVATE' });
  const [assets, setAssets] = useState<StudentOwnedAssetDto[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [skills, setSkills] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [consent, setConsent] = useState(false);
  const [alumniConsent, setAlumniConsent] = useState(false);
  const [network, setNetwork] = useState<Array<{ id: string; displayName: string; employerName?: string; graduationYear?: number }>>([]);
  const [networkPage, setNetworkPage] = useState(1);
  const [networkPages, setNetworkPages] = useState(1);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [job, setJob] = useState<{ id: string; title: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'ALL' | 'PROFILE' | 'APPLICATIONS' | 'ALUMNI' | 'NETWORK'>('ALL');

  const request = useRef(0);
  const mutation = useRef(false);
  const intent = useRef<{ payload: string; key: string } | null>(null);

  useEffect(() => {
    const sequence = ++request.current;
    setLoading(true);
    const tasks = [
      ApiClient.careerWorkspaceRequest<Profile | null>('profile'),
      ApiClient.careerWorkspaceRequest<Alumni | null>('alumni'),
      ApiClient.listMyActiveStudentAssets('application/pdf'),
      ApiClient.careerWorkspaceRequest<{ data: Application[]; totalPages: number }>(`applications?page=${page}`),
    ] as const;

    void Promise.allSettled(tasks).then((results) => {
      if (sequence !== request.current) return;
      const [p, a, files, list] = results;
      if (p.status === 'fulfilled' && p.value) {
        setProfile(p.value);
        setSkills(p.value.skills.join(', '));
      }
      if (a.status === 'fulfilled' && a.value) setAlumni(a.value);
      if (files.status === 'fulfilled') setAssets(files.value.items);
      if (list.status === 'fulfilled') {
        setApplications(list.value.data);
        setTotalPages(list.value.totalPages);
      }
      if (results.some((result) => result.status === 'rejected')) {
        setNotice(language === 'ar' ? 'تعذر تحميل بعض بيانات المسار المهني' : 'Some career data could not be loaded');
      }
      setLoading(false);
    });
    return () => {
      ++request.current;
    };
  }, [page, reload, language]);

  useEffect(() => {
    const jobId = new URLSearchParams(window.location.search).get('jobId');
    const slug = new URLSearchParams(window.location.search).get('jobSlug');
    if (!jobId || !slug) return;
    let active = true;
    void ApiClient.getCareerJobBySlug(slug, language)
      .then((row) => {
        if (active && row.id === jobId && row.metadata?.applicationChannel === 'INTERNAL') {
          setJob({ id: row.id, title: row.title });
        }
      })
      .catch(() => {
        if (active) setNotice(language === 'ar' ? 'الفرصة غير متاحة للتقديم' : 'This opportunity is not open');
      });
    return () => {
      active = false;
    };
  }, [language]);

  const write = async (path: string, method: string, body: Record<string, unknown>) => {
    if (mutation.current) return;
    mutation.current = true;
    setBusy(true);
    setNotice('');
    const payload = path + method + JSON.stringify(body);
    if (intent.current?.payload !== payload) {
      intent.current = { payload, key: crypto.randomUUID() };
    }
    try {
      await ApiClient.careerWorkspaceRequest(path, method, body, intent.current.key);
      intent.current = null;
      setNotice(c('تم حفظ التغييرات بنجاح', 'Changes saved successfully'));
      setReload((value) => value + 1);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : c('تعذر الحفظ، يرجى المحاولة لاحقًا', 'Could not save, please try again'));
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  };

  const submitProfile = (event: FormEvent) => {
    event.preventDefault();
    void write('profile', 'PUT', {
      headline: profile.headline || null,
      summary: profile.summary || null,
      skills: skills
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      resumeAssetId: profile.resumeAssetId || null,
      visibility: 'PRIVATE',
      expectedVersion: profile.version,
    });
  };

  const loadNetwork = (targetPage = 1) => {
    setNetworkLoading(true);
    void ApiClient.careerWorkspaceRequest<{ data: typeof network; totalPages: number }>(`alumni-network?page=${targetPage}`)
      .then((result) => {
        setNetwork(result.data);
        setNetworkPages(result.totalPages);
        setNetworkPage(targetPage);
      })
      .catch(() => {
        setNotice(c('الشبكة متاحة للخريجين ذوي الموافقة السارية فقط', 'The network requires active alumni consent'));
      })
      .finally(() => {
        setNetworkLoading(false);
      });
  };

  const parsedSkillsList = skills
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  const savedSkillsCount = parsedSkillsList.length;
  const hasProfile = Boolean(profile.headline?.trim() || profile.summary?.trim() || savedSkillsCount || profile.resumeAssetId);

  const cairo12Style = { fontFamily: "'Cairo', sans-serif", fontSize: '12px' } as const;

  const inputStyle =
    "mt-1 block min-h-10 w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3.5 py-2 text-[12px] font-['Cairo',sans-serif] font-medium text-[var(--mn-heading)] placeholder:font-['Cairo',sans-serif] placeholder:text-[var(--mn-text-muted)] placeholder:text-[12px] outline-none transition-colors focus:border-[#D6A43B] focus:ring-1 focus:ring-[#D6A43B]/30 dark:bg-[var(--mn-surface-elevated)]";
  const labelStyle = "block text-[12px] font-['Cairo',sans-serif] font-bold leading-[1.7] text-[var(--mn-heading)]";
  const actionStyle =
    "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#142B5F] hover:bg-[#1a3675] px-4 py-2 text-[12px] font-['Cairo',sans-serif] font-bold text-white transition-all shadow-xs border border-[#D6A43B]/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#D6A43B] dark:text-[#142B5F] dark:hover:bg-[#E5B54F]";
  const secondaryActionStyle =
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3.5 py-1.5 text-[12px] font-['Cairo',sans-serif] font-bold text-[var(--mn-heading)] transition-colors hover:border-[#D6A43B] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--mn-surface-elevated)]";

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div dir={dir} className="mn-student-career-page mt-0 space-y-5 font-['Cairo',sans-serif]">
      {/* Header box attached directly to the 8-tab bar above and stretched edge-to-edge right & left */}
      <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mt-px">
        <section
          aria-label={c('مساري المهني', 'My career')}
          className="mn-student-career-hero relative overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] shadow-2xs mn-panel"
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
                  <BriefcaseBusiness className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />
                </span>
                <h2 className="mn-student-career-heading text-[14px] sm:text-[15px] font-bold leading-tight text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                  {c('مساري المهني', 'My career')}
                </h2>
              </div>

              <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2.5 py-1 text-[11px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
                {hasProfile ? c('الملف مُعَدّ', 'Profile set') : c('ملف جديد', 'New profile')} · {applications.length} {c('طلبات', 'applications')} · {savedSkillsCount} {c('مهارات', 'skills')}
              </span>
            </div>

            <p className="mt-2.5 text-[11.5px] sm:text-[12px] font-medium leading-[1.75] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
              {c(
                'جهّز ملفك المهني وسيرتك الذاتية، وتابع طلبات التوظيف والتدريب وتواصل مع شبكة الخريجين.',
                'Build your career profile and CV, track job and internship applications, and connect with alumni.',
              )}
            </p>
          </div>
        </section>

        {/* Sub-Navigation Bar outside the header box, attached from the top and stretched edge-to-edge */}
        <nav
          aria-label={c('التنقل السريع في المسار المهني', 'Career quick navigation')}
          className="-mt-px grid grid-cols-4 divide-x divide-x-reverse divide-[var(--mn-border)] dark:divide-white/10 rounded-b-2xl border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] overflow-hidden shadow-2xs"
        >
          {[
            { id: 'mn-career-profile', label: c('الملف المهني', 'Profile'), icon: UserRound, key: 'PROFILE' as const },
            { id: 'mn-career-applications', label: c('الطلبات', 'Applications'), icon: ClipboardList, key: 'APPLICATIONS' as const, badge: applications.length },
            { id: 'mn-career-alumni', label: c('إعدادات الخريج', 'Alumni'), icon: GraduationCap, key: 'ALUMNI' as const },
            { id: 'mn-career-network', label: c('شبكة الخريجين', 'Network'), icon: UsersRound, key: 'NETWORK' as const },
          ].map((tabItem) => {
            const Icon = tabItem.icon;
            const active = activeSection === tabItem.key;
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => {
                  setActiveSection(tabItem.key);
                  scrollToAnchor(tabItem.id);
                }}
                className={`flex min-h-12 items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-2 text-center transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#142B5F] ${
                  active
                    ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white shadow-inner font-bold'
                    : 'bg-transparent text-[#1E293B] dark:text-[#F1F5F9] font-semibold hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${active ? 'text-[#F2CD78]' : 'text-[#142B5F] dark:text-[#E5B54F]'}`}
                  aria-hidden="true"
                />
                <span className="whitespace-normal break-words leading-[1.35] text-[11px] sm:text-[12px]">
                  {tabItem.label}
                  {typeof tabItem.badge === 'number' && tabItem.badge > 0 ? ` (${tabItem.badge})` : ''}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-3 text-[12px] leading-[1.8] text-[var(--mn-text)] shadow-xs dark:bg-[var(--mn-surface-elevated)]"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-[#0E7C86]" aria-hidden="true" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="text-[11px] font-bold text-[var(--mn-text-muted)] hover:text-[var(--mn-heading)]"
          >
            {c('إغلاق', 'Close')}
          </button>
        </div>
      )}

      {/* Loading indicator bar if fetching */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-[var(--mn-text-muted)]">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#D6A43B] border-t-transparent" />
          <span>{c('جارٍ تحديث بيانات المسار المهني…', 'Updating career data…')}</span>
        </div>
      )}

      {/* SECTION 1: ملفي المهني الخاص (Private Career Profile) */}
      <CareerSectionCard
        id="mn-career-profile"
        title={c('ملفي المهني الخاص', 'Private career profile')}
        icon={<UserRound className="h-4 w-4 text-[#E5B54F]" aria-hidden="true" />}
      >
        <div style={cairo12Style} className="rounded-xl border border-[#0E7C86]/20 bg-[#0E7C86]/5 dark:bg-[#0E7C86]/10 p-3 mb-3.5 flex items-start gap-2.5 text-[12px] leading-[1.8] text-[var(--mn-heading)]">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#B78622] dark:text-[#E5B54F]" aria-hidden="true" />
          <div style={cairo12Style}>
            <span className="font-bold">{c('خصوصيتك محفوظة بالكامل:', 'Your privacy is completely protected:')} </span>
            <span>
              {c(
                'ملفك المهني وسيرتك الذاتية لا تتم مشاركتهما مع أي جهة توظيف إلا بموافقتك وتقديمك المباشر على فرصة معينة.',
                'Your career profile and CV are only shared with employers upon your explicit job application.',
              )}
            </span>
          </div>
        </div>

        <form onSubmit={submitProfile} className="space-y-3.5">
          <label className={labelStyle}>
            {c('المسمى المهني / التخصص الحالي', 'Current headline or major')}
            <input
              style={cairo12Style}
              className={inputStyle}
              value={profile.headline || ''}
              maxLength={240}
              placeholder={c('مثال: خريج نظم معلومات إدارية · مطوّر ويب مبتدئ', 'e.g. MIS Graduate · Junior Web Developer')}
              onChange={(event) => setProfile((previous) => ({ ...previous, headline: event.target.value }))}
            />
          </label>

          <label className={labelStyle}>
            {c('النبذة المهنية والاهتمامات', 'Professional summary and interests')}
            <textarea
              style={cairo12Style}
              className={`${inputStyle} min-h-24 resize-y leading-relaxed`}
              rows={3}
              value={profile.summary || ''}
              maxLength={4000}
              placeholder={c('اكتب نبذة مختصرة عن مهاراتك، مشاريعك الجامعية، وطموحك المهني…', 'Briefly summarize your skills, university projects, and career aspirations…')}
              onChange={(event) => setProfile((previous) => ({ ...previous, summary: event.target.value }))}
            />
          </label>

          <div>
            <label className={labelStyle}>
              {c('المهارات (افصل بينها بفواصل)', 'Skills (comma-separated)')}
              <input
                style={cairo12Style}
                className={inputStyle}
                value={skills}
                placeholder={c('إدارة المشاريع، تحليل البيانات، العمل الجماعي، بايثون', 'Project Management, Data Analysis, Teamwork, Python')}
                onChange={(event) => setSkills(event.target.value)}
              />
            </label>
            {/* Visual Skill Tags Preview */}
            {parsedSkillsList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {parsedSkillsList.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    style={cairo12Style}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D6A43B]/30 bg-[#142B5F]/5 dark:bg-[#E5B54F]/10 px-2.5 py-1 text-[12px] font-bold text-[#142B5F] dark:text-[#E5B54F]"
                  >
                    <Sparkles className="h-3 w-3 text-[#D6A43B]" aria-hidden="true" />
                    <span style={cairo12Style}>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className={labelStyle}>
            <div className="flex items-center justify-between">
              <span>{c('السيرة الذاتية (ملف PDF من حسابك)', 'Curriculum Vitae (PDF from my files)')}</span>
              <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: '11px' }} className="text-[11px] text-[var(--mn-text-muted)] font-normal">
                {assets.length > 0 ? c(`${assets.length} ملف متاح`, `${assets.length} files available`) : c('لا توجد ملفات PDF مرفوعة', 'No PDF files uploaded')}
              </span>
            </div>
            <select
              style={cairo12Style}
              className={`${inputStyle} cursor-pointer`}
              value={profile.resumeAssetId || ''}
              onChange={(event) => setProfile((previous) => ({ ...previous, resumeAssetId: event.target.value }))}
            >
              <option style={cairo12Style} value="" className="font-['Cairo',sans-serif]">{c('— بدون تحديد سيرة ذاتية —', '— No file selected —')}</option>
              {profile.resumeAssetId && !assets.some((row) => row.id === profile.resumeAssetId) && (
                <option style={cairo12Style} value={profile.resumeAssetId} className="font-['Cairo',sans-serif]">{c('الملف المحفوظ حاليًا', 'Currently saved file')}</option>
              )}
              {assets.map((row) => (
                <option key={row.id} value={row.id} style={cairo12Style} className="font-['Cairo',sans-serif]">
                  📄 {row.metadata?.originalFilename || row.reference}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-between border-t border-[var(--mn-border)] dark:border-white/10 pt-3">
            <span className="text-[11px] text-[var(--mn-text-muted)]">
              {profile.version ? c(`الإصدار: v${profile.version}`, `Version: v${profile.version}`) : ''}
            </span>
            <button type="submit" disabled={busy || loading} className={actionStyle}>
              <ShieldCheck className="h-4 w-4 text-[#E5B54F] dark:text-[#142B5F]" aria-hidden="true" />
              <span>{c('حفظ بيانات الملف المهني', 'Save career profile')}</span>
            </button>
          </div>
        </form>
      </CareerSectionCard>

      {/* SECTION 2: التقديم على فرصة مهنية (Conditional Job Application if job selected) */}
      {job && (
        <CareerSectionCard
          title={c('التقديم على فرصة مهنية', 'Apply for a career opportunity')}
          icon={<BriefcaseBusiness className="h-4 w-4 text-[#E5B54F]" aria-hidden="true" />}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void write('applications', 'POST', {
                jobId: job.id,
                cvAssetId: profile.resumeAssetId,
                coverLetter,
                consent,
              });
            }}
            className="space-y-3.5"
          >
            {/* Job Banner */}
            <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3.5">
              <div className="flex items-center gap-2 text-[#0E7C86] dark:text-[#E5B54F] text-[11px] font-bold">
                <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{c('الفرصة المستهدفة للتقديم', 'Target opportunity')}</span>
              </div>
              <h4 className="mt-1 break-words text-[14px] sm:text-[15px] font-bold text-[var(--mn-heading)]">
                {job.title}
              </h4>
            </div>

            <label className={labelStyle}>
              {c('رسالة التقديم (Cover Letter)', 'Cover letter')}
              <textarea
                style={cairo12Style}
                aria-label={c('رسالة التقديم', 'Cover letter')}
                value={coverLetter}
                maxLength={4000}
                onChange={(event) => setCoverLetter(event.target.value)}
                rows={4}
                placeholder={c('اكتب رسالة موجزة لصاحب العمل توضح سبب اهتمامك بالفرصة وكيف تتوافق مهاراتك مع متطلباتها…', 'Explain why you are interested in this position and how your skills fit…')}
                className={`${inputStyle} min-h-24 resize-y leading-relaxed`}
              />
            </label>

            <label style={cairo12Style} className="flex items-start gap-2.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 text-[12px] font-['Cairo',sans-serif] font-medium leading-[1.8] text-[var(--mn-heading)] cursor-pointer">
              <input
                className="mt-1 h-4 w-4 shrink-0 rounded accent-[#142B5F]"
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span style={cairo12Style} className="font-['Cairo',sans-serif]">
                {c(
                  'أوافق على مشاركة ملفي المهني وسيرتي الذاتية المحددة مع مسؤولي التوظيف لهذه الفرصة فقط.',
                  'I consent to sharing my profile and CV with recruiters for this opportunity only.',
                )}
              </span>
            </label>

            {!profile.resumeAssetId && (
              <p style={cairo12Style} className="text-[12px] font-bold text-amber-600 dark:text-amber-400">
                ⚠️ {c('يرجى تحديد ملف سيرة ذاتية في ملفك المهني أعلاه لتتمكن من إرسال التقديم.', 'Please select a CV in your career profile above to submit.')}
              </p>
            )}

            <div className="flex justify-end border-t border-[var(--mn-border)] dark:border-white/10 pt-3">
              <button
                type="submit"
                className={actionStyle}
                disabled={busy || loading || !consent || !profile.resumeAssetId}
              >
                <CheckCircle2 className="h-4 w-4 text-[#E5B54F] dark:text-[#142B5F]" aria-hidden="true" />
                <span>{c('إرسال طلب التقديم', 'Submit application')}</span>
              </button>
            </div>
          </form>
        </CareerSectionCard>
      )}

      {/* SECTION 3: طلبات التقديم (Applications List) */}
      <CareerSectionCard
        id="mn-career-applications"
        title={c('طلبات التقديم', 'My applications')}
        icon={<ClipboardList className="h-4 w-4 text-[#E5B54F]" aria-hidden="true" />}
        count={applications.length > 0 ? `${applications.length} ${c('طلب', 'applications')}` : undefined}
      >
        {applications.length === 0 ? (
          <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-6 text-center dark:bg-[var(--mn-surface-elevated)]">
            <ClipboardList className="h-8 w-8 mx-auto text-[var(--mn-text-muted)] mb-2" aria-hidden="true" />
            <h4 style={cairo12Style} className="text-[13px] font-bold text-[var(--mn-heading)]">
              {loading ? c('جارٍ تحميل طلباتك…', 'Loading applications…') : c('لا توجد طلبات تقديم مسجلة حتى الآن', 'No applications registered yet')}
            </h4>
            <p style={cairo12Style} className="text-[12px] text-[var(--mn-text-muted)] mt-1 max-w-sm mx-auto leading-relaxed">
              {c(
                'عندما تقدم على فرص تدريب أو وظائف من خلال منصة منارتك، ستتمكن من متابعة حالة كل طلب وملاحظات مراجعيه من هنا.',
                'When you apply for internships or jobs via Manaratak, you can track progress and notes here.',
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {applications.map((row) => {
                const statusInfo = getApplicationStatusInfo(row.status, c);
                const canWithdraw = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(row.status);
                return (
                  <article
                    key={row.id}
                    className="relative overflow-hidden flex flex-col justify-between rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-3 shadow-2xs transition-all hover:border-[#D6A43B]/60 dark:bg-[var(--mn-surface-elevated)]"
                  >
                    <div>
                      {/* Top Row: Title + Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="break-words text-[12px] sm:text-[12.5px] font-bold leading-snug text-[var(--mn-heading)] font-['Cairo',sans-serif]">
                          {row.jobSnapshot?.title || c('فرصة مهنية', 'Career opportunity')}
                        </h4>
                        <span
                          style={cairo12Style}
                          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[12px] font-bold leading-[1.6] ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Public ID Pill */}
                      <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[var(--mn-text-muted)]">
                        <span style={cairo12Style}>{c('رقم الطلب:', 'ID:')}</span>
                        <span style={cairo12Style} className="font-mono text-[12px] rounded bg-[var(--mn-surface)] px-1.5 py-0.5 border border-[var(--mn-border)] break-all">
                          #{row.publicId}
                        </span>
                      </div>

                      {/* Student Decision Message / Feedback */}
                      {row.decisionMetadata?.studentMessage && (
                        <div style={cairo12Style} className="mt-2.5 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] p-2.5 text-[12px] leading-[1.8] text-[var(--mn-heading)]">
                          <span style={cairo12Style} className="font-bold text-[#D6A43B] block mb-0.5">
                            {c('ملاحظات جهة التوظيف:', 'Recruiter feedback:')}
                          </span>
                          <span style={cairo12Style}>{row.decisionMetadata.studentMessage}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {canWithdraw && (
                      <div className="mt-3 flex items-center justify-end border-t border-[var(--mn-border)] dark:border-white/10 pt-2.5">
                        <button
                          type="button"
                          style={cairo12Style}
                          className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-rose-300 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-1 text-[12px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100/70 transition-colors cursor-pointer disabled:opacity-50"
                          disabled={busy}
                          onClick={() =>
                            void write(`applications/${row.id}/withdraw`, 'POST', {
                              expectedVersion: row.version,
                            })
                          }
                        >
                          <span style={cairo12Style}>{c('سحب طلب التقديم', 'Withdraw application')}</span>
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-[var(--mn-border)] dark:border-white/10 pt-3">
                <button
                  type="button"
                  className={secondaryActionStyle}
                  disabled={loading || page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{c('السابق', 'Previous')}</span>
                </button>
                <span className="min-w-16 text-center text-[12px] font-bold text-[var(--mn-heading)]">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className={secondaryActionStyle}
                  disabled={loading || page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  <span>{c('التالي', 'Next')}</span>
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </CareerSectionCard>

      {/* SECTION 4: ملف الخريج والخصوصية (Alumni Profile & Privacy) */}
      <CareerSectionCard
        id="mn-career-alumni"
        title={c('ملف الخريج والخصوصية', 'Alumni profile and privacy')}
        icon={<GraduationCap className="h-4 w-4 text-[#E5B54F]" aria-hidden="true" />}
      >
        <div style={cairo12Style} className="rounded-xl border border-[#0E7C86]/20 bg-[#0E7C86]/5 dark:bg-[#0E7C86]/10 p-3 mb-3.5 flex items-start gap-2.5 text-[12px] leading-[1.8] text-[var(--mn-heading)]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B78622] dark:text-[#E5B54F]" aria-hidden="true" />
          <div style={cairo12Style}>
            <span className="font-bold">{c('مشاركة اختيارية:', 'Optional participation:')} </span>
            <span>
              {c(
                'اختر كيفية ظهور بياناتك لزملائك الخريجين أو للعامة لبناء شبكة علاقات مهنية. يمكنك تغيير النطاق أو سحب الموافقة في أي وقت.',
                'Control how your information appears to fellow alumni or the public. You may revoke consent at any time.',
              )}
            </span>
          </div>
        </div>

        <form
          className="space-y-3.5"
          onSubmit={(event) => {
            event.preventDefault();
            void write('alumni', 'PUT', {
              displayName: alumni.displayName,
              graduationYear: alumni.graduationYear ?? null,
              employerName: alumni.employerName || null,
              visibility: alumni.visibility,
              ...(alumniConsent ? { consentGranted: true } : {}),
              expectedVersion: alumni.version,
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelStyle}>
              {c('اسم العرض في شبكة الخريجين', 'Display name in alumni directory')}
              <input
                required
                style={cairo12Style}
                className={inputStyle}
                value={alumni.displayName}
                maxLength={240}
                placeholder={c('مثال: م. أحمد عبد الله', 'e.g. Eng. Ahmed Abdullah')}
                onChange={(event) => setAlumni((previous) => ({ ...previous, displayName: event.target.value }))}
              />
            </label>

            <label className={labelStyle}>
              {c('سنة التخرج (أو المتوقعة)', 'Graduation year (actual or expected)')}
              <input
                style={cairo12Style}
                className={inputStyle}
                type="number"
                min={1970}
                max={new Date().getFullYear() + 7}
                placeholder={String(new Date().getFullYear())}
                value={alumni.graduationYear ?? ''}
                onChange={(event) =>
                  setAlumni((previous) => ({
                    ...previous,
                    graduationYear: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
              />
            </label>
          </div>

          <label className={labelStyle}>
            {c('جهة العمل أو المنصب الحالي (اختياري)', 'Current employer or title (optional)')}
            <input
              style={cairo12Style}
              className={inputStyle}
              value={alumni.employerName || ''}
              maxLength={240}
              placeholder={c('مثال: مهندس حلول برمجية في شركة التقنية المتقدمة', 'e.g. Software Solutions Engineer')}
              onChange={(event) => setAlumni((previous) => ({ ...previous, employerName: event.target.value }))}
            />
          </label>

          <label className={labelStyle}>
            {c('مستوى الخصوصية وظهور الملف', 'Visibility and privacy level')}
            <select
              style={cairo12Style}
              className={`${inputStyle} cursor-pointer`}
              value={alumni.visibility}
              onChange={(event) =>
                setAlumni((previous) => ({
                  ...previous,
                  visibility: event.target.value as Alumni['visibility'],
                }))
              }
            >
              <option style={cairo12Style} value="PRIVATE" className="font-['Cairo',sans-serif] py-1">{c('🔒 خاص — لا يظهر لأحد في دليل الخريجين', '🔒 Private — hidden from alumni directory')}</option>
              <option style={cairo12Style} value="ALUMNI_ONLY" className="font-['Cairo',sans-serif] py-1">{c('🎓 الخريجون الموافقون فقط — متاح لشبكة زملائك', '🎓 Consenting alumni only — visible to peers')}</option>
              <option style={cairo12Style} value="PUBLIC" className="font-['Cairo',sans-serif] py-1">{c('🌐 عام — متاح للمنصة العامة', '🌐 Public — visible publicly')}</option>
            </select>
          </label>

          <label style={cairo12Style} className="flex items-start gap-2.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 text-[12px] font-['Cairo',sans-serif] font-medium leading-[1.8] text-[var(--mn-heading)] cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded accent-[#142B5F]"
              checked={alumniConsent}
              onChange={(event) => setAlumniConsent(event.target.checked)}
            />
            <span style={cairo12Style} className="font-['Cairo',sans-serif]">
              {c(
                'أوافق على إدراج بياناتي الأساسية (الاسم، سنة التخرج، وجهة العمل) وفق نطاق الخصوصية المحدد أعلاه.',
                'I consent to listing my basic info according to the selected privacy level.',
              )}
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--mn-border)] dark:border-white/10 pt-3">
            {alumni.version && (
              <button
                type="button"
                style={cairo12Style}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800/50 bg-rose-50/40 dark:bg-rose-950/20 px-3.5 py-1.5 text-[12px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100/60 transition-colors cursor-pointer disabled:opacity-50"
                disabled={busy}
                onClick={() =>
                  void write('alumni', 'PUT', {
                    displayName: alumni.displayName,
                    visibility: 'PRIVATE',
                    consentGranted: false,
                    expectedVersion: alumni.version,
                  })
                }
              >
                <span style={cairo12Style}>{c('سحب الموافقة وإخفاء الملف', 'Revoke consent')}</span>
              </button>
            )}
            <button type="submit" className={actionStyle} disabled={busy || loading}>
              <ShieldCheck className="h-4 w-4 text-[#E5B54F] dark:text-[#142B5F]" aria-hidden="true" />
              <span>{c('حفظ إعدادات الخريج', 'Save alumni settings')}</span>
            </button>
          </div>
        </form>
      </CareerSectionCard>

      {/* SECTION 5: شبكة الخريجين الموافقين (Consenting Alumni Network) */}
      <CareerSectionCard
        id="mn-career-network"
        title={c('شبكة الخريجين الموافقين', 'Consenting alumni network')}
        icon={<UsersRound className="h-4 w-4 text-[#E5B54F]" aria-hidden="true" />}
        count={network.length > 0 ? `${network.length} ${c('خريج', 'alumni')}` : undefined}
      >
        <div className="space-y-3">
          <p style={cairo12Style} className="text-[12px] leading-[1.8] text-[var(--mn-text-muted)]">
            {c(
              'تتيح لك هذه الشبكة استكشاف زملائك الخريجين والتواصل المهني معهم. يتطلب استعراض الشبكة ضبط ملفك كخريج مشارك.',
              'Discover fellow graduates and expand your professional circle. Requires active alumni consent.',
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={actionStyle}
              disabled={busy || loading || networkLoading || alumni.visibility === 'PRIVATE'}
              onClick={() => loadNetwork(1)}
            >
              <UsersRound className="h-4 w-4 text-[#E5B54F] dark:text-[#142B5F]" aria-hidden="true" />
              <span style={cairo12Style}>{networkLoading ? c('جارٍ التحميل…', 'Loading…') : c('تصفح شبكة الخريجين', 'Browse alumni network')}</span>
            </button>

            {alumni.visibility === 'PRIVATE' && (
              <span style={cairo12Style} className="text-[12px] font-bold text-amber-600 dark:text-amber-400">
                ℹ️ {c('يجب تعيين مستوى الخصوصية إلى "الخريجون الموافقون" أو "عام" لتصفح الشبكة.', 'Change your privacy setting above to browse the directory.')}
              </span>
            )}
          </div>

          {network.length > 0 && (
            <div className="pt-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {network.map((row) => (
                  <article
                    key={row.id}
                    className="relative overflow-hidden rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-3 shadow-2xs font-['Cairo',sans-serif] dark:bg-[var(--mn-surface-elevated)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/30 bg-[#142B5F] dark:bg-[#0c1a3b]">
                        <GraduationCap className="h-3.5 w-3.5 text-[#E5B54F]" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 style={{ fontFamily: "'Cairo', sans-serif" }} className="break-words text-[12px] sm:text-[12.5px] font-bold text-[var(--mn-heading)] leading-snug">
                          {row.displayName}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--mn-text-muted)]">
                          {row.graduationYear && (
                            <span style={cairo12Style} className="inline-flex items-center gap-1 rounded bg-[var(--mn-surface)] px-2 py-0.5 border border-[var(--mn-border)] font-semibold text-[12px] text-[var(--mn-heading)]">
                              <Calendar className="h-3 w-3 text-[#D6A43B]" aria-hidden="true" />
                              <span style={cairo12Style}>{c(`دفعة ${row.graduationYear}`, `Class of ${row.graduationYear}`)}</span>
                            </span>
                          )}
                          {row.employerName && (
                            <span style={cairo12Style} className="inline-flex items-center gap-1 truncate text-[12px] text-[var(--mn-text-muted)]">
                              <Building2 className="h-3 w-3 shrink-0 text-[#0E7C86]" aria-hidden="true" />
                              <span style={cairo12Style} className="truncate">{row.employerName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {networkPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2 border-t border-[var(--mn-border)] dark:border-white/10 pt-3">
                  <button
                    type="button"
                    className={secondaryActionStyle}
                    disabled={networkPage <= 1 || networkLoading}
                    onClick={() => loadNetwork(networkPage - 1)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{c('السابق', 'Previous')}</span>
                  </button>
                  <span className="min-w-16 text-center text-[12px] font-bold text-[var(--mn-heading)]">
                    {networkPage} / {networkPages}
                  </span>
                  <button
                    type="button"
                    className={secondaryActionStyle}
                    disabled={networkPage >= networkPages || networkLoading}
                    onClick={() => loadNetwork(networkPage + 1)}
                  >
                    <span>{c('التالي', 'Next')}</span>
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </CareerSectionCard>
    </div>
  );
}

function CareerSectionCard({
  id,
  title,
  icon,
  count,
  children,
}: {
  id?: string;
  title: string;
  icon: ReactNode;
  count?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className="mn-student-career-section relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] scroll-mt-6 rounded-none border-x-0 border-t border-b border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-2xs mn-panel dark:border-white/10 font-['Cairo',sans-serif] overflow-hidden"
    >
      {/* Subordinate sub-section header */}
      <div className="mb-3 border-b border-[var(--mn-border)] dark:border-white/10 pb-2 flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/40 bg-[#142B5F]">
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-[12.5px] sm:text-[13px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
              {title}
            </h3>
          </div>
        </div>
        {count && (
          <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: '10.5px' }} className="shrink-0 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2 py-0.5 text-[10.5px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
            {count}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}

function getApplicationStatusInfo(status: string, c: (ar: string, en: string) => string) {
  switch ((status || '').toUpperCase()) {
    case 'SUBMITTED':
      return {
        label: c('تم التقديم', 'Submitted'),
        className: 'bg-[var(--mn-info-soft)] text-[var(--mn-info-text)] border-[var(--mn-info-border)]',
      };
    case 'UNDER_REVIEW':
      return {
        label: c('قيد المراجعة', 'Under review'),
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      };
    case 'SHORTLISTED':
      return {
        label: c('في القائمة القصيرة', 'Shortlisted'),
        className: 'bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#E5B54F] border-[#0E7C86]/25',
      };
    case 'ACCEPTED':
      return {
        label: c('مقبول', 'Accepted'),
        className: 'bg-[var(--mn-success-soft)] text-[var(--mn-success-text)] border-[var(--mn-success-border)]',
      };
    case 'REJECTED':
      return {
        label: c('غير مستوفٍ', 'Rejected'),
        className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
      };
    case 'WITHDRAWN':
      return {
        label: c('تم السحب', 'Withdrawn'),
        className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      };
    default:
      return {
        label: status || c('غير محدد', 'Unknown'),
        className: 'bg-[var(--mn-page)] text-[var(--mn-text-muted)] border-[var(--mn-border)]',
      };
  }
}

