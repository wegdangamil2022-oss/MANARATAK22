import { PreviewStudentApiClient } from '../students/studentWorkspacePreviewApi';
const ApiClient = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? PreviewStudentApiClient : LiveApiClient;
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClient as LiveApiClient, type StudentCertificateProjectionDto } from '../../api/client';
import { certificateCopy, certificateStatusCopy } from '@manaratak/shared';
import { useTranslation } from '../../i18n/I18nProvider';
import { StudentCertificateActions } from './StudentCertificateActions';
import { Award, Check, RefreshCw } from 'lucide-react';

export function StudentCertificatesPanel({
  initial,
  compactLearning = false,
  externalRefreshKey,
}: {
  initial: StudentCertificateProjectionDto[];
  compactLearning?: boolean;
  externalRefreshKey?: number;
}) {
  const { language } = useTranslation();
  const copy = useCallback((text: string) => certificateCopy(language, text), [language]);
  const [rows, setRows] = useState(initial);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const pageController = useRef<AbortController | null>(null);
  const loadedMore = useRef(false);

  useEffect(() => {
    if (typeof externalRefreshKey === 'number' && externalRefreshKey > 0) {
      setBusy(false);
      setRefresh((value) => value + 1);
    }
  }, [externalRefreshKey]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    loadedMore.current = false;
    pageController.current?.abort();
    const load = async () => {
      if (document.hidden || loadedMore.current) return;
      try {
        const page = await ApiClient.listMyCertificates(undefined, controller.signal);
        if (active && !loadedMore.current) {
          setRows(page.data);
          setCursor(page.nextCursor);
          setError('');
        }
      } catch {
        if (active && !controller.signal.aborted) setError(copy('تعذر تحميل الشهادات'));
      }
    };
    let inFlight = true;
    void load().finally(() => {
      inFlight = false;
    });
    // Poll the canonical owner
    const timer = window.setInterval(() => {
      if (!inFlight) {
        inFlight = true;
        void load().finally(() => {
          inFlight = false;
        });
      }
    }, 5000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      pageController.current?.abort();
    };
  }, [refresh, copy]);

  const more = async () => {
    if (!cursor || busy) return;
    loadedMore.current = true;
    const controller = new AbortController();
    pageController.current = controller;
    setBusy(true);
    setError('');
    try {
      const page = await ApiClient.listMyCertificates(cursor, controller.signal);
      if (!controller.signal.aborted) {
        setRows((previous) => [
          ...previous,
          ...page.data.filter((row) => !previous.some((old) => old.id === row.id)),
        ]);
        setCursor(page.nextCursor);
      }
    } catch {
      if (!controller.signal.aborted) setError(copy('تعذر تحميل الشهادات'));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return (
    <section id="certificates" className="space-y-2.5 scroll-mt-6 font-['Cairo',sans-serif]" aria-label={copy('الشهادات')}>
      {!(compactLearning && typeof externalRefreshKey === 'number') && (
        <div className="flex items-center justify-between gap-2">
          {!compactLearning && (
            <h3 className="font-extrabold text-[13.5px] sm:text-[14.5px] text-[#142B5F] dark:text-[#F1F5F9]">
              {copy('إنجازاتي وشهاداتي')}
            </h3>
          )}
          <button
            type="button"
            onClick={() => {
              setBusy(false);
              setRefresh((value) => value + 1);
            }}
            className="mn-workspace-btn-sm ms-auto inline-flex items-center gap-1.5 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer font-['Cairo',sans-serif]"
          >
            <RefreshCw className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>{copy('تحديث')}</span>
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[11px] font-bold text-[#142B5F] dark:text-[#F2CD78]">
          {error}
        </p>
      )}

      {!rows.length && (
        <p className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center text-[11px] font-semibold leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
          {copy('تظهر شهادة منارتك للدورات المؤهلة بعد إتمام المتطلبات وانتهاء عملية إصدار الشهادة.')}
        </p>
      )}

      <div className={`grid gap-2.5 ${rows.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
        {rows.map((row) => (
          <article
            key={row.id}
            className="mn-student-learning-certificate relative overflow-hidden flex min-w-0 flex-col justify-between rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 pr-3.5 pl-3 py-3 transition-all font-['Cairo',sans-serif]"
          >
            {/* Selective Manaratak start-bar for issued official certificates */}
            <span aria-hidden="true" className="mn-summary-start-bar" />

            <div>
              {/* Header: Icon + Title & Unboxed Petrol Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <span className="mt-0.5 grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                    <Award className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </span>
                  <h4 className="min-w-0 flex-1 text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                    {row.courseDisplayName}
                  </h4>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0E7C86] dark:text-[#38C6D4] whitespace-nowrap">
                  <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{certificateStatusCopy(row.status, language)}</span>
                </span>
              </div>

              {/* Metadata Row: Serial & Date */}
              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9.5px] sm:text-[10.5px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">
                <span>
                  {copy('تاريخ الإصدار')}:{' '}
                  <strong className="font-bold tabular-nums text-[#142B5F] dark:text-[#F1F5F9]">
                    {new Date(row.issuedAt).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}
                  </strong>
                </span>
                <span className="text-[#142B5F]/20 dark:text-white/20">·</span>
                <span>
                  الرقم التسلسلي:{' '}
                  <strong className="font-bold tabular-nums text-[#142B5F] dark:text-[#F1F5F9]" dir="ltr">
                    {row.serialNumber}
                  </strong>
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <StudentCertificateActions
              certificate={row}
              onSaveReference={async () => {
                await ApiClient.createMyStudentSavedItem({
                  entityType: 'CERTIFICATE',
                  entityId: row.id,
                });
              }}
            />
          </article>
        ))}
      </div>

      {cursor && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void more()}
          className="mn-workspace-btn-sm w-full rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 px-4 text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] hover:border-[#0E7C86]/55 transition-all disabled:opacity-50 cursor-pointer"
        >
          {busy ? copy('جارٍ التحميل…') : copy('عرض المزيد')}
        </button>
      )}
    </section>
  );
}
