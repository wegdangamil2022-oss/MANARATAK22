import { useTranslation } from '../../i18n/I18nProvider';
import { certificateCopy } from '@manaratak/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createQrMatrix } from '@manaratak/shared';
import { ApiClient, type StudentCertificateProjectionDto } from '../../api/client';
import { Eye, ShieldCheck, Download, Bookmark, FileText } from 'lucide-react';

export function StudentCertificateActions({
  certificate,
  onSaveReference,
}: {
  certificate: StudentCertificateProjectionDto;
  onSaveReference?: () => Promise<void>;
}) {
  const { language } = useTranslation();
  const isPrototype = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype';
  const copy = useCallback((value: string) => certificateCopy(language, value), [language]);
  const [busy, setBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const previewRef = useRef('');
  const [previewBusy, setPreviewBusy] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const closePreview = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = '';
    setPreview('');
  };

  useEffect(
    () => () => {
      requestRef.current?.abort();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const viewPreview = async () => {
    setPreviewBusy(true);
    setError('');
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      if (isPrototype) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540">
          <rect width="900" height="540" fill="#f7f8fb"/><rect x="25" y="25" width="850" height="490" fill="none" stroke="#142B5F" stroke-width="4"/>
          <text x="450" y="155" text-anchor="middle" font-size="38" fill="#142B5F" font-family="sans-serif">MANARATAK</text>
          <text x="450" y="255" text-anchor="middle" font-size="45" fill="#B38018" font-family="sans-serif">DEMO / PREVIEW</text>
          <text x="450" y="320" text-anchor="middle" font-size="25" fill="#142B5F" font-family="sans-serif">NOT A VALID CERTIFICATE</text>
          <text x="450" y="388" text-anchor="middle" font-size="20" fill="#142B5F" font-family="sans-serif">Design-only visual placeholder</text>
        </svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        closePreview();
        previewRef.current = URL.createObjectURL(blob);
        setPreview(previewRef.current);
        return;
      }
      const blob = await ApiClient.getMyCertificateArtifactBlob(certificate.id, 'preview', controller.signal);
      if (!['image/svg+xml', 'image/png', 'image/jpeg'].includes(blob.type))
        throw new Error(copy('رابط ملف الشهادة غير صالح.'));
      if (controller.signal.aborted) return;
      closePreview();
      previewRef.current = URL.createObjectURL(blob);
      setPreview(previewRef.current);
    } catch (error) {
      if (!controller.signal.aborted)
        setError(error instanceof Error ? error.message : copy('تعذر تحميل الشهادة'));
    } finally {
      if (!controller.signal.aborted) setPreviewBusy(false);
    }
  };

  const verifyPath = certificate.verificationCode
    ? `/certificates/verify?code=${encodeURIComponent(certificate.verificationCode)}`
    : null;
  const verificationUrl =
    certificate.verificationUrl ||
    (verifyPath ? new URL(verifyPath, window.location.origin).href : '');
  const matrix = useMemo(() => {
    try {
      return verificationUrl ? createQrMatrix(verificationUrl) : null;
    } catch {
      return null;
    }
  }, [verificationUrl]);

  const download = async () => {
    setBusy(true);
    setError('');
    try {
      if (isPrototype) {
        setError(copy('معاينة فقط: لا توجد شهادة رسمية أو ملف PDF قابل للتنزيل. استخدم زر عرض الشهادة لتجربة التصميم.'));
        return;
      }
      const blob = await ApiClient.getMyCertificateArtifactBlob(certificate.id, 'pdf');
      if (blob.type !== 'application/pdf') throw new Error(copy('تعذر تنزيل الشهادة.'));
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `${certificate.serialNumber || 'certificate'}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    } catch (error) {
      setError(error instanceof Error ? error.message : copy('تعذر تحميل الشهادة'));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!onSaveReference || saveBusy) return;
    setSaveBusy(true);
    setError('');
    try {
      await onSaveReference();
    } catch {
      setError(language === 'en' ? 'Could not save this owned certificate.' : 'تعذر حفظ الشهادة المملوكة لك.');
    } finally {
      setSaveBusy(false);
    }
  };

  return (
    <div className="mt-2.5 pt-2.5 border-t border-[#142B5F]/8 dark:border-white/8 space-y-2 font-['Cairo',sans-serif]">
      {/* Compact QR Section if present */}
      {matrix && (
        <div className="flex items-center gap-2.5 rounded-lg bg-white dark:bg-[#111E38] border border-[#142B5F]/10 dark:border-white/10 p-2">
          <svg
            role="img"
            aria-label={copy('QR للتحقق من الشهادة')}
            viewBox={`0 0 ${matrix.length + 8} ${matrix.length + 8}`}
            className="h-11 w-11 shrink-0 rounded bg-white p-1 border border-[#142B5F]/12"
            shapeRendering="crispEdges"
          >
            <rect width="100%" height="100%" fill="white" />
            {matrix.flatMap((row, y) =>
              row.map((filled, x) =>
                filled ? (
                  <rect key={`${x}:${y}`} x={x + 4} y={y + 4} width={1} height={1} fill="black" />
                ) : null,
              ),
            )}
          </svg>
          <div className="min-w-0 flex-1 text-[10px] leading-snug text-[#5C707C] dark:text-[#9BB4C7]">
            <span className="font-bold text-[#142B5F] dark:text-[#F1F5F9] block">رمز التحقق السريع (QR)</span>
            <span className="text-[9.5px]">امسح الرمز للتحقق الفوري من صحة الشهادة</span>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {certificate.previewImageAssetId && (
          <button
            type="button"
            disabled={previewBusy}
            onClick={() => void viewPreview()}
            className="mn-workspace-btn-sm inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-2.5 text-[10px] sm:text-[11px] font-bold text-white transition-all shadow-2xs cursor-pointer disabled:opacity-50 font-['Cairo',sans-serif]"
          >
            <Eye className="h-3 w-3 shrink-0 text-white" aria-hidden="true" />
            <span>{previewBusy ? copy('جارٍ التحميل…') : copy('عرض الشهادة')}</span>
          </button>
        )}

        {verifyPath && (isPrototype ? (
          <button
            type="button"
            onClick={() => setError(copy('هذه شهادة توضيحية فقط؛ لا توجد شهادة رسمية للتحقق منها.'))}
            className="mn-workspace-btn-sm inline-flex items-center justify-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-white hover:bg-[#F6F8FA] dark:bg-[#111E38] dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-all cursor-pointer font-['Cairo',sans-serif]"
          >
            <ShieldCheck className="h-3 w-3 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>{copy('التحقق')}</span>
          </button>
        ) : (
          <Link
            to={verifyPath}
            className="mn-workspace-btn-sm inline-flex items-center justify-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-white hover:bg-[#F6F8FA] dark:bg-[#111E38] dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-all cursor-pointer font-['Cairo',sans-serif]"
          >
            <ShieldCheck className="h-3 w-3 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>{copy('التحقق')}</span>
          </Link>
        ))}

        {certificate.certificatePdfAssetId ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void download()}
            className="mn-workspace-btn-sm inline-flex items-center justify-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-white hover:bg-[#F6F8FA] dark:bg-[#111E38] dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-all cursor-pointer disabled:opacity-50 font-['Cairo',sans-serif]"
          >
            <Download className="h-3 w-3 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>{busy ? copy('جارٍ التحميل…') : copy('تحميل PDF')}</span>
          </button>
        ) : (
          <span className="inline-flex h-[28px] items-center gap-1 px-2.5 text-[10px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] border border-dashed border-[#142B5F]/18 dark:border-white/15 rounded-lg font-['Cairo',sans-serif]">
            <FileText className="h-3 w-3 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>{copy('قيد التجهيز')}</span>
          </span>
        )}

        {onSaveReference && (
          <button
            type="button"
            disabled={saveBusy}
            onClick={() => void handleSave()}
            className="mn-workspace-btn-sm inline-flex items-center justify-center gap-1 rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-white hover:bg-[#F6F8FA] dark:bg-[#111E38] dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-all cursor-pointer disabled:opacity-50 font-['Cairo',sans-serif]"
          >
            <Bookmark className="h-3 w-3 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>{saveBusy ? copy('جارٍ الحفظ…') : (language === 'en' ? 'Save' : 'حفظ المرجع')}</span>
          </button>
        )}
      </div>

      {preview && (
        <div className="mt-2 space-y-2 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">معاينة الشهادة</span>
            <button type="button" onClick={closePreview} className="text-[10.5px] font-bold text-[#0E7C86] dark:text-[#38C6D4] hover:underline cursor-pointer">
              {copy('إغلاق')}
            </button>
          </div>
          <img src={preview} alt={copy('معاينة الشهادة')} className="w-full rounded-lg border border-[#142B5F]/10" />
        </div>
      )}

      {error && (
        <p role="alert" className="text-[10.5px] font-bold text-[#142B5F] dark:text-[#F2CD78] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
