import { useEffect, useRef, useState } from 'react';
import { UploadCloud, FileUp, RefreshCw } from 'lucide-react';
import { ApiClient as LiveApiClient, type StudentOwnedAssetDto } from '../../api/client';
import { useTranslation } from '../../i18n/I18nProvider';
import { PreviewStudentApiClient } from './studentWorkspacePreviewApi';
const ApiClient = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? PreviewStudentApiClient : LiveApiClient;
export function StudentDocumentUpload({
  onUploaded,
}: {
  onUploaded: (asset: StudentOwnedAssetDto) => void;
}) {
  const { language } = useTranslation(),
    en = language === 'en';
  const [file, setFile] = useState<File | null>(null),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [previewNotice, setPreviewNotice] = useState(''),
    [pending, setPending] = useState<{ id: string; filename: string; mime: string } | null>(null),
    generation = useRef(0);
  useEffect(
    () => () => {
      ++generation.current;
    },
    [],
  );
  const complete = async (
    item: { id: string; filename: string; mime: string },
    request: number,
  ) => {
    const result = await ApiClient.completeMyDocumentUpload(item.id);
    if (request !== generation.current) return;
    if (result.assetId !== item.id || result.lifecycleState !== 'ACTIVE')
      throw new Error('DOCUMENT_NOT_READY');
    setPending(null);
    setFile(null);
    setConsent(false);
    onUploaded({
      id: item.id,
      reference: item.id,
      lifecycleState: 'ACTIVE',
      metadata: { originalFilename: item.filename, mimeType: item.mime },
    });
  };
  const upload = async () => {
    if (!file || !consent || busy) return;
    const request = generation.current;
    setBusy(true);
    setError('');
    try {
      if (
        !['application/pdf', 'image/png', 'image/jpeg'].includes(file.type) ||
        file.size < 1 ||
        file.size > 10 * 1024 * 1024
      )
        throw new Error(
          en
            ? 'Choose a PDF, PNG or JPEG up to 10 MB.'
            : 'اختر PDF أو PNG أو JPEG بحجم لا يتجاوز 10 ميغابايت.',
        );
      if (import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype') {
        // Only the filename/type are kept in volatile demo memory. Never send
        // or read the document bytes and never create an actual upload grant.
        const simulated = await ApiClient.requestMyDocumentUpload({
          originalFilename: file.name,
          mimeType: file.type,
          byteSize: file.size,
          consent: true,
        });
        if (request !== generation.current) return;
        onUploaded({
          id: simulated.assetId,
          reference: simulated.assetId,
          lifecycleState: 'ACTIVE',
          metadata: { originalFilename: file.name, mimeType: file.type },
        });
        setFile(null);
        setConsent(false);
        setPreviewNotice(en
          ? 'Preview only: the document name was added to the mock form; no file was uploaded or saved.'
          : 'معاينة فقط: أُضيف اسم المستند للنموذج التجريبي، ولم يُرفع أي ملف أو تُحفظ بياناته.');
        return;
      }
      const result = await ApiClient.requestMyDocumentUpload({
        originalFilename: file.name,
        mimeType: file.type,
        byteSize: file.size,
        consent: true,
      });
      if (request !== generation.current) return;
      const grant = result.uploadGrant;
      if (!grant) throw new Error('UPLOAD_PROVIDER_UNAVAILABLE');
      const target = new URL(grant.uploadUrl);
      if (
        target.username ||
        target.password ||
        (target.protocol !== 'https:' &&
          !(
            import.meta.env.DEV &&
            target.protocol === 'http:' &&
            ['localhost', '127.0.0.1'].includes(target.hostname)
          )) ||
        !['PUT', 'POST'].includes(grant.method) ||
        !Number.isFinite(Date.parse(grant.expiresAt)) ||
        Date.parse(grant.expiresAt) <= Date.now()
      )
        throw new Error('UPLOAD_GRANT_INVALID');
      const response = await fetch(target, {
        method: grant.method,
        headers: grant.headers,
        body: file,
        credentials: 'omit',
        redirect: 'error',
      });
      if (!response.ok) throw new Error('UPLOAD_FAILED');
      if (request !== generation.current) return;
      const item = { id: result.assetId, filename: file.name, mime: file.type };
      setPending(item);
      await complete(item, request);
    } catch (e) {
      if (request === generation.current)
        setError(e instanceof Error ? e.message : 'UPLOAD_FAILED');
    } finally {
      if (request === generation.current) setBusy(false);
    }
  };
  return (
    <section className="relative w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3 space-y-2.5 font-['Cairo',sans-serif]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#142B5F]/8 dark:border-white/8 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
            <UploadCloud className="w-3.5 h-3.5 text-white shrink-0" />
          </span>
          <h5 className="text-[11px] sm:text-[12px] font-bold text-[#142B5F] dark:text-[#F1F5F9] leading-tight truncate">
            {en ? 'Upload a private document' : 'رفع مستند خاص جديد'}
          </h5>
        </div>
        <span className="text-[9.5px] sm:text-[10px] font-bold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]" dir="ltr">
          PDF · PNG · JPEG · 10MB
        </span>
      </div>

      <p className="text-[10px] sm:text-[11px] font-medium leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
        {en
          ? 'PDF, PNG or JPEG, up to 10 MB. Retained for up to 180 days. A file is selectable only after security checks complete.'
          : 'ارفع وثيقتك بصيغة PDF أو PNG أو JPEG (بحد أقصى 10 ميغابايت). تُحفظ بأمان لمدة 180 يوماً وتُتاح للربط بعد الفحص الأمني.'}
      </p>

      {/* Modern responsive file trigger area */}
      <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-[#0E7C86]/40 dark:border-[#38C6D4]/35 hover:border-[#0E7C86] bg-white dark:bg-[#111E38] cursor-pointer transition-colors w-full max-w-full">
        <span className="mb-1.5 grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
          <FileUp className="w-4 h-4 shrink-0 text-white" />
        </span>
        <span className="text-[10.5px] sm:text-[11.5px] font-bold text-[#142B5F] dark:text-[#F1F5F9] text-center break-all px-2">
          {file ? file.name : (en ? 'Choose a document from your device' : 'اضغط هنا لاختيار مستند من جهازك')}
        </span>
        <span className="text-[9.5px] sm:text-[10.5px] font-medium text-[#5C707C] dark:text-[#9BB4C7] mt-0.5 tabular-nums">
          {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : (en ? 'PDF, PNG or JPEG' : 'يدعم ملفات PDF أو الصور الواضحة PNG / JPEG')}
        </span>
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          disabled={busy || Boolean(pending)}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>

      {/* Consent Checkbox */}
      <label className="flex items-start gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 cursor-pointer text-[10px] sm:text-[11px] font-medium text-[#142B5F] dark:text-[#DCE7F0] leading-relaxed select-none">
        <input
          type="checkbox"
          checked={consent}
          disabled={busy}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 w-3.5 h-3.5 rounded border-[#142B5F]/25 accent-[#0E7C86] shrink-0 cursor-pointer"
        />
        <span>
          {en
            ? 'I consent to storing this private document for application preparation.'
            : 'أوافق على تخزين هذا المستند الخاص في مساحتي الآمنة لغرض تجهيز ملفات التقديم.'}
        </span>
      </label>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        <button
          type="button"
          disabled={busy || !file || !consent || Boolean(pending)}
          onClick={() => void upload()}
          className="mn-workspace-btn-sm w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 text-white text-[10.5px] sm:text-[11px] font-bold transition-all disabled:opacity-45 cursor-pointer shadow-2xs"
        >
          <UploadCloud className="w-3.5 h-3.5 text-white shrink-0" />
          <span>{en ? 'Upload and check' : 'رفع وفحص المستند الآن'}</span>
        </button>

        {pending && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const request = generation.current;
              setBusy(true);
              setError('');
              void complete(pending, request)
                .catch((e) => {
                  if (request === generation.current)
                    setError(e instanceof Error ? e.message : 'UPLOAD_INCOMPLETE');
                })
                .finally(() => {
                  if (request === generation.current) setBusy(false);
                });
            }}
            className="mn-workspace-btn-sm w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-white dark:bg-[#111E38] text-[#142B5F] dark:text-[#EDF5F5] text-[10.5px] sm:text-[11px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-[#0E7C86] dark:text-[#38C6D4]" />
            <span>{en ? 'Retry file checks' : 'إعادة فحص الملف'}</span>
          </button>
        )}
      </div>

      {busy && (
        <div className="flex items-center gap-1.5 text-[10.5px] text-[#0E7C86] dark:text-[#38C6D4] font-bold pt-0.5" role="status">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>{en ? 'Uploading or checking the file…' : 'جارٍ رفع الملف وإجراء الفحص الأمني…'}</span>
        </div>
      )}
      {previewNotice && (
        <div className="p-2.5 rounded-xl bg-white dark:bg-[#111E38] border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 text-[10.5px] font-semibold text-[#0E7C86] dark:text-[#38C6D4]" role="status">
          {previewNotice}
        </div>
      )}
      {error && (
        <div className="p-2.5 rounded-xl bg-white dark:bg-[#111E38] border border-[#142B5F]/20 dark:border-white/15 text-[10.5px] font-bold text-[#142B5F] dark:text-[#F1F5F9]" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}
