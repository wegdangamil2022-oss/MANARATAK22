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
    <section className="mn-student-application-documents relative mt-2 overflow-hidden rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 font-['Cairo',sans-serif] w-full max-w-full min-w-0 transition-all">
      <button
        type="button"
        className="mn-student-documents-toggle flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-[#142B5F] dark:text-[#F1F5F9] transition-colors hover:bg-white dark:hover:bg-[#142342] cursor-pointer"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
            <FileCheck2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10.5px] sm:text-[11.5px] leading-snug font-bold text-[#142B5F] dark:text-[#F1F5F9] truncate font-['Cairo',sans-serif]">
              {text('مستندات ودورة التقديم', 'Documents and application cycle')}
            </span>
            <span className="block text-[9.5px] sm:text-[10px] leading-snug font-medium text-[#5C707C] dark:text-[#9BB4C7] truncate font-['Cairo',sans-serif]">
              {text('مراجعة المتطلبات الرسمية وربط الوثائق الخاصة', 'Review requirements and link documents')}
            </span>
          </span>
        </span>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-[#0E7C86]/25 dark:border-[#38C6D4]/30 bg-white dark:bg-[#111E38] text-[#0E7C86] dark:text-[#38C6D4]">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </span>
      </button>

      {open && (
        <div id={detailsId} className="mn-student-documents-detail space-y-2.5 border-t border-[#142B5F]/10 dark:border-white/10 p-2.5 sm:p-3 text-[11px] leading-[1.7] text-[#142B5F] dark:text-[#F1F5F9] font-['Cairo',sans-serif] w-full max-w-full min-w-0 overflow-hidden">
          {/* Informative Guidance Banner */}
          <div className="flex items-start gap-2 rounded-xl bg-[#0E7C86]/[0.06] dark:bg-[#38C6D4]/10 border border-[#0E7C86]/22 p-2.5 text-[10px] sm:text-[10.5px] font-medium text-[#142B5F] dark:text-[#DCE7F0] leading-relaxed">
            <Info className="w-3.5 h-3.5 text-[#0E7C86] dark:text-[#38C6D4] shrink-0 mt-0.5" />
            <span>
              {text(
                'هذه متابعة تنظيمية خاصة بملفك الطلابي لتجهيز مستنداتك دون إرسالها للجهة المانحة؛ الربط يسهل مراجعتها والتحقق منها بخصوصية كاملة.',
                'This is personal planning to prepare your documents privately; linking helps organize and review them securely.',
              )}
            </span>
          </div>

          {/* Section 1: Cycle & Scholarship Snapshot Info Boxes */}
          <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 sm:p-3 space-y-2">
            <div className="flex items-center gap-2 border-b border-[#142B5F]/8 dark:border-white/8 pb-1.5">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white flex items-center justify-center shrink-0">
                <Calendar className="w-3 h-3 text-white" />
              </span>
              <h5 className="text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] leading-tight">
                {text('بيانات الدورة والموعد المرجعي', 'Cycle & Reference Info')}
              </h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-2">
                <div className="min-w-0">
                  <span className="block text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                    {text('الدورة الأكاديمية', 'Cycle')}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] break-words">
                    {applicationCycleLabel(
                      tracker.ownerSnapshot?.cycleKey,
                      language === 'en' ? 'en' : 'ar',
                    )}
                  </span>
                </div>
                <Calendar className="w-4 h-4 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
              </div>

              {snapshotDeadline ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-2">
                  <div className="min-w-0">
                    <span className="block text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                      {text('الموعد المرجعي', 'Reference deadline')}
                    </span>
                    <strong className="mt-0.5 block text-[11px] font-bold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]">
                      {snapshotDeadline}
                    </strong>
                  </div>
                  <FileCheck2 className="w-4 h-4 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
                </div>
              ) : (
                typeof tracker.ownerSnapshot?.displayName === 'string' && (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-2">
                    <div className="min-w-0">
                      <span className="block text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                        {text('الفرصة المرتبطة', 'Linked Scholarship')}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] break-words">
                        {tracker.ownerSnapshot.displayName}
                      </span>
                    </div>
                    <Sparkles className="w-4 h-4 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
                  </div>
                )
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#142B5F]/[0.06] text-[#142B5F] dark:bg-white/10 dark:text-[#F1F5F9] border border-[#142B5F]/20 text-[11px] font-bold" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 2: Upload Document Box */}
          {tracker.status === 'ACTIVE' && (
            <StudentDocumentUpload
              key={tracker.id}
              onUploaded={(item) => {
                setAssets((previous) => [item, ...previous.filter((a) => a.id !== item.id)]);
                setAsset(item.id);
                setConsent(false);
              }}
            />
          )}

          {/* Section 3: Readiness Requirements Section */}
          {readiness && (
            <div className="space-y-2.5">
              <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 sm:p-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#142B5F]/8 dark:border-white/8 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                      <FileCheck2 className="w-3 h-3 text-white" />
                    </span>
                    <h5 className="text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] leading-tight">
                      {readiness.ownerState === 'AVAILABLE'
                        ? text('قائمة المستندات والمتطلبات الرسمية', 'Official documents and requirements')
                        : text('حالة متطلبات الجهة المانحة', 'Donor requirements state')}
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]">
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
                        className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-2.5 space-y-2 transition-all hover:border-[#0E7C86]/40"
                      >
                        <div className="flex items-start justify-between gap-2.5 flex-wrap">
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                              <FileCheck2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block font-bold text-[11px] sm:text-[11.5px] text-[#142B5F] dark:text-[#F1F5F9] break-words leading-snug">
                                {r.displayName}
                              </span>
                              <div className="text-[9.5px] sm:text-[10px] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                <span className={`font-bold ${isLinked ? 'text-[#0E7C86] dark:text-[#38C6D4]' : 'text-[#5C707C] dark:text-[#9BB4C7]'}`}>
                                  {stateLabel}
                                </span>
                                {r.verification && (
                                  <span className="font-bold text-[#142B5F] dark:text-[#F2CD78]">
                                    ·{' '}
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
                          {r.linked && (
                            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
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
                                className="px-2.5 py-1 rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent hover:text-white dark:bg-[#111E38] text-[#142B5F] dark:text-[#EDF5F5] text-[10px] font-bold transition cursor-pointer disabled:opacity-50"
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
                                className="px-2.5 py-1 rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-transparent hover:bg-white dark:hover:bg-[#111E38] text-[#5C707C] dark:text-[#9BB4C7] hover:text-[#142B5F] dark:hover:text-white text-[10px] font-bold transition cursor-pointer disabled:opacity-50"
                              >
                                {text('إلغاء الربط', 'Unlink')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Linking Form Container */}
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
                  className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 sm:p-3 space-y-2.5"
                >
                  <div className="flex items-center gap-2 border-b border-[#142B5F]/8 dark:border-white/8 pb-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                      <Link2 className="w-3 h-3 text-white" />
                    </span>
                    <h5 className="text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] leading-tight">
                      {text('ربط مستند بمتطلب رسمي للمنحة', 'Link document to an official requirement')}
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="block space-y-1">
                      <span className="text-[10.5px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">{text('١. اختر المتطلب المطلوب', 'Requirement')}</span>
                      <select
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        className="w-full min-h-9 rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 text-[11px] font-semibold text-[#142B5F] dark:text-[#F1F5F9] outline-none focus:border-[#0E7C86]"
                      >
                        <option value="">— {text('حدد المتطلب الرسمي', 'Select requirement')} —</option>
                        {readiness.entries.filter((r) => r.bindable).map((r) => (
                          <option key={r.requirementId} value={r.requirementId}>
                            {r.displayName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-1">
                      <span className="text-[10.5px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">{text('٢. اختر المستند من أصولك', 'Asset file')}</span>
                      <select
                        value={asset}
                        onChange={(e) => setAsset(e.target.value)}
                        className="w-full min-h-9 rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 text-[11px] font-semibold text-[#142B5F] dark:text-[#F1F5F9] outline-none focus:border-[#0E7C86]"
                      >
                        <option value="">— {text('حدد الملف المرفوع', 'Select file')} —</option>
                        {assets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.metadata?.originalFilename ?? a.reference}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-[10.5px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">{text('٣. تاريخ انتهاء صلاحية المستند (اختياري)', 'Document expiry date (optional)')}</span>
                    <input
                      type="date"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full min-h-9 rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 text-[11px] font-semibold text-[#142B5F] dark:text-[#F1F5F9] outline-none focus:border-[#0E7C86]"
                    />
                  </label>

                  <label className="flex items-start gap-2 rounded-lg border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-2.5 text-[10.5px] font-medium text-[#5C707C] dark:text-[#9BB4C7] cursor-pointer leading-relaxed">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-[#0E7C86] shrink-0"
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
                    className="w-full sm:w-auto min-h-9 px-4 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 text-white text-[11px] font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    {text('ربط المستند بالمتطلب الآن', 'Link document now')}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Section 5: Separate Cycle Tracking */}
          {cycles.length > 0 && (
            <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 sm:p-3 space-y-2">
              <div className="flex items-center gap-2 border-b border-[#142B5F]/8 dark:border-white/8 pb-1.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                  <Calendar className="w-3 h-3 text-white" />
                </span>
                <h5 className="text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] leading-tight">
                  {text('بدء متابعة دورة منشورة مستقلة', 'Track a separate published cycle')}
                </h5>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value)}
                  className="flex-1 min-h-9 rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 text-[11px] font-semibold text-[#142B5F] dark:text-[#F1F5F9] outline-none focus:border-[#0E7C86]"
                >
                  <option value="">— {text('اختر الدورة الأكاديمية', 'Select cycle')} —</option>
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
                  className="min-h-9 px-4 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 text-white text-[11px] font-bold shadow-2xs transition cursor-pointer disabled:opacity-50 shrink-0"
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
