import { PreviewStudentApiClient } from './studentWorkspacePreviewApi';
const ApiClient = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? PreviewStudentApiClient : LiveApiClient;
import { useEffect, useRef, useState } from 'react';
import { ApiClient as LiveApiClient, type StudentServicePackageDto } from '../../api/client';
import { useTranslation } from '../../i18n/I18nProvider';
import { CalendarClock } from 'lucide-react';
type Slot = { id: string; startsAt: string; timezone: string };
export function StudentServiceBookingPanel({ requestId }: { requestId: string }) {
  const { language, dir } = useTranslation();
  const [slots, setSlots] = useState<Slot[]>([]),
    [slotCursor, setSlotCursor] = useState<string | null>(null);
  const [packages, setPackages] = useState<StudentServicePackageDto[]>([]),
    [packageCursor, setPackageCursor] = useState<string | null>(null);
  const [packageId, setPackageId] = useState(''),
    [consent, setConsent] = useState(false);
  const [inputs, setInputs] = useState<Record<string, Record<string, unknown>>>({});
  const [deliverables, setDeliverables] = useState<Array<{ id: string; artifactType: string }>>([]);
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState('');
  const mutation = useRef(false),
    intent = useRef<{ payload: string; key: string } | null>(null),
    active = useRef(requestId);
  active.current = requestId;
  const selected = packages.find((row) => row.id === packageId);
  const label = (ar: string, en: string) => (language === 'ar' ? ar : en);
  useEffect(() => {
    let current = true;
    setSlots([]);
    setSlotCursor(null);
    setPackages([]);
    setPackageCursor(null);
    setPackageId('');
    setConsent(false);
    setInputs({});
    setDeliverables([]);
    setNotice('');
    intent.current = null;
    void Promise.allSettled([
      ApiClient.listMyServiceAvailability(requestId),
      ApiClient.listMyServicePackages(requestId),
      ApiClient.listMyServiceDeliverables(requestId),
    ]).then((results) => {
      if (!current) return;
      if (results[0].status === 'fulfilled') {
        setSlots(results[0].value.data);
        setSlotCursor(results[0].value.nextCursor);
      }
      if (results[1].status === 'fulfilled') {
        setPackages(results[1].value.data);
        setPackageCursor(results[1].value.nextCursor);
      }
      if (results[2].status === 'fulfilled') setDeliverables(results[2].value.data);
      if (results.some((result) => result.status === 'rejected'))
        setNotice(
          language === 'ar'
            ? 'تعذر تحميل بعض معلومات الخدمة.'
            : 'Some service information could not be loaded.',
        );
    });
    return () => {
      current = false;
    };
  }, [requestId, language]);
  async function more(kind: 'slots' | 'packages') {
    if (mutation.current) return;
    const reference = requestId;
    mutation.current = true;
    setBusy(true);
    try {
      if (kind === 'slots' && slotCursor) {
        const page = await ApiClient.listMyServiceAvailability(reference, slotCursor);
        if (active.current === reference) {
          setSlots((previous) =>
            Array.from(new Map([...previous, ...page.data].map((row) => [row.id, row])).values()),
          );
          setSlotCursor(page.nextCursor);
        }
      }
      if (kind === 'packages' && packageCursor) {
        const page = await ApiClient.listMyServicePackages(reference, packageCursor);
        if (active.current === reference) {
          setPackages((previous) =>
            Array.from(new Map([...previous, ...page.data].map((row) => [row.id, row])).values()),
          );
          setPackageCursor(page.nextCursor);
        }
      }
    } catch {
      if (active.current === reference)
        setNotice(label('تعذر تحميل الصفحة التالية.', 'Unable to load the next page.'));
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  async function book(slotId: string) {
    if (mutation.current || (selected && !consent)) return;
    const reference = requestId;
    const options = selected
      ? { packageId: selected.id, packageConsent: true, packageParameters: inputs }
      : undefined;
    const payload = JSON.stringify({ requestId: reference, slotId, options });
    if (!intent.current || intent.current.payload !== payload)
      intent.current = { payload, key: crypto.randomUUID() };
    mutation.current = true;
    setBusy(true);
    try {
      const result = await ApiClient.bookMyServiceRequest(
        reference,
        slotId,
        intent.current.key,
        options,
      );
      if (active.current === reference)
        setNotice(import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype'
          ? label(
              `معاينة فقط: تمت محاكاة حجز الموعد برمز ${result.publicId}. لم يتم إنشاء حجز أو دفع حقيقي.`,
              `Design preview only: booking ${result.publicId} was simulated. No booking or payment was created.`,
            )
          : label(
              `حُجز الموعد مؤقتًا: ${result.publicId}. التأكيد يتطلب تسوية المالية قبل انتهاء الحجز.`,
              `Temporary booking: ${result.publicId}. Finance settlement is required before hold expiry.`,
            ));
    } catch {
      if (active.current === reference)
        setNotice(
          label(
            'تعذر حجز الموعد؛ تحقق من المدخلات والسعة وحالة الطلب.',
            'Booking failed; check inputs, capacity and request status.',
          ),
        );
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  async function download(id: string) {
    if (mutation.current) return;
    const reference = requestId;
    mutation.current = true;
    setBusy(true);
    try {
      const grant = await ApiClient.getMyServiceDeliveryGrant(reference, id);
      const url = new URL(grant.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:')
        throw new Error('UNSAFE_DELIVERY_URL');
      const response = await fetch(url, { headers: grant.headers, credentials: 'omit' });
      if (!response.ok) throw new Error('DELIVERY_FAILED');
      const blob = await response.blob();
      if (active.current !== reference) return;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'service-deliverable';
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      if (active.current === reference)
        setNotice(
          label(
            'تعذر تنزيل الملف أو لم يعد التسليم مصرحًا.',
            'File unavailable or delivery is no longer authorized.',
          ),
        );
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  if (!slots.length && !packages.length && !deliverables.length && !notice) return null;
  return (
    <section
      dir={dir}
      className="mn-student-service-booking-panel relative overflow-hidden rounded-2xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] px-3 py-3 sm:px-4.5 sm:py-4 shadow-[0_2px_10px_rgba(20,43,95,0.035)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.24)] mn-panel font-['Cairo',sans-serif] space-y-2.5"
      aria-label={label('مواعيد ومخرجات الخدمة', 'Service bookings and deliverables')}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#142B5F]/28 dark:via-[#D6A43B]/35 to-transparent"
      />

      <div className="relative z-10 flex min-w-0 items-center gap-2">
        <span className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#142B5F] shadow-2xs">
          <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-2 w-2 rounded-bl-sm bg-[#D6A43B]" />
          <CalendarClock className="relative z-10 h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
        </span>
        <div className="inline-flex flex-col items-start min-w-0">
          <h3 className="text-[13px] sm:text-[14.5px] font-extrabold leading-tight text-[#142B5F] dark:text-[#F1F5F9] truncate">
            {label('مواعيد ومخرجات الخدمة', 'Service bookings and deliverables')}
          </h3>
          <span
            aria-hidden="true"
            className="w-full min-w-[68px] h-[1.5px] mt-0.5 rounded-full bg-[linear-gradient(270deg,rgba(14,124,134,0.68)_0%,rgba(14,124,134,0.3)_72%,transparent_100%)] dark:bg-[linear-gradient(270deg,rgba(56,198,212,0.75)_0%,rgba(56,198,212,0.34)_72%,transparent_100%)]"
          />
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-[#0E7C86]/25 dark:border-[#38C6D4]/25 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-2 text-[10.5px] font-semibold leading-relaxed text-[#0E7C86] dark:text-[#38C6D4]">
          {notice}
        </p>
      )}

      {packages.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">
            {label('الخدمة أو الباقة', 'Service or package')}
            <select
              value={packageId}
              disabled={busy}
              onChange={(event) => {
                setPackageId(event.target.value);
                setInputs({});
                setConsent(false);
              }}
              className="mt-1 block h-9 w-full rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 text-[11px] font-semibold text-[#142B5F] dark:text-[#F1F5F9] outline-none focus:border-[#0E7C86]"
            >
              <option value="">{label('الخدمة المفردة', 'Single service')}</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id} disabled={!pkg.price}>
                  {pkg.displayName}
                </option>
              ))}
            </select>
          </label>
          {packageCursor && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void more('packages')}
              className="mn-workspace-btn-sm inline-flex items-center rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 px-3 text-[10.5px] font-bold text-[#142B5F] dark:text-[#EDF5F5] disabled:opacity-50 cursor-pointer"
            >
              {label('المزيد من الباقات', 'More packages')}
            </button>
          )}
        </div>
      )}

      {selected && (
        <div className="space-y-2.5">
          {selected.items.map((item) => (
            <fieldset key={item.serviceId} className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3 space-y-2">
              <legend className="px-1 text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9]">
                {item.localizedContent?.[language]?.displayName ?? item.displayName} ×{' '}
                {item.quantity}
              </legend>
              {item.inputSchema.map((field) => (
                <label key={field.key} className="block text-[10.5px] font-semibold text-[#142B5F] dark:text-[#DCE7F0]">
                  {field.key}
                  <input
                    type={
                      field.type === 'BOOLEAN'
                        ? 'checkbox'
                        : field.type === 'NUMBER'
                          ? 'number'
                          : 'text'
                    }
                    required={field.required}
                    maxLength={2000}
                    checked={
                      field.type === 'BOOLEAN'
                        ? Boolean(inputs[item.serviceId]?.[field.key])
                        : undefined
                    }
                    value={
                      field.type === 'BOOLEAN'
                        ? undefined
                        : String(inputs[item.serviceId]?.[field.key] ?? '')
                    }
                    onChange={(event) =>
                      setInputs((previous) => ({
                        ...previous,
                        [item.serviceId]: {
                          ...previous[item.serviceId],
                          [field.key]:
                            field.type === 'BOOLEAN'
                              ? event.target.checked
                              : field.type === 'NUMBER'
                                ? Number(event.target.value)
                                : event.target.value,
                        },
                      }))
                    }
                    className={
                      field.type === 'BOOLEAN'
                        ? 'mt-1 h-4 w-4 accent-[#0E7C86]'
                        : 'mt-1 block h-9 w-full rounded-lg border border-[#142B5F]/12 dark:border-white/10 bg-white dark:bg-[#111E38] px-3 text-[11px] text-[#142B5F] dark:text-[#F1F5F9] outline-none focus:border-[#0E7C86]'
                    }
                  />
                </label>
              ))}
            </fieldset>
          ))}
          <label className="flex items-start gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-2.5 text-[10.5px] font-semibold leading-relaxed text-[#142B5F] dark:text-[#DCE7F0] cursor-pointer">
            <input
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#0E7C86]"
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            {label(
              'أوافق على خدمات الباقة وشروطها ومعالجة مدخلاتها.',
              'I accept the package services, terms and input processing.',
            )}
          </label>
        </div>
      )}

      {slots.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {slots.map((slot) => (
            <button
              type="button"
              key={slot.id}
              disabled={busy || Boolean(selected && !consent)}
              className="mn-workspace-btn-sm rounded-lg border border-[#0E7C86]/30 dark:border-[#38C6D4]/32 bg-[#F6F8FA] hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent dark:bg-[#0B1529]/80 px-3 text-[10.5px] font-bold text-[#142B5F] hover:text-white dark:text-[#EDF5F5] transition-all disabled:opacity-50 cursor-pointer tabular-nums"
              onClick={() => void book(slot.id)}
            >
              {new Date(slot.startsAt).toLocaleString(language, { timeZone: slot.timezone })} —{' '}
              {label('حجز مؤقت', 'Temporary booking')}
            </button>
          ))}
        </div>
      )}

      {slotCursor && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void more('slots')}
          className="mn-workspace-btn-sm rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 px-3 text-[10.5px] font-bold text-[#142B5F] dark:text-[#EDF5F5] disabled:opacity-50 cursor-pointer"
        >
          {label('المزيد من المواعيد', 'More availability')}
        </button>
      )}

      {deliverables.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {deliverables.map((file) => (
            <button
              type="button"
              key={file.id}
              disabled={busy}
              onClick={() => void download(file.id)}
              className="mn-workspace-btn-sm rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 px-3 text-[10.5px] font-bold text-[#142B5F] dark:text-[#EDF5F5] hover:border-[#0E7C86]/55 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {label('تنزيل المخرج', 'Download deliverable')}: {file.artifactType}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
