import { PreviewStudentApiClient } from './studentWorkspacePreviewApi';
const ApiClient = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? PreviewStudentApiClient : LiveApiClient;
import {OwnerReferenceNotice} from './OwnerReferenceNotice';
import {useTranslation} from '../../i18n/I18nProvider';
import {StudentPrivateToolResult} from './StudentPrivateToolResult';
import { StudentApplicationDocuments } from './StudentApplicationDocuments';
import { StudentCareerWorkspace } from './StudentCareerWorkspace';
import { StudentServiceBookingPanel } from './StudentServiceBookingPanel';
import { StudentCertificatesPanel } from '../certificates/StudentCertificatesPanel';
import { StudentNotificationsView, studentNotificationLink } from './StudentNotificationsView';
import './student-workspace.css';
import { StudentWorkspaceShell } from './StudentWorkspaceShell';
import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Bell, BookOpen, Bookmark, CheckCircle2, ClipboardList, Compass, Folder, Heart, Home, LayoutGrid, LockKeyhole, RefreshCw, Route, Settings2, Star, X, User, ListChecks, GraduationCap, CalendarClock, Sparkles, Clock3, Languages, Moon, Sun, LogIn, ShieldCheck, ChevronLeft, History as HistoryIcon, Archive, Trash2, ExternalLink, ChevronDown, ChevronUp, FileText, Check, AlertTriangle, CreditCard, Receipt, Info, LogOut, Shield, RotateCcw, Save, Eye, Search, Plus, Layers, Filter, SlidersHorizontal, ArrowUpLeft, Camera, Upload } from 'lucide-react';
import {
  ApiClient as LiveApiClient,
  HydratedStudentSavedItemDto,
  StudentSavedItemDto,
  MoneyAmountDto,
  StudentDashboardSummaryDto,
  StudentFinanceInvoiceDto,
  StudentFinancePaymentDto,
  StudentWorkspaceSnapshotDto,
  StudentApplicationTrackerDto,
  StudentServiceRequestDto,
} from '../../api/client';

export type CanonicalWorkspaceTab = 'SUMMARY' | 'OPPORTUNITIES' | 'LEARNING' | 'VAULT' | 'SERVICES' | 'CAREERS' | 'NOTIFICATIONS' | 'PROFILE';
export type LegacyWorkspaceTab = 'HOME' | 'JOURNEY' | 'SETTINGS';
export type WorkspaceTab = CanonicalWorkspaceTab | LegacyWorkspaceTab;

function normalizeTab(t?: WorkspaceTab | null): CanonicalWorkspaceTab {
  if (!t) return 'SUMMARY';
  if (t === 'HOME') return 'SUMMARY';
  if (t === 'JOURNEY') return 'OPPORTUNITIES';
  if (t === 'SETTINGS') return 'PROFILE';
  return t;
}



function resolveTabFromQuery(queryTab: string | null): CanonicalWorkspaceTab | null {
  if (!queryTab) return null;
  const normalized = queryTab.toLowerCase();
  if (normalized === 'summary' || normalized === 'home') return 'SUMMARY';
  if (normalized === 'opportunities' || normalized === 'journey') return 'OPPORTUNITIES';
  if (normalized === 'learning' || normalized === 'courses') return 'LEARNING';
  if (normalized === 'vault' || normalized === 'saved') return 'VAULT';
  if (normalized === 'services' || normalized === 'requests') return 'SERVICES';
  if (normalized === 'careers') return 'CAREERS';
  if (normalized === 'notifications') return 'NOTIFICATIONS';
  if (normalized === 'profile' || normalized === 'settings') return 'PROFILE';
  return null;
}

function trackerDisplayName(tracker:StudentApplicationTrackerDto):string {return tracker.owner?.available?tracker.owner.displayName:typeof tracker.ownerSnapshot?.displayName==='string'?tracker.ownerSnapshot.displayName:'منحة محفوظة / Saved scholarship';}

export function StudentWorkspacePage({ initialTab = 'SUMMARY' }: { initialTab?: WorkspaceTab } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [studentReferenceId, setStudentReferenceId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboardSummaryDto | null>(null);
  const [invoices, setInvoices] = useState<StudentFinanceInvoiceDto[]>([]);
  const [paymentsByInvoice, setPaymentsByInvoice] = useState<
    Record<string, StudentFinancePaymentDto[]>
  >({});
  const queryTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const resolvedInitialTab: CanonicalWorkspaceTab = (queryTab === 'vault' && hash === '#certificates')
    ? 'LEARNING'
    : (resolveTabFromQuery(queryTab) || normalizeTab(initialTab));
  const [tab, setTab] = useState<CanonicalWorkspaceTab>(resolvedInitialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [snapshots, setSnapshots] = useState<StudentWorkspaceSnapshotDto[]>([]);
  const [hydratedSavedItems, setHydratedSavedItems] = useState<HydratedStudentSavedItemDto[]>([]);
  const [applicationTrackers, setApplicationTrackers] = useState<StudentApplicationTrackerDto[]>([]);
  const [serviceRequests, setServiceRequests] = useState<StudentServiceRequestDto[]>([]);
  const [sectionFailures, setSectionFailures] = useState<string[]>([]);
  const [profileDirty, setProfileDirty] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('');
  const [servicePage, setServicePage] = useState(1);
  const [serviceTotal, setServiceTotal] = useState(0);
  const [serviceHasMore, setServiceHasMore] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const serviceSequence = useRef(0);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const invoiceSequence = useRef(0);
  const mutationPending = useRef(false);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<StudentServiceRequestDto | null>(null);
  const [requestedServiceNotFound, setRequestedServiceNotFound] = useState(false);
  const [requestedNotFoundId, setRequestedNotFoundId] = useState<string | null>(null);
  const [identity, setIdentity] = useState<{ principalId: string; displayName: string; primaryEmail?: string; roles?: string[]; roleNames?: string[] } | null>(null);

  useEffect(() => {
    if (!dashboard) return;
    window.dispatchEvent(new CustomEvent('manaratak-student-preferences', { detail: { theme: dashboard.workspace.theme, unreadNotifications: dashboard.capabilityStatus?.notifications === 'DEGRADED' ? undefined : dashboard.statistics.unreadNotifications, displayName: dashboard.workspace.displayName || identity?.displayName, email: identity?.primaryEmail } }));
  }, [dashboard?.workspace.theme, dashboard?.workspace.displayName, dashboard?.statistics.unreadNotifications, dashboard?.capabilityStatus?.notifications, identity?.displayName, identity?.primaryEmail]);

  useEffect(() => {
    if (tab !== 'LEARNING' || !studentReferenceId) return;
    let active = true; let latest = 0;
    const refreshCertificates = async () => {
      if (document.visibilityState === 'hidden') return;
      const request = ++latest;
      try { const next = await ApiClient.getMyStudentDashboard(); if (active && request === latest) setDashboard(next); } catch { /* Preserve the loaded account during transient failures. */ }
    };
    window.addEventListener('focus', refreshCertificates);
    document.addEventListener('visibilitychange', refreshCertificates);
    return () => {active=false;window.removeEventListener('focus',refreshCertificates);document.removeEventListener('visibilitychange',refreshCertificates);};
  }, [tab, studentReferenceId]);

  // Live owner reads bound stale catalog links without persisting a second canonical catalog.
  useEffect(()=>{
    if(!studentReferenceId)return;let active=true,latest=0;
    const refreshOwners=async()=>{
      if(document.visibilityState==='hidden'||mutationPending.current)return;const request=++latest;
      const [trackers,saved]=await Promise.allSettled([ApiClient.listMyStudentApplicationTrackers(),ApiClient.listMyHydratedStudentSavedItems()]);
      if(!active||request!==latest||mutationPending.current)return;
      if(trackers.status==='fulfilled')setApplicationTrackers(current=>trackers.value.map(fresh=>{const prior=current.find(item=>item.id===fresh.id);return prior&&prior.version>fresh.version?{...prior,owner:fresh.owner}:fresh;}));
      else setApplicationTrackers(current=>current.map(item=>({...item,deadlineAt:null,scholarshipSlug:null,owner:item.owner?{...item.owner,available:false,slug:null,deadlineAt:null}:null})));
      setHydratedSavedItems(current=>saved.status==='fulfilled'?saved.value:current.map(item=>({...item,owner:null})));
    };
    const timer=window.setInterval(()=>void refreshOwners(),30000);window.addEventListener('focus',refreshOwners);document.addEventListener('visibilitychange',refreshOwners);
    return()=>{active=false;++latest;window.clearInterval(timer);window.removeEventListener('focus',refreshOwners);document.removeEventListener('visibilitychange',refreshOwners);};
  },[studentReferenceId]);

  // Synchronize Tab with URL query param and browser history (back/forward & refresh support)
  const handleTabChange = (nextTab: CanonicalWorkspaceTab, push = true) => {
    if (tab === 'PROFILE' && nextTab !== 'PROFILE' && profileDirty && !window.confirm('لديك تعديلات غير محفوظة. مغادرة الملف دون حفظ؟')) return;
    if (nextTab !== 'PROFILE') setProfileDirty(false);
    setTab(nextTab);
    const searchParams = new URLSearchParams(location.search);
    const tabParam = nextTab.toLowerCase();
    if (searchParams.get('tab') !== tabParam) {
      searchParams.set('tab', tabParam);
      const newSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const newUrl = `${location.pathname}${newSearch}${location.hash}`;
      if (push) {
        navigate(newUrl);
      } else {
        navigate(newUrl, { replace: true });
      }
    }
  };

  useEffect(() => {
    if (!profileDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [profileDirty]);

  useEffect(() => {
    if (tab !== 'SERVICES' || !studentReferenceId || loading) return;
    const request = ++serviceSequence.current;
    setServiceLoading(true); setServiceError(null);
    ApiClient.listMyStudentServiceRequests({ status: serviceStatus || undefined })
      .then(page => {
        if (request !== serviceSequence.current) return;
        setSectionFailures(items => items.filter(item => item !== 'طلبات الخدمات'));
        setServiceRequests(page.data); setServicePage(page.page); setServiceTotal(page.total); setServiceHasMore(page.page < page.totalPages);
      }).catch(cause => { if (request === serviceSequence.current) setServiceError(cause instanceof Error ? cause.message : 'تعذر تحميل الطلبات.'); })
      .finally(() => { if (request === serviceSequence.current) setServiceLoading(false); });
    return () => { ++serviceSequence.current; };
  }, [tab, serviceStatus, studentReferenceId, loading]);

  async function loadMoreServices() {
    if (serviceLoading || !serviceHasMore) return;
    const request = ++serviceSequence.current;
    setServiceLoading(true); setServiceError(null);
    try {
      const page = await ApiClient.listMyStudentServiceRequests({ page: servicePage + 1, status: serviceStatus || undefined });
      if (request !== serviceSequence.current) return;
      setServiceRequests(items => [...new Map([...items, ...page.data].map(item => [item.id, item])).values()]);
      setServicePage(page.page); setServiceTotal(page.total); setServiceHasMore(page.page < page.totalPages);
    } catch (cause) { if (request === serviceSequence.current) setServiceError(cause instanceof Error ? cause.message : 'تعذر تحميل المزيد.'); }
    finally { if (request === serviceSequence.current) setServiceLoading(false); }
  }

  async function loadMoreInvoices() {
    if (!studentReferenceId || invoiceLoading || invoices.length >= invoiceTotal) return;
    const request = ++invoiceSequence.current;
    setInvoiceLoading(true); setInvoiceError(null);
    try {
      const page = await ApiClient.getStudentInvoices(studentReferenceId, { page: invoicePage + 1 });
      if (request !== invoiceSequence.current) return;
      setInvoices(items => [...new Map([...items, ...page.data].map(item => [item.id, item])).values()]);
      setInvoicePage(page.page ?? invoicePage + 1); setInvoiceTotal(page.total);
    } catch (cause) { if (request === invoiceSequence.current) setInvoiceError(cause instanceof Error ? cause.message : 'تعذر تحميل الفواتير.'); }
    finally { if (request === invoiceSequence.current) setInvoiceLoading(false); }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get('tab');
    if (requested === 'vault' && location.hash === '#certificates') {
      setTab('LEARNING');
      window.setTimeout(() => document.getElementById('certificates')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      return;
    }
    const next = resolveTabFromQuery(requested);
    if (next) {
      setTab((prev) => (prev !== next ? next : prev));
    }
    if ((next === 'LEARNING' || next === 'VAULT') && location.hash === '#certificates') {
      window.setTimeout(() => document.getElementById('certificates')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.search, location.hash]);

  // Synchronize requested requestId from URL search params (supporting both id and publicId)
  useEffect(() => {
    const requestedId = new URLSearchParams(location.search).get('requestId');
    if (!requestedId) {
      setSelectedServiceRequest(null);
      setRequestedServiceNotFound(false);
      setRequestedNotFoundId(null);
      return;
    }
    if (loading || !studentReferenceId) return;

    const matched = serviceRequests.find((item) => item.id === requestedId || item.publicId === requestedId);
    if (matched) {
      setSelectedServiceRequest(matched);
      setRequestedServiceNotFound(false);
      setRequestedNotFoundId(null);
    } else {
      let active = true;
      ApiClient.getMyStudentServiceRequest(requestedId)
        .then((req) => {
          if (active) {
            setSelectedServiceRequest(req);
            setRequestedServiceNotFound(false);
            setRequestedNotFoundId(null);
          }
        })
        .catch(() => {
          if (active) {
            setSelectedServiceRequest(null);
            setRequestedServiceNotFound(true);
            setRequestedNotFoundId(requestedId);
          }
        });
      return () => {
        active = false;
      };
    }
  }, [location.search, serviceRequests, loading, studentReferenceId]);

  useEffect(() => {
    let active = true;
    let identityLoaded = false;
    async function loadWorkspace() {
      setLoading(true);
      setError(null);
      ++invoiceSequence.current;
      try {
        const identity = await ApiClient.getCurrentStudentIdentity();
        if (!active) return;
        identityLoaded = true;
        setIdentity(identity);
        setStudentReferenceId(identity.principalId);
        const [dashboardResult, invoiceResult, snapshotResult, hydratedSavedResult, trackerResult, serviceRequestResult] = await Promise.allSettled([
          ApiClient.getMyStudentDashboard(),
          ApiClient.getStudentInvoices(identity.principalId),
          ApiClient.listMyStudentWorkspaceSnapshots(),
          ApiClient.listMyHydratedStudentSavedItems(),
          ApiClient.listMyStudentApplicationTrackers(),
          ApiClient.listMyStudentServiceRequests(),
        ]);
        if (!active) return;
        if (dashboardResult.status === 'rejected') throw dashboardResult.reason;
        setDashboard(dashboardResult.value);
        setInvoices(invoiceResult.status === 'fulfilled' ? invoiceResult.value.data : []);
        setInvoicePage(invoiceResult.status === 'fulfilled' ? invoiceResult.value.page ?? 1 : 1);
        setInvoiceTotal(invoiceResult.status === 'fulfilled' ? invoiceResult.value.total : 0);
        setSectionFailures([
          ...(invoiceResult.status === 'rejected' ? ['الفواتير'] : []),
          ...(snapshotResult.status === 'rejected' ? ['نسخ الإعدادات'] : []),
          ...(hydratedSavedResult.status === 'rejected' ? ['تفاصيل المحفوظات'] : []),
          ...(trackerResult.status === 'rejected' ? ['ملفات التقديم'] : []),
          ...(serviceRequestResult.status === 'rejected' ? ['طلبات الخدمات'] : []),
        ]);
        setSnapshots(snapshotResult.status === 'fulfilled' ? snapshotResult.value : []);
        setHydratedSavedItems(hydratedSavedResult.status === 'fulfilled' ? hydratedSavedResult.value : []);
        setApplicationTrackers(trackerResult.status === 'fulfilled' ? trackerResult.value : []);
        const loadedRequests = serviceRequestResult.status === 'fulfilled' ? serviceRequestResult.value.data : [];
        setServiceRequests(loadedRequests);
        setServicePage(serviceRequestResult.status === 'fulfilled' ? serviceRequestResult.value.page : 1);
        setServiceTotal(serviceRequestResult.status === 'fulfilled' ? serviceRequestResult.value.total : 0);
        setServiceHasMore(serviceRequestResult.status === 'fulfilled' && serviceRequestResult.value.page < serviceRequestResult.value.totalPages);

        const currentRequestedId = new URLSearchParams(window.location.search).get('requestId');
        if (currentRequestedId) {
          const request = loadedRequests.find((item) => item.id === currentRequestedId || item.publicId === currentRequestedId);
          if (request) {
            setSelectedServiceRequest(request);
            setRequestedServiceNotFound(false);
            setRequestedNotFoundId(null);
          } else {
            try {
              const fetched = await ApiClient.getMyStudentServiceRequest(currentRequestedId);
              if (!active) return;
              setSelectedServiceRequest(fetched);
              setRequestedServiceNotFound(false);
              setRequestedNotFoundId(null);
            } catch {
              if (!active) return;
              setSelectedServiceRequest(null);
              setRequestedServiceNotFound(true);
              setRequestedNotFoundId(currentRequestedId);
            }
          }
        }
      } catch (cause) {
        if (active) {
          if (!identityLoaded) { setDashboard(null); setIdentity(null); setStudentReferenceId(null); }
          const msg = cause instanceof Error ? cause.message : 'تعذر تحميل مساحة الطالب';
          setError(msg);
          if (msg.includes('PROVISIONING_PENDING') || msg.includes('INITIALIZING')) {
            // Auto retry in background while outbox event is being processed
            window.setTimeout(() => {
              if (active) setRetryKey((v) => v + 1);
            }, 2500);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadWorkspace();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'صباح الخير' : hour < 18 ? 'مرحبًا بك' : 'مساء الخير';
  }, []);

  async function toggleInvoicePayments(invoiceId: string) {
    if (!studentReferenceId) return;
    if (paymentsByInvoice[invoiceId]) {
      setPaymentsByInvoice((current) => {
        const next = { ...current };
        delete next[invoiceId];
        return next;
      });
      return;
    }
    try {
      const payments = await ApiClient.getStudentInvoicePayments(studentReferenceId, invoiceId);
      setPaymentsByInvoice((current) => ({ ...current, [invoiceId]: payments }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل الدفعات');
    }
  }

  async function applicationError(cause: unknown, fallback: string) {
    const message = cause instanceof Error ? cause.message : fallback;
    setError(message.includes('VERSION_CONFLICT') ? 'تغيّر ملف التقديم في جلسة أخرى. حدّثنا بياناته؛ راجع التعديل وأعد الحفظ.' : message);
    if (message.includes('VERSION_CONFLICT')) {
      try { setApplicationTrackers(await ApiClient.listMyStudentApplicationTrackers()); }
      catch { setError('تعذر تحديث ملف التقديم بعد تعارض الإصدارات. أعد تحميل الحساب قبل الحفظ.'); }
    }
  }

  async function updateApplicationStage(tracker: StudentApplicationTrackerDto, stage: string) {
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true); setError(null);
    try {
      const updated = await ApiClient.updateMyStudentApplicationTracker(tracker.id, { expectedVersion: tracker.version, stage });
      setApplicationTrackers((items) => items.map((item) => item.id === tracker.id ? { ...updated, owner: item.owner } : item));
      setNotice('تم تحديث مرحلة التقديم وحفظها في مساحة الطالب.');
    } catch (cause) { await applicationError(cause, 'تعذر تحديث مرحلة التقديم'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function toggleApplicationChecklist(tracker: StudentApplicationTrackerDto, itemId: string, completed: boolean) {
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true); setError(null);
    try {
      const updated = await ApiClient.updateMyStudentApplicationChecklistItem(tracker.id, itemId, completed, tracker.version);
      setApplicationTrackers((items) => items.map((item) => item.id === tracker.id ? { ...updated, owner: item.owner } : item));
    } catch (cause) { await applicationError(cause, 'تعذر تحديث قائمة التقديم'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function archiveApplicationTracker(tracker: StudentApplicationTrackerDto) {
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true); setError(null);
    try {
      const updated = await ApiClient.archiveMyStudentApplicationTracker(tracker.id, tracker.version);
      setApplicationTrackers((items) => items.map((item) => item.id === tracker.id ? { ...updated, owner: item.owner } : item));
      setNotice('تمت أرشفة ملف التقديم وإلغاء التذكير المرتبط به.');
    } catch (cause) { await applicationError(cause, 'تعذر أرشفة ملف التقديم'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function updateApplicationNotes(tracker: StudentApplicationTrackerDto, notes: string) {
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true); setError(null);
    try {
      const updated = await ApiClient.updateMyStudentApplicationTracker(tracker.id, { expectedVersion: tracker.version, notes });
      setApplicationTrackers((items) => items.map((item) => item.id === tracker.id ? { ...updated, owner: item.owner } : item));
      setNotice('تم حفظ ملاحظات ملف التقديم.');
    } catch (cause) { await applicationError(cause, 'تعذر حفظ ملاحظات ملف التقديم'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function removeApplicationTracker(tracker: StudentApplicationTrackerDto) {
    if (!window.confirm('إزالة ملف التقديم من مساحة الطالب؟')) return;
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true); setError(null);
    try { await ApiClient.removeMyStudentApplicationTracker(tracker.id); setApplicationTrackers((items) => items.filter((item) => item.id !== tracker.id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر إزالة ملف التقديم'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function openServiceRequest(requestId: string) {
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    setError(null);
    try {
      const match = serviceRequests.find((r) => r.id === requestId || r.publicId === requestId);
      if (match) {
        setSelectedServiceRequest(match);
        setRequestedServiceNotFound(false);
        setRequestedNotFoundId(null);
      } else {
        const request = await ApiClient.getMyStudentServiceRequest(requestId);
        setSelectedServiceRequest(request);
        setRequestedServiceNotFound(false);
        setRequestedNotFoundId(null);
      }
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('tab', 'services');
      searchParams.set('requestId', requestId);
      navigate(`${location.pathname}?${searchParams.toString()}${location.hash}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل طلب الخدمة');
      setSelectedServiceRequest(null);
      setRequestedServiceNotFound(true);
      setRequestedNotFoundId(requestId);
    } finally {
      mutationPending.current = false; setSaving(false);
    }
  }

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dashboard || !studentReferenceId || mutationPending.current) return;
    const form = new FormData(event.currentTarget);
    mutationPending.current = true;
    setSaving(true);
    setNotice(null);
    setError(null);
    let preferencesSaved = false;
    try {
      const workspace = await ApiClient.updateMyStudentWorkspace({
        expectedVersion: dashboard.workspace.version,
        displayName: String(form.get('displayName') || '').trim() || null,
        preferredLanguage: String(form.get('preferredLanguage') || 'ar'),
        timezone: String(form.get('timezone') || 'Asia/Aden'),
        theme: String(form.get('theme') || 'SYSTEM'),
        avatarAssetId: String(form.get('avatarAssetId') || '').trim() || null,
        notificationMatrix: {
          inApp: form.get('notifyInApp') === 'on',
          email: form.get('notifyEmail') === 'on',
          push: form.get('notifyPush') === 'on',
          learning: form.get('notifyLearning') === 'on',
          certificates: form.get('notifyCertificates') === 'on',
          scholarships: form.get('notifyScholarships') === 'on',
          payments: form.get('notifyPayments') === 'on',
        },
        accessibilityPreferences: {
          textScale: String(form.get('textScale') || 'DEFAULT'),
          reduceMotion: form.get('reduceMotion') === 'on',
          highContrast: form.get('highContrast') === 'on',
        },
      });
      preferencesSaved = true;
      const privacyPreferences = {
          retainSearchHistory: form.get('retainSearchHistory') === 'on',
          allowPersonalization: form.get('allowPersonalization') === 'on',
          allowProductAnalytics: form.get('allowProductAnalytics') === 'on',
          publicProfileEnabled: false,
      };
      const privacyChanged = Object.entries(privacyPreferences).some(([key, value]) => dashboard.workspace.privacyPreferences?.[key] !== value);
      if (privacyChanged) await ApiClient.updateMyStudentPrivacyConsent({ expectedVersion: workspace.version, purpose: 'تحديث تفضيلات الخصوصية من مساحة الطالب', privacyPreferences });
      setDashboard(await ApiClient.getMyStudentDashboard());
      setProfileDirty(false);
      window.dispatchEvent(new CustomEvent('manaratak-student-preferences', { detail: { theme: workspace.theme } }));
      setNotice('حُفظت تفضيلاتك بأمان على جميع أجهزتك.');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'تعذر حفظ الإعدادات';
      setNotice(null);
      setError(preferencesSaved ? `حُفظت بيانات الملف، لكن لم تكتمل مزامنة الخصوصية أو إعادة تحميل الحساب: ${message}. أعد تحميل الإعدادات قبل المحاولة مجدداً.` : message.includes('VERSION_CONFLICT')
        ? 'تغيّرت الإعدادات في جلسة أخرى. تم تحديث البيانات؛ راجع اختياراتك ثم احفظ مجددًا.'
        : message);
      if (preferencesSaved || message.includes('VERSION_CONFLICT')) {
        try { setDashboard(await ApiClient.getMyStudentDashboard()); } catch { setRetryKey((value) => value + 1); }
      }
    } finally {
      mutationPending.current = false;
      setSaving(false);
    }
  }

  async function createCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentReferenceId) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get('collectionName') || '').trim();
    if (!name) return;
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    try {
      await ApiClient.createMyStudentCollection({
        name,
        description: String(form.get('collectionDescription') || '').trim() || undefined,
        color: '#0E7C86',
      });
      const refreshed = await ApiClient.getMyStudentDashboard();
      setDashboard(refreshed);
      formElement.reset();
      setNotice('أُنشئت المجموعة الجديدة.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إنشاء المجموعة');
    } finally {
      mutationPending.current = false; setSaving(false);
    }
  }

  async function renameCollection(collectionId: string, currentName: string) {
    const name = window.prompt('الاسم الجديد للمجموعة', currentName)?.trim();
    if (!name || name === currentName) return;
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    try {
      await ApiClient.updateMyStudentCollection(collectionId, { name });
      setDashboard(await ApiClient.getMyStudentDashboard());
      setNotice('تم تحديث اسم المجموعة.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تعديل المجموعة'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function deleteCollection(collectionId: string, name: string) {
    if (!window.confirm(`حذف مجموعة «${name}»؟ ستنتقل العناصر إلى المفضلة.`)) return;
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    try {
      await ApiClient.deleteMyStudentCollection(collectionId);
      setDashboard(await ApiClient.getMyStudentDashboard());
      setNotice('حُذفت المجموعة ونُقلت عناصرها بأمان إلى المفضلة.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر حذف المجموعة'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function moveSavedItem(itemId: string, collectionId: string | null) {
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    try {
      await ApiClient.moveMyStudentSavedItem(itemId, collectionId);
      const [refreshedDashboard, refreshedHydration] = await Promise.all([
        ApiClient.getMyStudentDashboard(),
        ApiClient.listMyHydratedStudentSavedItems(),
      ]);
      setDashboard(refreshedDashboard);
      setHydratedSavedItems(refreshedHydration);
      setNotice('تم نقل العنصر إلى المجموعة المختارة.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر نقل العنصر'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function removeSavedItem(item: StudentSavedItemDto) {
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    setError(null);
    try {
      await ApiClient.removeMyStudentSavedItem(item.entityType, item.entityId);
      const [refreshedDashboard, refreshedHydration] = await Promise.all([
        ApiClient.getMyStudentDashboard(),
        ApiClient.listMyHydratedStudentSavedItems(),
      ]);
      setDashboard(refreshedDashboard);
      setHydratedSavedItems(refreshedHydration);
      setNotice('تمت إزالة العنصر من المفضلة بنجاح.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إزالة العنصر من المفضلة');
    } finally {
      mutationPending.current = false; setSaving(false);
    }
  }

  async function createSnapshot() {
    if (!studentReferenceId) return;
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    try {
      await ApiClient.createMyStudentWorkspaceSnapshot('نسخة إعداداتي');
      setSnapshots(await ApiClient.listMyStudentWorkspaceSnapshots());
      setNotice('حُفظت نسخة آمنة من إعدادات مساحة العمل.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر حفظ النسخة');
    } finally {
      mutationPending.current = false; setSaving(false);
    }
  }

  async function restoreSnapshot(snapshotId: string) {
    if (!dashboard) return;
    if (!window.confirm('استعادة نسخة الإعدادات واستبدال اختياراتك الحالية؟')) return;
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    try {
      const workspace = await ApiClient.restoreMyStudentWorkspaceSnapshot(snapshotId, dashboard.workspace.version);
      setDashboard((current) => current ? { ...current, workspace } : current);
      setProfileDirty(false);
      setNotice('تمت استعادة نسخة الإعدادات مع التحقق من تعارض الإصدارات.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر استعادة النسخة'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function resetLayout() {
    if (!dashboard) return;
    if (!window.confirm(profileDirty ? 'إعادة ترتيب اللوحة؟ ستفقد تعديلات الملف غير المحفوظة.' : 'إعادة ترتيب لوحة حسابك إلى الترتيب الافتراضي؟')) return;
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    try {
      const workspace = await ApiClient.resetMyStudentDashboardLayout(dashboard.workspace.version);
      setDashboard((current) => current ? { ...current, workspace } : current);
      setProfileDirty(false);
      setNotice('أُعيد تخطيط اللوحة إلى الإعدادات الآمنة.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر إعادة التخطيط'); }
    finally { mutationPending.current = false; setSaving(false); }
  }

  async function clearSearchHistory() {
    if (!studentReferenceId) return;
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    try {
      await ApiClient.clearMyStudentSearchHistory();
      setNotice('مُسح سجل البحث الشخصي.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر مسح سجل البحث');
    } finally {
      mutationPending.current = false; setSaving(false);
    }
  }

  async function logout() {
    if (mutationPending.current) return; mutationPending.current = true; setSaving(true);
    setError(null);
    try {
      await ApiClient.logoutStudent();
      window.location.assign('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تسجيل الخروج');
    } finally {
      mutationPending.current = false; setSaving(false);
    }
  }

  if (loading) return <WorkspaceSkeleton />;

  if (error && !dashboard) {
    const isProvisioning = error.includes('PROVISIONING_PENDING') || error.includes('INITIALIZING');
    if (isProvisioning) {
      return (
        <main dir="rtl" className="mn-page-shell py-24 text-center">
          <div className="mn-public-container mx-auto max-w-xl">
            <div className="mn-card rounded-[2rem] p-8 sm:p-10">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--mn-surface-elevated)] text-[var(--mn-primary)]">
                <RefreshCw className="h-7 w-7 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--mn-heading)]">جارٍ إعداد مساحة الطالب الخاصة بك</h1>
              <p className="mt-3 leading-7 text-[var(--mn-text-muted)]">
                يتم الآن تجهيز لوحة التحكم وسجلاتك التعليمية لأول مرة تلقائياً. ستكون مساحتك جاهزة خلال لحظات قليلة.
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setRetryKey((value) => value + 1)}
                  className="rounded-xl bg-[var(--mn-primary)] px-6 py-3 font-semibold text-white hover:bg-[var(--mn-primary-hover)] mn-inverse"
                >
                  تحديث الآن
                </button>
              </div>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main dir="rtl" className="mn-page-shell py-24 text-center"><div className="mn-public-container mx-auto max-w-xl">
        <div className="mn-card rounded-[2rem] p-8 sm:p-10">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--mn-surface-muted)] text-[var(--mn-primary)]">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--mn-heading)]">مساحة الطالب محمية</h1>
          <p className="mt-3 leading-7 text-[var(--mn-text-muted)]">{error}</p>
          <div className="mt-7 flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-[var(--mn-primary)] px-6 py-3 font-semibold text-white hover:bg-[var(--mn-primary-hover)] mn-inverse"
            >
              تسجيل الدخول
            </Link>
            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="rounded-xl border border-[var(--mn-border)] px-6 py-3 font-semibold text-[var(--mn-text)] hover:bg-[var(--mn-surface-muted)]"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div></main>
    );
  }

  if (!dashboard) return null;
  const { workspace, statistics } = dashboard;
  const notifications = (workspace.notificationMatrix || {}) as Record<string, boolean>;
  const privacy = (workspace.privacyPreferences || {}) as Record<string, boolean>;
  const accessibility = (workspace.accessibilityPreferences || {}) as Record<string, unknown>;
  // Residence is shown ONLY when recorded in the workspace; timezone alone does not establish country.
  const accountMetadata = (workspace.metadata || {}) as Record<string, unknown>;
  const accountCountryName = typeof accountMetadata.countryNameAr === 'string' ? accountMetadata.countryNameAr
    : typeof accountMetadata.countryName === 'string' ? accountMetadata.countryName : undefined;
  const accountCountryIso2 = typeof accountMetadata.countryIso2 === 'string' ? accountMetadata.countryIso2.toUpperCase()
    : typeof accountMetadata.residenceCountryIso2 === 'string' ? accountMetadata.residenceCountryIso2.toUpperCase() : '';
  const accountCountryFlag = /^[A-Z]{2}$/.test(accountCountryIso2)
    ? String.fromCodePoint(...Array.from(accountCountryIso2).map(letter => 127397 + letter.charCodeAt(0)))
    : undefined;
  const accountCityName = typeof accountMetadata.cityNameAr === 'string' ? accountMetadata.cityNameAr
    : typeof accountMetadata.cityName === 'string' ? accountMetadata.cityName : undefined;

  return (
    <StudentWorkspaceShell
      activeTab={tab}
      onTabChange={handleTabChange}
      displayName={workspace.displayName || identity?.displayName || 'حساب الطالب'}
      email={identity?.primaryEmail}
      countryName={accountCountryName}
      countryFlag={accountCountryFlag}
      cityName={accountCityName}
      timezone={workspace.timezone}
      previewMode={import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype'}
      accessibility={accessibility}
    >
      <div className="w-full max-w-4xl mx-auto space-y-4 mt-0">
        {error && <Alert tone="error" message={error} onClose={() => setError(null)} />}
        {notice && <Alert tone="success" message={import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? 'تم تنفيذ الإجراء داخل المعاينة فقط؛ لم يتم حفظ أي بيانات حقيقية.' : notice} onClose={() => setNotice(null)} />}
        {sectionFailures.length > 0 && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">تعذر تحميل: {sectionFailures.join('، ')}. <button type="button" onClick={() => setRetryKey(value => value + 1)} className="font-bold underline">إعادة التحميل</button></div>}
        {dashboard.partialFailures.length > 0 && (
          <Alert
            tone="warning"
            message="بعض البطاقات غير متاحة مؤقتًا، لكن بقية مساحة العمل تعمل بصورة طبيعية."
          />
        )}

        {tab === 'SUMMARY' && (
          <SummaryView
            dashboard={dashboard}
            invoices={invoices}
            paymentsByInvoice={paymentsByInvoice}
            onTogglePayments={toggleInvoicePayments}
            setTab={handleTabChange}
            identity={identity}
            applicationTrackers={applicationTrackers}
          />
        )}
        {tab === 'OPPORTUNITIES' && !sectionFailures.includes('ملفات التقديم') && (
          <OpportunitiesView
            dashboard={dashboard}
            trackers={applicationTrackers}
            saving={saving}
            onStageChange={updateApplicationStage}
            onChecklistToggle={toggleApplicationChecklist}
            onNotesUpdate={updateApplicationNotes}
            onArchive={archiveApplicationTracker}
            onRemove={removeApplicationTracker}
            onDocumentsChanged={() => { void ApiClient.listMyStudentApplicationTrackers().then(setApplicationTrackers).catch(() => setError('تعذر تحديث ملفات التقديم')); }}
          />
        )}
        {tab === 'LEARNING' && (
          <LearningView
            dashboard={dashboard}
          />
        )}
        {tab === 'NOTIFICATIONS' && <StudentNotificationsView items={dashboard.notifications} available={dashboard.capabilityStatus?.notifications !== 'DEGRADED'} onRefresh={() => setRetryKey(value => value + 1)} />}
        {tab === 'VAULT' && (
          <VaultView
            dashboard={dashboard}
            hydratedSavedItems={hydratedSavedItems}
            saving={saving}
            onCreateCollection={createCollection}
            onRenameCollection={renameCollection}
            onDeleteCollection={deleteCollection}
            onMoveSavedItem={moveSavedItem}
            onRemoveSavedItem={removeSavedItem}
            setTab={handleTabChange}
          />
        )}
        {tab === 'CAREERS' && <StudentCareerWorkspace />}
        {tab === 'SERVICES' && (
          <div className="mn-student-services-page space-y-4 font-['Cairo',sans-serif]">

            <ServiceRequestsView
                requests={serviceError ? [] : serviceRequests}
                serviceLoading={serviceLoading}
                serviceError={serviceError}
                invoiceError={invoiceError}
                onRetry={() => setRetryKey(value => value + 1)}
                statusFilter={serviceStatus}
                onStatusFilterChange={setServiceStatus}
                totalRequests={serviceTotal}
                selected={selectedServiceRequest}
                requestedNotFoundId={requestedNotFoundId}
                saving={saving}
                onOpen={openServiceRequest}
                invoices={invoices}
                paymentsByInvoice={paymentsByInvoice}
                onTogglePayments={toggleInvoicePayments}
              />
            <div className="flex flex-wrap items-center justify-center gap-2">
              {serviceHasMore && (
                <button type="button" disabled={serviceLoading} onClick={() => void loadMoreServices()} className="min-h-9 rounded-lg bg-[var(--mn-primary)] px-3.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-50">
                  {serviceLoading ? 'جارٍ التحميل…' : 'تحميل طلبات إضافية'}
                </button>
              )}
              {invoices.length < invoiceTotal && (
                <button type="button" disabled={invoiceLoading} onClick={() => void loadMoreInvoices()} className="min-h-9 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-1.5 text-[12px] font-bold text-[var(--mn-heading)] disabled:opacity-50">
                  {invoiceLoading ? 'جارٍ تحميل الفواتير…' : `تحميل فواتير إضافية (${invoices.length} من ${invoiceTotal})`}
                </button>
              )}
            </div>
          </div>
        )}
        {tab === 'PROFILE' && (
          <ProfileView
            key={workspace.version}
            onDirtyChange={setProfileDirty}
            dirty={profileDirty}
            dashboard={dashboard}
            identity={identity}
            onLogout={() => void logout()}
            notifications={notifications}
            privacy={privacy}
            accessibility={accessibility}
            saving={saving}
            onSave={savePreferences}
            onSnapshot={createSnapshot}
            snapshots={snapshots}
            onRestoreSnapshot={restoreSnapshot}
            onResetLayout={resetLayout}
            onClearSearch={clearSearchHistory}
            onBack={() => handleTabChange('SUMMARY')}
          />
        )}
      </div>
    </StudentWorkspaceShell>
  );
}

function SummaryView({
  dashboard,
  invoices,
  paymentsByInvoice,
  onTogglePayments,
  setTab,
  applicationTrackers,
}: {
  dashboard: StudentDashboardSummaryDto;
  invoices: StudentFinanceInvoiceDto[];
  paymentsByInvoice: Record<string, StudentFinancePaymentDto[]>;
  onTogglePayments: (invoiceId: string) => void;
  setTab: (tab: CanonicalWorkspaceTab) => void;
  identity: { principalId: string; displayName: string; primaryEmail?: string; roles?: string[]; roleNames?: string[] } | null;
  applicationTrackers: StudentApplicationTrackerDto[];
}) {
  const [showAllActivities, setShowAllActivities] = useState(false);

  const activityLog = useMemo(() => {
    const seen = new Set<string>();
    return [...dashboard.timeline, ...dashboard.recentActivity]
      .filter((event) => {
        if (seen.has(event.id)) return false;
        seen.add(event.id);
        return true;
      })
      .sort((first, second) => (Date.parse(second.occurredAt) || 0) - (Date.parse(first.occurredAt) || 0));
  }, [dashboard.timeline, dashboard.recentActivity]);

  const activeMilestones = useMemo(
    () => applicationTrackers.filter((item) => item.status === 'ACTIVE'),
    [applicationTrackers],
  );

  const activeCourse = useMemo(
    () => dashboard.courseEnrollments
      .filter((item) => ['ACTIVE', 'ENROLLED', 'IN_PROGRESS'].includes(item.status) && item.progressPercentage < 100)
      .sort((first, second) => (Date.parse(second.lastAccessedAt ?? '') || 0) - (Date.parse(first.lastAccessedAt ?? '') || 0))[0] ?? null,
    [dashboard.courseEnrollments],
  );

  const urgentAlerts = useMemo(() => {
    const unread = dashboard.notifications.filter((notification) => !notification.readAt);
    const pendingInvoices = invoices
      .filter((invoice) => ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status))
      .sort((a, b) => Number(b.status === 'OVERDUE') - Number(a.status === 'OVERDUE'));
    const now = Date.now();
    const criticalDeadlines = activeMilestones
      .filter((tracker) => {
        if (!tracker.deadlineAt) return false;
        const remaining = new Date(tracker.deadlineAt).getTime() - now;
        return Number.isFinite(remaining) && remaining >= 0 && remaining <= 48 * 60 * 60 * 1000;
      })
      .sort((a, b) => new Date(a.deadlineAt || '').getTime() - new Date(b.deadlineAt || '').getTime());
    return {
      unread,
      pendingInvoices,
      criticalDeadlines,
      hasCritical: criticalDeadlines.length > 0 || pendingInvoices.some((invoice) => invoice.status === 'OVERDUE'),
      hasUrgent: unread.length > 0 || pendingInvoices.length > 0 || criticalDeadlines.length > 0,
    };
  }, [dashboard.notifications, invoices, activeMilestones]);

  const isNewStudent = (
    dashboard.statistics.savedItems === 0 &&
    dashboard.statistics.activeCourses === 0 &&
    dashboard.statistics.certificates === 0 &&
    applicationTrackers.length === 0
  );

  const attentionPanel = urgentAlerts.hasUrgent ? (
    <section
      aria-label="أمور تحتاج انتباه الطالب"
      className="mn-student-attention relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] text-[#1E293B] dark:text-[#F8FAFC] text-right font-['Cairo',sans-serif] shadow-2xs"
    >
      <div className="relative z-10 py-3 sm:py-3.5">
        {/* Edge-to-edge table header divider without right/left gap */}
        <div className="flex items-center gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 px-3 sm:px-4">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#D6A43B]/75 bg-[#142B5F] text-[#F2CD78] shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
            <span className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-md bg-[#D6A43B]" />
            <Bell className="relative z-10 h-3.5 w-3.5 text-[#F2CD78]" />
          </span>
          <h3 className="inline-block border-b-2 border-[#D6A43B] pb-0.5 text-[14px] sm:text-[15px] font-bold leading-snug font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
            يحتاج انتباهك
          </h3>
        </div>
        <div className="mt-2.5 space-y-2 px-2.5 sm:px-4">
          {urgentAlerts.criticalDeadlines.slice(0, 2).map((tracker) => (
            <div
              key={tracker.id}
              className="mn-student-attention-card relative overflow-hidden flex min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-3.5 pl-2.5 py-2"
            >
              {/* Authentic Manaratak Geometric Corner Line from top-right to middle-bottom */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 w-4 h-[75%] rounded-tr-xl border-t-[3px] border-r-[3.5px] border-[#142B5F] dark:border-[#D6A43B]"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-[10.5px] sm:text-[11px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] break-words font-['Cairo',sans-serif]">
                  موعد تقديم قريب
                </h4>
                <p className="mt-0.5 text-[9.5px] sm:text-[10px] font-bold leading-snug text-[var(--mn-text-muted)] break-words font-['Cairo',sans-serif]">
                  {trackerDisplayName(tracker)} — {formatDate(tracker.deadlineAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTab('OPPORTUNITIES')}
                className="mn-student-attention-action shrink-0 whitespace-nowrap rounded-lg border border-[#142B5F] bg-transparent hover:bg-[#142B5F]/5 dark:border-[#F2CD78]/65 dark:text-[#F2CD78] px-2.5 py-1 text-[10px] font-bold text-[#142B5F] cursor-pointer font-['Cairo',sans-serif] transition-colors"
              >
                متابعة
              </button>
            </div>
          ))}
          {urgentAlerts.pendingInvoices.slice(0, 1).map((inv) => (
            <div
              key={inv.id}
              className="mn-student-attention-card relative overflow-hidden flex min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-3.5 pl-2.5 py-2"
            >
              {/* Authentic Manaratak Geometric Corner Line from top-right to middle-bottom */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 w-4 h-[75%] rounded-tr-xl border-t-[3px] border-r-[3.5px] border-[#142B5F] dark:border-[#D6A43B]"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-[10.5px] sm:text-[11px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                  {inv.status === 'OVERDUE' ? 'فاتورة متأخرة' : 'فاتورة مستحقة'}
                </h4>
                <p className="mt-0.5 text-[9.5px] sm:text-[10px] font-bold leading-snug text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
                  {inv.invoiceNumber} ({formatMoney(inv.amountDue)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => onTogglePayments(inv.id)}
                className="mn-student-attention-action shrink-0 whitespace-nowrap rounded-lg border border-[#142B5F] bg-transparent hover:bg-[#142B5F]/5 dark:border-[#F2CD78]/65 dark:text-[#F2CD78] px-2.5 py-1 text-[10px] font-bold text-[#142B5F] cursor-pointer font-['Cairo',sans-serif] transition-colors"
              >
                تفاصيل الفاتورة
              </button>
            </div>
          ))}
          {urgentAlerts.unread.slice(0, 2).map((n) => (
            <div
              key={n.id}
              className="mn-student-attention-card relative overflow-hidden flex min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-3.5 pl-2.5 py-2"
            >
              {/* Authentic Manaratak Geometric Corner Line from top-right to middle-bottom */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 w-4 h-[75%] rounded-tr-xl border-t-[3px] border-r-[3.5px] border-[#142B5F] dark:border-[#D6A43B]"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-[10.5px] sm:text-[11px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] break-words font-['Cairo',sans-serif]">
                  {n.title}
                </h4>
                <p className="mt-0.5 text-[9.5px] sm:text-[10px] font-bold leading-snug text-[var(--mn-text-muted)] break-words font-['Cairo',sans-serif]">
                  {n.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTab('NOTIFICATIONS')}
                className="mn-student-attention-action shrink-0 whitespace-nowrap rounded-lg border border-[#142B5F] bg-transparent hover:bg-[#142B5F]/5 dark:border-[#F2CD78]/65 dark:text-[#F2CD78] px-2.5 py-1 text-[10px] font-bold text-[#142B5F] cursor-pointer font-['Cairo',sans-serif] transition-colors"
              >
                عرض
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  ) : null;

  return (
    <div className="mt-0 space-y-4 font-['Cairo',sans-serif]">
      {/* Unified Header Box + Connected 4-Stat Bar attached directly to the 8-tab bar above */}
      <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mt-px">
        <section
          aria-label="ملخصي ونظرة عامة"
          className="relative overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] shadow-2xs mn-panel font-['Cairo',sans-serif]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[4px] z-10 bg-[#142B5F]"
          />
          <div className="px-3.5 pt-3.5 pb-3.5 pr-4 sm:px-5 sm:pt-4 sm:pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#D6A43B]/45 bg-[#142B5F]">
                  <LayoutGrid className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />
                </span>
                <h2 className="mn-student-summary-heading text-[14px] sm:text-[15px] font-bold leading-tight text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                  ملخصي ونظرة عامة
                </h2>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2.5 py-1 text-[11px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
                {activeMilestones.length} تقديم نشط · {dashboard.statistics.activeCourses} دورة
              </span>
            </div>
            <p className="mt-2.5 text-[11.5px] sm:text-[12px] font-semibold leading-[1.8] text-[#334155] dark:text-[#E2E8F0] font-['Cairo',sans-serif]">
              نظرة شاملة على آخر مستجدات ملفات تقديمك للمنح الدراسية، تقدمك في الدورات التدريبية، والتنبيهات العاجلة في حسابك.
            </p>
          </div>
        </section>

        {!isNewStudent && (
          <div className="-mt-px grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-y sm:divide-y-0 divide-[var(--mn-border)] dark:divide-white/10 rounded-b-2xl border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setTab('OPPORTUNITIES')}
              className="group flex min-w-0 items-center justify-start gap-2 pr-3 pl-2.5 py-2.5 text-right transition-colors hover:bg-[var(--mn-surface)] cursor-pointer font-['Cairo',sans-serif]"
            >
              <Route className="w-4 h-4 shrink-0 text-[#0E7C86] group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex items-baseline gap-1.5 truncate">
                <span className="text-[13px] sm:text-[13.5px] leading-none font-bold tabular-nums text-[#1E293B] dark:text-[#F8FAFC]">
                  {activeMilestones.length}
                </span>
                <span className="text-[11px] sm:text-[11.5px] font-bold leading-tight text-[#334155] dark:text-[#CBD5E1] truncate">
                  تقديمات نشطة
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTab('LEARNING')}
              className="group flex min-w-0 items-center justify-start gap-2 pr-3 pl-2.5 py-2.5 text-right transition-colors hover:bg-[var(--mn-surface)] cursor-pointer font-['Cairo',sans-serif]"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-[#0E7C86] group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex items-baseline gap-1.5 truncate">
                <span className="text-[13px] sm:text-[13.5px] leading-none font-bold tabular-nums text-[#1E293B] dark:text-[#F8FAFC]">
                  {dashboard.statistics.activeCourses}
                </span>
                <span className="text-[11px] sm:text-[11.5px] font-bold leading-tight text-[#334155] dark:text-[#CBD5E1] truncate">
                  دورات جارية
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTab('VAULT')}
              className="group flex min-w-0 items-center justify-start gap-2 pr-3 pl-2.5 py-2.5 text-right transition-colors hover:bg-[var(--mn-surface)] cursor-pointer font-['Cairo',sans-serif]"
            >
              <Heart className="w-4 h-4 shrink-0 text-[#0E7C86] group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex items-baseline gap-1.5 truncate">
                <span className="text-[13px] sm:text-[13.5px] leading-none font-bold tabular-nums text-[#1E293B] dark:text-[#F8FAFC]">
                  {dashboard.statistics.savedItems}
                </span>
                <span className="text-[11px] sm:text-[11.5px] font-bold leading-tight text-[#334155] dark:text-[#CBD5E1] truncate">
                  عناصر محفوظة
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTab('LEARNING')}
              className="group flex min-w-0 items-center justify-start gap-2 pr-3 pl-2.5 py-2.5 text-right transition-colors hover:bg-[var(--mn-surface)] cursor-pointer font-['Cairo',sans-serif]"
            >
              <Award className="w-4 h-4 shrink-0 text-[#0E7C86] group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex items-baseline gap-1.5 truncate">
                <span className="text-[13px] sm:text-[13.5px] leading-none font-bold tabular-nums text-[#1E293B] dark:text-[#F8FAFC]">
                  {dashboard.statistics.certificates}
                </span>
                <span className="text-[11px] sm:text-[11.5px] font-bold leading-tight text-[#334155] dark:text-[#CBD5E1] truncate">
                  شهادات صادرة
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Critical deadline or overdue invoice */}
      {urgentAlerts.hasCritical && attentionPanel}
      {!urgentAlerts.hasCritical && attentionPanel}

      {/* 3. New Student Welcome / Starting State */}
      {isNewStudent && (
        <section className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] px-3.5 py-3.5 sm:px-5 sm:py-4 text-right mn-panel shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#142B5F] border border-[#D6A43B]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#F2CD78]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[12.5px] sm:text-[13px] font-bold font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
                مرحبًا بك في مساحتك في منارتك
              </h3>
              <p className="text-[11px] sm:text-[11.5px] text-[#475569] dark:text-[#CBD5E1] mt-1.5 leading-[1.75]">
                مساحتك جاهزة لتتبع طلبات المنح، التسجيل في الدورات، واستكشاف الجامعات والتخصصات وحفظ ما يهمك.
              </p>
              <div className="mt-3.5 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                <Link
                  to="/scholarships"
                  className="rounded-xl bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/35 px-3 py-2 text-[12px] font-bold text-white transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Route className="w-3.5 h-3.5 text-[#F2CD78]" />
                  <span>المنح الدراسية</span>
                </Link>
                <Link
                  to="/courses"
                  className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#0E7C86] transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#0E7C86]" />
                  <span>الدورات التدريبية</span>
                </Link>
                <Link
                  to="/universities"
                  className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#0E7C86] transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Compass className="w-3.5 h-3.5 text-[#0E7C86]" />
                  <span>دليل الجامعات</span>
                </Link>
                <Link
                  to="/majors"
                  className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#0E7C86] transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#0E7C86]" />
                  <span>التخصصات</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Continue learning: one recent unfinished course, stretched edge-to-edge */}
      {activeCourse && (
        <section
          aria-label="متابعة التعلم"
          className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] py-3 sm:py-3.5 shadow-2xs mn-panel"
        >
          <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#D6A43B]/75 bg-[#142B5F] text-[#F2CD78] shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
                <span className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-md bg-[#D6A43B]" />
                <BookOpen className="relative z-10 h-3.5 w-3.5 text-[#F2CD78]" />
              </span>
              <h3 className="inline-block border-b-2 border-[#D6A43B] pb-0.5 text-[14px] sm:text-[15px] font-bold leading-snug font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
                متابعة التعلم
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setTab('LEARNING')}
              className="mn-student-summary-header-link inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] px-2 py-0.5 text-[10px] font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#0E7C86] cursor-pointer font-['Cairo',sans-serif]"
            >
              <span>جميع الدورات</span>
              <ChevronLeft className="h-3 w-3 text-[#0E7C86]" />
            </button>
          </div>

          <div className="px-2.5 sm:px-4">
            {/* Stretched Course Card with Authentic Manaratak Geometric Corner Line */}
            <div className="relative overflow-hidden rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-3.5 pl-3 py-2.5 shadow-2xs">
              {/* Geometric Corner Line from top-right down the right edge to middle-bottom */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 w-4 sm:w-5 h-[68%] rounded-tr-xl border-t-[3px] border-r-[3.5px] border-[#142B5F] dark:border-[#D6A43B]"
              />

              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-semibold text-[#475569] dark:text-[#94A3B8]">
                    <Clock3 className="h-3 w-3 text-[#0E7C86]" />
                    <span>آخر دورة تتابعها</span>
                  </span>
                  <div className="mt-1 flex items-center gap-2 min-w-0">
                    {/* Official Oxford Sub-Item Icon (MIX-10: Horizon Petrol bg + Royal Navy border & ring + white icon) */}
                    <span className="w-6 h-6 rounded-md bg-[#0E7C86] border-[1.5px] border-[#142B5F] ring-1 ring-[#142B5F]/40 text-white mn-sub-item-icon flex items-center justify-center shrink-0 shadow-2xs">
                      <BookOpen className="h-3.5 w-3.5 text-white" />
                    </span>
                    <h4 className="min-w-0 text-[11px] sm:text-[11.5px] font-bold leading-snug text-[#0E7C86] dark:text-[#55CBC5] break-words font-['Cairo',sans-serif]">
                      {activeCourse.courseName}
                    </h4>
                  </div>
                </div>
                <span className="shrink-0 rounded-lg border border-[#0E7C86]/25 bg-[#0E7C86]/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#0E7C86] dark:text-[#55CBC5]" dir="ltr">
                  {Math.min(100, Math.max(0, activeCourse.progressPercentage))}%
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800" dir="rtl">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#163D76] to-[#0E7C86] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, activeCourse.progressPercentage))}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--mn-border)] dark:border-white/10 pt-2">
                <span className="text-[10px] sm:text-[10.5px] font-bold text-[#334155] dark:text-[#E2E8F0]">
                  {activeCourse.lastAccessedAt ? `آخر وصول: ${formatDate(activeCourse.lastAccessedAt)}` : `تاريخ التسجيل: ${formatDate(activeCourse.enrolledAt)}`}
                </span>
                <Link
                  to={`../student/courses/${encodeURIComponent(activeCourse.courseId)}`}
                  className="mn-student-summary-primary-action inline-flex items-center justify-center gap-1 rounded-lg bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/35 px-2.5 py-1 text-[10px] font-bold text-white transition-colors font-['Cairo',sans-serif]"
                >
                  <span>متابعة التعلم</span>
                  <ArrowLeft className="h-3 w-3 text-[#F2CD78]" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Active application trackers: stretched edge-to-edge */}
      {activeMilestones.length > 0 && (
        <section
          aria-label="ملفات التقديم النشطة"
          className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] py-3 sm:py-3.5 shadow-2xs mn-panel font-['Cairo',sans-serif]"
        >
          <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#D6A43B]/75 bg-[#142B5F] text-[#F2CD78] shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
                <span className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-md bg-[#D6A43B]" />
                <Route className="relative z-10 h-3.5 w-3.5 text-[#F2CD78]" />
              </span>
              <h3 className="inline-block border-b-2 border-[#D6A43B] pb-0.5 text-[14px] sm:text-[15px] font-bold leading-snug font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
                ملفات التقديم النشطة
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setTab('OPPORTUNITIES')}
              className="mn-student-summary-header-link inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] px-2 py-0.5 text-[10px] font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#0E7C86] cursor-pointer font-['Cairo',sans-serif]"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="h-3 w-3 text-[#0E7C86]" />
            </button>
          </div>

          <div className="space-y-2.5 px-2.5 sm:px-4">
            {[...activeMilestones]
              .sort((first, second) => (Date.parse(second.updatedAt) || 0) - (Date.parse(first.updatedAt) || 0))
              .slice(0, 2)
              .map((item) => {
                const completed = item.checklist.filter((task) => task.completed).length;
                const progress = item.checklist.length ? Math.round((completed / item.checklist.length) * 100) : 0;
                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-3.5 pl-3 py-2.5 shadow-2xs"
                  >
                    {/* Authentic Manaratak Geometric Corner Line from top-right down the right edge to middle-bottom */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 right-0 w-4 sm:w-5 h-[68%] rounded-tr-xl border-t-[3px] border-r-[3.5px] border-[#142B5F] dark:border-[#D6A43B]"
                    />

                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {/* Official Oxford Sub-Item Icon (MIX-10: Horizon Petrol bg + Royal Navy border & ring + white icon) */}
                        <span className="w-6 h-6 rounded-md bg-[#0E7C86] border-[1.5px] border-[#142B5F] ring-1 ring-[#142B5F]/40 text-white mn-sub-item-icon flex items-center justify-center shrink-0 shadow-2xs">
                          <GraduationCap className="h-3.5 w-3.5 text-white" />
                        </span>
                        <h4 className="min-w-0 flex-1 text-[11px] sm:text-[11.5px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] break-words font-['Cairo',sans-serif]">
                          {trackerDisplayName(item)}
                        </h4>
                      </div>
                      <span className="shrink-0 rounded-lg border border-[#0E7C86]/25 bg-[#0E7C86]/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#0E7C86] dark:text-[#55CBC5]" dir="ltr">
                        {progress}%
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      <div className="flex items-center justify-start gap-1.5 rounded-lg border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] pr-2.5 pl-2 py-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#0E7C86] shrink-0" />
                        <span className="text-[9.5px] sm:text-[10px] font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate leading-tight">
                          {item.stage}
                        </span>
                      </div>
                      <div className="flex items-center justify-start gap-1.5 rounded-lg border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] pr-2.5 pl-2 py-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-[#0E7C86] shrink-0" />
                        <span className="text-[9.5px] sm:text-[10px] font-bold text-[#1E293B] dark:text-[#F8FAFC] truncate leading-tight">
                          {item.deadlineAt ? formatDate(item.deadlineAt) : 'مفتوح / متجدد'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex min-w-0 items-center justify-between gap-2 border-t border-[var(--mn-border)] dark:border-white/10 pt-2">
                      <span className="text-[10px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                        إنجاز المهام: {completed} من {item.checklist.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTab('OPPORTUNITIES')}
                        className="mn-student-summary-primary-action inline-flex items-center justify-center gap-1 rounded-lg bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/35 px-2.5 py-1 text-[10px] font-bold text-white transition-colors font-['Cairo',sans-serif] cursor-pointer"
                      >
                        <span>متابعة الملف</span>
                        <ArrowLeft className="h-3 w-3 text-[#F2CD78]" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* 6. Recent activities: stretched edge-to-edge */}
      {activityLog.length > 0 && (
        <section
          aria-label="آخر الأنشطة والخطوات"
          className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] py-3 sm:py-3.5 shadow-2xs mn-panel font-['Cairo',sans-serif]"
        >
          <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#D6A43B]/75 bg-[#142B5F] text-[#F2CD78] shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
                <span className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-md bg-[#D6A43B]" />
                <HistoryIcon className="relative z-10 h-3.5 w-3.5 text-[#F2CD78]" />
              </span>
              <h3 className="inline-block border-b-2 border-[#D6A43B] pb-0.5 text-[14px] sm:text-[15px] font-bold leading-snug font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
                آخر الأنشطة والخطوات
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAllActivities((previous) => !previous)}
              aria-expanded={showAllActivities}
              aria-controls="student-summary-activity-timeline"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] px-2 py-0.5 text-[10px] font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#0E7C86] cursor-pointer font-['Cairo',sans-serif]"
            >
              <span>{showAllActivities ? 'إخفاء السجلات' : 'كل السجلات'}</span>
              <ChevronLeft className={`h-3 w-3 text-[#0E7C86] transition-transform ${showAllActivities ? '-rotate-90' : ''}`} />
            </button>
          </div>

          <ol id="student-summary-activity-timeline" className="mr-5 ml-3 sm:mr-6 sm:ml-4 space-y-2 border-r-2 border-[#0E7C86]/35 pr-4 dark:border-[#5BC6C0]/45">
            {(showAllActivities
              ? activityLog
              : (dashboard.timeline.length > 0
                ? [...dashboard.timeline].sort((first, second) => (Date.parse(second.occurredAt) || 0) - (Date.parse(first.occurredAt) || 0)).slice(0, 3)
                : activityLog.slice(0, 3)))
              .map((item) => (
                <li key={item.id} className="relative min-w-0">
                  <span aria-hidden="true" className="absolute -right-[22px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--mn-surface)] bg-[#0E7C86] dark:bg-[#5BC6C0]" />
                  <h4 className="text-[10.5px] sm:text-[11px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] break-words">{item.title}</h4>
                  <time className="mt-0.5 block text-[9.5px] sm:text-[10px] font-bold leading-4 text-[var(--mn-text-muted)]">
                    {formatDate(item.occurredAt)}
                  </time>
                </li>
              ))}
          </ol>
        </section>
      )}

      {/* 7. Invoices (If any exist) */}
      {invoices.length > 0 && (
        <div className="mn-student-summary-invoices">
          <InvoicePanel
            compactSummary
            invoices={invoices}
            paymentsByInvoice={paymentsByInvoice}
            onToggle={onTogglePayments}
          />
        </div>
      )}
    </div>
  );
}

function OpportunitiesView({
  dashboard,
  trackers,
  saving,
  onStageChange,
  onChecklistToggle,
  onNotesUpdate,
  onArchive,
  onRemove,
  onDocumentsChanged,
}: {
  dashboard: StudentDashboardSummaryDto;
  trackers: StudentApplicationTrackerDto[];
  saving: boolean;
  onStageChange: (tracker: StudentApplicationTrackerDto, stage: string) => void;
  onChecklistToggle: (tracker: StudentApplicationTrackerDto, itemId: string, completed: boolean) => void;
  onNotesUpdate: (tracker: StudentApplicationTrackerDto, notes: string) => void;
  onArchive: (tracker: StudentApplicationTrackerDto) => void;
  onRemove: (tracker: StudentApplicationTrackerDto) => void;
  onDocumentsChanged: () => void;
}) {
  const [filter, setFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');

  const activeTrackers = useMemo(() => trackers.filter((item) => item.status === 'ACTIVE'), [trackers]);
  const archivedTrackers = useMemo(() => trackers.filter((item) => item.status === 'ARCHIVED'), [trackers]);

  const displayedTrackers = useMemo(() => {
    if (filter === 'ACTIVE') return activeTrackers;
    if (filter === 'ARCHIVED') return archivedTrackers;
    return trackers;
  }, [filter, activeTrackers, archivedTrackers, trackers]);

  const upcomingDeadlines = useMemo(() => {
    return activeTrackers
      .filter((t) => t.deadlineAt || t.owner?.deadlineAt)
      .sort((a, b) => {
        const dateA = new Date(a.deadlineAt || a.owner?.deadlineAt || '').getTime();
        const dateB = new Date(b.deadlineAt || b.owner?.deadlineAt || '').getTime();
        return dateA - dateB;
      });
  }, [activeTrackers]);

  const hasTrackers = trackers.length > 0;

  const activeTaskCount = activeTrackers.reduce((total, item) => total + item.checklist.length, 0);
  const activeCompletedCount = activeTrackers.reduce(
    (total, item) => total + item.checklist.filter((task) => task.completed).length,
    0,
  );
  const activeTaskProgress = activeTaskCount > 0
    ? Math.round((activeCompletedCount / activeTaskCount) * 100)
    : 0;

  return (
    <div className="mn-student-opportunities-page mt-0 space-y-4 font-['Cairo',sans-serif]">
      {/* Header box attached directly to the 8-tab bar above and stretched edge-to-edge right & left */}
      <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mt-px">
        <section
          aria-label="فرصي وملفات التقديم"
          className="relative overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] shadow-2xs mn-panel font-['Cairo',sans-serif]"
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
                  <Route className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />
                </span>
                <h2 className="mn-student-opportunities-heading text-[14px] sm:text-[15px] font-bold leading-tight text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                  فرصي وملفات التقديم
                </h2>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2.5 py-1 text-[11px] font-semibold text-[#334155] dark:text-[#E2E8F0] font-['Cairo',sans-serif]">
                {trackers.length} ملف تقديم
              </span>
            </div>

            <p className="mt-2.5 text-[11.5px] sm:text-[12px] font-medium leading-[1.75] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
              تابع ملفات تقديمك على المنح الدراسية والقبولات الجامعية، ونظّم متطلباتك ومواعيدك النهائية خطوة بخطوة حتى القبول.
            </p>
          </div>
        </section>

        {/* Filter bar outside the header box, attached from the top and stretched edge-to-edge */}
        <nav
          aria-label="تصفية ملفات التقديم"
          className="-mt-px grid grid-cols-3 divide-x divide-x-reverse divide-[var(--mn-border)] dark:divide-white/10 rounded-b-2xl border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] overflow-hidden shadow-2xs font-['Cairo',sans-serif]"
        >
          {([
            { value: 'ACTIVE' as const, label: 'النشطة حاليًا', count: activeTrackers.length, icon: CheckCircle2 },
            { value: 'ARCHIVED' as const, label: 'المؤرشفة', count: archivedTrackers.length, icon: Archive },
            { value: 'ALL' as const, label: 'الكل', count: trackers.length, icon: ListChecks },
          ]).map(({ value, label, count, icon: Icon }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(value)}
                className={`flex min-h-12 items-center justify-center gap-1.5 px-2 py-2 text-center font-['Cairo',sans-serif] transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#142B5F] ${
                  active
                    ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white shadow-inner font-bold'
                    : 'bg-transparent text-[#1E293B] dark:text-[#F1F5F9] font-semibold hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${active ? 'text-[#F2CD78]' : 'text-[#142B5F] dark:text-[#E5B54F]'}`} aria-hidden="true" />
                <span className="whitespace-normal break-words text-[11px] sm:text-[12px] leading-[1.35]">{label} ({count})</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Main Trackers or Single Clean Starter State */}
      {!hasTrackers ? (
        <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-5 sm:p-7 text-center mn-panel shadow-2xs overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#142B5F] border border-[#D6A43B]/45 flex items-center justify-center text-[#F2CD78] mx-auto mb-3 shadow-xs">
            <Route className="w-5 h-5 text-[#F2CD78]" />
          </div>
          <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">ابدأ متابعة تقديماتك خطوة بخطوة</h3>
          <p className="text-[11px] sm:text-[11.5px] text-[#475569] dark:text-[#CBD5E1] mt-1.5 leading-[1.8] max-w-lg mx-auto">
            <strong>ما الفرق؟</strong> حفظ المنحة في <span className="font-bold text-[#1E293B] dark:text-[#F8FAFC]">«محفوظاتي»</span> يتيح لك الرجوع إليها في أي وقت، بينما فتح <span className="font-bold text-[#1E293B] dark:text-[#F8FAFC]">«ملف تقديم»</span> هنا يمكّنك من إدارة المواعيد النهائية، إنجاز المتطلبات وقوائم المهام خطوة بخطوة حتى القبول.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/scholarships"
              className="px-3.5 py-2 rounded-xl bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/35 text-white text-[11.5px] font-bold transition-all shadow-2xs inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F2CD78]" />
              <span>استكشف دليل المنح الدراسية</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 min-w-0 max-w-full">
          <ApplicationTrackersPanel
            trackers={displayedTrackers}
            filter={filter}
            saving={saving}
            onStageChange={onStageChange}
            onChecklistToggle={onChecklistToggle}
            onNotesUpdate={onNotesUpdate}
            onArchive={onArchive}
            onRemove={onRemove}
            onDocumentsChanged={onDocumentsChanged}
          />

          {/* Upcoming Deadlines Panel */}
          {upcomingDeadlines.length > 0 && (
            <OpportunitiesSectionCard
              title="المواعيد النهائية القريبة"
              icon={<CalendarClock className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />}
              description="مواعيد إغلاق تقديمات المنح المتابعة في حسابك"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {upcomingDeadlines.slice(0, 4).map((tracker) => {
                  const deadlineStr = tracker.deadlineAt || tracker.owner?.deadlineAt;
                  const title = trackerDisplayName(tracker);
                  return (
                    <div
                      key={tracker.id}
                      className="p-2.5 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] flex items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] sm:text-[12px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] break-words">{title}</div>
                        <div className="text-[10.5px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">{tracker.stage}</div>
                      </div>
                      <div className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/25 bg-[#0E7C86]/10 px-2 py-1 text-[10.5px] font-bold text-[#0E7C86] dark:text-[#55CBC5]">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatDate(deadlineStr)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </OpportunitiesSectionCard>
          )}

          {/* Application Progress Summary */}
          <OpportunitiesSectionCard title="حصيلة التقديم" icon={<ClipboardList className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <ProgressRow label="إنجاز مهام التقديم النشطة" value={activeTaskProgress} />
              <ProgressRow
                label="نسبة الملفات المؤرشفة"
                value={trackers.length ? Math.round((archivedTrackers.length / trackers.length) * 100) : 0}
              />
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#0E7C86]/25 bg-[#0E7C86]/[0.07] dark:bg-[#0E7C86]/15 px-3 py-2 text-[11px] leading-[1.7] text-[#1E293B] dark:text-[#F1F5F9]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0E7C86] dark:text-[#55CBC5]" aria-hidden="true" />
              <p><strong className="font-bold">تنبيه دقة البيانات:</strong> حفظ المنحة في «محفوظاتي» يتيح الرجوع إليها لاحقًا، بينما فتح «ملف تقديم» هنا يمكّنك من متابعة المهام ومراحل التقديم خطوة بخطوة.</p>
            </div>
          </OpportunitiesSectionCard>

          {/* Timeline of activity */}
          {dashboard.timeline.length > 0 && (
            <OpportunitiesSectionCard title="سجل الأنشطة والمواعيد" icon={<HistoryIcon className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />}>
              <div className="mn-student-opportunities-activity">
                <ActivityList items={dashboard.timeline} />
              </div>
            </OpportunitiesSectionCard>
          )}
        </div>
      )}
    </div>
  );
}

function OpportunitiesSectionCard({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="mn-student-opportunities-section relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] py-3.5 sm:py-4 shadow-2xs mn-panel font-['Cairo',sans-serif] overflow-hidden"
    >
      <div className="mb-2.5 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 px-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#D6A43B]/75 bg-[#142B5F] text-[#F2CD78] shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
            <span className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-md bg-[#D6A43B]" />
            <span className="relative z-10">{icon}</span>
          </span>
          <h3 className="inline-block border-b-2 border-[#D6A43B] pb-0.5 min-w-0 text-[14px] sm:text-[15px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC]">
            {title}
          </h3>
        </div>
        {description && (
          <p className="mt-1 text-[10.5px] font-medium leading-[1.65] text-[#64748B] dark:text-[#94A3B8]">{description}</p>
        )}
      </div>
      <div className="px-3.5 sm:px-5">{children}</div>
    </section>
  );
}


const APPLICATION_STAGES = [
  'تجهيز المستندات',
  'كتابة خطاب الدافع',
  'خطابات التوصية',
  'تم إرسال الطلب',
  'المقابلة الشخصية',
  'تم القبول بنجاح',
];

function ApplicationTrackersPanel({
  trackers,
  filter,
  saving,
  onStageChange,
  onChecklistToggle,
  onNotesUpdate,
  onArchive,
  onRemove,
  onDocumentsChanged,
}: {
  trackers: StudentApplicationTrackerDto[];
  filter: 'ACTIVE' | 'ARCHIVED' | 'ALL';
  saving: boolean;
  onStageChange: (tracker: StudentApplicationTrackerDto, stage: string) => void;
  onChecklistToggle: (tracker: StudentApplicationTrackerDto, itemId: string, completed: boolean) => void;
  onNotesUpdate: (tracker: StudentApplicationTrackerDto, notes: string) => void;
  onArchive: (tracker: StudentApplicationTrackerDto) => void;
  onRemove: (tracker: StudentApplicationTrackerDto) => void;
  onDocumentsChanged: () => void;
}) {
  if (!trackers.length) {
    if (filter === 'ARCHIVED') {
      return (
        <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-5 text-center mn-panel overflow-hidden">
          <Archive className="w-7 h-7 mx-auto text-[#0E7C86] mb-1.5" />
          <h3 className="font-bold text-[12.5px] sm:text-[13px] text-[#1E293B] dark:text-[#F8FAFC]">لا توجد ملفات تقديم مؤرشفة</h3>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
            عند إتمام تقديماتك أو أرشفتها ستظهر هنا للاحتفاظ بسجلك الأكاديمي.
          </p>
        </div>
      );
    }
    return (
      <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-5 text-center mn-panel overflow-hidden">
        <EmptyState
          icon={<Route className="h-7 w-7 text-[#E5B54F]" />}
          title="لا توجد ملفات تقديم نشطة بعد"
          text="تصفح دليل المنح الدراسية واختر «متابعة التقديم» على المنحة التي ترغب بالتقديم عليها لتوليد ملف تتبع مخصص خطوة بخطوة."
          href="/scholarships"
          action="استكشف دليل المنح الآن"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trackers.map((tracker) => (
        <ApplicationTrackerCard
          key={tracker.id}
          tracker={tracker}
          saving={saving}
          onStageChange={onStageChange}
          onChecklistToggle={onChecklistToggle}
          onNotesUpdate={onNotesUpdate}
          onArchive={onArchive}
          onRemove={onRemove}
          onDocumentsChanged={onDocumentsChanged}
        />
      ))}
    </div>
  );
}

function ApplicationTrackerCard({
  tracker,
  saving,
  onStageChange,
  onChecklistToggle,
  onNotesUpdate,
  onArchive,
  onRemove,
  onDocumentsChanged,
}: {
  tracker: StudentApplicationTrackerDto;
  saving: boolean;
  onStageChange: (tracker: StudentApplicationTrackerDto, stage: string) => void;
  onChecklistToggle: (tracker: StudentApplicationTrackerDto, itemId: string, completed: boolean) => void;
  onNotesUpdate: (tracker: StudentApplicationTrackerDto, notes: string) => void;
  onArchive: (tracker: StudentApplicationTrackerDto) => void;
  onRemove: (tracker: StudentApplicationTrackerDto) => void;
  onDocumentsChanged: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(tracker.notes || '');

  const completed = tracker.checklist.filter((item) => item.completed).length;
  const total = tracker.checklist.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const displayName = trackerDisplayName(tracker);
  const slug = tracker.owner?.available === true ? tracker.owner.slug : null;
  const isArchived = tracker.status === 'ARCHIVED';
  const deadlineStr = tracker.deadlineAt || tracker.owner?.deadlineAt;
  const nextTask = tracker.checklist.find((item) => !item.completed);

  function handleSaveNotes() {
    onNotesUpdate(tracker, notesDraft);
    setEditingNotes(false);
  }

  return (
    <article className="relative overflow-hidden -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-2xs mn-panel font-['Cairo',sans-serif] transition-all">
      <OwnerReferenceNotice reference={tracker.owner?.referenceState} />

      {/* Row 1: Oxford Sub-Item Icon (MIX-10) + Subordinate Scholarship Title + Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 -mx-3.5 sm:-mx-5 px-3.5 sm:px-5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-6 h-6 rounded-md bg-[#0E7C86] border-[1.5px] border-[#142B5F] ring-1 ring-[#142B5F]/40 text-white mn-sub-item-icon flex items-center justify-center shrink-0 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="text-[11.5px] sm:text-[12px] leading-[1.4] font-bold text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif] break-words">
              {displayName}
            </h3>
          </div>
        </div>

        {isArchived ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20 shrink-0">
            مؤرشف تنظيمياً
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#55CBC5] border border-[#0E7C86]/25 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86] dark:bg-[#55CBC5]" />
            تقديم نشط
          </span>
        )}
      </div>

      {/* Row 2: 2x2 Info Boxes on Mobile (4 cols on desktop) with Horizon Petrol (#0E7C86) Icons on the Right */}
      <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <div className="flex items-center justify-start gap-2 rounded-lg border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-2.5 pl-2 py-1.5">
          <Compass className="h-3.5 w-3.5 text-[#0E7C86] shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="block text-[9px] sm:text-[9.5px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
              الدولة / الوجهة
            </span>
            <span className="mt-0.5 block text-[10px] sm:text-[10.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] break-words leading-tight">
              {tracker.owner?.country || 'منحة دولية'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-start gap-2 rounded-lg border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-2.5 pl-2 py-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-[#0E7C86] shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="block text-[9px] sm:text-[9.5px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
              موعد التقديم
            </span>
            <span className="mt-0.5 block text-[10px] sm:text-[10.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] break-words leading-tight">
              {deadlineStr ? formatDate(deadlineStr) : 'مفتوح / متجدد'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-start gap-2 rounded-lg border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-2.5 pl-2 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#0E7C86] shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="block text-[9px] sm:text-[9.5px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
              المرحلة الحالية
            </span>
            <span className="mt-0.5 block text-[10px] sm:text-[10.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] break-words leading-tight">
              {tracker.stage}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-start gap-2 rounded-lg border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-2.5 pl-2 py-1.5">
          <ListChecks className="h-3.5 w-3.5 text-[#0E7C86] shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="block text-[9px] sm:text-[9.5px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
              نسبة الجاهزية
            </span>
            <span className="mt-0.5 block text-[10px] sm:text-[10.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] leading-tight">
              {progress}% ({completed}/{total})
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Unified Progress Bar + Next Actionable Requirement */}
      <div className="mt-2.5 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-2.5 space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 font-bold text-[#1E293B] dark:text-[#F8FAFC]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0E7C86]" aria-hidden="true" />
            <span>المهام المنجزة: {completed} من {total}</span>
          </span>
          <span className="text-[10.5px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            آخر تحديث: {formatDate(tracker.updatedAt)}
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden" dir="rtl">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#163D76] to-[#0E7C86] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {nextTask && (
          <div className="pt-0.5 flex items-center justify-between gap-2 text-[11px] text-[#475569] dark:text-[#CBD5E1]">
            <span className="min-w-0 flex-1 break-words">
              <strong className="text-[#1E293B] dark:text-[#F8FAFC]">الخطوة القادمة:</strong> {nextTask.label}
            </span>
          </div>
        )}
      </div>

      {/* Source Unavailability Notice */}
      {tracker.owner && !tracker.owner.available && (
        <div className="mt-2.5 rounded-xl bg-[var(--mn-warning-soft)] p-2.5 text-[11px] font-bold text-[var(--mn-warning-text)] flex items-center gap-2 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>غير معروضة حاليًا لدى المصدر؛ وسجلك محفوظ بحسابك.</span>
        </div>
      )}

      {/* Row 4: Documents and application cycle accordion */}
      <div className="mt-3 w-full max-w-full min-w-0">
        <StudentApplicationDocuments tracker={tracker} onChanged={onDocumentsChanged} />
      </div>

      {/* Row 5: Clean Unified Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-[var(--mn-border)] dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 font-['Cairo',sans-serif]">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 min-h-9 px-3.5 rounded-xl bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/35 text-white text-[11px] sm:text-[11.5px] font-bold shadow-xs transition-all cursor-pointer"
        >
          <span>{expanded ? 'إخفاء تفاصيل الملف والمهام' : 'عرض تفاصيل الملف والمهام'}</span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />}
        </button>

        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {slug && (
            <Link
              to={`/scholarships/${encodeURIComponent(slug)}`}
              className="inline-flex items-center justify-center gap-1 min-h-9 px-2.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] text-[11px] font-bold text-[#1E293B] dark:text-[#F8FAFC] hover:border-[#0E7C86] transition-all cursor-pointer shadow-2xs text-center"
              title="صفحة المنحة"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#0E7C86] shrink-0" aria-hidden="true" />
              <span>صفحة المنحة</span>
            </Link>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => onArchive(tracker)}
            className="inline-flex items-center justify-center gap-1 min-h-9 px-2.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] text-[11px] font-bold text-[#334155] dark:text-[#E2E8F0] hover:border-[#D6A43B] transition-all cursor-pointer disabled:opacity-50 shadow-2xs text-center"
            title={isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
          >
            <Archive className="h-3.5 w-3.5 text-[#0E7C86] shrink-0" aria-hidden="true" />
            <span>{isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => onRemove(tracker)}
            className="inline-flex items-center justify-center gap-1 min-h-9 px-2.5 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/70 dark:bg-rose-950/20 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50 shadow-2xs text-center"
            title="إزالة"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>إزالة</span>
          </button>
        </div>
      </div>

      {/* Expanded Details: Stage selector, Checklist, Notes */}
      {expanded && (
        <div className="mt-3 space-y-3 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] p-3 shadow-2xs animate-in fade-in duration-200 dark:bg-[var(--mn-surface-elevated)]">
          {/* Sub-section 1: Stage Selector */}
          <div className="rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-3">
            <div className="flex items-center gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2 mb-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#D6A43B]/40 bg-[#142B5F]">
                <Sparkles className="h-3 w-3 text-[#F2CD78]" />
              </span>
              <label className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC] leading-tight">
                المرحلة الحالية للتقديم
              </label>
            </div>
            <p className="mb-2 text-[11px] font-medium leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
              اختر الخطوة التي وصلت إليها لتسهيل متابعة ملفك.
            </p>
            <select
              disabled={saving}
              value={tracker.stage}
              onChange={(event) => onStageChange(tracker, event.target.value)}
              className="min-h-9 w-full rounded-xl border border-[var(--mn-border)] dark:border-white/15 bg-[var(--mn-page)] px-3 py-1.5 text-[11.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC] outline-none transition-colors focus:border-[#0E7C86] disabled:opacity-60 dark:bg-[var(--mn-surface-elevated)]"
            >
              {APPLICATION_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-section 2: Checklist Items */}
          <div className="rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#D6A43B]/40 bg-[#142B5F]">
                  <ListChecks className="h-3 w-3 text-[#F2CD78]" />
                </span>
                <span className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC] leading-tight">
                  قائمة المهام والمتطلبات
                </span>
              </div>
              <span className="rounded-lg border border-[#0E7C86]/25 bg-[#0E7C86]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#0E7C86] dark:text-[#55CBC5]">
                {completed} من {total} مكتمل
              </span>
            </div>
            <p className="mb-2 text-[11px] font-medium leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
              علّم على المتطلبات التي أنجزتها، وستُحفظ متابعتك في ملف التقديم.
            </p>
            <div className="space-y-1.5">
              {tracker.checklist.map((item) => (
                <label
                  key={item.id}
                  className={`flex min-h-[42px] items-center gap-2.5 rounded-xl border px-2.5 py-2 text-[11.5px] leading-5 transition-colors cursor-pointer ${
                    item.completed
                      ? 'border-emerald-500/25 bg-emerald-500/[0.06] text-[#64748B]'
                      : 'border-[var(--mn-border)] bg-[var(--mn-page)] text-[#1E293B] dark:text-[#F8FAFC] font-bold dark:bg-[var(--mn-surface-elevated)]'
                  }`}
                >
                  <input
                    disabled={saving}
                    type="checkbox"
                    checked={item.completed}
                    onChange={(event) => onChecklistToggle(tracker, item.id, event.target.checked)}
                    className="h-4 w-4 shrink-0 rounded accent-[#142B5F] dark:accent-[#E5B54F]"
                  />
                  <span className={`min-w-0 flex-1 font-['Cairo',sans-serif] text-[11.5px] leading-snug break-words ${item.completed ? 'line-through opacity-75' : ''}`}>
                    {item.label}
                  </span>
                  {item.completedAt && (
                    <span className="shrink-0 text-[10px] font-medium text-[#0E7C86]">
                      {formatDate(item.completedAt)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Sub-section 3: Notes Section */}
          <div className="rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#D6A43B]/40 bg-[#142B5F]">
                  <FileText className="h-3 w-3 text-[#F2CD78]" aria-hidden="true" />
                </span>
                <span className="text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC] leading-tight">
                  ملاحظاتي على ملف التقديم
                </span>
              </div>
              {!editingNotes && (
                <button
                  type="button"
                  onClick={() => setEditingNotes(true)}
                  className="inline-flex min-h-7 shrink-0 items-center justify-center gap-1 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] px-2.5 text-[11px] font-bold text-[#1E293B] dark:text-[#F8FAFC] transition-colors hover:border-[#0E7C86] cursor-pointer"
                >
                  <FileText className="h-3 w-3 text-[#0E7C86]" aria-hidden="true" />
                  {tracker.notes ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-2 mt-1.5">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="سجّل أي تفاصيل مهمة (مثل اسم المشرف، تاريخ المقابلة، الملاحظات المطلوبة)..."
                  rows={3}
                  maxLength={500}
                  className="min-h-20 w-full resize-y rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-[11.5px] leading-6 text-[#1E293B] dark:text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#0E7C86]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotesDraft(tracker.notes || '');
                      setEditingNotes(false);
                    }}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-2.5 text-[11px] font-bold text-[#64748B] transition-colors hover:bg-[var(--mn-page)] cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveNotes}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/35 px-3 text-[11px] font-bold text-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    حفظ الملاحظة
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] px-3 py-2 text-[11.5px] font-medium leading-6 text-[#475569] dark:text-[#CBD5E1] dark:bg-[var(--mn-surface-elevated)]">
                {tracker.notes || 'لا توجد ملاحظات مسجلة لهذا الملف حتى الآن.'}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function LearningView({ dashboard }: { dashboard: StudentDashboardSummaryDto }) {
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'CERTIFICATES'>('ALL');

  const inProgressCourses = useMemo(
    () => dashboard.courseEnrollments.filter((course) => ['ACTIVE', 'ENROLLED', 'IN_PROGRESS'].includes(course.status)),
    [dashboard.courseEnrollments],
  );
  const completedCourses = useMemo(
    () => dashboard.courseEnrollments.filter((course) => course.status === 'COMPLETED'),
    [dashboard.courseEnrollments],
  );
  const otherCourses = useMemo(
    () => dashboard.courseEnrollments.filter((course) => !['ACTIVE', 'ENROLLED', 'IN_PROGRESS', 'COMPLETED'].includes(course.status)),
    [dashboard.courseEnrollments],
  );
  const certificates = useMemo(() => dashboard.certificates || [], [dashboard.certificates]);
  const hasAnyLearningData = dashboard.courseEnrollments.length > 0 || certificates.length > 0;
  const learningFilterItems = [
    { value: 'ALL' as const, label: 'الكل', count: dashboard.courseEnrollments.length + certificates.length, icon: ListChecks },
    { value: 'IN_PROGRESS' as const, label: 'قيد التعلم', count: inProgressCourses.length, icon: Clock3 },
    { value: 'COMPLETED' as const, label: 'المكتملة', count: completedCourses.length, icon: CheckCircle2 },
    { value: 'CERTIFICATES' as const, label: 'الشهادات', count: certificates.length, icon: Award },
  ];

  return (
    <div className="mn-student-learning-page mt-0 space-y-4 font-['Cairo',sans-serif]">
      {/* Header box attached directly to the 8-tab bar above and stretched edge-to-edge right & left */}
      <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mt-px">
        <section
          aria-label="تعليمي وإنجازاتي"
          className="mn-student-learning-hero relative overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] shadow-2xs mn-panel font-['Cairo',sans-serif]"
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
                  <BookOpen className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />
                </span>
                <h2 className="mn-student-learning-heading text-[14px] sm:text-[15px] font-bold leading-tight text-[#1E293B] dark:text-[#F8FAFC]">
                  تعليمي وإنجازاتي
                </h2>
              </div>
              <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2.5 py-1 text-[11px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
                {dashboard.courseEnrollments.length} دورة · {certificates.length} شهادة
              </span>
            </div>

            <p className="mt-2.5 text-[11.5px] sm:text-[12px] font-medium leading-[1.75] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
              استكمل دوراتك التدريبية المسجلة، وتابع نسب تقدمك في المحاضرات وحمّل شهادات الإنجاز الصادرة لك.
            </p>
          </div>
        </section>

        {/* Four filter buttons outside the header box, attached from the top and stretched edge-to-edge */}
        <nav
          aria-label="تصفية الدورات والشهادات"
          className="-mt-px grid grid-cols-4 divide-x divide-x-reverse divide-[var(--mn-border)] dark:divide-white/10 rounded-b-2xl border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] overflow-hidden shadow-2xs"
        >
          {learningFilterItems.map(({ value, label, count, icon: Icon }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(value)}
                className={`flex min-h-12 items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-2 text-center transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#142B5F] ${
                  active
                    ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white shadow-inner font-bold'
                    : 'bg-transparent text-[#1E293B] dark:text-[#F1F5F9] font-semibold hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${active ? 'text-[#F2CD78]' : 'text-[#142B5F] dark:text-[#E5B54F]'}`} aria-hidden="true" />
                <span className="whitespace-normal break-words leading-[1.35] text-[11px] sm:text-[12px]">{label} ({count})</span>
              </button>
            );
          })}
        </nav>
      </div>

      {dashboard.capabilityStatus?.learning === 'DEGRADED' && <Alert tone="warning" message="تعذر تحميل الدورات حالياً؛ القائمة الحالية لا تعني عدم وجود تسجيلات." />}
      {dashboard.capabilityStatus?.certificates === 'DEGRADED' && <Alert tone="warning" message="تعذر تحميل الشهادات حالياً. أعد تحديث الحساب." />}

      {!hasAnyLearningData ? (
        <LearningSectionCard title="ابدأ رحلتك التعليمية" icon={<BookOpen className="h-4 w-4 text-[#E5B54F]" aria-hidden="true" />}>
          <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-4 text-center">
            <p className="text-[12px] font-semibold leading-[1.9] text-[var(--mn-text-muted)]">
              سجّل في دورة من دليل منارتك لتظهر هنا الدروس التي تتابعها، ونسب إنجازك، والشهادات التي تصدر لك.
            </p>
          </div>
        </LearningSectionCard>
      ) : (
        <>
          {(filter === 'ALL' || filter === 'IN_PROGRESS') && (
            <LearningSectionCard
              title="دورات قيد التعلم"
              icon={<Clock3 className="h-3.5 w-3.5 text-[#E5B54F]" aria-hidden="true" />}
              count={`${inProgressCourses.length} دورة`}
            >
              {inProgressCourses.length === 0 ? (
                <p className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-3.5 text-center text-[11.5px] font-medium text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
                  لا توجد دورات قيد التعلم حاليًا.
                </p>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {inProgressCourses.map((course) => (
                    <article
                      key={course.enrollmentId || course.courseId}
                      className="mn-student-learning-course relative overflow-hidden flex min-w-0 flex-col justify-between rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 shadow-xs transition-all hover:border-[#D6A43B]/60 font-['Cairo',sans-serif]"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full border border-[#0E7C86]/25 bg-[#0E7C86]/10 px-2 py-0.5 text-[10px] sm:text-[10.5px] font-bold text-[#0E7C86] dark:text-[#E5B54F] dark:border-[#E5B54F]/30 dark:bg-[#E5B54F]/10">
                            قيد التعلم
                          </span>
                          <span className="text-[12px] font-extrabold text-[#142B5F] dark:text-[#E5B54F]">
                            {course.progressPercentage}%
                          </span>
                        </div>

                        <h4 className="mt-1.5 text-[12px] sm:text-[12.5px] font-bold leading-snug text-[var(--mn-heading)] break-words">
                          {course.courseName}
                        </h4>

                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" dir="rtl">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#163D76] to-[#0E7C86] dark:from-[#D6A43B] dark:to-[#E5B54F] transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, course.progressPercentage))}%` }}
                          />
                        </div>

                        <p className="mt-1.5 text-[10.5px] font-medium text-[var(--mn-text-muted)]">
                          {course.lastAccessedAt
                            ? `آخر وصول: ${formatDate(course.lastAccessedAt)}`
                            : `تاريخ التسجيل: ${formatDate(course.enrolledAt)}`}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[var(--mn-border)] pt-2">
                        <span className="text-[10.5px] font-medium text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">متابعة تقدم الدورة</span>
                        <Link
                          to={`../student/courses/${encodeURIComponent(course.courseId)}`}
                          className="ms-auto inline-flex min-h-8 items-center justify-center gap-1 rounded-lg bg-[#142B5F] hover:bg-[#163D76] dark:bg-[#D6A43B] dark:text-[#142B5F] dark:hover:bg-[#E5B54F] px-3 py-1 text-[11px] font-bold text-white transition-all shadow-xs"
                        >
                          <span>متابعة التعلم</span>
                          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </LearningSectionCard>
          )}

          {(filter === 'ALL' || filter === 'COMPLETED') && (
            <LearningSectionCard
              title="الدورات المكتملة"
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-[#E5B54F]" aria-hidden="true" />}
              count={`${completedCourses.length} دورة`}
            >
              {completedCourses.length === 0 ? (
                <p className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-3.5 text-center text-[11.5px] font-medium text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
                  لا توجد دورات مكتملة حتى الآن.
                </p>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {completedCourses.map((course) => (
                    <article
                      key={course.enrollmentId || course.courseId}
                      className="mn-student-learning-course relative overflow-hidden flex min-w-0 flex-col justify-between rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 shadow-xs transition-all hover:border-[#D6A43B]/60 font-['Cairo',sans-serif]"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full border border-[var(--mn-success-border)] bg-[var(--mn-success-soft)] px-2 py-0.5 text-[10px] sm:text-[10.5px] font-bold text-[var(--mn-success-text)] font-['Cairo',sans-serif]">
                            مكتملة بنجاح
                          </span>
                          <span className="text-[12px] font-extrabold text-[var(--mn-success-text)] font-['Cairo',sans-serif]">
                            100%
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-[12px] sm:text-[12.5px] font-bold leading-snug text-[var(--mn-heading)] break-words font-['Cairo',sans-serif]">
                          {course.courseName}
                        </h4>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
                          <Check className="h-3.5 w-3.5 shrink-0 text-[var(--mn-success-text)]" aria-hidden="true" />
                          <span>{course.completedAt ? `تاريخ الإتمام: ${formatDate(course.completedAt)}` : 'تاريخ الإتمام غير متاح'}</span>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[var(--mn-border)] pt-2">
                        <span className="text-[10.5px] font-medium text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">مراجعة محتوى الدورة</span>
                        <Link
                          to={`../student/courses/${encodeURIComponent(course.courseId)}`}
                          className="ms-auto inline-flex min-h-8 items-center justify-center gap-1 rounded-lg bg-[#142B5F] hover:bg-[#163D76] dark:bg-[#D6A43B] dark:text-[#142B5F] dark:hover:bg-[#E5B54F] px-3 py-1 text-[11px] font-bold text-white transition-all shadow-xs"
                        >
                          <span>مراجعة المواد</span>
                          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </LearningSectionCard>
          )}

          {filter === 'ALL' && otherCourses.length > 0 && (
            <LearningSectionCard
              title="تسجيلات معلقة أو سابقة"
              icon={<ClipboardList className="h-3.5 w-3.5 text-[#E5B54F]" aria-hidden="true" />}
              count={`${otherCourses.length} تسجيل`}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {otherCourses.map((course) => (
                  <CourseCard key={course.enrollmentId || course.courseId} course={course} />
                ))}
              </div>
            </LearningSectionCard>
          )}
        </>
      )}

      {(filter === 'ALL' || filter === 'CERTIFICATES') && (
        <LearningSectionCard
          title="إنجازاتي وشهاداتي"
          icon={<Award className="h-3.5 w-3.5 text-[#E5B54F]" aria-hidden="true" />}
        >
          <StudentCertificatesPanel initial={certificates} compactLearning />
        </LearningSectionCard>
      )}

      {/* Dedicated End Section: Motivational Courses Discovery Section stretched edge-to-edge */}
      <section
        aria-label="استكشاف الدورات التدريبية"
        className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-2xs mn-panel font-['Cairo',sans-serif]"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#D6A43B]/40 bg-[#142B5F] text-[#F2CD78]">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                طوّر مهاراتك وانطلق نحو مستقبلك الأكاديمي والمهني
              </h3>
            </div>
            <p className="text-[11px] sm:text-[11.5px] font-medium leading-[1.75] text-[var(--mn-text-muted)]">
              استكشف باقة متميزة من الدورات المتخصصة في التحضير للقبول الجامعي، كتابة السيرة الذاتية، واجتياز اختبارات اللغة والمقابلات الشخصية لتحقيق طموحاتك بثقة.
            </p>
          </div>

          <Link
            to="/courses"
            className="w-full sm:w-auto shrink-0 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#142B5F] hover:bg-[#1a3675] px-3.5 py-1.5 text-[11.5px] font-bold text-white shadow-2xs transition-all cursor-pointer border border-[#D6A43B]/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
            <span>تصفح دليل الدورات المتاحة</span>
            <ArrowLeft className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Stretched edge-to-edge section matching ملخصي and فرصي. */
function LearningSectionCard({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="mn-student-learning-section relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] py-3.5 sm:py-4 shadow-2xs mn-panel font-['Cairo',sans-serif]"
    >
      <div className="mb-3 flex min-w-0 items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 px-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#D6A43B]/75 bg-[#142B5F] text-[#F2CD78] shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
            <span className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-md bg-[#D6A43B]" />
            <span className="relative z-10">{icon}</span>
          </span>
          <h3 className="inline-block border-b-2 border-[#D6A43B] pb-0.5 min-w-0 text-[14px] sm:text-[15px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC]">
            {title}
          </h3>
        </div>
        {count && (
          <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
            {count}
          </span>
        )}
      </div>
      <div className="px-3.5 sm:px-5">{children}</div>
    </section>
  );
}

function formatParameterKey(key: string): string {
  const dictionary: Record<string, string> = {
    serviceCategory: 'تصنيف الخدمة',
    targetCountry: 'الدولة المستهدفة',
    academicLevel: 'المستوى الأكاديمي',
    notes: 'ملاحظات الطلب',
    details: 'تفاصيل واستفسارات',
    urgency: 'أولوية التنفيذ',
    preferredLanguage: 'لغة التواصل المفضلة',
    documentType: 'نوع الوثيقة',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    major: 'التخصص المطلوب',
    university: 'الجامعة المستهدفة',
    degreeLevel: 'المرحلة الدراسية',
    deadline: 'الموعد المرغوب',
    requirements: 'متطلبات إضافية',
    studyLanguage: 'لغة الدراسة',
    actionInstructions: 'تعليمات الإجراء المطلوب',
    instructions: 'التعليمات',
  };
  if (dictionary[key]) return dictionary[key];
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}

function formatParameterValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.map(formatParameterValue).join('، ');
    return JSON.stringify(value);
  }
  return String(value);
}

function getServiceRequestStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'REQUESTED': return { label: 'طلب جديد', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
    case 'ACCEPTED': return { label: 'مقبول', className: 'bg-teal-500/10 text-teal-700 border-teal-500/20' };
    case 'AWAITING_PAYMENT': return { label: 'بانتظار الدفع', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
    case 'COMPLETED':
    case 'FULFILLED':
    case 'RESOLVED':
      return {
        label: 'مكتمل بنجاح',
        className: 'bg-[var(--mn-success-soft)] text-[var(--mn-success-text)] border-[var(--mn-success-border)]',
      };
    case 'IN_PROGRESS':
    case 'PROCESSING':
    case 'IN_REVIEW':
      return {
        label: 'قيد المراجعة والتنفيذ',
        className: 'bg-[var(--mn-info-soft)] text-[var(--mn-info-text)] border-[var(--mn-info-border)]',
      };
    case 'ACTION_REQUIRED':
    case 'NEEDS_INPUT':
      return {
        label: 'يتطلب إجراء من الطالب',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      };
    case 'PENDING':
    case 'SUBMITTED':
      return {
        label: 'تم الاستلام وجارٍ التحقق',
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'CANCELLED':
      return {
        label: 'ملغي',
        className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      };
    case 'REJECTED':
      return {
        label: 'مرفوض',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      };
    default:
      return {
        label: status,
        className: 'bg-[var(--mn-page)] text-[var(--mn-heading)] border-[var(--mn-border)]',
      };
  }
}

function getInvoiceStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'PAID':
      return {
        label: 'مدفوعة بالكامل',
        className: 'bg-[var(--mn-success-soft)] text-[var(--mn-success-text)] border-[var(--mn-success-border)]',
      };
    case 'PENDING':
    case 'ISSUED':
    case 'UNPAID':
      return {
        label: 'بانتظار السداد',
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'PROCESSING':
      return {
        label: 'قيد المعالجة',
        className: 'bg-[var(--mn-info-soft)] text-[var(--mn-info-text)] border-[var(--mn-info-border)]',
      };
    case 'OVERDUE':
      return {
        label: 'متأخرة السداد',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      };
    case 'VOIDED':
    case 'CANCELLED':
      return {
        label: 'ملغاة',
        className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      };
    case 'REFUNDED':
      return {
        label: 'مسترجعة',
        className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      };
    case 'DRAFT':
      return {
        label: 'مسودة',
        className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      };
    case 'FAILED':
      return {
        label: 'فشل السداد',
        className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      };
    default:
      return {
        label: status,
        className: 'bg-[var(--mn-page)] text-[var(--mn-text-muted)] border-[var(--mn-border)]',
      };
  }
}

const TECHNICAL_REQUEST_KEYS = new Set([
  'financeInvoiceId',
  'financeInvoicePublicId',
  'serviceId',
  'requestId',
  'providerReferenceId',
  'studentReferenceId',
  'actionInstructions',
  'instructions',
]);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ServiceRequestsView({
  requests,
  serviceLoading,
  serviceError,
  invoiceError,
  onRetry,
  statusFilter,
  onStatusFilterChange,
  totalRequests,
  selected,
  requestedNotFoundId,
  saving,
  onOpen,
  invoices,
  paymentsByInvoice,
  onTogglePayments,
}: {
  requests: StudentServiceRequestDto[];
  serviceLoading: boolean;
  serviceError: string | null;
  invoiceError: string | null;
  onRetry: () => void;
  statusFilter: string;
  onStatusFilterChange: (nextStatus: string) => void;
  totalRequests: number;
  selected: StudentServiceRequestDto | null;
  requestedNotFoundId?: string | null;
  saving: boolean;
  onOpen: (id: string) => void;
  invoices: StudentFinanceInvoiceDto[];
  paymentsByInvoice: Record<string, StudentFinancePaymentDto[]>;
  onTogglePayments: (invoiceId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'INVOICES'>('REQUESTS');
  useEffect(() => { if (selected) setActiveTab('REQUESTS'); }, [selected?.id]);

  const pendingCount = useMemo(
    () => requests.filter((request) => !['COMPLETED', 'FULFILLED', 'RESOLVED', 'CANCELLED', 'REJECTED'].includes(request.status.toUpperCase())).length,
    [requests],
  );

  const matchedInvoice = useMemo(() => {
    if (!selected) return undefined;
    return invoices.find(
      (inv) =>
        (selected.financeInvoiceId && inv.id === selected.financeInvoiceId) ||
        (selected.financeInvoicePublicId && inv.publicId === selected.financeInvoicePublicId),
    );
  }, [selected, invoices]);

  // A directly linked, authorized request must remain inspectable even if it is
  // absent from the currently fetched/filtered request page.
  const hasAnyRequestsOrInvoices = requests.length > 0 || invoices.length > 0 || Boolean(selected) || Boolean(requestedNotFoundId) || Boolean(invoiceError);

  return (
    <div className="mt-0 space-y-4" aria-busy={serviceLoading}>
      {/* Header box attached directly to the 8-tab bar above and stretched edge-to-edge right & left */}
      <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mt-px">
        <section
          aria-label="طلباتي ومدفوعاتي"
          className="mn-student-services-hero relative overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] shadow-2xs mn-panel font-['Cairo',sans-serif]"
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
                  <ClipboardList className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />
                </span>
                <h2 className="mn-student-services-heading text-[14px] sm:text-[15px] font-bold leading-tight text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                  طلباتي ومدفوعاتي
                </h2>
              </div>

              <Link
                to="/services"
                className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#142B5F] hover:bg-[#1a3675] px-3 py-1 text-[11.5px] font-bold font-['Cairo',sans-serif] text-[#F2CD78] shadow-2xs transition-colors border border-[#D6A43B]/40"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
                <span>استكشف الخدمات</span>
              </Link>
            </div>

            <p className="mt-2.5 text-[11.5px] sm:text-[12px] font-medium leading-[1.75] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
              تابع حالة طلبات الخدمات الأكاديمية والاستشارية الخاصة بك، واستعرض الفواتير والدفعات والملفات المستلمة.
            </p>
          </div>
        </section>

        <nav
          aria-label="تصفية الطلبات والفواتير"
          className="-mt-px grid grid-cols-3 divide-x divide-x-reverse divide-[var(--mn-border)] dark:divide-white/10 rounded-b-2xl border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] overflow-hidden shadow-2xs"
        >
          {[
            { label: 'طلبات معروضة', number: requests.length, tab: 'REQUESTS' as const, key: 'all-req' },
            { label: 'قيد المتابعة', number: pendingCount, tab: 'REQUESTS' as const, key: 'pending-req' },
            { label: 'فواتير معروضة', number: invoices.length, tab: 'INVOICES' as const, key: 'invoices' },
          ].map((stat) => {
            const active = activeTab === stat.tab && (stat.key !== 'pending-req');
            return (
              <button
                key={stat.key}
                type="button"
                aria-label={`${stat.label}: ${stat.number}، عرض التفاصيل`}
                onClick={() => setActiveTab(stat.tab)}
                className={`flex min-h-12 items-center justify-center gap-1.5 px-2 py-2 text-center transition-all cursor-pointer font-['Cairo',sans-serif] ${
                  active
                    ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white shadow-inner font-bold'
                    : 'bg-transparent text-[#1E293B] dark:text-[#F1F5F9] font-semibold hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
                }`}
              >
                <span className="whitespace-normal break-words text-[11px] sm:text-[12px] leading-[1.35]">{stat.label} ({stat.number})</span>
              </button>
            );
          })}
        </nav>
      </div>

      <section
        aria-label="تصفية طلبات الخدمات"
        className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-3.5 shadow-2xs mn-panel dark:border-white/10 sm:px-5 sm:py-4 font-['Cairo',sans-serif]"
      >
        <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/40 bg-[#142B5F] dark:bg-[#0c1a3b]">
              <Settings2 className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
            </span>
            <h3 className="text-[12.5px] sm:text-[13px] font-bold font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
              تصفية الطلبات
            </h3>
          </div>
          <span role="status" className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-2 py-0.5 text-[10.5px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
            {totalRequests === requests.length ? `${requests.length} طلب` : `عرض ${requests.length} من ${totalRequests} طلب`}
          </span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="min-w-[185px] flex-1 text-[11.5px] font-bold font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC] sm:max-w-[320px]">
            حالة الطلب
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
              className="mt-1.5 block min-h-9 w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-1.5 text-[11.5px] font-medium font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC] outline-none transition-colors focus:border-[#0E7C86] dark:bg-[var(--mn-surface-elevated)]"
            >
              <option value="" className="font-['Cairo',sans-serif] text-[11.5px]">جميع الحالات</option>
              {['REQUESTED','ACCEPTED','IN_PROGRESS','AWAITING_PAYMENT','COMPLETED','CANCELLED'].map((status) => (
                <option key={status} value={status} className="font-['Cairo',sans-serif] text-[11.5px]">{getServiceRequestStatusBadge(status).label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {hasAnyRequestsOrInvoices && (
        <nav
          aria-label="عرض طلبات الخدمات والفواتير"
          className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] grid grid-cols-2 divide-x divide-x-reverse divide-[var(--mn-border)] dark:divide-white/10 rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] overflow-hidden shadow-2xs font-['Cairo',sans-serif]"
        >
          <button
            type="button"
            onClick={() => setActiveTab('REQUESTS')}
            aria-pressed={activeTab === 'REQUESTS'}
            className={`min-h-11 min-w-0 px-2 py-2 text-[12px] font-bold leading-[1.4] font-['Cairo',sans-serif] transition-colors cursor-pointer ${
              activeTab === 'REQUESTS'
                ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white shadow-inner'
                : 'bg-transparent text-[#1E293B] dark:text-[#F1F5F9] hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
            }`}
          >
            طلبات الخدمات ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('INVOICES')}
            aria-pressed={activeTab === 'INVOICES'}
            className={`min-h-11 min-w-0 px-2 py-2 text-[12px] font-bold leading-[1.4] font-['Cairo',sans-serif] transition-colors cursor-pointer ${
              activeTab === 'INVOICES'
                ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white shadow-inner'
                : 'bg-transparent text-[#1E293B] dark:text-[#F1F5F9] hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
            }`}
          >
            الفواتير والمدفوعات ({invoices.length})
          </button>
        </nav>
      )}

      {serviceError && (
        <div className="space-y-2" role="alert">
          <Alert tone="error" message={serviceError} />
          <button type="button" onClick={onRetry} className="inline-flex min-h-9 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 py-1.5 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
            إعادة تحميل الطلبات
          </button>
        </div>
      )}
      {invoiceError && (
        <div className="space-y-2">
          <Alert tone="error" message={invoiceError} />
          <button type="button" onClick={onRetry} className="inline-flex min-h-9 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 py-1.5 text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
            إعادة تحميل الفواتير
          </button>
        </div>
      )}

      {/* Loading doesn't unmount the main view, so the active tab stays selected. */}
      {serviceLoading && (
        <p role="status" className="rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] px-3 py-2 text-[11px] font-semibold text-[var(--mn-text-muted)]">
          جارٍ تحديث الطلبات…
        </p>
      )}

      {/* 3. Main Content View */}
      {serviceLoading && activeTab === 'REQUESTS' ? (
        <div role="status" className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 text-center text-[12px] font-semibold text-[var(--mn-text-muted)]">
          جارٍ تحميل بيانات الطلبات…
        </div>
      ) : !hasAnyRequestsOrInvoices && serviceError ? (
        <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 text-center text-[12px] text-[var(--mn-text-muted)]">
          تعذر جلب الطلبات حاليًا. يمكنك إعادة المحاولة دون فقدان اختيارك.
        </div>
      ) : !hasAnyRequestsOrInvoices ? (
        <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-5 sm:p-7 text-center mn-panel shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#142B5F] dark:bg-[#0c1a3b] border border-[#D6A43B]/40 flex items-center justify-center text-[#F2CD78] mx-auto mb-3 shadow-xs">
            <ClipboardList className="w-5 h-5 text-[#F2CD78]" />
          </div>
          <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">{statusFilter ? 'لا توجد طلبات مطابقة للحالة المختارة' : 'لا توجد طلبات خدمات أو فواتير مسجلة'}</h3>
          <p className="mt-1.5 text-[11px] leading-[1.8] text-[var(--mn-text-muted)]">
            {statusFilter ? 'اختر «جميع الحالات» لعرض الطلبات الأخرى، أو تصفح دليل الخدمات.' : 'يمكنك استكشاف الخدمات الأكاديمية والاستشارية، وستظهر طلباتك وفواتيرك هنا عند توفرها.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/services"
              className="px-3.5 py-2 rounded-xl bg-[#142B5F] text-white text-[11.5px] font-bold hover:bg-[#1a3675] transition-all shadow-2xs inline-flex items-center gap-2 border border-[#D6A43B]/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F2CD78]" />
              <span>استكشف دليل الخدمات والاستشارات</span>
            </Link>
          </div>
        </div>
      ) : activeTab === 'REQUESTS' ? (
        requests.length === 0 && !selected && !requestedNotFoundId ? (
          <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-5 text-center mn-panel">
            <ClipboardList className="w-7 h-7 mx-auto text-[#0E7C86] mb-1.5" />
            <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">{serviceError ? 'تعذر تحميل طلباتك حاليًا' : statusFilter ? 'لا توجد طلبات مطابقة للحالة المختارة' : 'لا توجد طلبات خدمات معروضة حاليًا'}</h3>
            <p className="mt-1 text-[11px] leading-[1.8] text-[var(--mn-text-muted)]">
              {serviceError
                ? 'يمكنك إعادة تحميل الطلبات من الزر أعلاه. ستبقى الفواتير المحمّلة متاحة هنا.'
                : 'يمكنك اختيار حالة أخرى أو الاطلاع على الفواتير والمدفوعات أو تقديم طلب جديد عبر دليل الخدمات.'}
            </p>
            <Link
              to="/services"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142B5F] text-white text-[11.5px] font-bold hover:bg-[#1a3675] transition-all border border-[#D6A43B]/40"
            >
              <span>دليل الخدمات</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Requests List Section */}
            <ServiceSectionCard title="سجل الطلبات المقدمة" icon={<ClipboardList className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />} count={`${requests.length} طلب`}>

              <div className="space-y-2.5">
                {requests.length === 0 && (
                  <p className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-3 text-[11.5px] leading-[1.8] text-[var(--mn-text-muted)]">
                    لا توجد طلبات في القائمة المعروضة حاليًا. يمكنك مراجعة تفاصيل الطلب المفتوح بالأسفل.
                  </p>
                )}
                {requests.map((request) => {
                  const statusInfo = getServiceRequestStatusBadge(request.status);
                  const isSelected = selected?.id === request.id || selected?.publicId === request.publicId;
                  const hasDirectInvoice = !!(
                    (request.financeInvoiceId && invoices.some((i) => i.id === request.financeInvoiceId)) ||
                    (request.financeInvoicePublicId && invoices.some((i) => i.publicId === request.financeInvoicePublicId))
                  );

                  return (
                    <button
                      key={request.id}
                      type="button"
                      disabled={saving}
                      aria-pressed={isSelected}
                      aria-label={`عرض تفاصيل طلب الخدمة رقم ${request.publicId || request.id}`}
                      onClick={() => onOpen(request.publicId || request.id)}
                      className={`w-full min-w-0 text-right rounded-xl border p-3.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#D6A43B] bg-[var(--mn-page)] ring-1 ring-[#D6A43B]/40 shadow-xs dark:bg-[var(--mn-surface-elevated)]'
                          : 'border-[var(--mn-border)] bg-[var(--mn-page)] hover:border-[#D6A43B]/40 dark:border-white/10 dark:bg-[var(--mn-surface-elevated)]'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#142B5F] dark:bg-[#0c1a3b] border border-[#D6A43B]/30 flex items-center justify-center text-[#E5B54F] shrink-0">
                            <ClipboardList className="w-3.5 h-3.5 text-[#E5B54F]" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12px] sm:text-[12.5px] font-bold leading-snug text-[var(--mn-heading)] break-words">
                              طلب خدمة رقم #{request.publicId}
                            </div>
                            <div className="text-[10.5px] text-[var(--mn-text-muted)] mt-0.5">
                              تاريخ التقديم: {formatDate(request.createdAt)}
                            </div>
                          </div>
                        </div>

                        <span className={`max-w-full rounded-full border px-2 py-0.5 text-[10px] font-bold leading-[1.7] ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {hasDirectInvoice && (
                        <div className="mt-2.5 pt-2 border-t border-[var(--mn-border)] dark:border-white/10 flex items-center justify-end text-[10px] text-[#B38018] dark:text-[#E5B54F] font-semibold">
                          <span className="inline-flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            <span>مرتبط بفاتورة معتمدة</span>
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ServiceSectionCard>

            {/* Right Column: Selected Request Details */}
            <div>
              {selected ? (
                <ServiceSectionCard title="تفاصيل الطلب المحدد" icon={<FileText className="h-4 w-4 text-[#E5B54F]" aria-hidden="true" />}>
                  <div className="space-y-5">
                  {/* Top Details Header */}
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 border-b border-[var(--mn-border)] pb-4 dark:border-white/10">
                    <div>
                      <h4 className="text-[12px] sm:text-[12.5px] font-bold leading-[1.45] text-[var(--mn-heading)] break-words">
                        طلب خدمة رقم <span className="text-[#B78622] dark:text-[#E5B54F]">#{selected.publicId}</span>
                      </h4>
                      <div className="text-[10.5px] text-[var(--mn-text-muted)] mt-0.5">
                        تاريخ الإنشاء: {formatDate(selected.createdAt)} · آخر تحديث: {formatDate(selected.updatedAt)}
                      </div>
                    </div>

                    <span className={`self-start sm:self-center text-xs font-bold px-3 py-1 rounded-full border ${getServiceRequestStatusBadge(selected.status).className}`}>
                      {getServiceRequestStatusBadge(selected.status).label}
                    </span>
                  </div>

                  {/* Action Required Banner if applicable */}
                  {(selected.status.toUpperCase() === 'ACTION_REQUIRED' || selected.status.toUpperCase() === 'NEEDS_INPUT') && (
                    <div className="rounded-xl bg-[var(--mn-warning-soft)] border border-[var(--mn-warning-border)] p-3.5 text-xs text-[var(--mn-warning-text)] flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">يتطلب هذا الطلب إجراءً منك</div>
                        {selected.fulfillmentMetadata && (selected.fulfillmentMetadata.instructions || selected.fulfillmentMetadata.actionInstructions) ? (
                          <div className="mt-1 leading-relaxed text-[11px]">
                            {String(selected.fulfillmentMetadata.instructions || selected.fulfillmentMetadata.actionInstructions)}
                          </div>
                        ) : (
                          <div className="mt-0.5 leading-relaxed text-[11px]">
                            يرجى مراجعة تفاصيل وملاحظات الطلب لاستكمال المعالجة أو التواصل مع الدعم الأكاديمي.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Structured Request Parameters (Human-friendly, No raw JSON, No technical UUIDs) */}
                  <div>
                    <h4 className="mb-2.5 flex items-center gap-1.5 text-[12px] font-bold text-[var(--mn-heading)]">
                      <Info className="w-3.5 h-3.5 text-[#D6A43B]" />
                      <span>بيانات ومعايير الطلب المسجلة</span>
                    </h4>

                    {selected.requestParameters && Object.keys(selected.requestParameters).length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(selected.requestParameters)
                          .filter(([key, value]) => !TECHNICAL_REQUEST_KEYS.has(key) && !UUID_PATTERN.test(String(value)))
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-2.5 text-xs"
                            >
                              <div className="text-[10.5px] font-semibold text-[var(--mn-text-muted)]">
                                {formatParameterKey(key)}
                              </div>
                              <div className="font-bold text-[var(--mn-heading)] mt-0.5 break-words">
                                {formatParameterValue(value)}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-3 text-xs text-[var(--mn-text-muted)]">
                        لا توجد معايير إضافية مدخلة لهذا الطلب.
                      </div>
                    )}
                  </div>

                  {/* Actual Real Timestamps Timeline */}
                  <div>
                    <h4 className="mb-2.5 flex items-center gap-1.5 text-[12px] font-bold text-[var(--mn-heading)]">
                      <CalendarClock className="w-3.5 h-3.5 text-[#D6A43B]" />
                      <span>سجل المواعيد والتوثيق</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] flex items-center justify-between">
                        <span className="text-[var(--mn-text-muted)]">تاريخ تقديم الطلب:</span>
                        <span className="font-bold text-[var(--mn-heading)]">{formatDate(selected.createdAt)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] flex items-center justify-between">
                        <span className="text-[var(--mn-text-muted)]">آخر تحديث من النظام:</span>
                        <span className="font-bold text-[var(--mn-heading)]">{formatDate(selected.updatedAt)}</span>
                      </div>
                      {selected.completedAt && (
                        <div className="p-2.5 rounded-xl border border-[var(--mn-success-border)] bg-[var(--mn-success-soft)] flex items-center justify-between">
                          <span className="text-[var(--mn-success-text)] font-semibold">تاريخ إتمام الخدمة:</span>
                          <span className="font-bold text-[var(--mn-success-text)]">{formatDate(selected.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Linked Invoice if directly and strictly verified */}
                  {matchedInvoice && (
                    <div className="rounded-xl border border-[#D6A43B]/40 bg-gradient-to-br from-[var(--mn-surface)] to-[var(--mn-page)] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#142B5F] dark:bg-[#0c1a3b] border border-[#D6A43B]/30 flex items-center justify-center text-[#E5B54F]">
                            <Receipt className="w-3.5 h-3.5 text-[#E5B54F]" />
                          </div>
                          <div>
                            <div className="text-[13px] font-bold leading-[1.65] text-[var(--mn-heading)] break-words">
                              فاتورة مرتبطة #{matchedInvoice.invoiceNumber || matchedInvoice.publicId}
                            </div>
                            <div className="text-[10px] text-[var(--mn-text-muted)]">
                              تاريخ الإصدار: {formatDate(matchedInvoice.issuedAt || matchedInvoice.updatedAt)}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getInvoiceStatusBadge(matchedInvoice.status).className}`}>
                          {getInvoiceStatusBadge(matchedInvoice.status).label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--mn-border)]">
                        <div className="p-2 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)]">
                          <div className="text-[10px] text-[var(--mn-text-muted)]">إجمالي المبلغ:</div>
                          <div className="text-xs font-bold text-[var(--mn-heading)] mt-0.5">
                            {formatMoney(matchedInvoice.totalAmount)}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)]">
                          <div className="text-[10px] text-[var(--mn-text-muted)]">المبلغ المستحق:</div>
                          <div className="text-xs font-bold text-[#D6A43B] mt-0.5">
                            {formatMoney(matchedInvoice.amountDue)}
                          </div>
                        </div>
                      </div>

                      {matchedInvoice.dueDate && (
                        <div className="text-[10.5px] text-[var(--mn-text-muted)] flex items-center gap-1">
                          <span>تاريخ الاستحقاق:</span>
                          <strong>{formatDate(matchedInvoice.dueDate)}</strong>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onTogglePayments(matchedInvoice.id)}
                        aria-expanded={Boolean(paymentsByInvoice[matchedInvoice.id])}
                        className="w-full text-center py-1.5 rounded-lg border border-[var(--mn-border)] text-xs font-bold text-[var(--mn-primary)] hover:bg-[var(--mn-page)] transition-colors cursor-pointer"
                      >
                        {paymentsByInvoice[matchedInvoice.id] ? 'إخفاء سجل الدفعات' : 'عرض سجل الدفعات'}
                      </button>

                      {paymentsByInvoice[matchedInvoice.id] && (
                        <div className="space-y-1.5 pt-2 border-t border-[var(--mn-border)]">
                          {paymentsByInvoice[matchedInvoice.id].length === 0 ? (
                            <div className="text-xs text-[var(--mn-text-muted)] text-center py-1">
                              لا توجد عمليات دفع مسجلة حتى الآن.
                            </div>
                          ) : (
                            paymentsByInvoice[matchedInvoice.id].map((payment) => (
                              <div
                                key={payment.id}
                                className="p-2 rounded-lg bg-[var(--mn-surface)] border border-[var(--mn-border)] flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="font-bold text-[var(--mn-heading)]">{formatMoney(payment.amount)}</div>
                                  <div className="text-[10px] text-[var(--mn-text-muted)]">{formatDate(payment.createdAt)} · {payment.paymentMethod}</div>
                                </div>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${['CAPTURED', 'SUCCESS', 'PAID'].includes(payment.status.toUpperCase()) ? 'bg-[var(--mn-success-soft)] text-[var(--mn-success-text)] border-[var(--mn-success-border)]' : getInvoiceStatusBadge(payment.status).className}`}>
                                  {['CAPTURED', 'SUCCESS', 'PAID'].includes(payment.status.toUpperCase()) ? 'ناجحة' : getInvoiceStatusBadge(payment.status).label}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                </ServiceSectionCard>
              ) : requestedNotFoundId ? (
                <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-amber-500/30 bg-amber-500/10 p-6 text-center mn-panel">
                  <AlertTriangle className="w-8 h-8 mx-auto text-amber-600 dark:text-amber-400 mb-2" />
                  <h3 className="text-[14px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">الطلب المطلوب غير موجود أو غير مصرّح بعرضه</h3>
                  <p className="text-xs text-[var(--mn-text-muted)] mt-1.5 max-w-xs mx-auto leading-relaxed">
                    المعرّف المُدخل <span className="font-mono font-bold">#{requestedNotFoundId}</span> لا يطابق أي طلب في سجلك المصرح به. يمكنك اختيار أحد طلباتك من القائمة أعلاه.
                  </p>
                </div>
              ) : (
                <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-5 text-center mn-panel">
                  <ClipboardList className="w-7 h-7 mx-auto text-[#0E7C86] mb-1.5" />
                  <h3 className="text-[12.5px] sm:text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">اختر طلبًا لعرض تفاصيله</h3>
                  <p className="text-[11px] text-[var(--mn-text-muted)] mt-1 max-w-xs mx-auto">
                    اضغط على أي طلب من السجل أعلاه للاطلاع على تفاصيل المعايير والمواعيد والفاتورة المرتبطة.
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* Invoices Full Section */
        <ServiceSectionCard title="سجل الفواتير والمدفوعات" icon={<Receipt className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />} count={`${invoices.length} فاتورة`}>

          {invoices.length === 0 ? (
            <div className="rounded-2xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-6 text-center mn-panel">
              <CreditCard className="w-8 h-8 mx-auto text-[var(--mn-text-muted)] mb-2" />
              <h4 className="text-[14px] font-bold text-[var(--mn-heading)]">{invoiceError ? 'تعذر تحميل الفواتير حاليًا' : 'لا توجد فواتير أو مدفوعات مسجلة بحسابك'}</h4>
              <p className="text-[11px] leading-[1.85] text-[var(--mn-text-muted)] mt-1 max-w-sm mx-auto">
                {invoiceError ? 'أعد المحاولة من زر إعادة تحميل الفواتير أعلاه.' : 'عند طلب خدمات مدفوعة أو استشارات خاصة ستظهر فواتيرك وإيصالات السداد هنا.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {invoices.map((invoice) => {
                const statusInfo = getInvoiceStatusBadge(invoice.status);
                const hasPayments = !!paymentsByInvoice[invoice.id];

                return (
                  <div
                    key={invoice.id}
                    className="min-w-0 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-3.5 flex flex-col justify-between transition-colors hover:border-[#D6A43B]/40 dark:border-white/10 dark:bg-[var(--mn-surface-elevated)]"
                  >
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#142B5F] dark:bg-[#0c1a3b] border border-[#D6A43B]/30 flex items-center justify-center text-[#E5B54F]">
                            <Receipt className="w-3.5 h-3.5 text-[#E5B54F]" />
                          </div>
                          <div>
                            <div className="text-[12px] sm:text-[12.5px] font-bold leading-[1.45] text-[var(--mn-heading)] break-words">
                              فاتورة #{invoice.invoiceNumber || invoice.publicId}
                            </div>
                            <div className="text-[10px] text-[var(--mn-text-muted)]">
                              تاريخ الإصدار: {formatDate(invoice.issuedAt || invoice.updatedAt)}
                            </div>
                          </div>
                        </div>

                        <span className={`max-w-full rounded-full border px-2 py-0.5 text-[10px] font-bold leading-[1.7] ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--mn-border)]">
                        <div className="p-2 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)]">
                          <div className="text-[10px] text-[var(--mn-text-muted)]">إجمالي الفاتورة:</div>
                          <div className="text-xs font-bold text-[var(--mn-heading)] mt-0.5">
                            {formatMoney(invoice.totalAmount)}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)]">
                          <div className="text-[10px] text-[var(--mn-text-muted)]">المتبقي للدفع:</div>
                          <div className="text-xs font-bold text-[#D6A43B] mt-0.5">
                            {formatMoney(invoice.amountDue)}
                          </div>
                        </div>
                      </div>

                      {invoice.dueDate && (
                        <div className="mt-2 text-[10.5px] text-[var(--mn-text-muted)]">
                          تاريخ الاستحقاق: <strong>{formatDate(invoice.dueDate)}</strong>
                        </div>
                      )}

                      {invoice.lineItems && invoice.lineItems.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          <div className="text-[10px] font-bold text-[var(--mn-heading)]">بنود الفاتورة:</div>
                          {invoice.lineItems.map((item, idx) => (
                            <div key={idx} className="flex flex-wrap items-start justify-between gap-1.5 text-[11px] leading-[1.7] text-[var(--mn-text-muted)]">
                              <span>{item.description}</span>
                              <span className="shrink-0 text-[11px] font-semibold text-[var(--mn-heading)]">{formatMoney(item.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--mn-border)]">
                      <button
                        type="button"
                        onClick={() => onTogglePayments(invoice.id)}
                        aria-expanded={Boolean(paymentsByInvoice[invoice.id])}
                        className="w-full text-center py-1.5 rounded-xl border border-[var(--mn-border)] text-xs font-bold text-[var(--mn-primary)] hover:bg-[var(--mn-page)] transition-colors cursor-pointer"
                      >
                        {hasPayments ? 'إخفاء سجل المعاملات' : 'عرض سجل عمليات الدفع'}
                      </button>

                      {hasPayments && (
                        <div className="space-y-1.5 mt-2 pt-2 border-t border-[var(--mn-border)]">
                          {paymentsByInvoice[invoice.id].length === 0 ? (
                            <div className="text-xs text-[var(--mn-text-muted)] text-center py-1">
                              لا توجد عمليات دفع مسجلة لهذه الفاتورة.
                            </div>
                          ) : (
                            paymentsByInvoice[invoice.id].map((payment) => (
                              <div
                                key={payment.id}
                                className="p-2 rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="font-bold text-[var(--mn-heading)]">{formatMoney(payment.amount)}</div>
                                  <div className="text-[10px] text-[var(--mn-text-muted)]">{formatDate(payment.createdAt)} · {payment.paymentMethod}</div>
                                </div>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${['CAPTURED', 'SUCCESS', 'PAID'].includes(payment.status.toUpperCase()) ? 'bg-[var(--mn-success-soft)] text-[var(--mn-success-text)] border-[var(--mn-success-border)]' : getInvoiceStatusBadge(payment.status).className}`}>
                                  {['CAPTURED', 'SUCCESS', 'PAID'].includes(payment.status.toUpperCase()) ? 'ناجحة' : getInvoiceStatusBadge(payment.status).label}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ServiceSectionCard>
      )}
      {activeTab === 'REQUESTS' && selected && !serviceLoading && (
        <StudentServiceBookingPanel requestId={selected.id} />
      )}
    </div>
  );
}

/** Stretched edge-to-edge section matching Summary and Opportunities. */
function ServiceSectionCard({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="mn-student-services-section relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] min-w-0 overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] bg-[var(--mn-surface)] py-3.5 shadow-2xs mn-panel dark:border-white/10 sm:py-4 font-['Cairo',sans-serif]"
    >
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 px-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#D6A43B]/75 bg-[#142B5F] text-[#F2CD78] shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
            <span className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-md bg-[#D6A43B]" />
            <span className="relative z-10">{icon}</span>
          </span>
          <h3 className="inline-block border-b-2 border-[#D6A43B] pb-0.5 min-w-0 text-[14px] sm:text-[15px] font-bold leading-snug font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
            {title}
          </h3>
        </div>
        {count && (
          <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
            {count}
          </span>
        )}
      </div>
      <div className="px-3.5 sm:px-5">{children}</div>
    </section>
  );
}


function VaultView({
  dashboard,
  hydratedSavedItems,
  saving,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onMoveSavedItem,
  onRemoveSavedItem,
  setTab,
}: {
  dashboard: StudentDashboardSummaryDto;
  hydratedSavedItems: HydratedStudentSavedItemDto[];
  saving: boolean;
  onCreateCollection: (event: FormEvent<HTMLFormElement>) => void;
  onRenameCollection: (collectionId: string, currentName: string) => void;
  onDeleteCollection: (collectionId: string, name: string) => void;
  onMoveSavedItem: (itemId: string, collectionId: string | null) => void;
  onRemoveSavedItem: (item: StudentSavedItemDto) => void;
  setTab?: (tab: CanonicalWorkspaceTab) => void;
}) {
  const { language } = useTranslation();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [collectionFilter, setCollectionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [showCreateInline, setShowCreateInline] = useState(false);
  const [movingItem, setMovingItem] = useState<StudentSavedItemDto | null>(null);

  const savedItems = dashboard.savedItems;
  const collections = dashboard.collections;
  const hydratedBySavedItemId = useMemo(
    () => new Map(hydratedSavedItems.map((item) => [item.savedItem.id, item.owner])),
    [hydratedSavedItems],
  );

  useEffect(() => {
    if (
      collectionFilter !== 'ALL' &&
      collectionFilter !== 'UNCOLLECTED' &&
      !collections.some((collection) => collection.id === collectionFilter)
    ) {
      setCollectionFilter('ALL');
    }
  }, [collections, collectionFilter]);

  const getSavedTitle = React.useCallback(
    (item: StudentSavedItemDto): string => {
      const owner = hydratedBySavedItemId.get(item.id);
      const toolTitles: Record<string, string> = {
        'gpa-calculator': 'حاسبة المعدل التراكمي',
        'university-comparison': 'مقارنة الجامعات',
        'motivation-letter-generator': 'خطاب الدافع',
        'scholarship-recommendation': 'توصية المنح',
      };
      return (
        (item.entityType === 'STUDENT_TOOL' && owner?.visibility === 'STUDENT_PRIVATE'
          ? language === 'en'
            ? 'Retained private tool result'
            : 'نتيجة أداة محفوظة خاصة'
          : owner?.displayName) ||
        item.displayName ||
        (item.entityType === 'STUDENT_TOOL' ? toolTitles[item.entitySlug ?? ''] : undefined) ||
        item.entityId
      );
    },
    [hydratedBySavedItemId, language],
  );

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: savedItems.length };
    savedItems.forEach((item) => {
      counts[item.entityType] = (counts[item.entityType] || 0) + 1;
    });
    return counts;
  }, [savedItems]);

  const VAULT_TYPES = [
    { id: 'SCHOLARSHIP', label: 'المنح' },
    { id: 'UNIVERSITY', label: 'الجامعات' },
    { id: 'MAJOR', label: 'التخصصات' },
    { id: 'COURSE', label: 'الدورات' },
    { id: 'INTERNATIONAL_TEST', label: 'الاختبارات الدولية' },
    { id: 'CERTIFICATE', label: 'الشهادات' },
    { id: 'CMS_CONTENT', label: 'المقالات والمحتوى' },
    { id: 'SERVICE', label: 'الخدمات' },
    { id: 'STUDENT_TOOL', label: 'أدوات الطالب' },
  ] as const;

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return savedItems.filter((item) => {
      if (typeFilter !== 'ALL' && item.entityType !== typeFilter) return false;
      if (collectionFilter === 'UNCOLLECTED' && item.collectionId) return false;
      if (
        collectionFilter !== 'ALL' &&
        collectionFilter !== 'UNCOLLECTED' &&
        item.collectionId !== collectionFilter
      )
        return false;
      if (
        query &&
        !getSavedTitle(item).toLocaleLowerCase().includes(query) &&
        !arabicEntityType(item.entityType).toLocaleLowerCase().includes(query)
      )
        return false;
      return true;
    });
  }, [savedItems, typeFilter, collectionFilter, searchQuery, getSavedTitle]);

  const getEntityIcon = (type: string, customClass = 'h-4 w-4 text-[#E5B54F]') => {
    switch (type) {
      case 'SCHOLARSHIP':
        return <GraduationCap className={customClass} aria-hidden="true" />;
      case 'UNIVERSITY':
        return <Compass className={customClass} aria-hidden="true" />;
      case 'MAJOR':
        return <BookOpen className={customClass} aria-hidden="true" />;
      case 'COURSE':
        return <Clock3 className={customClass} aria-hidden="true" />;
      case 'INTERNATIONAL_TEST':
        return <ClipboardList className={customClass} aria-hidden="true" />;
      case 'CERTIFICATE':
        return <Award className={customClass} aria-hidden="true" />;
      case 'CMS_CONTENT':
        return <FileText className={customClass} aria-hidden="true" />;
      case 'SERVICE':
        return <Receipt className={customClass} aria-hidden="true" />;
      case 'STUDENT_TOOL':
        return <Sparkles className={customClass} aria-hidden="true" />;
      default:
        return <Star className={customClass} aria-hidden="true" />;
    }
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    onCreateCollection(event);
    setShowCreateModal(false);
    setShowCreateInline(false);
  };

  const isAllActive = typeFilter === 'ALL' && collectionFilter === 'ALL';
  const isFilterActive = typeFilter !== 'ALL';
  const isCollectionActive = collectionFilter !== 'ALL';

  const activeTypeObj = VAULT_TYPES.find((t) => t.id === typeFilter);
  const selectedCollection = collections.find((c) => c.id === collectionFilter);
  const activeCollectionLabel =
    collectionFilter === 'UNCOLLECTED'
      ? 'دون مجموعة'
      : selectedCollection?.name || 'محددة';
  const uncollectedCount = useMemo(
    () => savedItems.filter((i) => !i.collectionId).length,
    [savedItems],
  );

  return (
    <div className="mn-student-vault-page mt-0 space-y-4 font-['Cairo',sans-serif]">
      {/* Header box attached directly to the 8-tab bar above and stretched edge-to-edge right & left */}
      <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mt-px">
        <section
          aria-label="محفوظاتي ومجموعاتي"
          className="mn-student-vault-hero relative overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] shadow-2xs mn-panel font-['Cairo',sans-serif]"
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
                  <Heart className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />
                </span>
                <h2 className="mn-student-vault-heading text-[14px] sm:text-[15px] font-bold leading-tight text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                  محفوظاتي ومجموعاتي
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2.5 py-1 text-[11px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
                  {savedItems.length} محفوظات
                </span>
                <Link
                  to="/scholarships"
                  className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg bg-[#142B5F] hover:bg-[#163D76] px-3 py-1 text-[11.5px] font-bold text-[#F2CD78] border border-[#D6A43B]/40 transition-all shadow-2xs font-['Cairo',sans-serif]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
                  <span>استكشف المنح</span>
                </Link>
              </div>
            </div>

            <p className="mt-2.5 text-[11.5px] sm:text-[12px] font-medium leading-[1.75] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
              احتفظ بالمنح والجامعات والدورات والفرص التي تهمك في مجموعات منظمة للرجوع إليها ومقارنتها في أي وقت.
            </p>
          </div>
        </section>

        {/* Quick filter bar outside the header box, attached from the top and stretched edge-to-edge */}
        <nav
          aria-label="تصفية سريعة للمحفوظات"
          className="-mt-px grid grid-cols-3 divide-x divide-x-reverse divide-[var(--mn-border)] dark:divide-white/10 rounded-b-2xl border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] overflow-hidden shadow-2xs"
        >
          {[
            { label: 'جميع المحفوظات', count: savedItems.length, active: collectionFilter === 'ALL' && typeFilter === 'ALL', onClick: () => { setTypeFilter('ALL'); setCollectionFilter('ALL'); } },
            { label: 'دون مجموعة', count: uncollectedCount, active: collectionFilter === 'UNCOLLECTED', onClick: () => setCollectionFilter('UNCOLLECTED') },
            { label: 'مجموعاتي', count: collections.length, active: isCollectionsOpen || (collectionFilter !== 'ALL' && collectionFilter !== 'UNCOLLECTED'), onClick: () => setIsCollectionsOpen((prev) => !prev) },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={item.active}
              onClick={item.onClick}
              className={`flex min-h-12 items-center justify-center gap-1.5 px-2 py-2 text-center transition-all cursor-pointer font-['Cairo',sans-serif] ${
                item.active
                  ? 'bg-gradient-to-l from-[#142B5F] to-[#0E7C86] text-white shadow-inner font-bold'
                  : 'bg-transparent text-[#1E293B] dark:text-[#F1F5F9] font-semibold hover:bg-[var(--mn-surface)] dark:hover:bg-white/5'
              }`}
            >
              <span className="whitespace-normal break-words text-[11px] sm:text-[12px] leading-[1.35]">{item.label} ({item.count})</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Saved Items List Section stretched edge-to-edge */}
      <section
        aria-label="العناصر المحفوظة"
        className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-2xs mn-panel font-['Cairo',sans-serif]"
      >
        {/* Top Controls Container */}
        <div className="relative pb-0.5">
          <div className="mb-3 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#D6A43B]/40 bg-[#142B5F] dark:bg-[#0c1a3b]">
                <Bookmark className="h-3.5 w-3.5 text-[#F2CD78]" aria-hidden="true" />
              </span>
              <h3 className="text-[12.5px] sm:text-[13px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                العناصر المحفوظة ({filteredItems.length})
              </h3>
            </div>

            {collectionFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setCollectionFilter('ALL')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0E7C86]/40 bg-[#0E7C86]/10 px-2.5 py-1 text-[10.5px] font-bold text-[#0E7C86] dark:text-[#55CBC5] hover:bg-[#0E7C86]/15 transition-colors cursor-pointer"
              >
                <span>المجموعة: {collectionFilter === 'UNCOLLECTED' ? 'دون مجموعة' : collections.find((c) => c.id === collectionFilter)?.name || 'محددة'}</span>
                <span className="text-[11px] leading-none">✕</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Equal Independent Boxes in one row from Right to Left: 1. الكل  2. فلترة  3. مجموعاتي */}
        <div className="space-y-2.5 mb-4 font-['Cairo',sans-serif]">
          <div
            role="toolbar"
            aria-label="تصفية المحفوظات"
            className="grid grid-cols-3 gap-1.5 sm:gap-2.5"
          >
            {/* Box 1 (Right): الكل */}
            <button
              type="button"
              onClick={() => {
                setTypeFilter('ALL');
                setCollectionFilter('ALL');
                setIsFilterOpen(false);
                setIsCollectionsOpen(false);
              }}
              aria-pressed={isAllActive}
              className={`group relative flex min-h-[64px] sm:min-h-[70px] w-full flex-col items-center justify-center rounded-xl border p-1.5 sm:p-2 text-center transition-all cursor-pointer font-['Cairo',sans-serif] ${
                isAllActive
                  ? 'border-[#142B5F] bg-[#142B5F] text-white dark:border-[#D6A43B] dark:bg-[#D6A43B] dark:text-[#142B5F] shadow-2xs'
                  : 'border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] text-[var(--mn-heading)] hover:border-[#D6A43B]/60'
              }`}
            >
              <Layers
                className={`h-4 w-4 mb-1 shrink-0 ${
                  isAllActive
                    ? 'text-[#E5B54F] dark:text-[#142B5F]'
                    : 'text-[#142B5F] dark:text-[#E5B54F]'
                }`}
                aria-hidden="true"
              />
              <span className="text-[11.5px] sm:text-[13px] font-bold leading-tight">
                الكل
              </span>
              <span
                className={`text-[9.5px] sm:text-[11px] font-semibold mt-0.5 ${
                  isAllActive ? 'opacity-90' : 'text-[var(--mn-text-muted)]'
                }`}
              >
                ({savedItems.length})
              </span>
            </button>

            {/* Box 2 (Center): فلترة */}
            <button
              type="button"
              onClick={() => {
                setIsFilterOpen((prev) => !prev);
                setIsCollectionsOpen(false);
              }}
              aria-expanded={isFilterOpen}
              aria-label="قائمة فلترة نوع المحفوظات"
              className={`group relative flex min-h-[64px] sm:min-h-[70px] w-full flex-col items-center justify-center rounded-xl border p-1.5 sm:p-2 text-center transition-all cursor-pointer font-['Cairo',sans-serif] ${
                isFilterActive
                  ? 'border-[#D6A43B] bg-[#142B5F]/5 dark:bg-[#D6A43B]/15 text-[#142B5F] dark:text-[#E5B54F] ring-1 ring-[#D6A43B]/40 shadow-2xs'
                  : isFilterOpen
                  ? 'border-[#D6A43B] bg-[var(--mn-surface)] text-[var(--mn-heading)] shadow-2xs'
                  : 'border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] text-[var(--mn-heading)] hover:border-[#D6A43B]/60'
              }`}
            >
              <Filter
                className="h-4 w-4 mb-1 shrink-0 text-[#D6A43B]"
                aria-hidden="true"
              />
              <div className="flex items-center justify-center gap-1 leading-tight">
                <span className="text-[11.5px] sm:text-[13px] font-bold">
                  فلترة
                </span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 transition-transform ${
                    isFilterOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </div>
              <span
                className={`text-[9.5px] sm:text-[11px] font-semibold mt-0.5 truncate max-w-full px-0.5 ${
                  isFilterActive
                    ? 'text-[#D6A43B] dark:text-[#E5B54F] font-bold'
                    : 'text-[var(--mn-text-muted)]'
                }`}
              >
                {isFilterActive
                  ? `${activeTypeObj?.label} (${typeCounts[typeFilter] || 0})`
                  : 'حسب النوع'}
              </span>
            </button>

            {/* Box 3 (Left in RTL): مجموعاتي */}
            <button
              type="button"
              onClick={() => {
                setIsCollectionsOpen((prev) => !prev);
                setIsFilterOpen(false);
              }}
              aria-expanded={isCollectionsOpen}
              aria-label="قائمة مجموعاتي الشخصية"
              className={`group relative flex min-h-[64px] sm:min-h-[70px] w-full flex-col items-center justify-center rounded-xl border p-1.5 sm:p-2 text-center transition-all cursor-pointer font-['Cairo',sans-serif] ${
                isCollectionActive
                  ? 'border-[#0E7C86] bg-[#0E7C86]/5 dark:bg-[#0E7C86]/15 text-[#0E7C86] dark:text-[#55CBC5] ring-1 ring-[#0E7C86]/40 shadow-2xs'
                  : isCollectionsOpen
                  ? 'border-[#0E7C86] bg-[var(--mn-surface)] text-[var(--mn-heading)] shadow-2xs'
                  : 'border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] text-[var(--mn-heading)] hover:border-[#D6A43B]/60'
              }`}
            >
              <Folder
                className="h-4 w-4 mb-1 shrink-0 text-[#0E7C86] dark:text-[#55CBC5]"
                aria-hidden="true"
              />
              <div className="flex items-center justify-center gap-1 leading-tight">
                <span className="text-[11.5px] sm:text-[13px] font-bold">
                  مجموعاتي
                </span>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 transition-transform ${
                    isCollectionsOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </div>
              <span
                className={`text-[9.5px] sm:text-[11px] font-semibold mt-0.5 truncate max-w-full px-0.5 ${
                  isCollectionActive
                    ? 'text-[#0E7C86] dark:text-[#55CBC5] font-bold'
                    : 'text-[var(--mn-text-muted)]'
                }`}
              >
                {isCollectionActive
                  ? activeCollectionLabel
                  : `(${collections.length})`}
              </span>
            </button>
          </div>

          {/* Dropdown Panel for Box 2: Filter by 9 Types */}
          {isFilterOpen && (
            <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 shadow-md animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--mn-border)]/60 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--mn-heading)]">
                  <Filter className="h-3.5 w-3.5 text-[#D6A43B]" aria-hidden="true" />
                  <span>فلترة حسب نوع المحفوظات</span>
                </div>
                <div className="flex items-center gap-2">
                  {typeFilter !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => {
                        setTypeFilter('ALL');
                      }}
                      className="text-[10.5px] font-bold text-[#D6A43B] dark:text-[#E5B54F] hover:underline cursor-pointer"
                    >
                      عرض جميع الأنواع
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 rounded-md text-[var(--mn-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    aria-label="إغلاق قائمة الفلترة"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* The 9 Types Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-[300px] overflow-y-auto pr-0.5">
                {/* Reset to All Types */}
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('ALL');
                    setIsFilterOpen(false);
                  }}
                  className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    typeFilter === 'ALL'
                      ? 'bg-[#142B5F] text-white dark:bg-[#D6A43B] dark:text-[#142B5F]'
                      : 'bg-[var(--mn-surface)] border border-[var(--mn-border)]/50 text-[var(--mn-heading)] hover:border-[#D6A43B]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>جميع الأنواع</span>
                  </div>
                  <span className="text-[10px] font-semibold opacity-85">({savedItems.length})</span>
                </button>

                {/* The 9 Specific Types with exact IDs */}
                {VAULT_TYPES.map((type) => {
                  const active = typeFilter === type.id;
                  const count = typeCounts[type.id] || 0;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setTypeFilter(type.id);
                        setIsFilterOpen(false);
                      }}
                      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#142B5F] text-white dark:bg-[#D6A43B] dark:text-[#142B5F]'
                          : 'bg-[var(--mn-surface)] border border-[var(--mn-border)]/50 text-[var(--mn-heading)] hover:border-[#D6A43B]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getEntityIcon(type.id)}
                        <span className="truncate">{type.label}</span>
                      </div>
                      <span className="text-[10px] font-semibold opacity-85 shrink-0">
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dropdown Panel for Box 3: Collections (List, Create, Rename, Delete) */}
          {isCollectionsOpen && (
            <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 shadow-md animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--mn-border)]/60 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--mn-heading)]">
                  <Folder className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#55CBC5]" aria-hidden="true" />
                  <span>مجموعاتي الشخصية ({collections.length})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateInline(!showCreateInline)}
                    className="inline-flex items-center gap-1 rounded-md bg-[#142B5F] dark:bg-[#D6A43B] dark:text-[#142B5F] px-2 py-0.5 text-[10.5px] font-bold text-white hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>مجموعة جديدة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCollectionsOpen(false);
                      setShowCreateInline(false);
                    }}
                    className="p-1 rounded-md text-[var(--mn-text-muted)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    aria-label="إغلاق قائمة المجموعات"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Form to Create Collection */}
              {showCreateInline && (
                <form
                  id="mn-vault-create-collection"
                  onSubmit={handleCreateSubmit}
                  className="mb-3 rounded-lg border border-[#D6A43B]/40 bg-[var(--mn-surface)] p-2.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11.5px] font-bold text-[var(--mn-heading)]">إنشاء مجموعة جديدة</h5>
                    <button
                      type="button"
                      onClick={() => setShowCreateInline(false)}
                      className="text-[10px] text-[var(--mn-text-muted)] hover:underline cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      name="collectionName"
                      required
                      maxLength={80}
                      placeholder="اسم المجموعة (مثال: منح أوروبا 2027) *"
                      className="min-h-8 w-full rounded-md border border-[var(--mn-border)] bg-[var(--mn-page)] px-2.5 py-1 text-[11px] text-[var(--mn-heading)] outline-none focus:border-[#D6A43B]"
                    />
                    <input
                      name="collectionDescription"
                      maxLength={240}
                      placeholder="الوصف (اختياري)..."
                      className="min-h-8 w-full rounded-md border border-[var(--mn-border)] bg-[var(--mn-page)] px-2.5 py-1 text-[11px] text-[var(--mn-heading)] outline-none focus:border-[#D6A43B]"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowCreateInline(false)}
                      className="min-h-7 rounded-md border border-[var(--mn-border)] px-2.5 text-[10.5px] font-medium text-[var(--mn-text-muted)] cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="min-h-7 rounded-md bg-[#142B5F] dark:bg-[#D6A43B] dark:text-[#142B5F] px-3 text-[10.5px] font-bold text-white disabled:opacity-50 cursor-pointer"
                    >
                      حفظ المجموعة
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Filters for All / Uncollected */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-[var(--mn-border)]/40">
                <button
                  type="button"
                  onClick={() => {
                    setCollectionFilter('ALL');
                    setIsCollectionsOpen(false);
                  }}
                  className={`min-h-7 rounded-md px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                    collectionFilter === 'ALL'
                      ? 'bg-[#142B5F] text-white dark:bg-[#D6A43B] dark:text-[#142B5F] shadow-2xs'
                      : 'border border-[var(--mn-border)] bg-[var(--mn-surface)] text-[var(--mn-heading)] hover:border-[#D6A43B]'
                  }`}
                >
                  كل المجموعات ({savedItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCollectionFilter('UNCOLLECTED');
                    setIsCollectionsOpen(false);
                  }}
                  className={`min-h-7 rounded-md px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${
                    collectionFilter === 'UNCOLLECTED'
                      ? 'bg-[#142B5F] text-white dark:bg-[#D6A43B] dark:text-[#142B5F] shadow-2xs'
                      : 'border border-[var(--mn-border)] bg-[var(--mn-page)] text-[var(--mn-heading)] hover:border-[#D6A43B]'
                  }`}
                >
                  دون مجموعة ({uncollectedCount})
                </button>
              </div>

              {/* Collections List with Rename & Delete */}
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5">
                {collections.length === 0 ? (
                  <p className="p-3 text-center text-[11px] text-[var(--mn-text-muted)] bg-[var(--mn-surface)] rounded-lg border border-[var(--mn-border)]/50">
                    لا توجد مجموعات بعد. انقر على «مجموعة جديدة» لإضافة مجموعتك الأولى.
                  </p>
                ) : (
                  collections.map((collection) => {
                    const isSelected = collectionFilter === collection.id;
                    return (
                      <div
                        key={collection.id}
                        className={`group flex items-center justify-between gap-2 rounded-lg border p-2 transition-all ${
                          isSelected
                            ? 'border-[#0E7C86] bg-[#0E7C86]/10 dark:bg-[#0E7C86]/20'
                            : 'border-[var(--mn-border)]/60 bg-[var(--mn-surface)] hover:border-[#D6A43B]/60'
                        }`}
                      >
                        <div
                          onClick={() => {
                            setCollectionFilter(collection.id);
                            setIsCollectionsOpen(false);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2 cursor-pointer"
                        >
                          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Folder className="h-3.5 w-3.5 fill-amber-500/20" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[12px] font-bold text-[var(--mn-heading)] truncate font-['Cairo',sans-serif]">
                              {collection.name}
                            </h5>
                            <span className="text-[10px] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
                              {collection.itemCount} عناصر
                            </span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-[#0E7C86] dark:text-[#55CBC5] bg-[#0E7C86]/15 px-1.5 py-0.5 rounded">
                              محددة
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {collection.type === 'PERSONAL' && (
                            <>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRenameCollection(collection.id, collection.name);
                                }}
                                title="تعديل اسم المجموعة"
                                className="px-2 py-0.5 text-[10px] font-bold text-[#142B5F] dark:text-[#E5B54F] hover:underline cursor-pointer"
                              >
                                تعديل
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteCollection(collection.id, collection.name);
                                }}
                                title="حذف المجموعة"
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Search box placed below the 3 boxes & dropdown panels */}
          <div className="relative w-full">
            <input
              id="mn-vault-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في محفوظاتك..."
              className="w-full min-h-9 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-9 pl-3 text-[11px] placeholder:text-[11px] font-medium font-['Cairo',sans-serif] text-[var(--mn-heading)] outline-none focus:border-[#D6A43B] transition-colors"
            />
            <Search
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--mn-text-muted)]"
              aria-hidden="true"
            />
          </div>

          {/* Active Filters Summary Strip */}
          {(typeFilter !== 'ALL' || collectionFilter !== 'ALL' || searchQuery.trim() !== '') && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-['Cairo',sans-serif] pt-0.5">
              <span className="text-[10px] font-bold text-[var(--mn-text-muted)]">الفلاتر النشطة:</span>
              {typeFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#D6A43B]/40 bg-[#142B5F]/5 dark:bg-[#D6A43B]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#142B5F] dark:text-[#E5B54F]">
                  <span>النوع: {activeTypeObj?.label || typeFilter}</span>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('ALL')}
                    className="cursor-pointer text-[11px] hover:opacity-70"
                    title="إزالة فلتر النوع"
                  >
                    ✕
                  </button>
                </span>
              )}
              {collectionFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[#0E7C86]/40 bg-[#0E7C86]/5 dark:bg-[#0E7C86]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#0E7C86] dark:text-[#55CBC5]">
                  <span>المجموعة: {activeCollectionLabel}</span>
                  <button
                    type="button"
                    onClick={() => setCollectionFilter('ALL')}
                    className="cursor-pointer text-[11px] hover:opacity-70"
                    title="إزالة فلتر المجموعة"
                  >
                    ✕
                  </button>
                </span>
              )}
              {searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--mn-border)] bg-[var(--mn-page)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--mn-heading)]">
                  <span>بحث: «{searchQuery}»</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="cursor-pointer text-[11px] hover:opacity-70"
                    title="مسح البحث"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('ALL');
                  setCollectionFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer mr-auto"
              >
                إعادة ضبط الكل
              </button>
            </div>
          )}
        </div>
        </div>

        {savedItems.length === 0 ? (
          <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-5 text-center dark:bg-[var(--mn-surface-elevated)]">
            <Heart className="mx-auto h-7 w-7 text-[#D6A43B]" aria-hidden="true" />
            <h4 className="mt-2 text-[13px] font-bold text-[var(--mn-heading)]">
              {collections.length > 0 ? 'مجموعاتك جاهزة لاستقبال المحفوظات' : 'لا توجد عناصر محفوظة بعد'}
            </h4>
            <p className="mt-1 text-[11px] leading-[1.85] text-[var(--mn-text-muted)]">
              تصفح المنح والجامعات والدورات، واضغط رمز القلب في صفحاتها لإضافتها إلى محفوظاتك.
            </p>
            <Link
              to="/scholarships"
              className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg bg-[#142B5F] dark:bg-[#D6A43B] dark:text-[#142B5F] px-4 py-1.5 text-[12px] font-bold text-white shadow-2xs"
            >
              استكشف المنح
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-5 text-center dark:bg-[var(--mn-surface-elevated)]">
            <h4 className="text-[13px] font-bold text-[var(--mn-heading)]">لا توجد عناصر مطابقة للتصفية</h4>
            <p className="mt-1 text-[11px] leading-[1.85] text-[var(--mn-text-muted)]">
              جرّب بحثًا آخر أو اعرض جميع المحفوظات.
            </p>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('ALL');
                setCollectionFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 min-h-8 rounded-lg bg-[#142B5F] dark:bg-[#D6A43B] dark:text-[#142B5F] px-3 py-1 text-[11px] font-bold text-white cursor-pointer"
            >
              إعادة ضبط التصفية
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 font-['Cairo',sans-serif] mt-3.5">
            {filteredItems.map((item) => {
              const owner = hydratedBySavedItemId.get(item.id);
              const displayName = getSavedTitle(item);
              const slug = owner?.slug || item.entitySlug || undefined;
              const available = owner ? owner.available : null;
              const targetUrl =
                owner?.visibility === 'STUDENT_PRIVATE'
                  ? item.entityType === 'CERTIFICATE'
                    ? '/student?tab=learning#certificates'
                    : null
                  : available !== true
                  ? null
                  : slug
                  ? buildEntityLink(item.entityType, slug)
                  : item.entityType === 'STUDENT_TOOL'
                  ? '/tools'
                  : null;

              const itemCountry =
                (typeof item.metadata?.country === 'string' && item.metadata.country) ||
                (owner && 'country' in owner && typeof (owner as { country?: string }).country === 'string'
                  ? (owner as { country?: string }).country
                  : null);
              const typeText = arabicEntityType(item.entityType);
              const subtitle = itemCountry ? `${typeText} · ${itemCountry}` : typeText;
              const currentCollection = item.collectionId
                ? collections.find((col) => col.id === item.collectionId)
                : null;

              return (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] p-3 shadow-2xs font-['Cairo',sans-serif] transition-all hover:border-[#D6A43B]/60"
                >
                  {/* Top Section: Emblem Icon on right, Title & Subtitle in middle, Favorite Heart button on left */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      {/* Rounded Emblem Icon */}
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#142B5F] dark:bg-[#0c1a3b] border border-[#D6A43B]/30 text-[#E5B54F] shadow-xs">
                        {getEntityIcon(item.entityType, 'h-4 w-4 text-[#E5B54F]')}
                      </div>

                      {/* Title & Subtitle (e.g. منحة · الصين) */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[12px] sm:text-[12.5px] font-bold text-[var(--mn-heading)] leading-snug break-words font-['Cairo',sans-serif]">
                          {displayName}
                        </h4>
                        <p className="mt-0.5 text-[10.5px] sm:text-[11px] font-medium text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
                          {subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Heart button (زر المفضلة) to un-favorite immediately */}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onRemoveSavedItem(item)}
                      title="إزالة من المفضلة"
                      aria-label={`إزالة ${displayName} من المفضلة`}
                      className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full text-rose-500 hover:bg-rose-500/10 active:scale-90 transition-transform cursor-pointer"
                    >
                      <Heart className="h-4.5 w-4.5 fill-rose-500 text-rose-500" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Horizontal Divider Line */}
                  <div className="my-2.5 border-t border-[var(--mn-border)]/60 dark:border-white/10" aria-hidden="true" />

                  {/* Bottom Row: Clean group button on right, Details link with ↖ on left - matching ChatGPT mockup */}
                  <div className="flex items-center justify-between gap-2 text-[11px] sm:text-[11.5px]">
                    {/* Right side (RTL start): Clean group button with folder icon */}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setMovingItem(item)}
                      className="inline-flex items-center gap-1.5 font-bold text-[11px] sm:text-[11.5px] text-[var(--mn-heading)] hover:text-[#D6A43B] active:opacity-70 transition-colors cursor-pointer select-none"
                      title="نقل أو إضافة إلى مجموعة"
                    >
                      <Folder className="h-3.5 w-3.5 shrink-0 text-[#0E7C86] dark:text-[#55CBC5]" aria-hidden="true" />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">
                        {currentCollection ? currentCollection.name : 'إضافة لمجموعة'}
                      </span>
                    </button>

                    {/* Left side (RTL end): عرض التفاصيل with arrow */}
                    {targetUrl ? (
                      <Link
                        to={targetUrl}
                        className="inline-flex items-center gap-1 font-bold text-[11px] sm:text-[11.5px] text-[var(--mn-heading)] hover:text-[#D6A43B] transition-colors shrink-0"
                        title="عرض التفاصيل"
                      >
                        <ArrowUpLeft className="h-3.5 w-3.5 text-[var(--mn-text-muted)] group-hover:text-[#D6A43B]" aria-hidden="true" />
                        <span>عرض التفاصيل</span>
                      </Link>
                    ) : (
                      <span className="text-[10.5px] text-[var(--mn-text-muted)] font-medium">محفوظة</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Move to Collection Modal / Sheet */}
      {movingItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="نقل إلى مجموعة"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs font-['Cairo',sans-serif]"
          onClick={() => setMovingItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#55CBC5]">
                  <Folder className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-[var(--mn-heading)]">نقل إلى مجموعة</h4>
                  <p className="text-[11px] text-[var(--mn-text-muted)] truncate max-w-[200px]">
                    {getSavedTitle(movingItem)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMovingItem(null)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--mn-text-muted)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
              {/* Uncollected option */}
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  onMoveSavedItem(movingItem.id, null);
                  setMovingItem(null);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-right text-[12px] font-bold transition-colors cursor-pointer ${
                  !movingItem.collectionId
                    ? 'bg-[#142B5F] text-white dark:bg-[#D6A43B] dark:text-[#142B5F]'
                    : 'hover:bg-[var(--mn-page)] text-[var(--mn-heading)]'
                }`}
              >
                <span>دون مجموعة (إلغاء التعيين)</span>
                {!movingItem.collectionId && <span>✓</span>}
              </button>

              {collections.map((col) => {
                const isSelected = movingItem.collectionId === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      onMoveSavedItem(movingItem.id, col.id);
                      setMovingItem(null);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-right text-[12px] font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#142B5F] text-white dark:bg-[#D6A43B] dark:text-[#142B5F]'
                        : 'hover:bg-[var(--mn-page)] text-[var(--mn-heading)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                      <span>{col.name}</span>
                    </div>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 border-t border-[var(--mn-border)] dark:border-white/10 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  setMovingItem(null);
                  setShowCreateModal(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#D6A43B]/60 bg-[#D6A43B]/5 py-2 text-[11.5px] font-bold text-[#142B5F] dark:text-[#E5B54F] hover:bg-[#D6A43B]/10 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>+ إنشاء مجموعة جديدة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Stretched edge-to-edge section matching ملخصي/فرصي/تعلمي. */
function VaultSectionCard({
  title,
  icon,
  count,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="mn-student-vault-section relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-3.5 shadow-2xs mn-panel dark:border-white/10 sm:px-5 sm:py-4 font-['Cairo',sans-serif]"
    >
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/40 bg-[#142B5F] dark:bg-[#0c1a3b]">
            {icon}
          </span>
          <h3 className="min-w-0 text-[12.5px] sm:text-[13px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC]">
            {title}
          </h3>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {count && (
            <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-2 py-0.5 text-[10.5px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
              {count}
            </span>
          )}
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}

function StudentAvatarAssetPicker({ currentAssetId }: { currentAssetId: string | null }) {
  const [assets, setAssets] = useState<Array<{ id: string; reference: string; metadata?: { originalFilename?: string; mimeType?: string } }>>([]);
  const [selected, setSelected] = useState(currentAssetId ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    ApiClient.listMyActiveStudentAssets('image/')
      .then((page) => {
        if (active) setAssets(page.items);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'تعذر تحميل صور الملف');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let cleanupUrl: string | null = null;
    setPreviewUrl(null); setError(null);

    if (!selected) {
      setLoadingPreview(false);
      setPreviewUrl(null);
      return;
    }

    async function loadPreview() {
      setLoadingPreview(true);
      setError(null);
      try {
        const grant = await ApiClient.getMyStudentAssetDeliveryGrant(selected);
        if (!active) return;
        if (grant.headers && Object.keys(grant.headers).length) {
          const res = await fetch(grant.url, { headers: grant.headers });
          if (!res.ok) throw new Error('تعذر تحميل معاينة الصورة');
          const blob = await res.blob();
          if (!active) return;
          const objectUrl = URL.createObjectURL(blob);
          cleanupUrl = objectUrl;
          setPreviewUrl(objectUrl);
        } else {
          setPreviewUrl(grant.url);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'تعذر تحميل معاينة الصورة');
      } finally {
        if (active) setLoadingPreview(false);
      }
    }

    void loadPreview();

    return () => {
      active = false;
      if (cleanupUrl) URL.revokeObjectURL(cleanupUrl);
    };
  }, [selected]);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب ألا يتجاوز 5 ميغابايت');
      return;
    }

    setUploading(true);
    setError(null);
    const localBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(localBlobUrl);

    try {
      const upload = await ApiClient.requestMyDocumentUpload({
        originalFilename: file.name,
        mimeType: file.type || 'image/jpeg',
        byteSize: file.size,
      });
      const assetId = upload.assetId;
      if (upload.uploadUrl && upload.uploadHeaders) {
        await fetch(upload.uploadUrl, {
          method: 'PUT',
          headers: upload.uploadHeaders,
          body: file,
        });
      }
      await ApiClient.completeMyDocumentUpload(assetId);
      const newAsset = {
        id: assetId,
        reference: assetId,
        metadata: { originalFilename: file.name, mimeType: file.type },
      };
      setAssets((prev) => [newAsset, ...prev]);
      setSelected(assetId);
    } catch {
      // In preview or simulated environment, register local asset
      const fallbackId = 'preview-avatar-' + Date.now();
      const newAsset = {
        id: fallbackId,
        reference: fallbackId,
        metadata: { originalFilename: file.name, mimeType: file.type },
      };
      setAssets((prev) => [newAsset, ...prev]);
      setSelected(fallbackId);
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  }

  return (
    <div className="relative overflow-hidden p-3 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] font-['Cairo',sans-serif] space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-[11.5px] font-bold text-[var(--mn-heading)] font-['Cairo',sans-serif]">
          الصورة الشخصية (من الأصول الآمنة)
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6A43B]/60 bg-[#D6A43B]/10 hover:bg-[#D6A43B]/20 text-[#8C600B] dark:text-[#E0B244] px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50 font-['Cairo',sans-serif]"
          title="رفع أو إضافة صورة شخصية جديدة من جهازك"
        >
          {uploading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>جارٍ الرفع…</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>إضافة صورة جديدة</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="انقر لتغيير أو إضافة صورة شخصية"
          className="group relative w-12 h-12 rounded-xl bg-[#142B5F] border-2 border-[#D6A43B]/60 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs cursor-pointer"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="معاينة الصورة" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-[#E5B54F]" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-4 h-4 text-white" />
          </div>
          {(loadingPreview || uploading) && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <select
            name="avatarAssetId"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="w-full rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--mn-text)] outline-none focus:border-[#D6A43B] focus:ring-2 focus:ring-[#D6A43B]/20 transition-all font-['Cairo',sans-serif]"
          >
            <option value="">بدون صورة رمزية (الأيقونة الافتراضية)</option>
            {selected && !assets.some(asset => asset.id === selected) && <option value={selected}>الصورة المحددة</option>}
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.metadata?.originalFilename || asset.reference || `صورة (${asset.id.slice(0, 8)})`}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
            تُجلب الصور المعتمدة حصرياً من أصول ملفك الآمنة في المنصة.
          </p>
        </div>
      </div>
      {error && <span className="block text-[11px] text-rose-500 font-['Cairo',sans-serif]">{error}</span>}
    </div>
  );
}

function ProfileSectionCard({
  title,
  icon,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={title}
      className={`relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-2xs mn-panel font-['Cairo',sans-serif] ${className}`}
    >
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/40 bg-[#142B5F] dark:bg-[#0c1a3b]">
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="min-w-0 text-[12.5px] sm:text-[13px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-[10.5px] font-medium text-[var(--mn-text-muted)] break-words font-['Cairo',sans-serif]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function ProfileToggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="mn-student-profile-toggle group flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-3 py-1.5 min-h-[36px] hover:border-[#D6A43B]/60 hover:bg-[var(--mn-surface-muted)] transition-all font-['Cairo',sans-serif]">
      <div className="min-w-0 flex-1">
        <span className="text-[12px] font-semibold text-[#1E293B] dark:text-[#F8FAFC] block leading-snug font-['Cairo',sans-serif]">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 text-[10.5px] text-[var(--mn-text-muted)] block leading-tight font-['Cairo',sans-serif]">
            {description}
          </span>
        )}
      </div>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded accent-[#142B5F] dark:accent-[#D6A43B] shrink-0 cursor-pointer"
      />
    </label>
  );
}

function ProfileView({
  dashboard,
  identity,
  onLogout,
  notifications,
  privacy,
  accessibility,
  saving,
  onSave,
  onSnapshot,
  snapshots,
  onRestoreSnapshot,
  onResetLayout,
  onClearSearch,
  onDirtyChange,
  dirty,
}: {
  onDirtyChange: (dirty: boolean) => void;
  dirty: boolean;
  dashboard: StudentDashboardSummaryDto;
  identity: { principalId: string; displayName: string; primaryEmail?: string; roles?: string[]; roleNames?: string[] } | null;
  onLogout: () => void;
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean>;
  accessibility: Record<string, unknown>;
  saving: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSnapshot: () => void;
  snapshots: StudentWorkspaceSnapshotDto[];
  onRestoreSnapshot: (snapshotId: string) => void;
  onResetLayout: () => void;
  onClearSearch: () => void;
  onBack?: () => void;
}) {
  function handleClearSearch() {
    if (window.confirm('هل أنت متأكد من مسح كامل سجل البحث الشخصي؟ لا يمكن التراجع عن هذا الإجراء.')) {
      onClearSearch();
    }
  }

  return (
    <div className="mn-student-profile-page mt-0 space-y-4 font-['Cairo',sans-serif]">
      {/* Unified inline section header attached directly to the 8-tab bar above and stretched edge-to-edge */}
      <section
        aria-label="إعداداتي وملفي الشخصي"
        className="mn-student-profile-hero relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] -mt-px overflow-hidden rounded-b-2xl rounded-t-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] shadow-2xs mn-panel font-['Cairo',sans-serif]"
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
                <User className="h-4 w-4 text-[#F2CD78]" aria-hidden="true" />
              </span>
              <h2 className="mn-student-profile-heading text-[14px] sm:text-[15px] font-bold leading-tight text-[#1E293B] dark:text-[#F8FAFC] font-['Cairo',sans-serif]">
                إعداداتي وملفي الشخصي
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] dark:border-white/15 px-2.5 py-1 text-[11px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#55CBC5]" aria-hidden="true" />
                <span>{arabicStatus(dashboard.workspace.status)}</span>
              </span>

              <button
                type="button"
                disabled={saving}
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 text-[11.5px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="تسجيل الخروج من الحساب"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          <p className="mt-2.5 text-[11.5px] sm:text-[12px] font-medium leading-[1.75] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
            حدّث بياناتك الشخصية والأكاديمية، واضبط تفضيلات الإشعارات والخصوصية وإعدادات العرض في حسابك.
          </p>
        </div>
      </section>

      {/* Profile Form */}
      <form onSubmit={onSave} onChange={() => onDirtyChange(true)} className="space-y-4 font-['Cairo',sans-serif]">
        <fieldset disabled={saving} className="space-y-4 min-w-0 border-0 p-0">
          {dirty && (
            <p role="status" className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] rounded-none border-x-0 border-t border-b border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-[12px] font-bold text-amber-900 dark:text-amber-200 font-['Cairo',sans-serif]">
              لديك تعديلات غير محفوظة، اضغط على زر الحفظ بالأسفل لتطبيقها سحابياً.
            </p>
          )}

          <div className="space-y-4">
            {/* Section 1: بياناتي والهوية */}
            <ProfileSectionCard
              title="بياناتي والهوية"
              icon={<User className="w-4 h-4 text-[#F2CD78]" />}
              subtitle="معلومات الحساب المعتمدة في منصة منارتك"
            >
              <div className="space-y-3.5">
                {/* Avatar Asset Picker */}
                <StudentAvatarAssetPicker currentAssetId={dashboard.workspace.avatarAssetId ?? null} />

                {/* Display Name - Editable */}
                <div>
                  <label className="block text-[12px] font-bold text-[var(--mn-heading)] mb-1 font-['Cairo',sans-serif]">
                    الاسم الظاهر
                  </label>
                  <input
                    name="displayName"
                    defaultValue={dashboard.workspace.displayName || ''}
                    maxLength={120}
                    placeholder="أدخل اسمك الظاهر"
                    className="w-full rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] font-medium text-[var(--mn-text)] outline-none focus:border-[#D6A43B] focus:ring-2 focus:ring-[#D6A43B]/20 transition-all font-['Cairo',sans-serif]"
                  />
                  <p className="mt-1 text-[11px] text-[var(--mn-text-muted)] font-['Cairo',sans-serif]">
                    الاسم الظاهر في مساحة حسابك؛ الشهادات الصادرة تحتفظ ببيانات إصدارها المعتمدة.
                  </p>
                </div>

                {/* Email Address - Read only */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-bold text-[var(--mn-heading)] font-['Cairo',sans-serif]">
                      البريد الإلكتروني الأساسي
                    </label>
                    <span className="text-[10px] font-semibold text-[var(--mn-text-muted)] bg-[var(--mn-page)] px-2 py-0.5 rounded-md flex items-center gap-1 border border-[var(--mn-border)] dark:border-white/10">
                      <LockKeyhole className="w-3 h-3 text-[var(--mn-text-muted)]" /> للقراءة فقط
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={identity?.primaryEmail || 'غير مسجل'}
                    className="w-full rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] px-3 py-2 text-[12px] text-[var(--mn-text-muted)] font-mono cursor-not-allowed"
                  />
                </div>

                {/* Academic Account Role Badge */}
                <div className="pt-1">
                  <div className="p-3 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] flex items-center justify-between font-['Cairo',sans-serif]">
                    <div>
                      <span className="text-[11px] font-semibold text-[var(--mn-text-muted)] block">حالة الحساب الأكاديمي</span>
                      <span className="text-[12px] font-bold text-[#142B5F] dark:text-[#E0B244] mt-0.5 inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--mn-success-text)]" />
                        {arabicStatus(dashboard.workspace.status)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--mn-text-muted)] bg-[var(--mn-surface)] px-2.5 py-0.5 rounded-md border border-[var(--mn-border)] dark:border-white/10">
                      حساب طالب
                    </span>
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            {/* Section 2: تفضيلات التجربة والعرض */}
            <ProfileSectionCard
              title="تفضيلات التجربة والعرض"
              icon={<Sparkles className="w-4 h-4 text-[#E5B54F]" />}
              subtitle="تخصيص اللغة والمظهر والوصول"
            >
              <div className="space-y-3.5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-bold text-[var(--mn-heading)] mb-1 flex items-center gap-1.5 font-['Cairo',sans-serif]">
                      <Languages className="w-3.5 h-3.5 text-[#D6A43B]" />
                      اللغة المفضلة
                    </label>
                    <select
                      name="preferredLanguage"
                      defaultValue={dashboard.workspace.preferredLanguage || 'ar'}
                      className="w-full rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] text-[var(--mn-text)] font-medium outline-none focus:border-[#D6A43B] focus:ring-2 focus:ring-[#D6A43B]/20 font-['Cairo',sans-serif]"
                    >
                      <option value="ar">العربية (الافتراضية)</option>
                      <option value="en">English (الإنجليزية)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[var(--mn-heading)] mb-1 flex items-center gap-1.5 font-['Cairo',sans-serif]">
                      <Clock3 className="w-3.5 h-3.5 text-[#D6A43B]" />
                      المنطقة الزمنية
                    </label>
                    <select
                      name="timezone"
                      defaultValue={dashboard.workspace.timezone || 'Asia/Aden'}
                      className="w-full rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] text-[var(--mn-text)] font-medium outline-none focus:border-[#D6A43B] focus:ring-2 focus:ring-[#D6A43B]/20 font-['Cairo',sans-serif]"
                    >
                      {dashboard.workspace.timezone && !['Asia/Aden','Asia/Riyadh','Asia/Dubai','Africa/Cairo','UTC'].includes(dashboard.workspace.timezone) && <option value={dashboard.workspace.timezone}>{dashboard.workspace.timezone}</option>}
                      <option value="Asia/Aden">عدن (GMT+3)</option>
                      <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                      <option value="Asia/Dubai">دبي (GMT+4)</option>
                      <option value="Africa/Cairo">القاهرة (حسب التوقيت المحلي)</option>
                      <option value="UTC">التوقيت العالمي الموحد (UTC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[var(--mn-heading)] mb-1 flex items-center gap-1.5 font-['Cairo',sans-serif]">
                      <Moon className="w-3.5 h-3.5 text-[#D6A43B]" />
                      المظهر العام
                    </label>
                    <select
                      name="theme"
                      defaultValue={dashboard.workspace.theme || 'SYSTEM'}
                      className="w-full rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] text-[var(--mn-text)] font-medium outline-none focus:border-[#D6A43B] focus:ring-2 focus:ring-[#D6A43B]/20 font-['Cairo',sans-serif]"
                    >
                      <option value="SYSTEM">تلقائي (حسب نظام الجهاز)</option>
                      <option value="LIGHT">المظهر الفاتح</option>
                      <option value="DARK">المظهر الداكن</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[var(--mn-heading)] mb-1 flex items-center gap-1.5 font-['Cairo',sans-serif]">
                      <Settings2 className="w-3.5 h-3.5 text-[#D6A43B]" />
                      حجم خط الواجهة
                    </label>
                    <select
                      name="textScale"
                      defaultValue={String(accessibility.textScale || 'DEFAULT')}
                      className="w-full rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface-elevated)] px-3 py-2 text-[12px] text-[var(--mn-text)] font-medium outline-none focus:border-[#D6A43B] focus:ring-2 focus:ring-[#D6A43B]/20 font-['Cairo',sans-serif]"
                    >
                      <option value="SMALL">خط صغير (Compact)</option>
                      <option value="DEFAULT">الافتراضي (Standard)</option>
                      <option value="LARGE">خط كبير (Large)</option>
                    </select>
                  </div>
                </div>

                {/* Accessibility Toggles */}
                <div className="pt-2 border-t border-[var(--mn-border)] dark:border-white/10 space-y-2">
                  <span className="text-[12px] font-bold text-[var(--mn-heading)] block font-['Cairo',sans-serif]">إمكانية الوصول والراحة</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ProfileToggle
                      name="reduceMotion"
                      label="تقليل الحركة والتأثيرات"
                      defaultChecked={Boolean(accessibility.reduceMotion)}
                    />
                    <ProfileToggle
                      name="highContrast"
                      label="وضع التباين المرتفع"
                      defaultChecked={Boolean(accessibility.highContrast)}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 font-['Cairo',sans-serif]">
                  <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>تُحفظ جميع التفضيلات سحابياً في حسابك وتُطبّق على الفور عبر جميع أجهزتك المتصلة.</span>
                </div>
              </div>
            </ProfileSectionCard>

            {/* Section 3: إعدادات الإشعارات والتنبيهات */}
            <ProfileSectionCard
              title="إعدادات الإشعارات والتنبيهات"
              icon={<Bell className="w-4 h-4 text-[#E5B54F]" />}
              subtitle="اختر القنوات والفئات التي تهمك"
            >
              <div className="space-y-3 font-['Cairo',sans-serif]">
                <div>
                  <span className="text-[12px] font-bold text-[var(--mn-heading)] block mb-1.5 font-['Cairo',sans-serif]">قنوات الاستقبال</span>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                    <ProfileToggle
                      name="notifyInApp"
                      label="داخل المنصة"
                      defaultChecked={notifications.inApp ?? true}
                    />
                    <ProfileToggle
                      name="notifyEmail"
                      label="البريد الإلكتروني"
                      defaultChecked={notifications.email ?? true}
                    />
                    <ProfileToggle
                      name="notifyPush"
                      label="الإشعارات الفورية"
                      defaultChecked={notifications.push ?? false}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--mn-border)] dark:border-white/10">
                  <span className="text-[12px] font-bold text-[var(--mn-heading)] block mb-1.5 font-['Cairo',sans-serif]">فئات التنبيهات</span>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    <ProfileToggle
                      name="notifyLearning"
                      label="تحديثات التعلم والدورات"
                      defaultChecked={notifications.learning ?? true}
                    />
                    <ProfileToggle
                      name="notifyCertificates"
                      label="إصدار الشهادات والاعتمادات"
                      defaultChecked={notifications.certificates ?? true}
                    />
                    <ProfileToggle
                      name="notifyScholarships"
                      label="المنح ومواعيد التقديم"
                      defaultChecked={notifications.scholarships ?? true}
                    />
                    <ProfileToggle
                      name="notifyPayments"
                      label="الفواتير والطلبات المالية"
                      defaultChecked={notifications.payments ?? true}
                    />
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            {/* Section 4: مركز الخصوصية وسجل البحث */}
            <ProfileSectionCard
              title="الخصوصية وسجل البحث"
              icon={<Shield className="w-4 h-4 text-[#E5B54F]" />}
              subtitle="إدارة خصوصية البحث والتوصيات والبيانات المحفوظة"
            >
              <div className="space-y-3.5">
                <div className="space-y-2">
                  <span className="text-[12px] font-bold text-[var(--mn-heading)] block font-['Cairo',sans-serif]">خيارات الخصوصية والبيانات</span>
                  <ProfileToggle
                    name="retainSearchHistory"
                    label="الاحتفاظ بسجل البحث الشخصي"
                    description="حفظ كلمات البحث للوصول السريع"
                    defaultChecked={privacy.retainSearchHistory ?? false}
                  />
                  <ProfileToggle
                    name="allowPersonalization"
                    label="السماح بتخصيص التوصيات الذكية"
                    description="عرض فرص ودورات ملائمة لاهتماماتك"
                    defaultChecked={privacy.allowPersonalization ?? false}
                  />
                  <ProfileToggle
                    name="allowProductAnalytics"
                    label="المساهمة في تحسين أداء المنصة"
                    description="مشاركة بيانات أداء مجهولة الهوية"
                    defaultChecked={privacy.allowProductAnalytics ?? false}
                  />
                </div>

                <div className="p-3 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] flex items-center justify-between gap-3 font-['Cairo',sans-serif]">
                  <div>
                    <span className="text-[11.5px] font-bold text-[var(--mn-heading)] block">مسح سجل البحث</span>
                    <span className="text-[10.5px] text-[var(--mn-text-muted)]">حذف عمليات البحث المحفوظة من حسابك فوراً.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    disabled={saving}
                    className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors shrink-0 disabled:opacity-50 cursor-pointer font-['Cairo',sans-serif]"
                  >
                    مسح السجل الآن
                  </button>
                </div>
              </div>
            </ProfileSectionCard>

            {/* Section 5: إعدادات متقدمة والنسخ الاحتياطية */}
            <ProfileSectionCard
              title="إعدادات متقدمة والنسخ الاحتياطية"
              icon={<Settings2 className="w-3.5 h-3.5 text-[#E5B54F]" />}
              subtitle="معرّفات النظام، تفاصيل التزامن السحابي، وإدارة نسخ مساحة العمل"
              className="lg:col-span-2"
            >
              <div className="space-y-4 font-['Cairo',sans-serif]">
                {/* Internal Identifiers & Technical Sync Details */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="p-3 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)]">
                    <span className="text-[10.5px] font-semibold text-[var(--mn-text-muted)] block">معرّف النظام الداخلي (Principal ID)</span>
                    <span className="text-[11.5px] font-mono text-[var(--mn-heading)] mt-1 block truncate select-all" title={identity?.principalId}>
                      {identity?.principalId || '—'}
                    </span>
                    <span className="text-[10px] text-[var(--mn-text-muted)] mt-0.5 block">معرّف تقني فريد يُستخدم في ربط وتأمين الخدمات</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)]">
                    <span className="text-[10.5px] font-semibold text-[var(--mn-text-muted)] block">إصدار تكوين مساحة العمل</span>
                    <span className="text-[11.5px] font-bold text-[var(--mn-heading)] mt-1 inline-flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--mn-success-text)]" />
                      الإصدار #{dashboard.workspace.version}
                    </span>
                    <span className="text-[10px] text-[var(--mn-text-muted)] mt-0.5 block">
                      آخر مزامنة سحابية: {formatDate(dashboard.workspace.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Workspace Snapshot & Layout Management */}
                <div className="pt-2 border-t border-[var(--mn-border)] dark:border-white/10 space-y-3">
                  <span className="text-[12px] font-bold text-[var(--mn-heading)] block">النسخ الاحتياطية وإعادة التعيين</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={onSnapshot}
                      disabled={saving}
                      className="rounded-xl border border-[#D6A43B]/40 bg-[#D6A43B]/10 hover:bg-[#D6A43B]/20 px-3 py-2 text-[12px] font-bold text-[#8C600B] dark:text-[#E0B244] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer font-['Cairo',sans-serif]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ نسخة إعدادات</span>
                    </button>

                    <button
                      type="button"
                      onClick={onResetLayout}
                      disabled={saving}
                      className="rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface-elevated)] hover:bg-[var(--mn-surface-muted)] px-3 py-2 text-[12px] font-bold text-[var(--mn-text)] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer font-['Cairo',sans-serif]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استعادة التخطيط</span>
                    </button>
                  </div>

                  {/* Snapshots List */}
                  {snapshots.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[var(--mn-text-muted)] block">النسخ الاحتياطية المسجلة:</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {snapshots.slice(0, 4).map((snapshot) => (
                          <div
                            key={snapshot.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] text-xs"
                          >
                            <div className="min-w-0 pr-1">
                              <span className="font-bold text-[var(--mn-heading)] block truncate text-[12px]">
                                {snapshot.label || 'نسخة إعدادات مساحة العمل'}
                              </span>
                              <span className="text-[10px] text-[var(--mn-text-muted)]">
                                {formatDate(snapshot.createdAt)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRestoreSnapshot(snapshot.id)}
                              disabled={saving}
                              className="rounded-lg bg-[var(--mn-surface)] hover:bg-[#D6A43B] hover:text-white border border-[var(--mn-border)] dark:border-white/10 px-2.5 py-1 text-[11px] font-bold text-[var(--mn-primary)] dark:text-[#E0B244] transition-colors cursor-pointer shrink-0 disabled:opacity-50 font-['Cairo',sans-serif]"
                            >
                              استعادة
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ProfileSectionCard>
          </div>

          {/* End-of-form save bar stretched edge-to-edge */}
          <div className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-2xs mn-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-['Cairo',sans-serif]">
            <div className="flex items-center gap-2 text-right">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#D6A43B]/40 bg-[#142B5F]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F2CD78]" />
              </span>
              <div>
                <p className="text-[12px] sm:text-[12.5px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">هل قمت بتعديل بياناتك أو إعداداتك؟</p>
                <p className="text-[10.5px] sm:text-[11px] font-medium text-[var(--mn-text-muted)]">اضغط لحفظ التعديلات وتطبيقها ومزامنتها سحابياً فوراً عبر حسابك.</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto min-h-9 rounded-xl bg-[#142B5F] hover:bg-[#1a3675] border border-[#D6A43B]/45 px-4 py-1.5 text-[11.5px] font-bold text-white shadow-2xs active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer font-['Cairo',sans-serif]"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F2CD78]" />
                  <span>جارٍ حفظ التفضيلات…</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-[#F2CD78]" />
                  <span>حفظ جميع التعديلات</span>
                </>
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-xl px-3 py-2 text-center">
      <strong className="block text-xl">{value}</strong>
      <span className="text-xs text-[var(--mn-on-dark-muted)]">{label}</span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'success' | 'info' | 'warning' | 'accent';
}) {
  const styles: Record<typeof tone, string> = {
    success: 'border border-[var(--mn-success-border)] bg-[var(--mn-success-soft)] text-[var(--mn-success-text)]',
    info: 'border border-[var(--mn-info-border)] bg-[var(--mn-info-soft)] text-[var(--mn-info-text)]',
    warning: 'border border-[var(--mn-warning-border)] bg-[var(--mn-warning-soft)] text-[var(--mn-warning-text)]',
    accent: 'border border-[var(--mn-border-gold)] bg-[var(--mn-gold-surface)] text-[var(--mn-accent-text)]',
  };
  return (
    <div className="mn-card rounded-3xl p-5">
      <div
        className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl text-xl ${styles[tone]}`}
      >
        {icon}
      </div>
      <strong className="text-3xl font-bold text-[var(--mn-heading)]">{value}</strong>
      <p className="mt-1 text-sm text-[var(--mn-text-muted)]">{label}</p>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mn-card rounded-3xl p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-[var(--mn-heading)]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function CourseCard({
  course,
  wide = false,
}: {
  course: StudentDashboardSummaryDto['courseEnrollments'][number];
  wide?: boolean;
}) {
  return (
    <Link
      to={['ACTIVE', 'COMPLETED', 'ENROLLED', 'IN_PROGRESS'].includes(course.status) ? `../student/courses/${encodeURIComponent(course.courseId)}` : `/courses/${encodeURIComponent(course.courseSlug || course.courseId)}`}
      className={`group block rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 hover:border-[var(--mn-border-gold)] hover:shadow-sm ${wide ? 'sm:p-5' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-[var(--mn-secondary)]">
            {['ACTIVE', 'ENROLLED', 'IN_PROGRESS'].includes(course.status) ? 'قيد التعلم' : arabicStatus(course.status)}
          </span>
          <h3 className="mt-1 truncate font-bold">{course.courseName}</h3>
        </div>
        <span className="text-sm font-bold text-[var(--mn-success-text)]">{course.progressPercentage}%</span>
      </div>
      <progress className="mn-native-progress mn-native-progress-secondary mt-4 h-2 w-full" value={Math.min(100, Math.max(0, course.progressPercentage))} max={100} aria-label="تقدم الدورة" />
      <div className="mt-3 flex justify-between text-xs text-[var(--mn-text-muted)]">
        <span>
          {course.lastAccessedAt
            ? `آخر وصول ${formatDate(course.lastAccessedAt)}`
            : `التسجيل ${formatDate(course.enrolledAt)}`}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-[var(--mn-secondary)] transition group-hover:-translate-x-1">
          متابعة
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function ActivityList({ items }: { items: StudentDashboardSummaryDto['timeline'] }) {
  return items.length ? (
    <ol className="space-y-1">
      {items.map((item) => (
        <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[var(--mn-secondary)] ring-4 ring-[var(--mn-gold-surface)]" />
          <div>
            <h3 className="text-sm font-bold">{item.title}</h3>
            {item.description && <p className="mt-1 text-sm text-[var(--mn-text-muted)]">{item.description}</p>}
            <time className="mt-1 block text-xs text-[var(--mn-text-muted)]">{formatDate(item.occurredAt)}</time>
          </div>
        </li>
      ))}
    </ol>
  ) : (
    <p className="rounded-2xl bg-[var(--mn-surface-muted)] p-5 text-center text-sm text-[var(--mn-text-muted)]">
      سيظهر هنا سجل إنجازاتك ونشاطك المهم.
    </p>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="font-['Cairo',sans-serif]">
      <div className="mb-2 flex items-center justify-between gap-3 text-[12px] leading-[1.6]">
        <span className="font-bold text-[var(--mn-heading)]">{label}</span>
        <span className="shrink-0 font-medium text-[var(--mn-text-muted)]">{value}%</span>
      </div>
      <progress className="mn-native-progress mn-native-progress-secondary h-2 w-full" value={Math.min(100, Math.max(0, value))} max={100} aria-label={label} />
    </div>
  );
}

function InvoicePanel({
  invoices,
  paymentsByInvoice,
  onToggle,
  compactSummary = false,
}: {
  invoices: StudentFinanceInvoiceDto[];
  paymentsByInvoice: Record<string, StudentFinancePaymentDto[]>;
  onToggle: (id: string) => void;
  compactSummary?: boolean;
}) {
  const content = (
    <>
      {invoices.length ? (
        <div className={compactSummary ? 'space-y-2.5' : 'space-y-3'}>
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className={
                compactSummary
                  ? 'relative overflow-hidden rounded-xl border border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] pr-3.5 pl-3 py-2.5 shadow-2xs'
                  : 'rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-4'
              }
            >
              {compactSummary && (
                /* Authentic Horizon Petrol (#0E7C86) Geometric Corner Line from top-right down the right edge to middle-bottom */
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 right-0 w-4 sm:w-5 h-[68%] rounded-tr-xl border-t-[3px] border-r-[3.5px] border-[#0E7C86] dark:border-[#55CBC5]"
                />
              )}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-start gap-2">
                  {compactSummary && (
                    <span className="mt-0.5 w-6 h-6 rounded-md bg-[#0E7C86] border-[1.5px] border-[#142B5F] ring-1 ring-[#142B5F]/40 text-white mn-sub-item-icon flex items-center justify-center shrink-0 shadow-2xs">
                      <Receipt className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className={compactSummary ? 'text-[10.5px] sm:text-[11px] font-bold leading-snug text-[#1E293B] dark:text-[#F8FAFC] break-words' : 'font-bold'}>
                      {invoice.invoiceNumber}
                    </h3>
                    <p className={compactSummary ? 'mt-0.5 text-[9.5px] sm:text-[10px] font-bold leading-snug text-[var(--mn-text-muted)]' : 'mt-1 text-sm text-[var(--mn-text-muted)]'}>
                      المستحق {formatMoney(invoice.amountDue)}
                    </p>
                  </div>
                </div>
                <span
                  className={`h-fit shrink-0 rounded-lg ${compactSummary ? 'px-2.5 py-0.5 text-[9.5px]' : 'px-3 py-1 text-xs'} font-bold font-['Cairo',sans-serif] ${
                    invoice.status === 'PAID'
                      ? 'border border-[var(--mn-success-border)] bg-[var(--mn-success-soft)] text-[var(--mn-success-text)]'
                      : invoice.status === 'ISSUED'
                        ? 'border border-[#142B5F] bg-[#142B5F] text-white'
                        : 'border border-[var(--mn-warning-border)] bg-[var(--mn-warning-soft)] text-[var(--mn-warning-text)]'
                  }`}
                >
                  {arabicStatus(invoice.status)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onToggle(invoice.id)}
                className={
                  compactSummary
                    ? "mn-student-summary-primary-action mt-2 inline-flex items-center justify-center rounded-lg bg-[#142B5F] hover:bg-[#203D74] border border-[#142B5F] px-2.5 py-1 text-[10px] font-bold text-white transition-colors font-['Cairo',sans-serif] cursor-pointer"
                    : 'mt-3 text-xs font-semibold text-[var(--mn-secondary)]'
                }
              >
                {paymentsByInvoice[invoice.id] ? 'إخفاء الدفعات' : 'عرض الدفعات'}
              </button>
              {paymentsByInvoice[invoice.id] && (
                <div className="mt-2.5 space-y-1.5 border-t border-[var(--mn-border)] pt-2.5">
                  {paymentsByInvoice[invoice.id].length ? (
                    paymentsByInvoice[invoice.id].map((payment) => (
                      <p key={payment.id} className="rounded-lg bg-[var(--mn-surface-muted)] p-2 text-[10.5px] font-semibold">
                        {formatMoney(payment.amount)} — {arabicStatus(payment.status)}
                      </p>
                    ))
                  ) : (
                    <p className="text-[10.5px] text-[var(--mn-text-muted)]">لا توجد دفعات مسجلة.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-[var(--mn-surface-muted)] p-5 text-center text-sm text-[var(--mn-text-muted)]">
          لا توجد فواتير حالية.
        </p>
      )}
    </>
  );

  if (!compactSummary) {
    return <Panel title="الفواتير والدفعات">{content}</Panel>;
  }

  return (
    <section
      aria-label="الفواتير والدفعات"
      className="relative -mx-3 sm:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] overflow-hidden rounded-none border-x-0 border-t border-b border-[var(--mn-border)] dark:border-white/10 bg-[var(--mn-surface)] py-3 sm:py-3.5 shadow-2xs mn-panel font-['Cairo',sans-serif]"
    >
      <div className="mb-2.5 flex min-w-0 items-center justify-between gap-2 border-b border-[var(--mn-border)] dark:border-white/10 pb-2.5 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-[#D6A43B]/75 bg-[#142B5F] text-[#F2CD78] shadow-[0_2px_8px_rgba(20,43,95,0.16)]">
            <span className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-md bg-[#D6A43B]" />
            <Receipt className="relative z-10 h-3.5 w-3.5 text-[#F2CD78]" />
          </span>
          <h3 className="inline-block border-b-2 border-[#D6A43B] pb-0.5 text-[14px] sm:text-[15px] font-bold leading-snug font-['Cairo',sans-serif] text-[#1E293B] dark:text-[#F8FAFC]">
            الفواتير والدفعات
          </h3>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] dark:bg-[var(--mn-surface-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[#334155] dark:text-[#E2E8F0]">
          {invoices.length} فاتورة
        </span>
      </div>
      <div className="px-2.5 sm:px-4">{content}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const singleControl = React.isValidElement<{ className?: string }>(children) && React.Children.count(children) === 1;
  if (singleControl) {
    return (
      <label className="block text-sm font-semibold text-[var(--mn-text)]">
        {label}
        {React.cloneElement(children, {
          className: `${children.props.className || ''} mt-2 w-full rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 py-2.5 font-normal outline-none focus:border-[var(--mn-focus)] focus:ring-2 focus:ring-[var(--mn-gold-surface)]`,
        })}
      </label>
    );
  }
  return (
    <div className="block text-sm font-semibold text-[var(--mn-text)]">
      <span>{label}</span>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 hover:bg-[var(--mn-surface-muted)]">
      <span className="text-sm font-bold">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-[var(--mn-secondary)]"
      />
    </label>
  );
}

function EmptyState({
  icon,
  title,
  text,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--mn-border)] bg-[var(--mn-surface-muted)] p-8 text-center">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--mn-text-muted)]">{text}</p>
      {href && action && (
        <Link
          to={href}
          className="mt-4 inline-block rounded-xl bg-[var(--mn-primary)] px-5 py-2.5 text-sm font-bold text-white"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

function Alert({
  tone,
  message,
  onClose,
}: {
  tone: 'error' | 'success' | 'warning';
  message: string;
  onClose?: () => void;
}) {
  const styles = {
    error: 'border-[var(--mn-danger-border)] bg-[var(--mn-danger-soft)] text-[var(--mn-danger-text)]',
    success: 'border-[var(--mn-success-border)] bg-[var(--mn-success-soft)] text-[var(--mn-success-text)]',
    warning: 'border-[var(--mn-warning-border)] bg-[var(--mn-warning-soft)] text-[var(--mn-warning-text)]',
  };
  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${styles[tone]}`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          aria-label="إغلاق الرسالة"
          onClick={onClose}
          className="grid min-h-10 min-w-10 place-items-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div dir="rtl" className="mn-page-shell min-h-screen">
      <div className="h-64 animate-pulse bg-[var(--mn-primary)]" />
      <div className="mx-auto grid max-w-7xl gap-5 px-[9px] py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-3xl bg-[var(--mn-surface)] border border-[var(--mn-border)]" />
        ))}
      </div>
    </div>
  );
}

function formatMoney(amount: MoneyAmountDto): string {
  const value = Number(BigInt(amount.amountMinorUnits)) / Math.pow(10, amount.scale);
  return `${value.toLocaleString('ar', { minimumFractionDigits: amount.scale, maximumFractionDigits: amount.scale })} ${amount.currencyCode}`;
}
function formatDate(value?: string | null): string {
  return value
    ? (Number.isNaN(new Date(value).getTime()) ? '—' : new Date(value).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' }))
    : '—';
}
function arabicStatus(value: string): string {
  return (
    (
      {
        PAID: 'مدفوعة',
        VOIDED: 'ملغاة',
        PENDING: 'معلقة',
        ACTIVE: 'نشطة',
        COMPLETED: 'مكتملة',
        REVOKED: 'ملغاة',
        SUSPENDED: 'معلّقة', ARCHIVED: 'مؤرشفة', INITIALIZING: 'قيد التهيئة', EXPIRED: 'منتهية الصلاحية', WAITLISTED: 'قائمة الانتظار', CANCELLED: 'ملغاة', ENROLLED: 'مسجل', IN_PROGRESS: 'قيد التعلم', ISSUED: 'صادرة', PARTIALLY_PAID: 'مدفوعة جزئياً', OVERDUE: 'متأخرة', DRAFT: 'مسودة',
      } as Record<string, string>
    )[value] || value
  );
}
function arabicEntityType(value: string): string {
  return (
    (
      {
        COURSE: 'دورة',
        SCHOLARSHIP: 'منحة',
        UNIVERSITY: 'جامعة',
        MAJOR: 'تخصص',
        CERTIFICATE: 'شهادة',
        STUDENT_TOOL: 'أداة طالب',
        INTERNATIONAL_TEST:'اختبار دولي',CMS_CONTENT:'محتوى',SERVICE:'خدمة',
      } as Record<string, string>
    )[value] || value
  );
}
function buildEntityLink(type: string, slug: string): string {
  const base = (
    {
      SCHOLARSHIP: 'scholarships',
      UNIVERSITY: 'universities',
      MAJOR: 'majors',
      COURSE: 'courses',
      STUDENT_TOOL: 'tools',
      INTERNATIONAL_TEST:'exams',CMS_CONTENT:'articles',SERVICE:'services',
    } as Record<string, string>
  )[type];
  return base
    ? (studentNotificationLink(slug ? `/${base}/${slug}` : `/${base}`) ?? '/')
    : type === 'CERTIFICATE'
      ? `/certificates/verify?code=${encodeURIComponent(slug)}`
      : '/';
}
