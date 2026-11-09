import { PreviewStudentApiClient } from './studentWorkspacePreviewApi';
const ApiClient = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? PreviewStudentApiClient : LiveApiClient;
import {StudentDocumentUpload} from './StudentDocumentUpload';
import { applicationCycleLabel } from './ApplicationCycleLabel';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronDown, FileCheck2, Info, Calendar, Sparkles, AlertCircle, Link2 } from 'lucide-react';
import {
  ApiClient as LiveApiClient,
  type StudentApplicationTrackerDto,
  type StudentOwnedAssetDto,
} from '../../api/client';
import { useTranslation } from '../../i18n/I18nProvider';
export function StudentApplicationDocuments({
  tracker,
  onChanged,
}: {
  tracker: StudentApplicationTrackerDto;
  onChanged: () => void;
}) {
  const generation = useRef(0);
  const detailsId = `mn-student-application-documents-${tracker.id}`;
  const { language } = useTranslation();
  const text = useCallback((ar: string, en: string) => (language === 'en' ? en : ar), [language]);
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [readiness, setReadiness] = useState<Awaited<
    ReturnType<typeof ApiClient.getMyApplicationDocuments>
  > | null>(null);
  const [assets, setAssets] = useState<StudentOwnedAssetDto[]>([]),
    [requirement, setRequirement] = useState(''),
    [asset, setAsset] = useState(''),
    [consent, setConsent] = useState(false),
    [expiry, setExpiry] = useState('');
  const [cycles, setCycles] = useState<Array<{ id: string; cycleKey: string }>>([]),
    [cycle, setCycle] = useState('');
  useEffect(() => {
    const current = ++generation.current;
    if (!open) return;
    setReadiness(null);
    setAssets([]);
    setCycles([]);
    setRequirement('');
    setAsset('');
    setConsent(false);
    setError('');
    void Promise.allSettled([
      ApiClient.getMyApplicationDocuments(tracker.id),
      ApiClient.listMyActiveStudentAssets('application/pdf'),
      ApiClient.getScholarshipApplicationCycles(tracker.scholarshipId),
      ApiClient.listMyActiveStudentAssets('image/'),
    ]).then(([r, a, c, images]) => {
      if (current !== generation.current) return;
      if (r.status === 'fulfilled') setReadiness(r.value);
      const availableAssets = [a, images].flatMap((result) => result.status === 'fulfilled' ? result.value.items : []);
      setAssets([...new Map(availableAssets.map((item) => [item.id, item])).values()]);
      if (c.status === 'fulfilled') setCycles(c.value.cycles);
      if ([r, a, c, images].some((v) => v.status === 'rejected'))
        setError(
          text(
            'بعض المتطلبات أو الأصول أو الدورات غير متاحة. أعد فتح اللوحة للمحاولة.',
            'Some requirements, assets or cycles are unavailable. Reopen this panel to retry.',
          ),
        );
    });
    return () => {
      ++generation.current;
    };
  }, [open, tracker.id, tracker.version, tracker.scholarshipId, text]);
  const labels: Record<string, [string, string]> = {
    UNFULFILLED: ['لم يرتبط مستند', 'No document linked'],
    REQUIREMENT_REMOVED: [
      'حذف المالك المتطلب؛ يمكنك سحب الموافقة',
      'Owner removed this requirement; you can withdraw consent',
    ],
    ASSET_AVAILABLE_UNVERIFIED: [
      'أصل متاح؛ محتواه غير مُصدّق',
      'Asset available; content not attested',
    ],
    OWNER_UNAVAILABLE: ['متطلبات المالك غير متاحة', 'Owner unavailable'],
    REVISION_CHANGED: [
      'تغير إصدار المتطلبات؛ يلزم المراجعة',
      'Requirement revision changed; review needed',
    ],
    EXPIRED: ['انتهت المدة', 'Expired'],
    ASSET_UNAVAILABLE: ['الأصل غير متاح أو سُحبت صلاحيته', 'Asset unavailable or revoked'],
  };
  const snapshotDeadline =
    typeof tracker.ownerSnapshot?.deadlineAt === 'string' &&
    Number.isFinite(Date.parse(tracker.ownerSnapshot.deadlineAt))
      ? new Date(tracker.ownerSnapshot.deadlineAt).toLocaleDateString(
          language === 'en' ? 'en-GB' : 'ar',
          { timeZone: 'UTC' },
        )
      : null;
  return (
    <section className="mn-student-application-documents mt-3 overflow-hidden rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] font-['Cairo',sans-serif] w-full max-w-full min-w-0 shadow-2xs transition-all">
      <button
        type="button"
        className="mn-student-documents-toggle flex w-full items-center gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 text-start text-[var(--mn-heading)] transition-colors hover:bg-[var(--mn-surface-muted)] cursor-pointer"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-8 h-8 rounded-xl bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center shrink-0">
          <FileCheck2 className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] sm:text-[13.5px] leading-snug font-bold font-['Cairo',sans-serif]">
            {text('مستندات ودورة التقديم', 'Documents and application cycle')}
          </span>
          <span className="mt-0.5 block text-[11px] leading-[1.6] font-medium text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
            {text('مراجعة المتطلبات، رفع المستندات، ومعرفة دورة التقديم.', 'Review requirements, upload documents, and view the application cycle.')}
          </span>
        </span>
        <ChevronDown className={`h-4.5 w-4.5 shrink-0 text-[#D6A43B] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div id={detailsId} className="mn-student-documents-detail space-y-4 border-t border-[var(--mn-border)] p-3 sm:p-4 text-[12px] leading-[1.8] text-[var(--mn-text)] font-['Cairo',sans-serif] w-full max-w-full min-w-0 overflow-hidden">
          {/* Informative Guidance Banner */}
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11.5px] text-amber-900 dark:text-amber-200 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              {text(
                'هذه متابعة تنظيمية خاصة بملفك الطلابي لتجهيز مستنداتك دون إرسالها للجهة المانحة؛ الربط يسهل مراجعتها والتحقق منها بخصوصية كاملة.',
                'This is personal planning to prepare your documents privately; linking helps organize and review them securely.',
              )}
            </span>
          </div>

          {/* Cycle & Scholarship Snapshot Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full max-w-full min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] text-[11px] font-bold text-[var(--mn-heading)]">
              <Calendar className="w-3.5 h-3.5 text-[#0E7C86] shrink-0" />
              <span>{text('الدورة:', 'Cycle:')}</span>
              <span className="font-semibold text-[var(--mn-text-muted)]">
                {applicationCycleLabel(
                  tracker.ownerSnapshot?.cycleKey,
                  language === 'en' ? 'en' : 'ar',
                )}
              </span>
            </div>

            {typeof tracker.ownerSnapshot?.displayName === 'string' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] text-[11px] font-bold text-[var(--mn-heading)] max-w-full min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-[#D6A43B] shrink-0" />
                <span className="truncate max-w-[160px] sm:max-w-xs">{tracker.ownerSnapshot.displayName}</span>
              </div>
            )}

            {snapshotDeadline && (
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] text-[11px] font-semibold text-[var(--mn-text-muted)]">
                <span>{text('الموعد المرجعي:', 'Reference deadline:')}</span>
                <strong className="text-[var(--mn-heading)]">{snapshotDeadline}</strong>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300 border border-rose-200 text-xs" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Document Box */}
          {tracker.status === 'ACTIVE' && (
            <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 sm:p-3.5 w-full max-w-full min-w-0 overflow-hidden">
              <StudentDocumentUpload
                key={tracker.id}
                onUploaded={(item) => {
                  setAssets((previous) => [item, ...previous.filter((a) => a.id !== item.id)]);
                  setAsset(item.id);
                  setConsent(false);
                }}
              />
            </div>
          )}

          {/* Readiness Requirements Section */}
          {readiness && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--mn-heading)] pt-1">
                <span>
                  {readiness.ownerState === 'AVAILABLE'
                    ? text('قائمة المستندات والمتطلبات الرسمية', 'Official documents and requirements')
                    : text('حالة متطلبات الجهة المانحة', 'Donor requirements state')}
                </span>
                <span className="text-[11px] text-[var(--mn-text-muted)] font-normal">
                  {readiness.entries.length} {text('متطلبات', 'requirements')}
                </span>
              </div>

              <div className="space-y-2">
                {readiness.entries.map((r) => {
                  const stateLabel = labels[r.state]?.[language === 'en' ? 1 : 0] ?? r.state;
                  const isLinked = r.linked;
                  return (
                    <div
                      key={r.requirementId}
                      className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3.5 shadow-2xs space-y-2 transition-all hover:border-[#D6A43B]/40"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isLinked ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[12.5px] text-[var(--mn-heading)]">{r.displayName}</span>
                            <div className="text-[10.5px] text-[var(--mn-text-muted)] flex items-center gap-1.5 mt-0.5">
                              <span className={`px-2 py-0.5 rounded-md font-semibold ${isLinked ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'}`}>
                                {stateLabel}
                              </span>
                              {r.verification && (
                                <span className="px-2 py-0.5 rounded-md font-semibold bg-[#0E7C86]/10 text-[#0E7C86]">
                                  {({
                                    VERIFIED: text('تم التدقيق الأكاديمي', 'Academically verified'),
                                    REJECTED: text('مرفوض', 'Rejected'),
                                    STALE: text('بحاجة لتحديث', 'Update needed'),
                                    NOT_ATTESTED: text('غير مصدق', 'Not attested'),
                                  } as Record<string, string>)[r.verification] ?? r.verification}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons per requirement */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {r.linked && (
                            <>
                              <button
                                type="button"
                                disabled={busy || (!r.reviewConsentGranted && (!r.bindable || r.state !== 'ASSET_AVAILABLE_UNVERIFIED'))}
                                onClick={() => {
                                  const current = generation.current;
                                  if (!r.reviewConsentGranted && !window.confirm(text('أوافق على إتاحة المستند للمراجعة الأكاديمية البشرية وحفظ نتيجتها حسب المدة الموضحة.', 'I consent to human academic review of this document and retention of its result for the stated period.'))) return;
                                  setBusy(true);
                                  void ApiClient.setMyDocumentReviewConsent(tracker.id, r.requirementId, tracker.version, !r.reviewConsentGranted).then(() => {
                                    if (current === generation.current) onChanged();
                                  }).catch(() => {
                                    if (current === generation.current) setError(text('تعذر تحديث موافقة المراجعة؛ حدّث الملف.', 'Could not update review consent; refresh the tracker.'));
                                  }).finally(() => {
                                    if (current === generation.current) setBusy(false);
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-[#0E7C86]/30 bg-[#0E7C86]/8 hover:bg-[#0E7C86] hover:text-white text-[#0E7C86] text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
                              >
                                {r.reviewConsentGranted ? text('سحب المراجعة', 'Withdraw review') : text('طلب مراجعة أكاديمية', 'Request review')}
                              </button>

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  const current = generation.current;
                                  setBusy(true);
                                  void ApiClient.unbindMyApplicationDocument(tracker.id, r.requirementId, tracker.version).then(() => {
                                    if (current === generation.current) onChanged();
                                  }).catch(() => {
                                    if (current === generation.current) setError(text('تعذر إلغاء الربط؛ حدّث الملف.', 'Could not unlink; refresh the tracker.'));
                                  }).finally(() => setBusy(false));
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
                              >
                                {text('إلغاء الربط', 'Unlink')}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Linking Form Container */}
              {tracker.status === 'ACTIVE' && tracker.cycleReferenceId && tracker.cycleReferenceId !== 'LEGACY' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (busy || !consent || !requirement || !asset) return;
                    const current = generation.current;
                    setBusy(true);
                    setError('');
                    void ApiClient.bindMyApplicationDocument(tracker.id, {
                      requirementId: requirement,
                      assetId: asset,
                      expectedVersion: tracker.version,
                      consent: true,
                      expiresAt: expiry ? new Date(expiry).toISOString() : null,
                    }).then(() => {
                      if (current === generation.current) {
                        setConsent(false);
                        onChanged();
                      }
                    }).catch(() => {
                      if (current === generation.current) setError(text('تعذر الربط؛ حدّث الملف وتحقق من صلاحية الأصل.', 'Could not link; refresh the tracker and check asset access.'));
                    }).finally(() => setBusy(false));
                  }}
                  className="rounded-2xl border border-[#D6A43B]/30 bg-[var(--mn-surface)] p-4 space-y-3.5 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#142B5F] dark:text-[#E5B54F]">
                    <Link2 className="w-4 h-4 text-[#D6A43B]" />
                    <span>{text('ربط مستند بمتطلب رسمي للمنحة', 'Link document to an official requirement')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1">
                      <span className="text-[11px] font-semibold text-[var(--mn-heading)]">{text('اختر المتطلب المطلوب', 'Requirement')}</span>
                      <select
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        className="w-full h-10 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 text-xs font-semibold text-[var(--mn-heading)] outline-none focus:border-[#D6A43B]"
                      >
                        <option value="">— {text('حدد المتطلب', 'Select requirement')} —</option>
                        {readiness.entries.filter((r) => r.bindable).map((r) => (
                          <option key={r.requirementId} value={r.requirementId}>
                            {r.displayName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-1">
                      <span className="text-[11px] font-semibold text-[var(--mn-heading)]">{text('اختر المستند من أصولك', 'Asset file')}</span>
                      <select
                        value={asset}
                        onChange={(e) => setAsset(e.target.value)}
                        className="w-full h-10 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 text-xs font-semibold text-[var(--mn-heading)] outline-none focus:border-[#D6A43B]"
                      >
                        <option value="">— {text('حدد الملف', 'Select file')} —</option>
                        {assets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.metadata?.originalFilename ?? a.reference}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-[11px] font-semibold text-[var(--mn-heading)]">{text('تاريخ انتهاء صلاحية المستند (اختياري)', 'Document expiry date (optional)')}</span>
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full h-10 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 text-xs font-semibold text-[var(--mn-heading)] outline-none focus:border-[#D6A43B]"
                    />
                  </label>

                  <label className="flex items-start gap-2.5 pt-1 text-[11.5px] text-[var(--mn-text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#0E7C86] focus:ring-[#0E7C86]"
                    />
                    <span>
                      {text(
                        'أوافق على ربط هذا المستند بملفي الطلابي لمدة أقصاها 180 يومًا وفق معايير الخصوصية.',
                        'I consent to linking this document to my application profile for up to 180 days privately.',
                      )}
                    </span>
                  </label>

                  <button
                    disabled={busy || !requirement || !asset || !consent}
                    className="w-full h-10 rounded-xl bg-[#0E7C86] hover:bg-[#0c6b74] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {text('ربط المستند الآن', 'Link document now')}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Separate Cycle Tracking */}
          {cycles.length > 0 && (
            <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3.5 space-y-2.5">
              <span className="block text-xs font-bold text-[var(--mn-heading)]">
                {text('بدء متابعة دورة منشورة مستقلة', 'Track a separate published cycle')}
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value)}
                  className="flex-1 h-10 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 text-xs font-semibold text-[var(--mn-heading)] outline-none focus:border-[#D6A43B]"
                >
                  <option value="">— {text('اختر الدورة', 'Select cycle')} —</option>
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {applicationCycleLabel(c.cycleKey, language === 'en' ? 'en' : 'ar')}
                    </option>
                  ))}
                </select>

                <button
                  disabled={busy || !cycle}
                  onClick={() => {
                    if (busy || !cycle) return;
                    const current = generation.current;
                    setBusy(true);
                    void ApiClient.createMyStudentApplicationTracker({
                      scholarshipId: tracker.scholarshipId,
                      cycleId: cycle,
                    }).then(() => {
                      if (current === generation.current) onChanged();
                    }).catch(() => {
                      if (current === generation.current) setError(text('تعذر بدء الدورة', 'Could not start this cycle'));
                    }).finally(() => setBusy(false));
                  }}
                  className="h-10 px-4 rounded-xl bg-[#142B5F] hover:bg-[#1a3675] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {text('متابعة الدورة', 'Track cycle')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
