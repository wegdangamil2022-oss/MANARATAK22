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
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 sm:p-3.5 space-y-3 font-['Cairo',sans-serif]">
      <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--mn-heading)]">
        <UploadCloud className="w-4 h-4 text-[#0E7C86] shrink-0" />
        <span>{en ? 'Upload a private document' : 'رفع مستند خاص'}</span>
      </div>

      <p className="text-[11px] leading-[1.7] text-[var(--mn-text-muted)]">
        {en
          ? 'PDF, PNG or JPEG, up to 10 MB. Retained for up to 180 days. A file is selectable only after security checks complete.'
          : 'صيغ PDF أو PNG أو JPEG حتى 10 ميغابايت. يُحفظ لغاية 180 يوماً ويُتاح بعد اكتمال الفحص الأمني.'}
      </p>

      {/* Modern responsive file trigger area */}
      <label className="flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-dashed border-[var(--mn-border)] hover:border-[#D6A43B] bg-[var(--mn-surface)] cursor-pointer transition w-full max-w-full">
        <FileUp className="w-5 h-5 text-[#D6A43B] mb-1 shrink-0" />
        <span className="text-[11.5px] font-bold text-[var(--mn-heading)] text-center break-all px-2">
          {file ? file.name : (en ? 'Choose a document from your device' : 'انقر لاختيار مستند من جهازك')}
        </span>
        <span className="text-[10px] text-[var(--mn-text-muted)] mt-0.5">
          {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : (en ? 'PDF, PNG or JPEG' : 'PDF، أو PNG، أو JPEG')}
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
      <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[var(--mn-text-muted)] leading-relaxed select-none">
        <input
          type="checkbox"
          checked={consent}
          disabled={busy}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#142B5F] focus:ring-[#D6A43B] shrink-0 cursor-pointer"
        />
        <span>
          {en
            ? 'I consent to storing this private document for application preparation.'
            : 'أوافق على تخزين هذا المستند الخاص لغرض تجهيز التقديم.'}
        </span>
      </label>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button
          type="button"
          disabled={busy || !file || !consent || Boolean(pending)}
          onClick={() => void upload()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-[#142B5F] hover:bg-[#1a3675] text-white text-[12px] font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#D6A43B]" />
          <span>{en ? 'Upload and check' : 'رفع وفحص المستند'}</span>
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-[11.5px] font-bold transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{en ? 'Retry file checks' : 'إعادة فحص الملف'}</span>
          </button>
        )}
      </div>

      {busy && (
        <div className="flex items-center gap-2 text-xs text-[#0E7C86] font-medium pt-1" role="status">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{en ? 'Uploading or checking the file…' : 'جارٍ رفع الملف أو فحصه…'}</span>
        </div>
      )}
      {previewNotice && (
        <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11.5px] text-teal-800 dark:text-teal-200" role="status">
          {previewNotice}
        </div>
      )}
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/20 dark:text-rose-300" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}
