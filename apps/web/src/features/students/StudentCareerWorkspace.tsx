import { PreviewStudentApiClient } from './studentWorkspacePreviewApi';
const ApiClient =
  import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype'
    ? PreviewStudentApiClient
    : LiveApiClient;
import { FormEvent, useEffect, useRef, useState } from 'react';
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
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  HorizontalSwipeTabs,
  WorkspaceTabCanopy,
  SummarySectionCard,
  CareerJobsExplorePanel,
  CareerSkillDevelopmentPanel,
} from './StudentExpandedSections';

type Profile = {
  headline?: string;
  summary?: string;
  skills: string[];
  resumeAssetId?: string;
  version?: number;
};
type Alumni = {
  displayName: string;
  graduationYear?: number;
  employerName?: string;
  visibility: 'PRIVATE' | 'ALUMNI_ONLY' | 'PUBLIC';
  consentRevokedAt?: string;
  version?: number;
};
type Application = {
  id: string;
  publicId: string;
  status: string;
  version: number;
  jobSnapshot: { title?: string };
  decisionMetadata?: { studentMessage?: string };
};

type CareerSubTab = 'PROFILE' | 'JOBS' | 'APPLICATIONS' | 'SKILLS' | 'ALUMNI';

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
  const [network, setNetwork] = useState<
    Array<{ id: string; displayName: string; employerName?: string; graduationYear?: number }>
  >([]);
  const [networkPage, setNetworkPage] = useState(1);
  const [networkPages, setNetworkPages] = useState(1);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [job, setJob] = useState<{ id: string; title: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<CareerSubTab>('PROFILE');

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
      ApiClient.careerWorkspaceRequest<{ data: Application[]; totalPages: number }>(
        `applications?page=${page}`,
      ),
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
        setNotice(
          language === 'ar'
            ? 'تعذر تحميل بعض بيانات المسار المهني'
            : 'Some career data could not be loaded',
        );
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
          setActiveSubTab('JOBS');
        }
      })
      .catch(() => {
        if (active)
          setNotice(
            language === 'ar' ? 'الفرصة غير متاحة للتقديم' : 'This opportunity is not open',
          );
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
      setNotice(
        error instanceof Error
          ? error.message
          : c('تعذر الحفظ، يرجى المحاولة لاحقًا', 'Could not save, please try again'),
      );
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
    void ApiClient.careerWorkspaceRequest<{ data: typeof network; totalPages: number }>(
      `alumni-network?page=${targetPage}`,
    )
      .then((result) => {
        setNetwork(result.data);
        setNetworkPages(result.totalPages);
        setNetworkPage(targetPage);
      })
      .catch(() => {
        setNotice(
          c(
            'الشبكة متاحة للخريجين ذوي الموافقة السارية فقط',
            'The network requires active alumni consent',
          ),
        );
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
  const hasProfile = Boolean(
    profile.headline?.trim() ||
      profile.summary?.trim() ||
      savedSkillsCount ||
      profile.resumeAssetId,
  );

  const inputStyle =
    "mt-1 block w-full rounded-xl border border-[#142B5F]/12 dark:border-white/12 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-1.5 text-[11px] sm:text-[12px] font-['Cairo',sans-serif] font-medium text-[#142B5F] dark:text-white placeholder:text-[#5C707C] dark:placeholder:text-[#9BB4C7] outline-none transition-colors focus:border-[#0E7C86] dark:focus:border-[#38C6D4] focus:bg-white dark:focus:bg-[#111E38]";
  const labelStyle =
    "block text-[10.5px] sm:text-[11px] font-['Cairo',sans-serif] font-bold leading-snug text-[#142B5F] dark:text-white";
  const primaryActionStyle =
    "mn-workspace-btn-sm inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-3.5 text-[10.5px] sm:text-[11px] font-['Cairo',sans-serif] font-bold text-white transition-opacity shadow-2xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
  const secondaryActionStyle =
    "mn-workspace-btn-sm inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#0B1529] px-3 text-[10.5px] sm:text-[11px] font-['Cairo',sans-serif] font-bold text-[#142B5F] dark:text-white transition-all hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:text-white hover:border-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div dir={dir} className="mn-student-career-page mt-0 space-y-3 font-['Cairo',sans-serif]">
      <WorkspaceTabCanopy
        title={c('مساري المهني والخريجون', 'Career & Alumni')}
        subtitle={c(
          'ملفك المهني، فرص التدريب، التقديمات وشبكة الخريجين',
          'Career profile, internships, applications and alumni network',
        )}
        icon={BriefcaseBusiness}
        metaLabel={
          <span className="tabular-nums">
            {hasProfile ? c('جاهز', 'Ready') : c('جديد', 'New')} · {savedSkillsCount}{' '}
            {c('مهارات', 'skills')}
          </span>
        }
      >
        <HorizontalSwipeTabs
          embedded
          ariaLabel={c('أقسام المسار المهني', 'Career sections')}
          activeId={activeSubTab}
          onSelect={setActiveSubTab}
          items={[
            { id: 'PROFILE', label: c('ملفي', 'Profile'), icon: UserRound },
            { id: 'JOBS', label: c('الفرص', 'Jobs'), icon: BriefcaseBusiness },
            {
              id: 'APPLICATIONS',
              label: c('تقديماتي', 'Applied'),
              count: applications.length,
              icon: ClipboardList,
            },
            { id: 'SKILLS', label: c('مهاراتي', 'Skills'), icon: Sparkles },
            { id: 'ALUMNI', label: c('الخريجون', 'Alumni'), icon: GraduationCap },
          ]}
        />
      </WorkspaceTabCanopy>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 rounded-xl border border-[#0E7C86]/25 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#111E38] px-3 py-2 text-[10.5px] sm:text-[11px] font-semibold text-[#142B5F] dark:text-white"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Info className="h-3.5 w-3.5 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span className="truncate">{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="mn-workspace-btn-sm shrink-0 text-[10px] font-bold text-[#0E7C86] dark:text-[#38C6D4] hover:underline cursor-pointer"
          >
            {c('إغلاق', 'Close')}
          </button>
        </div>
      )}

      {/* SUB-TAB 1: ملفي المهني */}
      {activeSubTab === 'PROFILE' && (
        <SummarySectionCard
          id="mn-career-profile"
          title={c('ملفي المهني والسيرة الذاتية', 'Career profile & CV')}
          icon={UserRound}
          metaLabel={c('خاص بك', 'Private')}
        >
          <div className="rounded-xl border border-[#0E7C86]/20 dark:border-[#38C6D4]/25 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-2 mb-3 flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">
            <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>
              {c(
                'ملفك المهني خاص ولا يُشارك إلا عند تقديمك المباشر على فرصة.',
                'Your profile is private and shared only upon direct application.',
              )}
            </span>
          </div>

          <form onSubmit={submitProfile} className="space-y-2.5">
            <label className={labelStyle}>
              {c('المسمى المهني / التخصص الحالي', 'Current headline or major')}
              <input
                className={inputStyle}
                value={profile.headline || ''}
                maxLength={240}
                placeholder={c(
                  'مثال: خريج نظم معلومات · باحث في الذكاء الاصطناعي',
                  'e.g. MIS Graduate · AI Researcher',
                )}
                onChange={(event) =>
                  setProfile((previous) => ({ ...previous, headline: event.target.value }))
                }
              />
            </label>

            <label className={labelStyle}>
              {c('النبذة المهنية المختصرة', 'Professional summary')}
              <textarea
                className={`${inputStyle} min-h-20 resize-y leading-relaxed`}
                rows={2}
                value={profile.summary || ''}
                maxLength={4000}
                placeholder={c(
                  'لخّص مهاراتك، مشاريعك الأكاديمية، وطموحك المهني…',
                  'Summarize your skills and academic projects…',
                )}
                onChange={(event) =>
                  setProfile((previous) => ({ ...previous, summary: event.target.value }))
                }
              />
            </label>

            <div>
              <label className={labelStyle}>
                {c('المهارات (افصل بينها بفواصل)', 'Skills (comma-separated)')}
                <input
                  className={inputStyle}
                  value={skills}
                  placeholder={c(
                    'البحث العلمي، تحليل البيانات، اللغة الإنجليزية، بايثون',
                    'Research, Data Analysis, English, Python',
                  )}
                  onChange={(event) => setSkills(event.target.value)}
                />
              </label>
              {parsedSkillsList.length > 0 && (
                <p className="mt-1.5 text-[10px] font-semibold text-[#0E7C86] dark:text-[#38C6D4]">
                  {parsedSkillsList.join(' · ')}
                </p>
              )}
            </div>

            <label className={labelStyle}>
              <div className="flex items-center justify-between">
                <span>{c('السيرة الذاتية المعتمدة (PDF)', 'CV (PDF from my files)')}</span>
                <span className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                  {assets.length > 0
                    ? c(`${assets.length} ملف متاح`, `${assets.length} files`)
                    : c('لا توجد ملفات PDF', 'No PDF files')}
                </span>
              </div>
              <select
                className={`${inputStyle} cursor-pointer`}
                value={profile.resumeAssetId || ''}
                onChange={(event) =>
                  setProfile((previous) => ({ ...previous, resumeAssetId: event.target.value }))
                }
              >
                <option value="">
                  {c('— بدون تحديد سيرة ذاتية —', '— No file selected —')}
                </option>
                {profile.resumeAssetId &&
                  !assets.some((row) => row.id === profile.resumeAssetId) && (
                    <option value={profile.resumeAssetId}>
                      {c('الملف المحفوظ حاليًا', 'Currently saved file')}
                    </option>
                  )}
                {assets.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.metadata?.originalFilename || row.reference}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-end border-t border-[#142B5F]/10 dark:border-white/10 pt-2.5">
              <button type="submit" disabled={busy || loading} className={primaryActionStyle}>
                <ShieldCheck className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                <span>{c('حفظ الملف المهني', 'Save career profile')}</span>
              </button>
            </div>
          </form>
        </SummarySectionCard>
      )}

      {/* SUB-TAB 2: فرص العمل والتدريب */}
      {activeSubTab === 'JOBS' && (
        <div className="space-y-3">
          <CareerJobsExplorePanel
            onSelectJob={(selectedJob) => {
              setJob(selectedJob);
            }}
          />

          {job && (
            <SummarySectionCard
              title={c('نموذج التقديم المباشر', 'Direct application form')}
              icon={BriefcaseBusiness}
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
                className="space-y-2.5"
              >
                <div className="mn-summary-start-bar relative overflow-hidden rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-2.5">
                  <span className="text-[9.5px] font-bold text-[#0E7C86] dark:text-[#38C6D4]">
                    {c('الفرصة المختارة', 'Selected role')}
                  </span>
                  <h4 className="mt-0.5 text-[11px] sm:text-[12px] font-bold text-[#142B5F] dark:text-white">
                    {job.title}
                  </h4>
                </div>

                <label className={labelStyle}>
                  {c('رسالة التقديم المختصرة', 'Cover letter')}
                  <textarea
                    value={coverLetter}
                    maxLength={4000}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    rows={3}
                    placeholder={c(
                      'اكتب رسالة موجزة توضح سبب اهتمامك بالفرصة…',
                      'Explain why you are interested in this role…',
                    )}
                    className={`${inputStyle} min-h-20 resize-y`}
                  />
                </label>

                <label className="flex items-start gap-2 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-2.5 text-[10.5px] sm:text-[11px] font-medium text-[#142B5F] dark:text-white cursor-pointer">
                  <input
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-[#0E7C86] cursor-pointer"
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                  />
                  <span>
                    {c(
                      'أوافق على مشاركة ملفي المهني وسيرتي الذاتية مع جهة التدريب لهذه الفرصة فقط.',
                      'I consent to sharing my profile and CV for this opportunity only.',
                    )}
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#142B5F]/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setJob(null)}
                    className={secondaryActionStyle}
                  >
                    {c('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className={primaryActionStyle}
                    disabled={busy || loading || !consent || !profile.resumeAssetId}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    <span>{c('إرسال التقديم', 'Submit application')}</span>
                  </button>
                </div>
              </form>
            </SummarySectionCard>
          )}
        </div>
      )}

      {/* SUB-TAB 3: تقديماتي المهنية */}
      {activeSubTab === 'APPLICATIONS' && (
        <SummarySectionCard
          id="mn-career-applications"
          title={c('تقديماتي المهنية المسجلة', 'My career applications')}
          icon={ClipboardList}
          metaLabel={`${applications.length} ${c('طلب', 'applications')}`}
        >
          {applications.length === 0 ? (
            <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
              <span className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
              </span>
              <h4 className="text-[11px] sm:text-[12px] font-bold text-[#142B5F] dark:text-white">
                {c('لا توجد طلبات تقديم مهنية مسجلة بعد', 'No career applications yet')}
              </h4>
              <p className="mt-1 text-[10px] sm:text-[11px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">
                {c(
                  'تصفح فرص التدريب والعمل المتاحة وقدّم مباشرة باستخدام ملفك المهني.',
                  'Browse available training and career roles and apply directly with your profile.',
                )}
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('JOBS')}
                className={`mt-3 ${primaryActionStyle}`}
              >
                <span>{c('تصفح فرص العمل والتدريب', 'Browse opportunities')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className={`grid gap-2.5 ${applications.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {applications.map((row) => {
                  const statusInfo = getApplicationStatusInfo(row.status, c);
                  const canWithdraw = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(
                    row.status,
                  );
                  return (
                    <article
                      key={row.id}
                      className={`relative overflow-hidden flex flex-col justify-between rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 hover:bg-white dark:hover:bg-[#111E38] hover:border-[#0E7C86]/35 p-2.5 sm:p-3 transition-all ${
                        canWithdraw ? 'mn-summary-start-bar' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-start gap-2.5">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                            <BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-white">
                              {row.jobSnapshot?.title || c('فرصة مهنية', 'Career opportunity')}
                            </h4>
                            <div className="mt-0.5 text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                              #{row.publicId}
                            </div>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[9.5px] font-bold ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {canWithdraw && (
                        <div className="mt-2.5 flex justify-end border-t border-[#142B5F]/10 dark:border-white/10 pt-2">
                          <button
                            type="button"
                            className="mn-workspace-btn-sm rounded-lg border border-[#142B5F]/20 dark:border-white/15 bg-white dark:bg-[#111E38] px-2.5 text-[10px] font-bold text-[#5C707C] dark:text-[#9BB4C7] hover:text-[#142B5F] dark:hover:text-white hover:border-[#0E7C86] transition-colors cursor-pointer disabled:opacity-50"
                            disabled={busy}
                            onClick={() =>
                              void write(`applications/${row.id}/withdraw`, 'POST', {
                                expectedVersion: row.version,
                              })
                            }
                          >
                            {c('سحب الطلب', 'Withdraw')}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    className={secondaryActionStyle}
                    disabled={loading || page <= 1}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{c('السابق', 'Prev')}</span>
                  </button>
                  <span className="text-[10.5px] font-bold text-[#142B5F] dark:text-white tabular-nums">
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
        </SummarySectionCard>
      )}

      {/* SUB-TAB 4: تطوير مهاراتي */}
      {activeSubTab === 'SKILLS' && (
        <CareerSkillDevelopmentPanel skillsCount={savedSkillsCount} />
      )}

      {/* SUB-TAB 5: الخريجون (إعدادات الخريج + شبكة الخريجين) */}
      {activeSubTab === 'ALUMNI' && (
        <div className="space-y-3">
          <SummarySectionCard
            id="mn-career-alumni"
            title={c('ملف الخريج والخصوصية', 'Alumni profile & privacy')}
            icon={GraduationCap}
          >
            <form
              className="space-y-2.5"
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
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className={labelStyle}>
                  {c('اسم العرض في دليل الخريجين', 'Display name')}
                  <input
                    required
                    className={inputStyle}
                    value={alumni.displayName}
                    maxLength={240}
                    placeholder={c('مثال: م. أحمد عبد الله', 'e.g. Eng. Ahmed')}
                    onChange={(event) =>
                      setAlumni((previous) => ({ ...previous, displayName: event.target.value }))
                    }
                  />
                </label>

                <label className={labelStyle}>
                  {c('سنة التخرج', 'Graduation year')}
                  <input
                    className={`${inputStyle} tabular-nums`}
                    type="number"
                    min={1970}
                    max={new Date().getFullYear() + 7}
                    placeholder={String(new Date().getFullYear())}
                    value={alumni.graduationYear ?? ''}
                    onChange={(event) =>
                      setAlumni((previous) => ({
                        ...previous,
                        graduationYear: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className={labelStyle}>
                  {c('جهة العمل الحالية (اختياري)', 'Current employer')}
                  <input
                    className={inputStyle}
                    value={alumni.employerName || ''}
                    maxLength={240}
                    placeholder={c('مثال: مهندس برمجيات', 'e.g. Software Engineer')}
                    onChange={(event) =>
                      setAlumni((previous) => ({ ...previous, employerName: event.target.value }))
                    }
                  />
                </label>

                <label className={labelStyle}>
                  {c('مستوى ظهور الملف', 'Visibility level')}
                  <select
                    className={`${inputStyle} cursor-pointer`}
                    value={alumni.visibility}
                    onChange={(event) =>
                      setAlumni((previous) => ({
                        ...previous,
                        visibility: event.target.value as Alumni['visibility'],
                      }))
                    }
                  >
                    <option value="PRIVATE">
                      {c('خاص — غير مدرج في الدليل', 'Private')}
                    </option>
                    <option value="ALUMNI_ONLY">
                      {c('للخريجين الموافقين فقط', 'Consenting alumni only')}
                    </option>
                    <option value="PUBLIC">
                      {c('عام', 'Public')}
                    </option>
                  </select>
                </label>
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-2.5 text-[10.5px] sm:text-[11px] font-medium text-[#142B5F] dark:text-white cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-[#0E7C86] cursor-pointer"
                  checked={alumniConsent}
                  onChange={(event) => setAlumniConsent(event.target.checked)}
                />
                <span>
                  {c(
                    'أوافق على إدراج بياناتي الأساسية وفق نطاق الخصوصية المحدد أعلاه.',
                    'I consent to listing my basic info according to the privacy level above.',
                  )}
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#142B5F]/10 dark:border-white/10 pt-2.5">
                <button type="submit" className={primaryActionStyle} disabled={busy || loading}>
                  <ShieldCheck className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  <span>{c('حفظ إعدادات الخريج', 'Save alumni settings')}</span>
                </button>
              </div>
            </form>
          </SummarySectionCard>

          <SummarySectionCard
            id="mn-career-network"
            title={c('دليل شبكة الخريجين', 'Alumni directory')}
            icon={UsersRound}
            action={
              <button
                type="button"
                className={secondaryActionStyle}
                disabled={busy || loading || networkLoading || alumni.visibility === 'PRIVATE'}
                onClick={() => loadNetwork(1)}
              >
                <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {networkLoading
                    ? c('جارٍ التحميل…', 'Loading…')
                    : c('تصفح الشبكة', 'Browse network')}
                </span>
              </button>
            }
          >
            <p className="text-[10.5px] sm:text-[11px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">
              {alumni.visibility === 'PRIVATE'
                ? c(
                    'فعّل ظهور ملفك إلى «للخريجين الموافقين» لاستعراض زملائك.',
                    'Enable alumni visibility above to browse peers.',
                  )
                : c('تواصل مع زملائك الخريجين المشاركين في الشبكة.', 'Connect with peers.')}
            </p>

            {network.length > 0 && (
              <div className="mt-3 space-y-2.5">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {network.map((row) => (
                    <article
                      key={row.id}
                      className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-[10.5px] sm:text-[11.5px] font-bold text-[#142B5F] dark:text-white truncate">
                            {row.displayName}
                          </h4>
                          <div className="flex items-center gap-2 text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                            {row.graduationYear && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                                <span>{row.graduationYear}</span>
                              </span>
                            )}
                            {row.employerName && (
                              <span className="inline-flex items-center gap-1 truncate">
                                <Building2 className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                                <span className="truncate">{row.employerName}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {networkPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      className={secondaryActionStyle}
                      disabled={networkLoading || networkPage <= 1}
                      onClick={() => loadNetwork(networkPage - 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{c('السابق', 'Prev')}</span>
                    </button>
                    <span className="text-[10.5px] font-bold text-[#142B5F] dark:text-white tabular-nums">
                      {networkPage} / {networkPages}
                    </span>
                    <button
                      type="button"
                      className={secondaryActionStyle}
                      disabled={networkLoading || networkPage >= networkPages}
                      onClick={() => loadNetwork(networkPage + 1)}
                    >
                      <span>{c('التالي', 'Next')}</span>
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </SummarySectionCard>
        </div>
      )}
    </div>
  );
}

function getApplicationStatusInfo(status: string, c: (ar: string, en: string) => string) {
  switch ((status || '').toUpperCase()) {
    case 'SUBMITTED':
      return {
        label: c('تم التقديم', 'Submitted'),
        className: 'text-[#0E7C86] dark:text-[#38C6D4]',
      };
    case 'UNDER_REVIEW':
      return {
        label: c('قيد المراجعة', 'Under review'),
        className: 'text-[#142B5F] dark:text-white',
      };
    case 'SHORTLISTED':
      return {
        label: c('قائمة قصيرة', 'Shortlisted'),
        className: 'text-[#0E7C86] dark:text-[#38C6D4]',
      };
    case 'ACCEPTED':
      return {
        label: c('مقبول', 'Accepted'),
        className: 'text-[#0E7C86] dark:text-[#38C6D4]',
      };
    case 'REJECTED':
      return {
        label: c('غير مستوفٍ', 'Rejected'),
        className: 'text-[#5C707C] dark:text-[#9BB4C7]',
      };
    default:
      return {
        label: status || c('قيد المتابعة', 'Pending'),
        className: 'text-[#5C707C] dark:text-[#9BB4C7]',
      };
  }
}
