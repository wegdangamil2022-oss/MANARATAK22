import { PreviewStudentApiClient, loginPreviewStudent } from './studentWorkspacePreviewApi';
const ApiClient = import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE === 'prototype' ? PreviewStudentApiClient : LiveApiClient;
import {OwnerReferenceNotice} from './OwnerReferenceNotice';
import {useTranslation} from '../../i18n/I18nProvider';
import {StudentPrivateToolResult} from './StudentPrivateToolResult';
import { StudentApplicationDocuments } from './StudentApplicationDocuments';
import { StudentCareerWorkspace } from './StudentCareerWorkspace';
import { StudentServiceBookingPanel } from './StudentServiceBookingPanel';
import { StudentCertificatesPanel } from '../certificates/StudentCertificatesPanel';
import { StudentNotificationsView, studentNotificationLink } from './StudentNotificationsView';
import {
  HorizontalSwipeTabs,
  WorkspaceTabCanopy,
  SummarySectionCard,
  SummarySectionIcon,
  NextStepHeroCard,
  ThisWeekScheduleCard,
  GoalMatchedSection,
  OpportunitiesDiscoverPanel,
  OpportunitiesShortlistPanel,
  OpportunitiesOffersPanel,
  StudentDocumentsLibraryPanel,
  LearningStudyPlanPanel,
  LearningTestPrepPanel,
  VaultComparisonsPanel,
  VaultToolsResultsPanel,
  ServiceDeliverablesPanel,
  AcademicProfileSummaryCard,
  StudentCalendarTasksPanel,
  StudentSupportCenterPanel,
  AccountQuickSearchModal,
} from './StudentExpandedSections';
import './student-workspace.css';
import { StudentWorkspaceShell } from './StudentWorkspaceShell';
import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Bell, BookOpen, Bookmark, CheckCircle2, ClipboardList, Compass, FileCheck2, Folder, Heart, Home, LayoutGrid, LockKeyhole, RefreshCw, Route, Settings2, Star, X, User, ListChecks, GraduationCap, CalendarClock, Sparkles, Clock3, Languages, Moon, Sun, LogIn, ShieldCheck, ChevronLeft, History as HistoryIcon, Archive, Trash2, ExternalLink, ChevronDown, ChevronUp, FileText, Check, AlertTriangle, CreditCard, Receipt, Info, LogOut, Shield, RotateCcw, Save, Eye, Search, Plus, Layers, Filter, SlidersHorizontal, ArrowUpLeft, Camera, Upload, Scale, HelpCircle } from 'lucide-react';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileSubTabRequest, setProfileSubTabRequest] = useState<'ACADEMIC' | 'SETTINGS' | 'CALENDAR' | 'SUPPORT' | null>(null);
  const [opportunitiesSubTabRequest, setOpportunitiesSubTabRequest] = useState<'ACTIVE' | 'DISCOVER' | 'SHORTLIST' | 'OFFERS' | 'DOCUMENTS' | 'ARCHIVED' | null>(null);

  useEffect(() => {
    const onAuthChange = () => setRetryKey((v) => v + 1);
    window.addEventListener('mn-preview-auth-change', onAuthChange);
    return () => window.removeEventListener('mn-preview-auth-change', onAuthChange);
  }, []);

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
      setDashboard(null);
      setIdentity(null);
      setStudentReferenceId(null);
      setError('UNAUTHENTICATED_GUEST');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تسجيل الخروج');
    } finally {
      mutationPending.current = false; setSaving(false);
    }
  }

  if (loading) return <WorkspaceSkeleton />;

  if ((error && !dashboard) || !dashboard) {
    const isProvisioning = Boolean(error && (error.includes('PROVISIONING_PENDING') || error.includes('INITIALIZING')));
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

    const guestTabMeta: Record<CanonicalWorkspaceTab, { title: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
      SUMMARY: {
        title: 'ملخصي ونظرة عامة',
        description: 'تابِع أولوياتك اليومية، خطوتك القادمة، ومواعيد التقديم الهامة خلال الأسبوع في لوحة واحدة مركزة.',
        icon: Home,
      },
      OPPORTUNITIES: {
        title: 'فرصي ومتابعة المنح',
        description: 'أدِر ملفات تقديمك على المنح الدراسية خطوة بخطوة، وتابع قائمة المهام والمستندات المطلوبة لكل منحة.',
        icon: Route,
      },
      LEARNING: {
        title: 'تعلمي ودوراتي التدريبية',
        description: 'استكمل دوراتك التدريبية المسجلة، وتابع نسبة تقدمك الأكاديمي وحمّل شهاداتك المعتمدة فور إتمام الدراسة.',
        icon: BookOpen,
      },
      VAULT: {
        title: 'محفوظاتي وخزنتي الشخصية',
        description: 'احفظ المنح الدراسية، الجامعات، التخصصات، والدورات المفضلة لديك في مجموعات منظمة للرجوع إليها في أي وقت.',
        icon: Heart,
      },
      CAREERS: {
        title: 'مساري الأكاديمي والمهني',
        description: 'ابنِ ملفك الأكاديمي والمهني واستكشف التخصصات والفرص الوظيفية التي تتناسب مع مؤهلاتك وطموحك المستقبلي.',
        icon: GraduationCap,
      },
      SERVICES: {
        title: 'طلباتي والخدمات الأكاديمية',
        description: 'قدّم على خدمات الاستشارة الأكاديمية ومراجعة المستندات، وتابع حالة طلباتك والفواتير المرتبطة بها بسهولة.',
        icon: ClipboardList,
      },
      NOTIFICATIONS: {
        title: 'إشعاراتي وتنبيهاتي الفورية',
        description: 'احصل على تنبيهات مبكرة قبل إغلاق مواعيد المنح المحفوظة، وإشعارات فورية بتحديثات طلباتك ودوراتك.',
        icon: Bell,
      },
      PROFILE: {
        title: 'إعداداتي وملفي الأكاديمي',
        description: 'أكمل بياناتك الأكاديمية، معدلك التراكمي، ومستوى اللغة لتخصيص توصيات المنح الدراسية الأنسب لملفك.',
        icon: User,
      },
    };

    const currentGuestSection = guestTabMeta[tab] || guestTabMeta.SUMMARY;
    const GuestSectionIcon = currentGuestSection.icon;

    return (
      <StudentWorkspaceShell
        activeTab={tab}
        onTabChange={handleTabChange}
        isGuest
        onOpenLogin={() => navigate('/login')}
        onOpenSignup={() => navigate('/signup')}
        onTogglePreviewAccount={() => loginPreviewStudent()}
      >
        <div className="w-full max-w-4xl mx-auto mt-0 font-['Cairo',sans-serif]">
          <WorkspaceTabCanopy
            title={currentGuestSection.title}
            icon={GuestSectionIcon}
          >
            <p className="mt-2 text-[11px] sm:text-[12px] font-medium leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
              {currentGuestSection.description}
            </p>

            <div className="mt-3.5 pt-3 border-t border-[#142B5F]/8 dark:border-white/10 flex items-center justify-start gap-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="!min-h-[34px] h-[34px] rounded-xl bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-4 py-1.5 text-[11px] sm:text-[12px] font-bold text-white inline-flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(20,43,95,0.18)] transition-all active:scale-[0.98] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-white shrink-0" />
                <span>تسجيل الدخول</span>
              </button>
            </div>
          </WorkspaceTabCanopy>
        </div>
      </StudentWorkspaceShell>
    );
  }
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

  const activeApplicationsCount = applicationTrackers.filter((item) => item.status === 'ACTIVE').length;
  const activeServiceRequestsCount = serviceRequests.filter(
    (req) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(req.status),
  ).length;
  const checklistTasks = applicationTrackers.flatMap((tracker) => tracker.checklist || []);
  const completedChecklistTasks = checklistTasks.filter((task) => task.completed).length;
  const baseCompletedProfileItems = [
    Boolean(workspace.displayName || identity?.displayName),
    Boolean(identity?.primaryEmail),
    Boolean(accountCountryName),
    Boolean(workspace.preferredLanguage),
    dashboard.savedItems.length > 0,
    dashboard.courseEnrollments.length > 0,
  ].filter(Boolean).length;
  const totalRequirementsCount = Math.max(10, 6 + checklistTasks.length);
  const completedRequirementsCount = Math.min(
    totalRequirementsCount,
    baseCompletedProfileItems + completedChecklistTasks,
  );
  const readinessPercent = Math.round((completedRequirementsCount / totalRequirementsCount) * 100);

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
      readinessPercent={readinessPercent}
      completedRequirementsCount={completedRequirementsCount}
      totalRequirementsCount={totalRequirementsCount}
      activeApplicationsCount={activeApplicationsCount}
      activeServiceRequestsCount={activeServiceRequestsCount}
      onTogglePreviewAccount={() => void logout()}
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
            onOpenSearch={() => setSearchOpen(true)}
            onOpenDocuments={() => {
              setOpportunitiesSubTabRequest('DOCUMENTS');
              handleTabChange('OPPORTUNITIES');
            }}
            onOpenCalendar={() => {
              setProfileSubTabRequest('CALENDAR');
              handleTabChange('PROFILE');
            }}
            onOpenSupport={() => {
              setProfileSubTabRequest('SUPPORT');
              handleTabChange('PROFILE');
            }}
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
            requestedSubTab={opportunitiesSubTabRequest}
            onClearRequestedSubTab={() => setOpportunitiesSubTabRequest(null)}
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
            trackers={applicationTrackers}
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
            trackers={applicationTrackers}
            requestedSubTab={profileSubTabRequest}
            onClearRequestedSubTab={() => setProfileSubTabRequest(null)}
          />
        )}

        <AccountQuickSearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          dashboard={dashboard}
          trackers={applicationTrackers}
          requests={serviceRequests}
          onNavigateTab={handleTabChange}
        />
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
  onOpenSearch,
  onOpenDocuments,
  onOpenCalendar,
  onOpenSupport,
}: {
  dashboard: StudentDashboardSummaryDto;
  invoices: StudentFinanceInvoiceDto[];
  paymentsByInvoice: Record<string, StudentFinancePaymentDto[]>;
  onTogglePayments: (invoiceId: string) => void;
  setTab: (tab: CanonicalWorkspaceTab) => void;
  identity: { principalId: string; displayName: string; primaryEmail?: string; roles?: string[]; roleNames?: string[] } | null;
  applicationTrackers: StudentApplicationTrackerDto[];
  onOpenSearch: () => void;
  onOpenDocuments: () => void;
  onOpenCalendar: () => void;
  onOpenSupport: () => void;
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

  const isNewStudent = (
    dashboard.statistics.savedItems === 0 &&
    dashboard.statistics.activeCourses === 0 &&
    dashboard.statistics.certificates === 0 &&
    applicationTrackers.length === 0
  );

  return (
    <div className="mn-summary-tab mt-0 space-y-2.5 sm:space-y-3.5 font-['Cairo',sans-serif]">
      {/* Parent Umbrella Canopy: top cap line spanning right-to-left & descending on both sides */}
      <WorkspaceTabCanopy
        title="ملخصي ونظرة عامة"
        subtitle="أولويات اليوم، مواعيد الأسبوع، واستكمال مسارك الدراسي"
        icon={LayoutGrid}
        actions={
          <>
            <button
              type="button"
              onClick={onOpenSearch}
              className="mn-summary-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Search className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
              <span>بحث</span>
            </button>
            <button
              type="button"
              onClick={onOpenSupport}
              className="mn-summary-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
              <span>الدعم</span>
            </button>
          </>
        }
      >
        {/* Embedded Quick Overview Strip: gives the student an instant 1-second snapshot right inside the umbrella */}
        <div className="mt-2.5 pt-2.5 border-t border-[#142B5F]/8 dark:border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setTab('OPPORTUNITIES')}
            className="mn-summary-stat-tile flex items-center justify-between gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 px-2.5 py-2 text-right transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                <Route className="w-3 h-3" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#DCE7F0] truncate">
                تقديمات نشطة
              </span>
            </div>
            <span className="text-[12px] sm:text-[13px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#F2CD78] shrink-0">
              {activeMilestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('LEARNING')}
            className="mn-summary-stat-tile flex items-center justify-between gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 px-2.5 py-2 text-right transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                <BookOpen className="w-3 h-3" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#DCE7F0] truncate">
                دورات جارية
              </span>
            </div>
            <span className="text-[12px] sm:text-[13px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#F2CD78] shrink-0">
              {dashboard.statistics.activeCourses}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('VAULT')}
            className="mn-summary-stat-tile flex items-center justify-between gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 px-2.5 py-2 text-right transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                <Heart className="w-3 h-3" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#DCE7F0] truncate">
                عناصر محفوظة
              </span>
            </div>
            <span className="text-[12px] sm:text-[13px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#F2CD78] shrink-0">
              {dashboard.statistics.savedItems}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab('LEARNING')}
            className="mn-summary-stat-tile flex items-center justify-between gap-2 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 px-2.5 py-2 text-right transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                <Award className="w-3 h-3" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#DCE7F0] truncate">
                شهادات صادرة
              </span>
            </div>
            <span className="text-[12px] sm:text-[13px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#F2CD78] shrink-0">
              {dashboard.statistics.certificates}
            </span>
          </button>
        </div>
      </WorkspaceTabCanopy>

      {/* 1. خطوتي التالية (Focal Priority Action — WITH selective leading accent bar) */}
      <NextStepHeroCard
        trackers={applicationTrackers}
        dashboard={dashboard}
        invoices={invoices}
        onNavigate={setTab}
      />

      {/* 2. هذا الأسبوع (Calm Grouped Schedule — NO start bars) */}
      <ThisWeekScheduleCard
        trackers={applicationTrackers}
        dashboard={dashboard}
        onNavigate={setTab}
        onOpenCalendar={onOpenCalendar}
      />

      {/* New Student Starting State */}
      {isNewStudent && (
        <SummarySectionCard title="ابدأ رحلتك الأكاديمية" icon={Sparkles}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link
              to="/scholarships"
              className="rounded-xl bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] px-3 py-2 text-[11px] font-bold text-white transition-opacity hover:opacity-95 inline-flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Route className="w-3.5 h-3.5 text-white shrink-0" />
              <span>المنح الدراسية</span>
            </Link>
            <Link
              to="/courses"
              className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 px-3 py-2 text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] hover:border-[#0E7C86]/45 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
              <span>الدورات التدريبية</span>
            </Link>
            <Link
              to="/universities"
              className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 px-3 py-2 text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] hover:border-[#0E7C86]/45 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
              <span>دليل الجامعات</span>
            </Link>
            <Link
              to="/majors"
              className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 px-3 py-2 text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] hover:border-[#0E7C86]/45 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
              <span>التخصصات</span>
            </Link>
          </div>
        </SummarySectionCard>
      )}

      {/* 3. ملفات التقديم النشطة (Active Momentum — WITH selective leading accent bar) */}
      {activeMilestones.length > 0 && (
        <SummarySectionCard
          title="ملفات التقديم النشطة"
          icon={Route}
          action={
            <button
              type="button"
              onClick={() => setTab('OPPORTUNITIES')}
              className="mn-summary-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
            </button>
          }
        >
          <div className="space-y-2">
            {[...activeMilestones]
              .sort((first, second) => (Date.parse(second.updatedAt) || 0) - (Date.parse(first.updatedAt) || 0))
              .slice(0, 2)
              .map((item) => {
                const completed = item.checklist.filter((task) => task.completed).length;
                const progress = item.checklist.length ? Math.round((completed / item.checklist.length) * 100) : 0;
                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 pr-3.5 pl-3 py-2.5 transition-all duration-200"
                  >
                    {/* Selective start-of-card accent bar for active applications */}
                    <span aria-hidden="true" className="mn-summary-start-bar" />

                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                          <GraduationCap className="h-3.5 w-3.5 text-white" />
                        </span>
                        <h4 className="min-w-0 flex-1 text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                          {trackerDisplayName(item)}
                        </h4>
                      </div>
                      <span className="shrink-0 text-[10.5px] sm:text-[11.5px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]" dir="ltr">
                        {progress}%
                      </span>
                    </div>

                    <div className="mt-2 h-[4.5px] w-full overflow-hidden rounded-full bg-white dark:bg-[#111E38] border border-[#142B5F]/8 dark:border-white/10" dir="rtl">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] dark:from-[#0E7C86] dark:to-[#38C6D4] transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] truncate">
                        {item.stage} · {completed}/{item.checklist.length} مهام
                      </span>
                      <button
                        type="button"
                        onClick={() => setTab('OPPORTUNITIES')}
                        className="mn-summary-cta-secondary shrink-0 inline-flex items-center justify-center gap-1 rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent dark:bg-[#111E38] px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] hover:text-white dark:text-[#EDF5F5] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span>متابعة الملف</span>
                        <ArrowLeft className="h-3 w-3 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </SummarySectionCard>
      )}

      {/* 4. متابعة التعلم (Active Course — calm progress card, NO start bar) */}
      {activeCourse && (
        <SummarySectionCard
          title="متابعة التعلم"
          icon={BookOpen}
          action={
            <button
              type="button"
              onClick={() => setTab('LEARNING')}
              className="mn-summary-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>جميع الدورات</span>
              <ChevronLeft className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" />
            </button>
          }
        >
          <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 px-3 py-2.5 transition-all duration-200">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                  <BookOpen className="h-3.5 w-3.5 text-white" />
                </span>
                <h4 className="min-w-0 flex-1 text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                  {activeCourse.courseName}
                </h4>
              </div>
              <span className="shrink-0 text-[10.5px] sm:text-[11.5px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]" dir="ltr">
                {Math.min(100, Math.max(0, activeCourse.progressPercentage))}%
              </span>
            </div>

            <div className="mt-2 h-[4.5px] w-full overflow-hidden rounded-full bg-white dark:bg-[#111E38] border border-[#142B5F]/8 dark:border-white/10" dir="rtl">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] dark:from-[#0E7C86] dark:to-[#38C6D4] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, activeCourse.progressPercentage))}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] truncate">
                {activeCourse.lastAccessedAt ? `آخر وصول: ${formatDate(activeCourse.lastAccessedAt)}` : `تاريخ التسجيل: ${formatDate(activeCourse.enrolledAt)}`}
              </span>
              <Link
                to={`../student/courses/${encodeURIComponent(activeCourse.courseId)}`}
                className="mn-summary-cta-secondary shrink-0 inline-flex items-center justify-center gap-1 rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent dark:bg-[#111E38] px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] hover:text-white dark:text-[#EDF5F5] transition-all whitespace-nowrap"
              >
                <span>متابعة التعلم</span>
                <ArrowLeft className="h-3 w-3 shrink-0" />
              </Link>
            </div>
          </div>
        </SummarySectionCard>
      )}

      {/* 5. مناسب لهدفي (Goal-Matched Discovery — NO start bars) */}
      <GoalMatchedSection onNavigate={setTab} />

      {/* 6. آخر الأنشطة والخطوات (Minimal Clean Timeline — NO start bars) */}
      {activityLog.length > 0 && (
        <SummarySectionCard
          title="آخر الأنشطة والخطوات"
          icon={HistoryIcon}
          action={
            <button
              type="button"
              onClick={() => setShowAllActivities((previous) => !previous)}
              aria-expanded={showAllActivities}
              aria-controls="student-summary-activity-timeline"
              className="mn-summary-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{showAllActivities ? 'إخفاء السجلات' : 'كل السجلات'}</span>
              <ChevronLeft className={`h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] transition-transform shrink-0 ${showAllActivities ? '-rotate-90' : ''}`} />
            </button>
          }
        >
          <ol id="student-summary-activity-timeline" className="mr-2 space-y-2.5 border-r-[1.5px] border-[#0E7C86]/30 dark:border-[#38C6D4]/35 pr-4">
            {(showAllActivities
              ? activityLog
              : (dashboard.timeline.length > 0
                ? [...dashboard.timeline].sort((first, second) => (Date.parse(second.occurredAt) || 0) - (Date.parse(first.occurredAt) || 0)).slice(0, 3)
                : activityLog.slice(0, 3)))
              .map((item) => (
                <li key={item.id} className="relative min-w-0">
                  <span
                    aria-hidden="true"
                    className="absolute -right-[21.5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0E7C86] dark:border-[#38C6D4] bg-white dark:bg-[#111E38]"
                  />
                  <h4 className="text-[10.5px] sm:text-[11.5px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                    {item.title}
                  </h4>
                  <time className="mt-0.5 block text-[9.5px] sm:text-[10.5px] font-medium leading-4 text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                    {formatDate(item.occurredAt)}
                  </time>
                </li>
              ))}
          </ol>
        </SummarySectionCard>
      )}

      {/* 7. الفواتير والدفعات (Compact Finance Summary — only if invoices exist) */}
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

type OpportunitiesSubTab = 'ACTIVE' | 'DISCOVER' | 'SHORTLIST' | 'OFFERS' | 'DOCUMENTS' | 'ARCHIVED';

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
  requestedSubTab,
  onClearRequestedSubTab,
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
  requestedSubTab?: OpportunitiesSubTab | null;
  onClearRequestedSubTab?: () => void;
}) {
  const [subTab, setSubTab] = useState<OpportunitiesSubTab>(requestedSubTab || 'ACTIVE');

  useEffect(() => {
    if (requestedSubTab) {
      setSubTab(requestedSubTab);
      onClearRequestedSubTab?.();
    }
  }, [requestedSubTab, onClearRequestedSubTab]);

  const activeTrackers = useMemo(() => trackers.filter((item) => item.status === 'ACTIVE'), [trackers]);
  const archivedTrackers = useMemo(() => trackers.filter((item) => item.status === 'ARCHIVED'), [trackers]);

  const upcomingDeadlines = useMemo(() => {
    return activeTrackers
      .filter((t) => t.deadlineAt || t.owner?.deadlineAt)
      .sort((a, b) => {
        const dateA = new Date(a.deadlineAt || a.owner?.deadlineAt || '').getTime();
        const dateB = new Date(b.deadlineAt || b.owner?.deadlineAt || '').getTime();
        return dateA - dateB;
      });
  }, [activeTrackers]);

  const savedScholarshipsCount = useMemo(
    () => dashboard.savedItems.filter((item) => item.entityType === 'SCHOLARSHIP' || item.entityType === 'UNIVERSITY').length,
    [dashboard.savedItems],
  );

  const subTabs = [
    { id: 'ACTIVE' as const, label: 'تقديماتي', count: activeTrackers.length, icon: CheckCircle2 },
    { id: 'DISCOVER' as const, label: 'اكتشف', icon: Compass },
    { id: 'SHORTLIST' as const, label: 'قائمتي', count: savedScholarshipsCount, icon: Star },
    { id: 'OFFERS' as const, label: 'النتائج', icon: Award },
    { id: 'DOCUMENTS' as const, label: 'المستندات', icon: FileCheck2 },
    { id: 'ARCHIVED' as const, label: 'الأرشيف', count: archivedTrackers.length, icon: Archive },
  ];

  return (
    <div className="mn-student-opportunities-page mt-0 space-y-2.5 sm:space-y-3.5 font-['Cairo',sans-serif]">
      {/* Parent Umbrella Canopy with integrated 6 sub-tabs */}
      <WorkspaceTabCanopy
        title="فرصي وملفات التقديم"
        subtitle="متابعة ملفات التقديم النشطة، الاستكشاف، النتائج والمستندات"
        icon={Route}
        metaLabel={`${trackers.length} ملف تقديم`}
      >
        <HorizontalSwipeTabs
          embedded
          ariaLabel="أقسام فرصي وملفات التقديم"
          items={subTabs}
          activeId={subTab}
          onChange={setSubTab}
        />
      </WorkspaceTabCanopy>

      {/* Sub-Tab 1: ACTIVE (تقديماتي) */}
      {subTab === 'ACTIVE' && (
        <div className="space-y-2.5 sm:space-y-3.5 min-w-0 max-w-full">
          <ApplicationTrackersPanel
            trackers={activeTrackers}
            filter="ACTIVE"
            saving={saving}
            onStageChange={onStageChange}
            onChecklistToggle={onChecklistToggle}
            onNotesUpdate={onNotesUpdate}
            onArchive={onArchive}
            onRemove={onRemove}
            onDocumentsChanged={onDocumentsChanged}
          />

          {upcomingDeadlines.length > 0 && (
            <SummarySectionCard
              title="المواعيد النهائية القريبة"
              icon={CalendarClock}
              metaLabel={`${upcomingDeadlines.length} موعد`}
            >
              <div className="overflow-hidden rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 divide-y divide-[#142B5F]/8 dark:divide-white/8">
                {upcomingDeadlines.slice(0, 4).map((tracker) => {
                  const deadlineStr = tracker.deadlineAt || tracker.owner?.deadlineAt;
                  const title = trackerDisplayName(tracker);
                  return (
                    <div
                      key={tracker.id}
                      className="flex items-center justify-between gap-2.5 px-3 py-2.5 hover:bg-white dark:hover:bg-[#142342] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                          <GraduationCap className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] truncate">
                            {title}
                          </h4>
                          <p className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-medium leading-snug text-[#5C707C] dark:text-[#9BB4C7] truncate">
                            {tracker.stage}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] sm:text-[11px] font-bold tabular-nums text-[#0E7C86] dark:text-[#38C6D4] whitespace-nowrap">
                        {formatDate(deadlineStr)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SummarySectionCard>
          )}
        </div>
      )}

      {/* Sub-Tab 2: DISCOVER (اكتشف) */}
      {subTab === 'DISCOVER' && <OpportunitiesDiscoverPanel />}

      {/* Sub-Tab 3: SHORTLIST (قائمتي المختصرة) */}
      {subTab === 'SHORTLIST' && (
        <OpportunitiesShortlistPanel
          savedItems={dashboard.savedItems}
          trackers={trackers}
          onSwitchToActive={() => setSubTab('ACTIVE')}
        />
      )}

      {/* Sub-Tab 4: OFFERS (النتائج والعروض + خطواتي بعد القبول) */}
      {subTab === 'OFFERS' && <OpportunitiesOffersPanel trackers={trackers} />}

      {/* Sub-Tab 5: DOCUMENTS (مستنداتي الموحدة) */}
      {subTab === 'DOCUMENTS' && (
        <StudentDocumentsLibraryPanel trackers={trackers} onDocumentsChanged={onDocumentsChanged} />
      )}

      {/* Sub-Tab 6: ARCHIVED (الأرشيف) */}
      {subTab === 'ARCHIVED' && (
        <ApplicationTrackersPanel
          trackers={archivedTrackers}
          filter="ARCHIVED"
          saving={saving}
          onStageChange={onStageChange}
          onChecklistToggle={onChecklistToggle}
          onNotesUpdate={onNotesUpdate}
          onArchive={onArchive}
          onRemove={onRemove}
          onDocumentsChanged={onDocumentsChanged}
        />
      )}
    </div>
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
        <SummarySectionCard title="الأرشيف" icon={Archive}>
          <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
            <span className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
              <Archive className="w-4 h-4 text-white" />
            </span>
            <h4 className="font-bold text-[12px] sm:text-[13px] text-[#142B5F] dark:text-[#F1F5F9]">
              لا توجد ملفات تقديم مؤرشفة
            </h4>
            <p className="text-[10.5px] sm:text-[11.5px] font-medium text-[#5C707C] dark:text-[#9BB4C7] mt-1 max-w-sm mx-auto leading-relaxed">
              عند إتمام تقديماتك أو أرشفتها ستظهر هنا للاحتفاظ بسجلك الأكاديمي.
            </p>
          </div>
        </SummarySectionCard>
      );
    }
    return (
      <SummarySectionCard title="ملفات التقديم النشطة" icon={Route}>
        <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
          <EmptyState
            icon={<Route className="h-7 w-7 text-[#0E7C86] dark:text-[#38C6D4]" />}
            title="لا توجد ملفات تقديم نشطة بعد"
            text="تصفح دليل المنح الدراسية واختر «متابعة التقديم» على المنحة التي ترغب بالتقديم عليها لتوليد ملف تتبع مخصص خطوة بخطوة."
            href="/scholarships"
            action="استكشف دليل المنح الآن"
          />
        </div>
      </SummarySectionCard>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3.5">
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
    <article className="relative overflow-hidden rounded-2xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] px-3 py-3 sm:px-4.5 sm:py-4 shadow-[0_2px_10px_rgba(20,43,95,0.035)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.24)] mn-panel font-['Cairo',sans-serif] transition-all">
      {/* Delicate approved top hairline */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#142B5F]/28 dark:via-[#D6A43B]/35 to-transparent"
      />

      <OwnerReferenceNotice reference={tracker.owner?.referenceState} />

      {/* Row 1: Official Manaratak Section Icon + Scholarship Title + Unboxed Status */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <SummarySectionIcon icon={GraduationCap} />
          <div className="inline-flex flex-col items-start min-w-0">
            <h3 className="text-[13px] sm:text-[14.5px] leading-tight font-extrabold text-[#142B5F] dark:text-[#F1F5F9] font-['Cairo',sans-serif] truncate max-w-full">
              {displayName}
            </h3>
            <span
              aria-hidden="true"
              className="w-full min-w-[68px] h-[1.5px] mt-0.5 rounded-full bg-[linear-gradient(270deg,rgba(14,124,134,0.68)_0%,rgba(14,124,134,0.3)_72%,transparent_100%)] dark:bg-[linear-gradient(270deg,rgba(56,198,212,0.75)_0%,rgba(56,198,212,0.34)_72%,transparent_100%)]"
            />
          </div>
        </div>

        <span
          className={`shrink-0 text-[10px] sm:text-[11px] font-bold whitespace-nowrap ${
            isArchived
              ? 'text-[#5C707C] dark:text-[#9BB4C7]'
              : 'text-[#0E7C86] dark:text-[#38C6D4]'
          }`}
        >
          {isArchived ? 'مؤرشف' : 'تقديم نشط'}
        </span>
      </div>

      {/* Row 2: Clean 2x2 Info Tiles on Mobile / 4x1 on Desktop with unified Navy-to-Petrol mini icons */}
      <div className="relative z-10 mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 py-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
              <Compass className="h-2.5 w-2.5 text-white" aria-hidden="true" />
            </span>
            <span className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] truncate">
              الدولة / الوجهة
            </span>
          </div>
          <span className="mt-1 block text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] truncate leading-snug">
            {tracker.owner?.country || 'منحة دولية'}
          </span>
        </div>

        <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 py-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
              <CalendarClock className="h-2.5 w-2.5 text-white" aria-hidden="true" />
            </span>
            <span className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] truncate">
              موعد التقديم
            </span>
          </div>
          <span className="mt-1 block text-[10.5px] sm:text-[11px] font-bold tabular-nums text-[#0E7C86] dark:text-[#38C6D4] truncate leading-snug">
            {deadlineStr ? formatDate(deadlineStr) : 'مفتوح / متجدد'}
          </span>
        </div>

        <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 py-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
              <Sparkles className="h-2.5 w-2.5 text-white" aria-hidden="true" />
            </span>
            <span className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] truncate">
              المرحلة الحالية
            </span>
          </div>
          <span className="mt-1 block text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] truncate leading-snug">
            {tracker.stage}
          </span>
        </div>

        <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 py-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
              <ListChecks className="h-2.5 w-2.5 text-white" aria-hidden="true" />
            </span>
            <span className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] truncate">
              نسبة الجاهزية
            </span>
          </div>
          <span className="mt-1 block text-[10.5px] sm:text-[11px] font-extrabold text-[#142B5F] dark:text-[#38C6D4] leading-snug tabular-nums" dir="ltr">
            {progress}% ({completed}/{total})
          </span>
        </div>
      </div>

      {/* Row 3: Progress & Next Actionable Step (WITH selective start-bar on active trackers only) */}
      <div
        className={`relative z-10 overflow-hidden mt-2 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 py-2.5 transition-all ${
          isArchived ? 'px-3' : 'pr-3.5 pl-3'
        }`}
      >
        {!isArchived && <span aria-hidden="true" className="mn-summary-start-bar" />}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            </span>
            <span className="text-[10.5px] sm:text-[11.5px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] tabular-nums">
              المهام المنجزة: {completed} من {total}
            </span>
          </div>
          <span className="text-[9.5px] sm:text-[10px] font-medium text-[#5C707C] dark:text-[#9BB4C7] tabular-nums shrink-0">
            آخر تحديث: {formatDate(tracker.updatedAt)}
          </span>
        </div>

        <div className="mt-2 h-[4.5px] w-full overflow-hidden rounded-full bg-white dark:bg-[#111E38] border border-[#142B5F]/8 dark:border-white/10" dir="rtl">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] dark:from-[#0E7C86] dark:to-[#38C6D4] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {nextTask && (
          <div className="mt-2 flex items-center justify-between gap-2 text-[9.5px] sm:text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7]">
            <span className="min-w-0 flex-1 break-words leading-snug">
              <strong className="font-bold text-[#0E7C86] dark:text-[#38C6D4]">الخطوة القادمة:</strong>{' '}
              <span className="font-semibold text-[#142B5F] dark:text-[#DCE7F0]">{nextTask.label}</span>
            </span>
          </div>
        )}
      </div>

      {/* Source Unavailability Notice */}
      {tracker.owner && !tracker.owner.available && (
        <div className="relative z-10 mt-2 rounded-xl bg-[#0E7C86]/[0.06] dark:bg-[#38C6D4]/10 px-3 py-2 text-[10px] font-bold text-[#142B5F] dark:text-[#DCE7F0] flex items-center gap-2 border border-[#0E7C86]/25">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" />
          <span>غير معروضة حاليًا لدى المصدر؛ وسجلك محفوظ بحسابك.</span>
        </div>
      )}

      {/* Row 4: Documents and application cycle accordion */}
      <div className="relative z-10 w-full max-w-full min-w-0">
        <StudentApplicationDocuments tracker={tracker} onChanged={onDocumentsChanged} />
      </div>

      {/* Row 5: Clean Unified Action Bar */}
      <div className="relative z-10 mt-2.5 pt-2.5 border-t border-[#142B5F]/8 dark:border-white/8 flex items-center justify-between gap-1.5 font-['Cairo',sans-serif]">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="mn-student-opp-btn-primary inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 text-white shadow-[0_2px_8px_rgba(20,43,95,0.16)] transition-all active:scale-[0.98] cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>{expanded ? 'إخفاء التفاصيل' : 'تفاصيل الملف والمهام'}</span>
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-white shrink-0" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3 text-white shrink-0" aria-hidden="true" />
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {slug && (
            <Link
              to={`/scholarships/${encodeURIComponent(slug)}`}
              className="mn-student-opp-btn-secondary inline-flex items-center justify-center gap-1 border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 text-[#142B5F] dark:text-[#EDF5F5] transition-all cursor-pointer"
              title="صفحة المنحة"
            >
              <ExternalLink className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" aria-hidden="true" />
              <span>المنحة</span>
            </Link>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => onArchive(tracker)}
            className="mn-student-opp-btn-secondary inline-flex items-center justify-center gap-1 border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 text-[#142B5F] dark:text-[#DCE7F0] transition-all cursor-pointer disabled:opacity-50"
            title={isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
          >
            <Archive className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4] shrink-0" aria-hidden="true" />
            <span>{isArchived ? 'استعادة' : 'أرشفة'}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => onRemove(tracker)}
            className="mn-student-opp-btn-secondary inline-flex items-center justify-center gap-1 border border-[#142B5F]/12 dark:border-white/12 bg-transparent hover:bg-[#F6F8FA] dark:hover:bg-[#0B1529]/80 text-[#5C707C] dark:text-[#9BB4C7] hover:text-[#142B5F] dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="إزالة"
          >
            <Trash2 className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>إزالة</span>
          </button>
        </div>
      </div>

      {/* Expanded Details: Stage selector, Checklist, Notes (clean Frost/White blocks without redundant bars) */}
      {expanded && (
        <div className="mn-student-tracker-details relative z-10 mt-3 space-y-2.5 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/70 p-2.5 sm:p-3 animate-in fade-in duration-200">
          {/* Sub-section 1: Stage Selector */}
          <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 sm:p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
              <label className="text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] leading-snug">
                المرحلة الحالية للتقديم
              </label>
            </div>
            <p className="mt-1 mb-2 text-[9.5px] sm:text-[10px] font-medium leading-snug text-[#5C707C] dark:text-[#9BB4C7]">
              اختر الخطوة التي وصلت إليها لتحديث حالة ملفك تلقائيًا.
            </p>
            <select
              disabled={saving}
              value={tracker.stage}
              onChange={(event) => onStageChange(tracker, event.target.value)}
              className="h-[34px] w-full rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 py-1 text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] outline-none transition-colors focus:border-[#0E7C86] disabled:opacity-60"
            >
              {APPLICATION_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-section 2: Checklist Items */}
          <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 sm:p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                  <ListChecks className="h-3 w-3 text-white" />
                </span>
                <span className="text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] leading-snug truncate">
                  قائمة المهام والمتطلبات
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]">
                {completed} من {total} مكتمل
              </span>
            </div>
            <p className="mt-1 mb-2 text-[9.5px] sm:text-[10px] font-medium leading-snug text-[#5C707C] dark:text-[#9BB4C7]">
              علّم على المتطلبات التي أنجزتها لتحديث نسبة الجاهزية.
            </p>
            <div className="space-y-1.5">
              {tracker.checklist.map((item) => (
                <label
                  key={item.id}
                  className={`flex min-h-[36px] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10.5px] leading-snug transition-colors cursor-pointer ${
                    item.completed
                      ? 'border-[#0E7C86]/22 bg-[#0E7C86]/[0.05] dark:bg-[#38C6D4]/[0.08] text-[#5C707C] dark:text-[#9BB4C7]'
                      : 'border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 text-[#142B5F] dark:text-[#F1F5F9] font-bold'
                  }`}
                >
                  <input
                    disabled={saving}
                    type="checkbox"
                    checked={item.completed}
                    onChange={(event) => onChecklistToggle(tracker, item.id, event.target.checked)}
                    className="h-[15px] w-[15px] shrink-0 rounded accent-[#0E7C86]"
                  />
                  <span className={`min-w-0 flex-1 font-['Cairo',sans-serif] text-[10.5px] leading-snug break-words ${item.completed ? 'line-through opacity-75' : ''}`}>
                    {item.label}
                  </span>
                  {item.completedAt && (
                    <span className="shrink-0 text-[9px] font-semibold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]">
                      {formatDate(item.completedAt)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Sub-section 3: Notes Section */}
          <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-2.5 sm:p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                  <FileText className="h-3 w-3 text-white" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold text-[#142B5F] dark:text-[#F1F5F9] leading-snug truncate">
                  ملاحظاتي على ملف التقديم
                </span>
              </div>
              {!editingNotes && (
                <button
                  type="button"
                  onClick={() => setEditingNotes(true)}
                  className="inline-flex h-[26px] shrink-0 items-center justify-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 px-2.5 text-[9.5px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors hover:border-[#0E7C86]/55 cursor-pointer"
                >
                  <FileText className="h-2.5 w-2.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                  <span>{tracker.notes ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}</span>
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-2 mt-1">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="سجّل أي تفاصيل مهمة (مثل اسم المشرف، تاريخ المقابلة، الملاحظات المطلوبة)..."
                  rows={3}
                  maxLength={500}
                  className="min-h-[72px] w-full resize-y rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 py-1.5 text-[10.5px] leading-relaxed text-[#142B5F] dark:text-[#F1F5F9] outline-none transition-colors placeholder:text-[#5C707C] focus:border-[#0E7C86]"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNotesDraft(tracker.notes || '');
                      setEditingNotes(false);
                    }}
                    className="inline-flex h-[28px] items-center justify-center rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 text-[10px] font-bold text-[#5C707C] dark:text-[#9BB4C7] transition-colors hover:bg-white cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveNotes}
                    className="inline-flex h-[28px] items-center justify-center rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-3 text-[10px] font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    حفظ الملاحظة
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 rounded-lg border border-[#142B5F]/8 dark:border-white/8 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-2.5 py-2 text-[10px] sm:text-[10.5px] font-medium leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
                {tracker.notes || 'لا توجد ملاحظات مسجلة لهذا الملف حتى الآن.'}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

type LearningSubTab = 'COURSES' | 'PLAN' | 'EXAMS' | 'CERTIFICATES';

function LearningView({ dashboard }: { dashboard: StudentDashboardSummaryDto }) {
  const [subTab, setSubTab] = useState<LearningSubTab>(() =>
    typeof window !== 'undefined' && window.location.hash === '#certificates' ? 'CERTIFICATES' : 'COURSES'
  );
  const [courseFilter, setCourseFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [certRefreshKey, setCertRefreshKey] = useState(0);

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
  const hasBothCourseStates = inProgressCourses.length > 0 && completedCourses.length > 0;

  const learningSubTabs = [
    { id: 'COURSES' as const, label: 'دوراتي', count: dashboard.courseEnrollments.length, icon: BookOpen },
    { id: 'PLAN' as const, label: 'خطتي', icon: ListChecks },
    { id: 'EXAMS' as const, label: 'الاختبارات', icon: GraduationCap },
    { id: 'CERTIFICATES' as const, label: 'شهاداتي', count: certificates.length, icon: Award },
  ];

  return (
    <div className="mn-student-learning-page mt-0 space-y-2.5 sm:space-y-3.5 font-['Cairo',sans-serif]">
      {/* Parent Umbrella Canopy with architectural top-and-side line + integrated 4 sub-tabs */}
      <WorkspaceTabCanopy
        title="تعليمي وإنجازاتي"
        subtitle="الدورات المسجلة، خطة الدراسة الأسبوعية، الاختبارات والشهادات"
        icon={BookOpen}
        metaLabel={`${dashboard.courseEnrollments.length} دورة · ${certificates.length} شهادة`}
      >
        <HorizontalSwipeTabs
          embedded
          ariaLabel="أقسام تعلمي وإنجازاتي"
          items={learningSubTabs}
          activeId={subTab}
          onChange={setSubTab}
        />
      </WorkspaceTabCanopy>

      {dashboard.capabilityStatus?.learning === 'DEGRADED' && <Alert tone="warning" message="تعذر تحميل الدورات حالياً؛ القائمة الحالية لا تعني عدم وجود تسجيلات." />}
      {dashboard.capabilityStatus?.certificates === 'DEGRADED' && <Alert tone="warning" message="تعذر تحميل الشهادات حالياً. أعد تحديث الحساب." />}

      {subTab === 'COURSES' && (
        <div className="space-y-2.5 sm:space-y-3.5">
          {!hasAnyLearningData ? (
            <SummarySectionCard title="ابدأ رحلتك التعليمية" icon={BookOpen}>
              <div className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center">
                <p className="text-[11px] sm:text-[12px] font-semibold leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
                  سجّل في دورة من دليل منارتك لتظهر هنا الدروس التي تتابعها ونسب إنجازك.
                </p>
                <Link
                  to="/courses"
                  className="mt-3 inline-flex h-[32px] items-center justify-center gap-1.5 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] px-4 text-[11px] font-bold text-white shadow-2xs transition-opacity hover:opacity-95"
                >
                  <span>تصفح الدورات التدريبية</span>
                  <ArrowLeft className="h-3.5 w-3.5 text-white shrink-0" />
                </Link>
              </div>
            </SummarySectionCard>
          ) : (
            <>
              {/* Compact course status switcher when both in-progress and completed courses exist */}
              {hasBothCourseStates && (
                <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] p-1 shadow-[0_2px_8px_rgba(20,43,95,0.03)]">
                  {[
                    { id: 'ALL' as const, label: `الكل (${dashboard.courseEnrollments.length})` },
                    { id: 'IN_PROGRESS' as const, label: `قيد التعلم (${inProgressCourses.length})` },
                    { id: 'COMPLETED' as const, label: `مكتملة (${completedCourses.length})` },
                  ].map((item) => {
                    const active = courseFilter === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCourseFilter(item.id)}
                        className={`mn-workspace-btn-sm rounded-lg px-2 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer truncate ${
                          active
                            ? 'bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.16)]'
                            : 'bg-[#F6F8FA] dark:bg-[#0B1529]/80 text-[#142B5F] dark:text-[#DCE7F0] hover:bg-white dark:hover:bg-[#142342]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {(courseFilter === 'ALL' || courseFilter === 'IN_PROGRESS') && (
                <SummarySectionCard
                  title="دورات قيد التعلم"
                  icon={Clock3}
                  metaLabel={`${inProgressCourses.length} دورة`}
                >
                  {inProgressCourses.length === 0 ? (
                    <p className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3.5 text-center text-[11px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                      لا توجد دورات قيد التعلم حاليًا.
                    </p>
                  ) : (
                    <div className={`grid gap-2.5 ${inProgressCourses.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                      {inProgressCourses.map((course) => (
                        <article
                          key={course.enrollmentId || course.courseId}
                          className="mn-student-learning-course relative overflow-hidden flex min-w-0 flex-col justify-between rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 pr-3.5 pl-3 py-2.5 transition-all duration-200 font-['Cairo',sans-serif]"
                        >
                          {/* Selective start-bar for active in-progress courses */}
                          <span aria-hidden="true" className="mn-summary-start-bar" />

                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                                  <BookOpen className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                                </span>
                                <h4 className="min-w-0 flex-1 text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                                  {course.courseName}
                                </h4>
                              </div>
                              <span className="shrink-0 text-[10.5px] sm:text-[11.5px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]" dir="ltr">
                                {Math.min(100, Math.max(0, course.progressPercentage))}%
                              </span>
                            </div>

                            <div className="mt-2 h-[4.5px] w-full overflow-hidden rounded-full bg-white dark:bg-[#111E38] border border-[#142B5F]/8 dark:border-white/10" dir="rtl">
                              <div
                                className="h-full rounded-full bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] dark:from-[#0E7C86] dark:to-[#38C6D4] transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.max(0, course.progressPercentage))}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-[#142B5F]/8 dark:border-white/8 flex items-center justify-between gap-2">
                            <span className="text-[9.5px] sm:text-[10.5px] font-medium text-[#5C707C] dark:text-[#9BB4C7] truncate tabular-nums">
                              {course.lastAccessedAt
                                ? `آخر وصول: ${formatDate(course.lastAccessedAt)}`
                                : `التسجيل: ${formatDate(course.enrolledAt)}`}
                            </span>
                            <Link
                              to={`../student/courses/${encodeURIComponent(course.courseId)}`}
                              className="mn-workspace-btn-sm shrink-0 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-2.5 text-[10px] sm:text-[11px] font-bold text-white shadow-[0_2px_6px_rgba(20,43,95,0.16)] transition-all whitespace-nowrap"
                            >
                              <span>متابعة التعلم</span>
                              <ArrowLeft className="h-3 w-3 text-white shrink-0" aria-hidden="true" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </SummarySectionCard>
              )}

              {(courseFilter === 'ALL' || courseFilter === 'COMPLETED') && (
                <SummarySectionCard
                  title="الدورات المكتملة"
                  icon={CheckCircle2}
                  metaLabel={`${completedCourses.length} دورة`}
                >
                  {completedCourses.length === 0 ? (
                    <p className="rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3.5 text-center text-[11px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                      لا توجد دورات مكتملة حتى الآن.
                    </p>
                  ) : (
                    <div className={`grid gap-2.5 ${completedCourses.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                      {completedCourses.map((course) => (
                        <article
                          key={course.enrollmentId || course.courseId}
                          className="mn-student-learning-course flex min-w-0 flex-col justify-between rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 dark:hover:border-[#38C6D4]/45 px-3 py-2.5 transition-all duration-200 font-['Cairo',sans-serif]"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                                  <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                                </span>
                                <h4 className="min-w-0 flex-1 text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words">
                                  {course.courseName}
                                </h4>
                              </div>
                              <span className="shrink-0 text-[10px] sm:text-[11px] font-extrabold tabular-nums text-[#0E7C86] dark:text-[#38C6D4]">
                                100% · مكتملة
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-[#142B5F]/8 dark:border-white/8 flex items-center justify-between gap-2">
                            <span className="text-[9.5px] sm:text-[10.5px] font-medium text-[#5C707C] dark:text-[#9BB4C7] truncate tabular-nums">
                              {course.completedAt ? `أُتمّت: ${formatDate(course.completedAt)}` : 'مكتملة بنجاح'}
                            </span>
                            <Link
                              to={`../student/courses/${encodeURIComponent(course.courseId)}`}
                              className="mn-workspace-btn-sm shrink-0 inline-flex items-center justify-center gap-1 rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent dark:bg-[#111E38] px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] hover:text-white dark:text-[#EDF5F5] transition-all whitespace-nowrap"
                            >
                              <span>مراجعة المواد</span>
                              <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden="true" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </SummarySectionCard>
              )}

              {courseFilter === 'ALL' && otherCourses.length > 0 && (
                <SummarySectionCard
                  title="تسجيلات معلقة أو سابقة"
                  icon={ClipboardList}
                  metaLabel={`${otherCourses.length} تسجيل`}
                >
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {otherCourses.map((course) => (
                      <CourseCard key={course.enrollmentId || course.courseId} course={course} />
                    ))}
                  </div>
                </SummarySectionCard>
              )}
            </>
          )}
        </div>
      )}

      {subTab === 'PLAN' && <LearningStudyPlanPanel dashboard={dashboard} />}

      {subTab === 'EXAMS' && <LearningTestPrepPanel />}

      {subTab === 'CERTIFICATES' && (
        <SummarySectionCard
          title="إنجازاتي وشهاداتي"
          icon={Award}
          metaLabel={`${certificates.length} شهادة`}
          action={
            <button
              type="button"
              onClick={() => setCertRefreshKey((value) => value + 1)}
              className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/55 px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] dark:text-[#EDF5F5] transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
              <span>تحديث</span>
            </button>
          }
        >
          <StudentCertificatesPanel initial={certificates} compactLearning externalRefreshKey={certRefreshKey} />
        </SummarySectionCard>
      )}
    </div>
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
    case 'REQUESTED':
      return { label: 'طلب جديد', className: 'text-[#0E7C86] dark:text-[#38C6D4]' };
    case 'ACCEPTED':
      return { label: 'مقبول', className: 'text-[#0E7C86] dark:text-[#38C6D4]' };
    case 'AWAITING_PAYMENT':
      return { label: 'بانتظار الدفع', className: 'text-[#142B5F] dark:text-[#F2CD78]' };
    case 'COMPLETED':
    case 'FULFILLED':
    case 'RESOLVED':
      return { label: 'مكتمل بنجاح', className: 'text-[#0E7C86] dark:text-[#38C6D4]' };
    case 'IN_PROGRESS':
    case 'PROCESSING':
    case 'IN_REVIEW':
      return { label: 'قيد المراجعة والتنفيذ', className: 'text-[#0E7C86] dark:text-[#38C6D4]' };
    case 'ACTION_REQUIRED':
    case 'NEEDS_INPUT':
      return { label: 'يتطلب إجراء منك', className: 'text-[#142B5F] dark:text-[#F2CD78]' };
    case 'PENDING':
    case 'SUBMITTED':
      return { label: 'تم الاستلام وجارٍ التحقق', className: 'text-[#142B5F] dark:text-white' };
    case 'CANCELLED':
      return { label: 'ملغي', className: 'text-[#5C707C] dark:text-[#9BB4C7]' };
    case 'REJECTED':
      return { label: 'غير مكتمل', className: 'text-[#5C707C] dark:text-[#9BB4C7]' };
    default:
      return { label: status, className: 'text-[#5C707C] dark:text-[#9BB4C7]' };
  }
}

function getInvoiceStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'PAID':
      return { label: 'مدفوعة بالكامل', className: 'text-[#0E7C86] dark:text-[#38C6D4]' };
    case 'PENDING':
    case 'ISSUED':
    case 'UNPAID':
      return { label: 'بانتظار السداد', className: 'text-[#142B5F] dark:text-[#F2CD78]' };
    case 'PROCESSING':
      return { label: 'قيد المعالجة', className: 'text-[#0E7C86] dark:text-[#38C6D4]' };
    case 'OVERDUE':
      return { label: 'متأخرة السداد', className: 'text-[#142B5F] dark:text-[#F2CD78]' };
    case 'VOIDED':
    case 'CANCELLED':
      return { label: 'ملغاة', className: 'text-[#5C707C] dark:text-[#9BB4C7]' };
    case 'REFUNDED':
      return { label: 'مسترجعة', className: 'text-[#5C707C] dark:text-[#9BB4C7]' };
    case 'DRAFT':
      return { label: 'مسودة', className: 'text-[#5C707C] dark:text-[#9BB4C7]' };
    case 'FAILED':
      return { label: 'تعذر السداد', className: 'text-[#5C707C] dark:text-[#9BB4C7]' };
    default:
      return { label: status, className: 'text-[#5C707C] dark:text-[#9BB4C7]' };
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

type ServicesSubTab = 'REQUESTS' | 'BOOKINGS' | 'DELIVERABLES' | 'INVOICES';

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
  const [activeTab, setActiveTab] = useState<ServicesSubTab>('REQUESTS');
  useEffect(() => {
    if (selected) setActiveTab('REQUESTS');
  }, [selected?.id]);

  const matchedInvoice = useMemo(() => {
    if (!selected) return undefined;
    return invoices.find(
      (inv) =>
        (selected.financeInvoiceId && inv.id === selected.financeInvoiceId) ||
        (selected.financeInvoicePublicId && inv.publicId === selected.financeInvoicePublicId),
    );
  }, [selected, invoices]);

  const hasAnyRequestsOrInvoices =
    requests.length > 0 ||
    invoices.length > 0 ||
    Boolean(selected) ||
    Boolean(requestedNotFoundId) ||
    Boolean(invoiceError);

  const serviceSubTabs = [
    { id: 'REQUESTS' as const, label: 'طلباتي', count: requests.length, icon: ClipboardList },
    { id: 'BOOKINGS' as const, label: 'المواعيد', icon: CalendarClock },
    { id: 'DELIVERABLES' as const, label: 'المخرجات', icon: FileText },
    { id: 'INVOICES' as const, label: 'الفواتير', count: invoices.length, icon: Receipt },
  ];

  return (
    <div className="mt-0 space-y-3 font-['Cairo',sans-serif]" aria-busy={serviceLoading}>
      <WorkspaceTabCanopy
        title="طلباتي ومدفوعاتي"
        subtitle="طلبات الخدمات، المواعيد الاستشارية، المخرجات والفواتير"
        icon={ClipboardList}
        actions={
          <Link
            to="/services"
            className="mn-workspace-btn-sm inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-2.5 text-[10px] sm:text-[10.5px] font-bold text-white shadow-2xs transition-opacity"
          >
            <Sparkles className="h-3 w-3 text-white" aria-hidden="true" />
            <span>استكشف الخدمات</span>
          </Link>
        }
      >
        <HorizontalSwipeTabs
          embedded
          ariaLabel="أقسام طلباتي ومدفوعاتي"
          items={serviceSubTabs}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      </WorkspaceTabCanopy>

      {serviceError && (
        <div className="space-y-2" role="alert">
          <Alert tone="error" message={serviceError} />
          <button
            type="button"
            onClick={onRetry}
            className="mn-workspace-btn-sm inline-flex items-center rounded-lg border border-[#0E7C86]/28 bg-[#F6F8FA] dark:bg-[#111E38] px-3 text-[10.5px] font-bold text-[#142B5F] dark:text-white cursor-pointer"
          >
            إعادة تحميل الطلبات
          </button>
        </div>
      )}
      {invoiceError && (
        <div className="space-y-2">
          <Alert tone="error" message={invoiceError} />
          <button
            type="button"
            onClick={onRetry}
            className="mn-workspace-btn-sm inline-flex items-center rounded-lg border border-[#0E7C86]/28 bg-[#F6F8FA] dark:bg-[#111E38] px-3 text-[10.5px] font-bold text-[#142B5F] dark:text-white cursor-pointer"
          >
            إعادة تحميل الفواتير
          </button>
        </div>
      )}

      {serviceLoading && (
        <p
          role="status"
          className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-white dark:bg-[#111E38] px-3 py-2 text-[10.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]"
        >
          جارٍ تحديث الطلبات…
        </p>
      )}

      {/* Sub-Tab 2: BOOKINGS (الحجوزات والمواعيد) */}
      {activeTab === 'BOOKINGS' &&
        (selected || requests[0] ? (
          <StudentServiceBookingPanel requestId={(selected || requests[0]).id} />
        ) : (
          <SummarySectionCard title="الحجوزات والمواعيد الاستشارية" icon={CalendarClock}>
            <p className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center text-[11px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">
              عند تقديم طلب خدمة استشارية ستتمكن من حجز موعد الجلسة وإدارته مباشرة من هنا.
            </p>
          </SummarySectionCard>
        ))}

      {/* Sub-Tab 3: DELIVERABLES (الملفات المستلمة) */}
      {activeTab === 'DELIVERABLES' && <ServiceDeliverablesPanel requests={requests} />}

      {/* Sub-Tab 1 & 4: REQUESTS or INVOICES */}
      {activeTab !== 'BOOKINGS' &&
        activeTab !== 'DELIVERABLES' &&
        (serviceLoading && activeTab === 'REQUESTS' ? (
          <SummarySectionCard title="سجل الطلبات المقدمة" icon={ClipboardList}>
            <p
              role="status"
              className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center text-[11px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]"
            >
              جارٍ تحميل بيانات الطلبات…
            </p>
          </SummarySectionCard>
        ) : !hasAnyRequestsOrInvoices && serviceError ? (
          <SummarySectionCard title="سجل الطلبات المقدمة" icon={ClipboardList}>
            <p className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center text-[11px] text-[#5C707C] dark:text-[#9BB4C7]">
              تعذر جلب الطلبات حاليًا. يمكنك إعادة المحاولة دون فقدان اختيارك.
            </p>
          </SummarySectionCard>
        ) : !hasAnyRequestsOrInvoices ? (
          <SummarySectionCard title="سجل الطلبات والخدمات" icon={ClipboardList}>
            <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
              <span className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
              </span>
              <h4 className="text-[11.5px] sm:text-[12.5px] font-bold text-[#142B5F] dark:text-white">
                {statusFilter ? 'لا توجد طلبات مطابقة للحالة المختارة' : 'لا توجد طلبات خدمات أو فواتير مسجلة'}
              </h4>
              <p className="mt-1 text-[10.5px] sm:text-[11px] leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
                {statusFilter
                  ? 'اختر «جميع الحالات» لعرض الطلبات الأخرى، أو تصفح دليل الخدمات.'
                  : 'يمكنك استكشاف الخدمات الأكاديمية والاستشارية، وستظهر طلباتك وفواتيرك هنا عند توفرها.'}
              </p>
              <Link
                to="/services"
                className="mn-workspace-btn-sm mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-3.5 text-[10.5px] font-bold text-white shadow-2xs transition-opacity"
              >
                <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                <span>استكشف دليل الخدمات</span>
              </Link>
            </div>
          </SummarySectionCard>
        ) : activeTab === 'REQUESTS' ? (
          requests.length === 0 && !selected && !requestedNotFoundId ? (
            <SummarySectionCard title="سجل الطلبات المقدمة" icon={ClipboardList}>
              <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
                <ClipboardList className="h-6 w-6 mx-auto text-[#0E7C86] dark:text-[#38C6D4] mb-1.5" aria-hidden="true" />
                <h4 className="text-[11.5px] sm:text-[12.5px] font-bold text-[#142B5F] dark:text-white">
                  {serviceError
                    ? 'تعذر تحميل طلباتك حاليًا'
                    : statusFilter
                      ? 'لا توجد طلبات مطابقة للحالة المختارة'
                      : 'لا توجد طلبات خدمات معروضة حاليًا'}
                </h4>
                <p className="mt-1 text-[10.5px] sm:text-[11px] leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
                  {serviceError
                    ? 'يمكنك إعادة تحميل الطلبات من الزر أعلاه. ستبقى الفواتير المحمّلة متاحة هنا.'
                    : 'يمكنك اختيار حالة أخرى أو الاطلاع على الفواتير والمدفوعات أو تقديم طلب جديد عبر دليل الخدمات.'}
                </p>
                <Link
                  to="/services"
                  className="mn-workspace-btn-sm mt-3 inline-flex items-center gap-1 rounded-xl bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] px-3 text-[10.5px] font-bold text-white"
                >
                  <span>دليل الخدمات</span>
                </Link>
              </div>
            </SummarySectionCard>
          ) : (
            <div className="space-y-3">
              {/* Requests List Section with embedded compact status filter */}
              <SummarySectionCard
                title="سجل الطلبات"
                icon={ClipboardList}
                action={
                  <div className="flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                    <label htmlFor="service-status-select" className="sr-only">
                      تصفية حسب حالة الطلب
                    </label>
                    <select
                      id="service-status-select"
                      value={statusFilter}
                      onChange={(event) => onStatusFilterChange(event.target.value)}
                      className="mn-workspace-select-sm rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529] px-2 font-bold text-[#142B5F] dark:text-white outline-none focus:border-[#0E7C86] cursor-pointer"
                    >
                      <option value="">جميع الحالات</option>
                      {['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED', 'CANCELLED'].map(
                        (status) => (
                          <option key={status} value={status}>
                            {getServiceRequestStatusBadge(status).label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                }
              >
                <div className="space-y-2">
                  {requests.length === 0 && (
                    <p className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3 text-[11px] text-[#5C707C] dark:text-[#9BB4C7]">
                      لا توجد طلبات في القائمة المعروضة حاليًا. يمكنك مراجعة تفاصيل الطلب المفتوح بالأسفل.
                    </p>
                  )}
                  {requests.map((request) => {
                    const statusInfo = getServiceRequestStatusBadge(request.status);
                    const isSelected =
                      selected?.id === request.id || selected?.publicId === request.publicId;
                    const hasDirectInvoice = !!(
                      (request.financeInvoiceId && invoices.some((i) => i.id === request.financeInvoiceId)) ||
                      (request.financeInvoicePublicId &&
                        invoices.some((i) => i.publicId === request.financeInvoicePublicId))
                    );

                    return (
                      <button
                        key={request.id}
                        type="button"
                        disabled={saving}
                        aria-pressed={isSelected}
                        aria-label={`عرض تفاصيل طلب الخدمة رقم ${request.publicId || request.id}`}
                        onClick={() => onOpen(request.publicId || request.id)}
                        className={`relative overflow-hidden w-full min-w-0 text-right rounded-xl border p-2.5 sm:p-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'mn-summary-start-bar border-[#0E7C86]/45 dark:border-[#38C6D4]/50 bg-white dark:bg-[#111E38] shadow-2xs'
                            : 'border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 hover:bg-white dark:hover:bg-[#111E38] hover:border-[#0E7C86]/35'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                              <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-white break-words tabular-nums">
                                طلب خدمة رقم #{request.publicId}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                                <span>تاريخ التقديم: {formatDate(request.createdAt)}</span>
                                {hasDirectInvoice && (
                                  <>
                                    <span className="opacity-45">·</span>
                                    <span className="inline-flex items-center gap-0.5 text-[#0E7C86] dark:text-[#38C6D4]">
                                      <Receipt className="h-2.5 w-2.5" aria-hidden="true" />
                                      <span>فاتورة مرتبطة</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className={`shrink-0 text-[9.5px] sm:text-[10px] font-bold ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SummarySectionCard>

              {/* Selected Request Details */}
              {selected ? (
                <SummarySectionCard
                  title="تفاصيل الطلب المحدد"
                  icon={FileText}
                  metaLabel={`#${selected.publicId}`}
                >
                  <div className="space-y-3.5">
                    {/* Top Details Summary */}
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 border-b border-[#142B5F]/10 dark:border-white/10 pb-2.5">
                      <div>
                        <h4 className="text-[11px] sm:text-[12.5px] font-bold leading-snug text-[#142B5F] dark:text-white tabular-nums">
                          طلب خدمة رقم{' '}
                          <span className="text-[#0E7C86] dark:text-[#38C6D4]">#{selected.publicId}</span>
                        </h4>
                        <div className="text-[9.5px] sm:text-[10px] font-medium text-[#5C707C] dark:text-[#9BB4C7] mt-0.5 tabular-nums">
                          الإنشاء: {formatDate(selected.createdAt)} · آخر تحديث: {formatDate(selected.updatedAt)}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] sm:text-[10.5px] font-bold ${getServiceRequestStatusBadge(selected.status).className}`}
                      >
                        {getServiceRequestStatusBadge(selected.status).label}
                      </span>
                    </div>

                    {/* Action Required Banner */}
                    {(selected.status.toUpperCase() === 'ACTION_REQUIRED' ||
                      selected.status.toUpperCase() === 'NEEDS_INPUT') && (
                      <div className="mn-summary-start-bar relative overflow-hidden rounded-xl border border-[#0E7C86]/30 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3 flex items-start gap-2.5">
                        <AlertTriangle
                          className="h-4 w-4 shrink-0 mt-0.5 text-[#0E7C86] dark:text-[#38C6D4]"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-[#142B5F] dark:text-white">
                            يتطلب هذا الطلب إجراءً منك
                          </div>
                          <div className="mt-0.5 leading-relaxed text-[10px] sm:text-[11px] text-[#5C707C] dark:text-[#9BB4C7]">
                            {selected.fulfillmentMetadata &&
                            (selected.fulfillmentMetadata.instructions ||
                              selected.fulfillmentMetadata.actionInstructions)
                              ? String(
                                  selected.fulfillmentMetadata.instructions ||
                                    selected.fulfillmentMetadata.actionInstructions,
                                )
                              : 'يرجى مراجعة تفاصيل وملاحظات الطلب لاستكمال المعالجة أو التواصل مع الدعم الأكاديمي.'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Structured Request Parameters */}
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-[11px] sm:text-[11.5px] font-bold text-[#142B5F] dark:text-white">
                        <Info className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                        <span>بيانات ومعايير الطلب المسجلة</span>
                      </h4>

                      {selected.requestParameters &&
                      Object.keys(selected.requestParameters).length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {Object.entries(selected.requestParameters)
                            .filter(
                              ([key, value]) =>
                                !TECHNICAL_REQUEST_KEYS.has(key) && !UUID_PATTERN.test(String(value)),
                            )
                            .map(([key, value]) => (
                              <div
                                key={key}
                                className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-2.5"
                              >
                                <div className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                                  {formatParameterKey(key)}
                                </div>
                                <div className="mt-0.5 text-[10.5px] sm:text-[11.5px] font-bold text-[#142B5F] dark:text-white break-words">
                                  {formatParameterValue(value)}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3 text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7]">
                          لا توجد معايير إضافية مدخلة لهذا الطلب.
                        </div>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-[11px] sm:text-[11.5px] font-bold text-[#142B5F] dark:text-white">
                        <CalendarClock className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                        <span>سجل المواعيد والتوثيق</span>
                      </h4>

                      <div className="space-y-1.5 text-[10.5px] sm:text-[11px]">
                        <div className="px-3 py-2 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 flex items-center justify-between gap-2">
                          <span className="text-[#5C707C] dark:text-[#9BB4C7]">تاريخ تقديم الطلب</span>
                          <span className="font-bold text-[#142B5F] dark:text-white tabular-nums">
                            {formatDate(selected.createdAt)}
                          </span>
                        </div>
                        <div className="px-3 py-2 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 flex items-center justify-between gap-2">
                          <span className="text-[#5C707C] dark:text-[#9BB4C7]">آخر تحديث من النظام</span>
                          <span className="font-bold text-[#142B5F] dark:text-white tabular-nums">
                            {formatDate(selected.updatedAt)}
                          </span>
                        </div>
                        {selected.completedAt && (
                          <div className="px-3 py-2 rounded-xl border border-[#0E7C86]/30 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#0B1529]/80 flex items-center justify-between gap-2">
                            <span className="text-[#0E7C86] dark:text-[#38C6D4] font-semibold">
                              تاريخ إتمام الخدمة
                            </span>
                            <span className="font-bold text-[#0E7C86] dark:text-[#38C6D4] tabular-nums">
                              {formatDate(selected.completedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Linked Invoice */}
                    {matchedInvoice && (
                      <div className="mn-summary-start-bar relative overflow-hidden rounded-xl border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                              <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-[11px] sm:text-[12px] font-bold text-[#142B5F] dark:text-white break-words tabular-nums">
                                فاتورة مرتبطة #{matchedInvoice.invoiceNumber || matchedInvoice.publicId}
                              </div>
                              <div className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                                الإصدار: {formatDate(matchedInvoice.issuedAt || matchedInvoice.updatedAt)}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 text-[9.5px] sm:text-[10px] font-bold ${getInvoiceStatusBadge(matchedInvoice.status).className}`}
                          >
                            {getInvoiceStatusBadge(matchedInvoice.status).label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#142B5F]/10 dark:border-white/10">
                          <div className="p-2 rounded-lg bg-white dark:bg-[#111E38] border border-[#142B5F]/10 dark:border-white/10">
                            <div className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7]">إجمالي المبلغ</div>
                            <div className="text-[11px] font-bold text-[#142B5F] dark:text-white mt-0.5 tabular-nums">
                              {formatMoney(matchedInvoice.totalAmount)}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-[#111E38] border border-[#142B5F]/10 dark:border-white/10">
                            <div className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7]">المبلغ المستحق</div>
                            <div className="text-[11px] font-bold text-[#0E7C86] dark:text-[#38C6D4] mt-0.5 tabular-nums">
                              {formatMoney(matchedInvoice.amountDue)}
                            </div>
                          </div>
                        </div>

                        {matchedInvoice.dueDate && (
                          <div className="text-[10px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                            تاريخ الاستحقاق:{' '}
                            <strong className="text-[#142B5F] dark:text-white">
                              {formatDate(matchedInvoice.dueDate)}
                            </strong>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => onTogglePayments(matchedInvoice.id)}
                          aria-expanded={Boolean(paymentsByInvoice[matchedInvoice.id])}
                          className="mn-workspace-btn-sm w-full text-center rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-white dark:bg-[#111E38] text-[10.5px] font-bold text-[#142B5F] dark:text-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:text-white hover:border-transparent transition-all cursor-pointer"
                        >
                          {paymentsByInvoice[matchedInvoice.id] ? 'إخفاء سجل الدفعات' : 'عرض سجل الدفعات'}
                        </button>

                        {paymentsByInvoice[matchedInvoice.id] && (
                          <div className="space-y-1.5 pt-2 border-t border-[#142B5F]/10 dark:border-white/10">
                            {paymentsByInvoice[matchedInvoice.id].length === 0 ? (
                              <div className="text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7] text-center py-1">
                                لا توجد عمليات دفع مسجلة حتى الآن.
                              </div>
                            ) : (
                              paymentsByInvoice[matchedInvoice.id].map((payment) => {
                                const succeeded = ['CAPTURED', 'SUCCESS', 'PAID'].includes(
                                  payment.status.toUpperCase(),
                                );
                                return (
                                  <div
                                    key={payment.id}
                                    className="p-2 rounded-lg bg-white dark:bg-[#111E38] border border-[#142B5F]/10 dark:border-white/10 flex items-center justify-between text-[10.5px]"
                                  >
                                    <div>
                                      <div className="font-bold text-[#142B5F] dark:text-white tabular-nums">
                                        {formatMoney(payment.amount)}
                                      </div>
                                      <div className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                                        {formatDate(payment.createdAt)} · {payment.paymentMethod}
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold ${
                                        succeeded
                                          ? 'text-[#0E7C86] dark:text-[#38C6D4]'
                                          : getInvoiceStatusBadge(payment.status).className
                                      }`}
                                    >
                                      {succeeded ? 'ناجحة' : getInvoiceStatusBadge(payment.status).label}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </SummarySectionCard>
              ) : requestedNotFoundId ? (
                <SummarySectionCard title="تفاصيل الطلب المحدد" icon={AlertTriangle}>
                  <div className="rounded-xl border border-[#0E7C86]/25 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
                    <AlertTriangle className="h-6 w-6 mx-auto text-[#0E7C86] dark:text-[#38C6D4] mb-1.5" />
                    <h4 className="text-[12px] font-bold text-[#142B5F] dark:text-white">
                      الطلب المطلوب غير موجود أو غير مصرّح بعرضه
                    </h4>
                    <p className="text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7] mt-1 max-w-xs mx-auto leading-relaxed">
                      المعرّف المُدخل <span className="font-mono font-bold">#{requestedNotFoundId}</span> لا يطابق
                      أي طلب في سجلك المصرح به.
                    </p>
                  </div>
                </SummarySectionCard>
              ) : (
                <SummarySectionCard title="تفاصيل الطلب المحدد" icon={FileText}>
                  <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-4 text-center">
                    <ClipboardList className="h-6 w-6 mx-auto text-[#0E7C86] dark:text-[#38C6D4] mb-1" />
                    <h4 className="text-[11.5px] font-bold text-[#142B5F] dark:text-white">
                      اختر طلبًا لعرض تفاصيله
                    </h4>
                    <p className="text-[10px] sm:text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7] mt-0.5 max-w-xs mx-auto">
                      اضغط على أي طلب من السجل أعلاه للاطلاع على المعايير والمواعيد والفاتورة المرتبطة.
                    </p>
                  </div>
                </SummarySectionCard>
              )}
            </div>
          )
        ) : (
          /* Invoices Full Section */
          <SummarySectionCard
            title="سجل الفواتير والمدفوعات"
            icon={Receipt}
            metaLabel={`${invoices.length} فاتورة`}
          >
            {invoices.length === 0 ? (
              <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
                <CreditCard className="h-6 w-6 mx-auto text-[#0E7C86] dark:text-[#38C6D4] mb-1.5" />
                <h4 className="text-[11.5px] sm:text-[12.5px] font-bold text-[#142B5F] dark:text-white">
                  {invoiceError
                    ? 'تعذر تحميل الفواتير حاليًا'
                    : 'لا توجد فواتير أو مدفوعات مسجلة بحسابك'}
                </h4>
                <p className="text-[10.5px] leading-relaxed text-[#5C707C] dark:text-[#9BB4C7] mt-1 max-w-sm mx-auto">
                  {invoiceError
                    ? 'أعد المحاولة من زر إعادة تحميل الفواتير أعلاه.'
                    : 'عند طلب خدمات مدفوعة أو استشارات خاصة ستظهر فواتيرك وإيصالات السداد هنا.'}
                </p>
              </div>
            ) : (
              <div className={`grid gap-2.5 ${invoices.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {invoices.map((invoice) => {
                  const statusInfo = getInvoiceStatusBadge(invoice.status);
                  const hasPayments = !!paymentsByInvoice[invoice.id];
                  const isUnpaid = ['PENDING', 'ISSUED', 'UNPAID', 'OVERDUE'].includes(
                    invoice.status.toUpperCase(),
                  );

                  return (
                    <article
                      key={invoice.id}
                      className={`relative overflow-hidden min-w-0 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 hover:bg-white dark:hover:bg-[#111E38] hover:border-[#0E7C86]/35 p-3 flex flex-col justify-between transition-all ${
                        isUnpaid ? 'mn-summary-start-bar' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                              <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-[11px] sm:text-[12px] font-bold text-[#142B5F] dark:text-white break-words tabular-nums">
                                فاتورة #{invoice.invoiceNumber || invoice.publicId}
                              </div>
                              <div className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                                الإصدار: {formatDate(invoice.issuedAt || invoice.updatedAt)}
                              </div>
                            </div>
                          </div>

                          <span className={`shrink-0 text-[9.5px] sm:text-[10px] font-bold ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-[#142B5F]/10 dark:border-white/10">
                          <div className="p-2 rounded-lg bg-white dark:bg-[#111E38] border border-[#142B5F]/10 dark:border-white/10">
                            <div className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7]">إجمالي الفاتورة</div>
                            <div className="text-[11px] font-bold text-[#142B5F] dark:text-white mt-0.5 tabular-nums">
                              {formatMoney(invoice.totalAmount)}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-white dark:bg-[#111E38] border border-[#142B5F]/10 dark:border-white/10">
                            <div className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7]">المتبقي للدفع</div>
                            <div className="text-[11px] font-bold text-[#0E7C86] dark:text-[#38C6D4] mt-0.5 tabular-nums">
                              {formatMoney(invoice.amountDue)}
                            </div>
                          </div>
                        </div>

                        {invoice.dueDate && (
                          <div className="mt-2 text-[10px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                            تاريخ الاستحقاق:{' '}
                            <strong className="text-[#142B5F] dark:text-white">
                              {formatDate(invoice.dueDate)}
                            </strong>
                          </div>
                        )}

                        {invoice.lineItems && invoice.lineItems.length > 0 && (
                          <div className="mt-2.5 space-y-1">
                            <div className="text-[9.5px] font-bold text-[#142B5F] dark:text-white">
                              بنود الفاتورة:
                            </div>
                            {invoice.lineItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex flex-wrap items-start justify-between gap-1.5 text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7]"
                              >
                                <span>{item.description}</span>
                                <span className="shrink-0 font-bold text-[#142B5F] dark:text-white tabular-nums">
                                  {formatMoney(item.totalPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#142B5F]/10 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => onTogglePayments(invoice.id)}
                          aria-expanded={Boolean(paymentsByInvoice[invoice.id])}
                          className="mn-workspace-btn-sm w-full text-center rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-white dark:bg-[#111E38] text-[10.5px] font-bold text-[#142B5F] dark:text-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:text-white hover:border-transparent transition-all cursor-pointer"
                        >
                          {hasPayments ? 'إخفاء سجل المعاملات' : 'عرض سجل عمليات الدفع'}
                        </button>

                        {hasPayments && (
                          <div className="space-y-1.5 mt-2 pt-2 border-t border-[#142B5F]/10 dark:border-white/10">
                            {paymentsByInvoice[invoice.id].length === 0 ? (
                              <div className="text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7] text-center py-1">
                                لا توجد عمليات دفع مسجلة لهذه الفاتورة.
                              </div>
                            ) : (
                              paymentsByInvoice[invoice.id].map((payment) => {
                                const succeeded = ['CAPTURED', 'SUCCESS', 'PAID'].includes(
                                  payment.status.toUpperCase(),
                                );
                                return (
                                  <div
                                    key={payment.id}
                                    className="p-2 rounded-lg bg-white dark:bg-[#111E38] border border-[#142B5F]/10 dark:border-white/10 flex items-center justify-between text-[10.5px]"
                                  >
                                    <div>
                                      <div className="font-bold text-[#142B5F] dark:text-white tabular-nums">
                                        {formatMoney(payment.amount)}
                                      </div>
                                      <div className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                                        {formatDate(payment.createdAt)} · {payment.paymentMethod}
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold ${
                                        succeeded
                                          ? 'text-[#0E7C86] dark:text-[#38C6D4]'
                                          : getInvoiceStatusBadge(payment.status).className
                                      }`}
                                    >
                                      {succeeded ? 'ناجحة' : getInvoiceStatusBadge(payment.status).label}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </SummarySectionCard>
        ))}

      {activeTab === 'REQUESTS' && selected && !serviceLoading && (
        <StudentServiceBookingPanel requestId={selected.id} />
      )}
    </div>
  );
}


type VaultSubTab = 'ALL' | 'COLLECTIONS' | 'COMPARISONS' | 'TOOLS' | 'DOCUMENTS';

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
  trackers = [],
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
  trackers?: StudentApplicationTrackerDto[];
}) {
  const { language } = useTranslation();
  const [subTab, setSubTab] = useState<VaultSubTab>('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [collectionFilter, setCollectionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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

  const getEntityIcon = (type: string, customClass = 'h-3.5 w-3.5 text-white') => {
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
    setShowCreateInline(false);
  };

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

  const vaultSubTabs = [
    { id: 'ALL' as const, label: 'الكل', count: savedItems.length, icon: Bookmark },
    { id: 'COLLECTIONS' as const, label: 'المجموعات', count: collections.length, icon: Folder },
    { id: 'COMPARISONS' as const, label: 'المقارنات', icon: Scale },
    { id: 'TOOLS' as const, label: 'الأدوات', count: typeCounts.STUDENT_TOOL || 0, icon: Sparkles },
    { id: 'DOCUMENTS' as const, label: 'مستنداتي', icon: FileText },
  ];

  return (
    <div className="mn-student-vault-page mt-0 space-y-3 font-['Cairo',sans-serif]">
      <WorkspaceTabCanopy
        title="محفوظاتي ومجموعاتي"
        subtitle="العناصر المحفوظة، المجموعات، المقارنات، نتائج الأدوات والمستندات"
        icon={Bookmark}
        metaLabel={<span className="tabular-nums">{savedItems.length} محفوظ</span>}
      >
        <HorizontalSwipeTabs
          embedded
          ariaLabel="أقسام محفوظاتي ومجموعاتي"
          items={vaultSubTabs}
          activeId={subTab}
          onChange={(next) => {
            setSubTab(next);
            if (next === 'COLLECTIONS') {
              setIsCollectionsOpen(true);
              setIsFilterOpen(false);
            }
          }}
        />
      </WorkspaceTabCanopy>

      {/* Sub-Tab 3: COMPARISONS */}
      {subTab === 'COMPARISONS' && (
        <VaultComparisonsPanel
          savedItems={savedItems}
          onOpenApplications={() => setTab?.('OPPORTUNITIES')}
        />
      )}

      {/* Sub-Tab 4: TOOLS */}
      {subTab === 'TOOLS' && (
        <VaultToolsResultsPanel
          savedItems={savedItems}
          hydratedSavedItems={hydratedSavedItems}
        />
      )}

      {/* Sub-Tab 5: DOCUMENTS */}
      {subTab === 'DOCUMENTS' && <StudentDocumentsLibraryPanel trackers={trackers} />}

      {/* Sub-Tab 1 & 2: ALL & COLLECTIONS */}
      {(subTab === 'ALL' || subTab === 'COLLECTIONS') && (
        <SummarySectionCard
          title="العناصر المحفوظة"
          icon={Bookmark}
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              {(typeFilter !== 'ALL' || collectionFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('ALL');
                    setCollectionFilter('ALL');
                  }}
                  className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/30 bg-[#0E7C86]/10 px-2 text-[10px] font-bold text-[#0E7C86] dark:text-[#38C6D4] cursor-pointer"
                >
                  <span>الكل</span>
                  <span>✕</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsFilterOpen((prev) => !prev);
                  setIsCollectionsOpen(false);
                }}
                aria-expanded={isFilterOpen}
                className={`mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border px-2.5 text-[10px] font-bold transition-all cursor-pointer ${
                  isFilterOpen || isFilterActive
                    ? 'border-transparent bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs'
                    : 'border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#0B1529] text-[#142B5F] dark:text-white hover:border-[#0E7C86]'
                }`}
              >
                <Filter
                  className={`h-3 w-3 ${isFilterOpen || isFilterActive ? 'text-white' : 'text-[#0E7C86] dark:text-[#38C6D4]'}`}
                  aria-hidden="true"
                />
                <span>{isFilterActive ? activeTypeObj?.label : 'النوع'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCollectionsOpen((prev) => !prev);
                  setIsFilterOpen(false);
                }}
                aria-expanded={isCollectionsOpen}
                className={`mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border px-2.5 text-[10px] font-bold transition-all cursor-pointer tabular-nums ${
                  isCollectionsOpen || isCollectionActive
                    ? 'border-transparent bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs'
                    : 'border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#0B1529] text-[#142B5F] dark:text-white hover:border-[#0E7C86]'
                }`}
              >
                <Folder
                  className={`h-3 w-3 ${isCollectionsOpen || isCollectionActive ? 'text-white' : 'text-[#0E7C86] dark:text-[#38C6D4]'}`}
                  aria-hidden="true"
                />
                <span>مجموعاتي ({collections.length})</span>
              </button>
            </div>
          }
        >
          <div className="space-y-2.5">
            {/* Filter by 9 Types Dropdown */}
            {isFilterOpen && (
              <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#142B5F]/10 dark:border-white/10">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#142B5F] dark:text-white">
                    <Filter className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                    <span>تصفية حسب نوع المحفوظات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeFilter !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => setTypeFilter('ALL')}
                        className="mn-workspace-btn-sm text-[10px] font-bold text-[#0E7C86] dark:text-[#38C6D4] hover:underline cursor-pointer"
                      >
                        عرض الكل
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="mn-workspace-btn-sm p-1 rounded-md text-[#5C707C] dark:text-[#9BB4C7] hover:bg-white dark:hover:bg-[#111E38] cursor-pointer"
                      aria-label="إغلاق قائمة الفلترة"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[260px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter('ALL');
                      setIsFilterOpen(false);
                    }}
                    className={`mn-workspace-btn-sm flex items-center justify-between gap-1.5 rounded-lg px-2.5 text-[10.5px] font-bold transition-all cursor-pointer tabular-nums ${
                      typeFilter === 'ALL'
                        ? 'bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white'
                        : 'bg-white dark:bg-[#111E38] border border-[#142B5F]/12 dark:border-white/10 text-[#142B5F] dark:text-white hover:border-[#0E7C86]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Layers className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">جميع الأنواع</span>
                    </span>
                    <span className="text-[9.5px] opacity-80">({savedItems.length})</span>
                  </button>

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
                        className={`mn-workspace-btn-sm flex items-center justify-between gap-1.5 rounded-lg px-2.5 text-[10.5px] font-bold transition-all cursor-pointer tabular-nums ${
                          active
                            ? 'bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white'
                            : 'bg-white dark:bg-[#111E38] border border-[#142B5F]/12 dark:border-white/10 text-[#142B5F] dark:text-white hover:border-[#0E7C86]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          {getEntityIcon(
                            type.id,
                            `h-3 w-3 shrink-0 ${active ? 'text-white' : 'text-[#0E7C86] dark:text-[#38C6D4]'}`,
                          )}
                          <span className="truncate">{type.label}</span>
                        </span>
                        <span className="text-[9.5px] opacity-80 shrink-0">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Collections Dropdown Panel */}
            {isCollectionsOpen && (
              <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#142B5F]/10 dark:border-white/10">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#142B5F] dark:text-white tabular-nums">
                    <Folder className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                    <span>مجموعاتي الشخصية ({collections.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowCreateInline(!showCreateInline)}
                      className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] px-2.5 text-[10px] font-bold text-white hover:opacity-95 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      <span>مجموعة جديدة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCollectionsOpen(false);
                        setShowCreateInline(false);
                      }}
                      className="mn-workspace-btn-sm p-1 rounded-md text-[#5C707C] dark:text-[#9BB4C7] hover:bg-white dark:hover:bg-[#111E38] cursor-pointer"
                      aria-label="إغلاق قائمة المجموعات"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {showCreateInline && (
                  <form
                    id="mn-vault-create-collection"
                    onSubmit={handleCreateSubmit}
                    className="mb-2.5 rounded-xl border border-[#0E7C86]/25 bg-white dark:bg-[#111E38] p-2.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11px] font-bold text-[#142B5F] dark:text-white">
                        إنشاء مجموعة جديدة
                      </h5>
                      <button
                        type="button"
                        onClick={() => setShowCreateInline(false)}
                        className="mn-workspace-btn-sm text-[10px] font-semibold text-[#5C707C] hover:underline cursor-pointer"
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
                        className="h-8 w-full rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529] px-2.5 text-[11px] text-[#142B5F] dark:text-white outline-none focus:border-[#0E7C86]"
                      />
                      <input
                        name="collectionDescription"
                        maxLength={240}
                        placeholder="الوصف (اختياري)..."
                        className="h-8 w-full rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529] px-2.5 text-[11px] text-[#142B5F] dark:text-white outline-none focus:border-[#0E7C86]"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowCreateInline(false)}
                        className="mn-workspace-btn-sm rounded-lg border border-[#142B5F]/15 dark:border-white/15 px-2.5 text-[10px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="mn-workspace-btn-sm rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] px-3 text-[10px] font-bold text-white disabled:opacity-50 cursor-pointer"
                      >
                        حفظ المجموعة
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-[#142B5F]/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setCollectionFilter('ALL');
                      setIsCollectionsOpen(false);
                    }}
                    className={`mn-workspace-btn-sm rounded-lg px-2.5 text-[10px] font-bold transition-all cursor-pointer tabular-nums ${
                      collectionFilter === 'ALL'
                        ? 'bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white'
                        : 'border border-[#142B5F]/15 dark:border-white/12 bg-white dark:bg-[#111E38] text-[#142B5F] dark:text-white hover:border-[#0E7C86]'
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
                    className={`mn-workspace-btn-sm rounded-lg px-2.5 text-[10px] font-bold transition-all cursor-pointer tabular-nums ${
                      collectionFilter === 'UNCOLLECTED'
                        ? 'bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white'
                        : 'border border-[#142B5F]/15 dark:border-white/12 bg-white dark:bg-[#111E38] text-[#142B5F] dark:text-white hover:border-[#0E7C86]'
                    }`}
                  >
                    دون مجموعة ({uncollectedCount})
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                  {collections.length === 0 ? (
                    <p className="p-3 text-center text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7] bg-white dark:bg-[#111E38] rounded-xl border border-[#142B5F]/10 dark:border-white/10">
                      لا توجد مجموعات بعد. انقر على «مجموعة جديدة» لإضافة مجموعتك الأولى.
                    </p>
                  ) : (
                    collections.map((collection) => {
                      const isSelected = collectionFilter === collection.id;
                      return (
                        <div
                          key={collection.id}
                          className={`group flex items-center justify-between gap-2 rounded-xl border p-2 transition-all ${
                            isSelected
                              ? 'border-[#0E7C86] bg-white dark:bg-[#111E38]'
                              : 'border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] hover:border-[#0E7C86]/45'
                          }`}
                        >
                          <div
                            onClick={() => {
                              setCollectionFilter(collection.id);
                              setIsCollectionsOpen(false);
                            }}
                            className="flex min-w-0 flex-1 items-center gap-2 cursor-pointer"
                          >
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white">
                              <Folder className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-[11px] font-bold text-[#142B5F] dark:text-white truncate">
                                {collection.name}
                              </h5>
                              <span className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                                {collection.itemCount} عناصر
                              </span>
                            </div>
                            {isSelected && (
                              <span className="text-[9.5px] font-bold text-[#0E7C86] dark:text-[#38C6D4]">
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
                                  className="mn-workspace-btn-sm px-2 text-[10px] font-bold text-[#0E7C86] dark:text-[#38C6D4] hover:underline cursor-pointer"
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
                                  className="mn-workspace-btn-sm p-1 text-[#5C707C] dark:text-[#9BB4C7] hover:text-[#142B5F] dark:hover:text-white rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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

            {/* Search Input */}
            <div className="relative w-full">
              <input
                id="mn-vault-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في محفوظاتك..."
                className="w-full h-8 sm:h-9 rounded-xl border border-[#142B5F]/12 dark:border-white/12 bg-[#F6F8FA] dark:bg-[#0B1529]/80 pr-8 pl-3 text-[11px] font-medium text-[#142B5F] dark:text-white placeholder:text-[#5C707C] dark:placeholder:text-[#9BB4C7] outline-none focus:border-[#0E7C86] dark:focus:border-[#38C6D4] focus:bg-white dark:focus:bg-[#111E38] transition-colors"
              />
              <Search
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]"
                aria-hidden="true"
              />
            </div>

            {/* Active Filters Strip */}
            {(typeFilter !== 'ALL' || collectionFilter !== 'ALL' || searchQuery.trim() !== '') && (
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span className="font-bold text-[#5C707C] dark:text-[#9BB4C7]">التصفية النشطة:</span>
                {typeFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setTypeFilter('ALL')}
                    className="mn-workspace-btn-sm inline-flex items-center gap-1 font-bold text-[#142B5F] dark:text-white hover:text-[#0E7C86] cursor-pointer"
                    title="إزالة فلتر النوع"
                  >
                    <span>النوع: {activeTypeObj?.label || typeFilter}</span>
                    <span>✕</span>
                  </button>
                )}
                {collectionFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setCollectionFilter('ALL')}
                    className="mn-workspace-btn-sm inline-flex items-center gap-1 font-bold text-[#0E7C86] dark:text-[#38C6D4] cursor-pointer"
                    title="إزالة فلتر المجموعة"
                  >
                    <span>المجموعة: {activeCollectionLabel}</span>
                    <span>✕</span>
                  </button>
                )}
                {searchQuery.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mn-workspace-btn-sm inline-flex items-center gap-1 font-semibold text-[#142B5F] dark:text-white cursor-pointer"
                    title="مسح البحث"
                  >
                    <span>بحث: «{searchQuery}»</span>
                    <span>✕</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('ALL');
                    setCollectionFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="mn-workspace-btn-sm text-[10px] font-bold text-[#5C707C] dark:text-[#9BB4C7] hover:text-[#142B5F] dark:hover:text-white hover:underline cursor-pointer mr-auto"
                >
                  إعادة ضبط الكل
                </button>
              </div>
            )}

            {/* Saved Items List */}
            {savedItems.length === 0 ? (
              <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
                <span className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                </span>
                <h4 className="text-[11.5px] sm:text-[12.5px] font-bold text-[#142B5F] dark:text-white">
                  {collections.length > 0 ? 'مجموعاتك جاهزة لاستقبال المحفوظات' : 'لا توجد عناصر محفوظة بعد'}
                </h4>
                <p className="mt-1 text-[10.5px] leading-relaxed text-[#5C707C] dark:text-[#9BB4C7]">
                  تصفح المنح والجامعات والدورات واضغط رمز الحفظ لإضافتها إلى محفوظاتك.
                </p>
                <Link
                  to="/scholarships"
                  className="mn-workspace-btn-sm mt-3 inline-flex items-center justify-center rounded-xl bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] px-4 text-[10.5px] font-bold text-white shadow-2xs"
                >
                  استكشف المنح
                </Link>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 p-5 text-center">
                <h4 className="text-[11.5px] font-bold text-[#142B5F] dark:text-white">
                  لا توجد عناصر مطابقة للتصفية
                </h4>
                <p className="mt-1 text-[10.5px] text-[#5C707C] dark:text-[#9BB4C7]">
                  جرّب بحثًا آخر أو اعرض جميع المحفوظات.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('ALL');
                    setCollectionFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="mn-workspace-btn-sm mt-3 rounded-lg bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] px-3 text-[10.5px] font-bold text-white cursor-pointer"
                >
                  إعادة ضبط التصفية
                </button>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
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
                    (owner &&
                    'country' in owner &&
                    typeof (owner as { country?: string }).country === 'string'
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
                      className="group relative overflow-hidden rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 hover:bg-white dark:hover:bg-[#111E38] hover:border-[#0E7C86]/35 dark:hover:border-[#38C6D4]/40 p-2.5 sm:p-3 flex flex-col justify-between transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-start gap-2.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-2xs">
                            {getEntityIcon(item.entityType, 'h-4 w-4 text-white')}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[10.5px] sm:text-[12px] font-bold text-[#142B5F] dark:text-white leading-snug break-words">
                              {displayName}
                            </h4>
                            <p className="mt-0.5 text-[9.5px] sm:text-[10px] font-semibold text-[#0E7C86] dark:text-[#38C6D4]">
                              {subtitle}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => onRemoveSavedItem(item)}
                          title="إزالة من المحفوظات"
                          aria-label={`إزالة ${displayName} من المحفوظات`}
                          className="mn-workspace-btn-sm grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#0E7C86] dark:text-[#38C6D4] hover:bg-[#0E7C86]/10 active:scale-95 transition-all cursor-pointer"
                        >
                          <Bookmark className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#142B5F]/10 dark:border-white/10 flex items-center justify-between gap-2 text-[10px] sm:text-[10.5px]">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => setMovingItem(item)}
                          className="mn-workspace-btn-sm inline-flex items-center gap-1 font-bold text-[#5C707C] dark:text-[#9BB4C7] hover:text-[#142B5F] dark:hover:text-white transition-colors cursor-pointer"
                          title="نقل أو إضافة إلى مجموعة"
                        >
                          <Folder className="h-3 w-3 shrink-0 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                          <span className="truncate max-w-[130px] sm:max-w-[160px]">
                            {currentCollection ? currentCollection.name : 'إضافة لمجموعة'}
                          </span>
                        </button>

                        {targetUrl ? (
                          <Link
                            to={targetUrl}
                            className="inline-flex items-center gap-0.5 font-bold text-[#142B5F] dark:text-white hover:text-[#0E7C86] dark:hover:text-[#38C6D4] transition-colors shrink-0"
                            title="عرض التفاصيل"
                          >
                            <span>عرض التفاصيل</span>
                            <ArrowUpLeft className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                          </Link>
                        ) : (
                          <span className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                            محفوظة
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </SummarySectionCard>
      )}

      {/* Move to Collection Modal */}
      {movingItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="نقل إلى مجموعة"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 p-2.5 sm:p-4 backdrop-blur-xs font-['Cairo',sans-serif]"
          onClick={() => setMovingItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#142B5F]/12 dark:border-white/12 bg-white dark:bg-[#111E38] p-3.5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#142B5F]/10 dark:border-white/10 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <SummarySectionIcon icon={Folder} />
                <div className="min-w-0">
                  <h4 className="text-[12.5px] font-bold text-[#142B5F] dark:text-white">نقل إلى مجموعة</h4>
                  <p className="text-[10px] text-[#5C707C] dark:text-[#9BB4C7] truncate max-w-[200px]">
                    {getSavedTitle(movingItem)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMovingItem(null)}
                aria-label="إغلاق"
                className="mn-workspace-btn-sm grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-[#F6F8FA] dark:hover:bg-[#0B1529] text-[#5C707C] dark:text-[#9BB4C7] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-2.5 max-h-60 overflow-y-auto space-y-1">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  onMoveSavedItem(movingItem.id, null);
                  setMovingItem(null);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-right text-[11px] font-bold transition-colors cursor-pointer ${
                  !movingItem.collectionId
                    ? 'bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white'
                    : 'bg-[#F6F8FA] dark:bg-[#0B1529]/80 hover:border-[#0E7C86] text-[#142B5F] dark:text-white'
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
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-right text-[11px] font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white'
                        : 'bg-[#F6F8FA] dark:bg-[#0B1529]/80 hover:bg-white dark:hover:bg-[#111E38] text-[#142B5F] dark:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
                      <span className="truncate">{col.name}</span>
                    </span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 border-t border-[#142B5F]/10 dark:border-white/10 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  setMovingItem(null);
                  setIsCollectionsOpen(true);
                  setShowCreateInline(true);
                }}
                className="mn-workspace-btn-sm w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#0E7C86]/45 bg-[#F6F8FA] dark:bg-[#0B1529]/80 text-[10.5px] font-bold text-[#142B5F] dark:text-white hover:border-[#0E7C86] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                <span>إنشاء مجموعة جديدة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentAvatarAssetPicker({ currentAssetId }: { currentAssetId: string | null }) {
  const [assets, setAssets] = useState<
    Array<{ id: string; reference: string; metadata?: { originalFilename?: string; mimeType?: string } }>
  >([]);
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
    setPreviewUrl(null);
    setError(null);

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
    <div className="relative overflow-hidden p-2.5 sm:p-3 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 font-['Cairo',sans-serif] space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white">
          الصورة الشخصية (من الأصول الآمنة)
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-white dark:bg-[#111E38] hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:text-white hover:border-transparent text-[#142B5F] dark:text-white px-2.5 text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
          title="رفع أو إضافة صورة شخصية جديدة من جهازك"
        >
          {uploading ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
              <span>جارٍ الرفع…</span>
            </>
          ) : (
            <>
              <Camera className="h-3 w-3" aria-hidden="true" />
              <span>إضافة صورة</span>
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
          className="group relative h-11 w-11 rounded-xl bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] border border-[#0E7C86]/35 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs cursor-pointer"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="معاينة الصورة" className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-white" aria-hidden="true" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          {(loadingPreview || uploading) && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <RefreshCw className="h-3.5 w-3.5 text-white animate-spin" aria-hidden="true" />
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <select
            name="avatarAssetId"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="w-full rounded-xl border border-[#142B5F]/12 dark:border-white/12 bg-white dark:bg-[#111E38] px-2.5 py-1.5 text-[11px] sm:text-[12px] font-medium text-[#142B5F] dark:text-white outline-none focus:border-[#0E7C86] dark:focus:border-[#38C6D4] transition-colors cursor-pointer"
          >
            <option value="">بدون صورة رمزية (الأيقونة الافتراضية)</option>
            {selected && !assets.some((asset) => asset.id === selected) && (
              <option value={selected}>الصورة المحددة</option>
            )}
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.metadata?.originalFilename ||
                  asset.reference ||
                  `صورة (${asset.id.slice(0, 8)})`}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[9.5px] sm:text-[10px] text-[#5C707C] dark:text-[#9BB4C7]">
            تُجلب الصور المعتمدة حصرياً من أصول ملفك الآمنة في المنصة.
          </p>
        </div>
      </div>
      {error && (
        <span className="block text-[10px] font-semibold text-[#142B5F] dark:text-[#F2CD78]">
          {error}
        </span>
      )}
    </div>
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
    <label className="mn-student-profile-toggle group flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-2 hover:bg-white dark:hover:bg-[#111E38] hover:border-[#0E7C86]/35 transition-all font-['Cairo',sans-serif]">
      <div className="min-w-0 flex-1">
        <span className="text-[10.5px] sm:text-[11.5px] font-bold text-[#142B5F] dark:text-white block leading-snug">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 text-[9.5px] sm:text-[10px] text-[#5C707C] dark:text-[#9BB4C7] block leading-tight">
            {description}
          </span>
        )}
      </div>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-3.5 w-3.5 rounded accent-[#0E7C86] shrink-0 cursor-pointer"
      />
    </label>
  );
}

type ProfileSubTab = 'ACADEMIC' | 'SETTINGS' | 'CALENDAR' | 'SUPPORT';

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
  trackers = [],
  requestedSubTab,
  onClearRequestedSubTab,
}: {
  onDirtyChange: (dirty: boolean) => void;
  dirty: boolean;
  dashboard: StudentDashboardSummaryDto;
  identity: {
    principalId: string;
    displayName: string;
    primaryEmail?: string;
    roles?: string[];
    roleNames?: string[];
  } | null;
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
  trackers?: StudentApplicationTrackerDto[];
  requestedSubTab?: ProfileSubTab | null;
  onClearRequestedSubTab?: () => void;
}) {
  const [subTab, setSubTab] = useState<ProfileSubTab>(requestedSubTab || 'ACADEMIC');
  const [showAdvancedBackups, setShowAdvancedBackups] = useState(false);
  const [confirmClearSearch, setConfirmClearSearch] = useState(false);

  useEffect(() => {
    if (requestedSubTab) {
      setSubTab(requestedSubTab);
      onClearRequestedSubTab?.();
    }
  }, [requestedSubTab, onClearRequestedSubTab]);

  const fieldInputClass =
    'w-full rounded-xl border border-[#142B5F]/12 dark:border-white/12 bg-[#F6F8FA] dark:bg-[#0B1529]/80 px-3 py-1.5 text-[11px] sm:text-[12px] font-medium text-[#142B5F] dark:text-white outline-none focus:border-[#0E7C86] dark:focus:border-[#38C6D4] focus:bg-white dark:focus:bg-[#111E38] transition-colors';

  const profileSubTabs = [
    { id: 'ACADEMIC' as const, label: 'الأكاديمي', icon: GraduationCap },
    { id: 'SETTINGS' as const, label: 'الإعدادات', icon: Settings2 },
    { id: 'CALENDAR' as const, label: 'التقويم', icon: CalendarClock },
    { id: 'SUPPORT' as const, label: 'الدعم', icon: HelpCircle },
  ];

  return (
    <div className="mn-student-profile-page mt-0 space-y-3 font-['Cairo',sans-serif]">
      <WorkspaceTabCanopy
        title="إعداداتي وملفي"
        subtitle="الملف الأكاديمي، تفضيلات الحساب، التقويم والدعم الفني"
        icon={User}
        metaLabel={
          <span className="hidden sm:inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>{arabicStatus(dashboard.workspace.status)}</span>
          </span>
        }
        actions={
          <button
            type="button"
            disabled={saving}
            onClick={onLogout}
            className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#142B5F]/18 dark:border-white/15 bg-[#F6F8FA] dark:bg-[#0B1529] px-2.5 text-[10px] font-bold text-[#142B5F] dark:text-white hover:border-[#0E7C86] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="تسجيل الخروج من الحساب"
          >
            <LogOut className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
            <span>تسجيل الخروج</span>
          </button>
        }
      >
        <HorizontalSwipeTabs
          embedded
          ariaLabel="أقسام إعداداتي وملفي"
          items={profileSubTabs}
          activeId={subTab}
          onChange={setSubTab}
        />
      </WorkspaceTabCanopy>

      {/* Sub-Tab 3: CALENDAR */}
      {subTab === 'CALENDAR' && <StudentCalendarTasksPanel trackers={trackers} />}

      {/* Sub-Tab 4: SUPPORT */}
      {subTab === 'SUPPORT' && <StudentSupportCenterPanel />}

      {/* Sub-Tab 1: ACADEMIC summary card */}
      {subTab === 'ACADEMIC' && <AcademicProfileSummaryCard />}

      <form
        onSubmit={onSave}
        onChange={() => onDirtyChange(true)}
        className={subTab === 'ACADEMIC' || subTab === 'SETTINGS' ? 'space-y-3' : 'hidden'}
      >
        <fieldset disabled={saving} className="space-y-3 min-w-0 border-0 p-0">
          {dirty && (
            <p
              role="status"
              className="mn-summary-start-bar relative overflow-hidden rounded-xl border border-[#0E7C86]/30 dark:border-[#38C6D4]/30 bg-white dark:bg-[#111E38] px-3.5 py-2 text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white"
            >
              لديك تعديلات غير محفوظة، اضغط على زر الحفظ بالأسفل لتطبيقها سحابياً.
            </p>
          )}

          {/* Section 1: بياناتي والهوية (Shown in ACADEMIC sub-tab) */}
          <div className={subTab === 'ACADEMIC' ? 'block' : 'hidden'}>
            <SummarySectionCard
              title="بياناتي والهوية"
              icon={User}
              metaLabel="معلومات الحساب"
            >
              <div className="space-y-2.5">
                <StudentAvatarAssetPicker currentAssetId={dashboard.workspace.avatarAssetId ?? null} />

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white mb-1">
                      الاسم الظاهر
                    </label>
                    <input
                      name="displayName"
                      defaultValue={dashboard.workspace.displayName || ''}
                      maxLength={120}
                      placeholder="أدخل اسمك الظاهر"
                      className={fieldInputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white">
                        البريد الإلكتروني الأساسي
                      </label>
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7]">
                        <LockKeyhole className="h-2.5 w-2.5" aria-hidden="true" />
                        <span>للقراءة فقط</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={identity?.primaryEmail || 'غير مسجل'}
                      className="w-full rounded-xl border border-[#142B5F]/10 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/60 px-3 py-1.5 text-[11px] sm:text-[12px] text-[#5C707C] dark:text-[#9BB4C7] font-mono cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </SummarySectionCard>
          </div>

          {/* Sections 2, 3, 4, 5: Shown in SETTINGS sub-tab */}
          <div className={subTab === 'SETTINGS' ? 'space-y-3' : 'hidden'}>
            {/* Section 2: تفضيلات التجربة والعرض */}
            <SummarySectionCard
              title="تفضيلات التجربة والعرض"
              icon={Sparkles}
              metaLabel="اللغة والمظهر"
            >
              <div className="space-y-3">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white mb-1">
                      <Languages className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                      <span>اللغة المفضلة</span>
                    </label>
                    <select
                      name="preferredLanguage"
                      defaultValue={dashboard.workspace.preferredLanguage || 'ar'}
                      className={`${fieldInputClass} cursor-pointer`}
                    >
                      <option value="ar">العربية (الافتراضية)</option>
                      <option value="en">English (الإنجليزية)</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white mb-1">
                      <Clock3 className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                      <span>المنطقة الزمنية</span>
                    </label>
                    <select
                      name="timezone"
                      defaultValue={dashboard.workspace.timezone || 'Asia/Aden'}
                      className={`${fieldInputClass} cursor-pointer`}
                    >
                      {dashboard.workspace.timezone &&
                        !['Asia/Aden', 'Asia/Riyadh', 'Asia/Dubai', 'Africa/Cairo', 'UTC'].includes(
                          dashboard.workspace.timezone,
                        ) && (
                          <option value={dashboard.workspace.timezone}>
                            {dashboard.workspace.timezone}
                          </option>
                        )}
                      <option value="Asia/Aden">عدن (GMT+3)</option>
                      <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                      <option value="Asia/Dubai">دبي (GMT+4)</option>
                      <option value="Africa/Cairo">القاهرة (التوقيت المحلي)</option>
                      <option value="UTC">التوقيت العالمي الموحد (UTC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white mb-1">
                      <Moon className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                      <span>المظهر العام</span>
                    </label>
                    <select
                      name="theme"
                      defaultValue={dashboard.workspace.theme || 'SYSTEM'}
                      className={`${fieldInputClass} cursor-pointer`}
                    >
                      <option value="SYSTEM">تلقائي (حسب نظام الجهاز)</option>
                      <option value="LIGHT">المظهر الفاتح</option>
                      <option value="DARK">المظهر الداكن</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white mb-1">
                      <Settings2 className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                      <span>حجم خط الواجهة</span>
                    </label>
                    <select
                      name="textScale"
                      defaultValue={String(accessibility.textScale || 'DEFAULT')}
                      className={`${fieldInputClass} cursor-pointer`}
                    >
                      <option value="SMALL">خط صغير (Compact)</option>
                      <option value="DEFAULT">الافتراضي (Standard)</option>
                      <option value="LARGE">خط كبير (Large)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#142B5F]/10 dark:border-white/10 space-y-2">
                  <span className="text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white block">
                    إمكانية الوصول والراحة
                  </span>
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
              </div>
            </SummarySectionCard>

            {/* Section 3: إعدادات الإشعارات والتنبيهات */}
            <SummarySectionCard
              title="إعدادات الإشعارات والتنبيهات"
              icon={Bell}
              metaLabel="القنوات والفئات"
            >
              <div className="space-y-3">
                <div>
                  <span className="text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white block mb-1.5">
                    قنوات الاستقبال
                  </span>
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

                <div className="pt-2.5 border-t border-[#142B5F]/10 dark:border-white/10">
                  <span className="text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white block mb-1.5">
                    فئات التنبيهات
                  </span>
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
            </SummarySectionCard>

            {/* Section 4: مركز الخصوصية وسجل البحث */}
            <SummarySectionCard
              title="الخصوصية وسجل البحث"
              icon={Shield}
              metaLabel="حماية البيانات"
            >
              <div className="space-y-2.5">
                <div className="space-y-2">
                  <ProfileToggle
                    name="retainSearchHistory"
                    label="الاحتفاظ بسجل البحث الشخصي"
                    defaultChecked={privacy.retainSearchHistory ?? false}
                  />
                  <ProfileToggle
                    name="allowPersonalization"
                    label="السماح بتخصيص التوصيات الذكية"
                    defaultChecked={privacy.allowPersonalization ?? false}
                  />
                  <ProfileToggle
                    name="allowProductAnalytics"
                    label="المساهمة في تحسين أداء المنصة"
                    defaultChecked={privacy.allowProductAnalytics ?? false}
                  />
                </div>

                <div className="p-2.5 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-[#142B5F] dark:text-white block">
                      مسح سجل البحث
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] text-[#5C707C] dark:text-[#9BB4C7]">
                      حذف عمليات البحث المحفوظة في حسابك فوراً.
                    </span>
                  </div>
                  {confirmClearSearch ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConfirmClearSearch(false)}
                        className="mn-workspace-btn-sm rounded-lg border border-[#142B5F]/15 dark:border-white/15 bg-white dark:bg-[#111E38] px-2.5 text-[10px] font-bold text-[#5C707C] dark:text-[#9BB4C7] cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmClearSearch(false);
                          onClearSearch();
                        }}
                        disabled={saving}
                        className="mn-workspace-btn-sm rounded-lg bg-[#142B5F] hover:opacity-95 px-2.5 text-[10px] font-bold text-white cursor-pointer disabled:opacity-50"
                      >
                        تأكيد المسح
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearSearch(true)}
                      disabled={saving}
                      className="mn-workspace-btn-sm rounded-lg border border-[#142B5F]/20 dark:border-white/15 bg-white dark:bg-[#111E38] px-2.5 text-[10px] font-bold text-[#142B5F] dark:text-white hover:border-[#0E7C86] transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      مسح السجل
                    </button>
                  )}
                </div>
              </div>
            </SummarySectionCard>

            {/* Section 5: إعدادات متقدمة والنسخ الاحتياطية */}
            <SummarySectionCard
              title="إعدادات متقدمة"
              icon={Settings2}
              action={
                <button
                  type="button"
                  onClick={() => setShowAdvancedBackups((prev) => !prev)}
                  className="mn-workspace-btn-sm inline-flex items-center gap-1 rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#0B1529] px-2.5 text-[10px] font-bold text-[#142B5F] dark:text-white cursor-pointer"
                >
                  <span>{showAdvancedBackups ? 'إخفاء' : 'عرض الخيارات'}</span>
                  {showAdvancedBackups ? (
                    <ChevronUp className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                  )}
                </button>
              }
            >
              {showAdvancedBackups ? (
                <div className="space-y-2.5">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="p-2.5 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80">
                      <span className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] block">
                        معرّف النظام الداخلي
                      </span>
                      <span className="text-[10.5px] font-mono text-[#142B5F] dark:text-white mt-0.5 block truncate select-all">
                        {identity?.principalId || '—'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80">
                      <span className="text-[9.5px] font-semibold text-[#5C707C] dark:text-[#9BB4C7] block">
                        إصدار مساحة العمل
                      </span>
                      <span className="text-[10.5px] font-bold text-[#142B5F] dark:text-white mt-0.5 inline-flex items-center gap-1.5 font-mono tabular-nums">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0E7C86] dark:text-[#38C6D4]" aria-hidden="true" />
                        <span>الإصدار #{dashboard.workspace.version}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onSnapshot}
                      disabled={saving}
                      className="mn-workspace-btn-sm rounded-xl border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-[#F6F8FA] dark:bg-[#0B1529] hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:text-white hover:border-transparent px-3 text-[10.5px] font-bold text-[#142B5F] dark:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>حفظ نسخة</span>
                    </button>

                    <button
                      type="button"
                      onClick={onResetLayout}
                      disabled={saving}
                      className="mn-workspace-btn-sm rounded-xl border border-[#142B5F]/15 dark:border-white/12 bg-[#F6F8FA] dark:bg-[#0B1529] hover:border-[#0E7C86] px-3 text-[10.5px] font-bold text-[#5C707C] dark:text-[#9BB4C7] hover:text-[#142B5F] dark:hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>استعادة التخطيط</span>
                    </button>
                  </div>

                  {snapshots.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {snapshots.slice(0, 4).map((snapshot) => (
                        <div
                          key={snapshot.id}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] dark:bg-[#0B1529]/80"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-[#142B5F] dark:text-white block truncate text-[10.5px]">
                              {snapshot.label || 'نسخة إعدادات مساحة العمل'}
                            </span>
                            <span className="text-[9.5px] text-[#5C707C] dark:text-[#9BB4C7] tabular-nums">
                              {formatDate(snapshot.createdAt)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRestoreSnapshot(snapshot.id)}
                            disabled={saving}
                            className="mn-workspace-btn-sm rounded-lg border border-[#0E7C86]/28 dark:border-[#38C6D4]/30 bg-white dark:bg-[#111E38] hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:text-white hover:border-transparent px-2.5 text-[10px] font-bold text-[#142B5F] dark:text-white transition-all cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            استعادة
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10.5px] sm:text-[11px] font-medium text-[#5C707C] dark:text-[#9BB4C7]">
                  يتضمن النسخ الاحتياطية لإعدادات مساحة العمل واستعادة التخطيط الافتراضي.
                </p>
              )}
            </SummarySectionCard>
          </div>

          {/* Rounded Manaratak Save Bar */}
          <div className="relative overflow-hidden rounded-2xl border border-[#142B5F]/10 dark:border-white/10 bg-white dark:bg-[#111E38] px-3.5 py-3 sm:px-5 sm:py-3.5 shadow-[0_6px_22px_rgba(20,43,95,0.05)] dark:shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 font-['Cairo',sans-serif]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-l from-[#142B5F]/40 via-[#0E7C86]/55 to-transparent dark:from-[#38C6D4]/55 dark:via-[#38C6D4]/25"
            />
            <div className="flex items-center gap-2.5 text-right">
              <SummarySectionIcon icon={ShieldCheck} />
              <p className="text-[11px] sm:text-[12px] font-bold text-[#142B5F] dark:text-white">
                حفظ التعديلات ومزامنتها سحابياً عبر حسابك
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mn-workspace-btn-sm w-full sm:w-auto rounded-xl bg-gradient-to-l from-[#142B5F] via-[#133A6A] to-[#0E7C86] hover:opacity-95 px-4 text-[11px] font-bold text-white shadow-2xs active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" aria-hidden="true" />
                  <span>جارٍ حفظ التفضيلات…</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
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
        <div className={compactSummary ? 'space-y-2' : 'space-y-3'}>
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className={
                compactSummary
                  ? 'rounded-xl border border-[#142B5F]/12 dark:border-white/10 bg-[#F6F8FA] hover:bg-white dark:bg-[#0B1529]/80 dark:hover:bg-[#142342] hover:border-[#0E7C86]/45 px-3 py-2.5 transition-all duration-200'
                  : 'rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-4'
              }
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  {compactSummary && (
                    <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#142B5F] via-[#133A6A] to-[#0E7C86] text-white shadow-[0_2px_6px_rgba(20,43,95,0.14)]">
                      <Receipt className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className={compactSummary ? 'text-[10.5px] sm:text-[12px] font-bold leading-snug text-[#142B5F] dark:text-[#F1F5F9] break-words tabular-nums' : 'font-bold'}>
                        {invoice.invoiceNumber}
                      </h3>
                      <span
                        className={`text-[9.5px] font-bold ${
                          invoice.status === 'PAID'
                            ? 'text-[#0E7C86] dark:text-[#38C6D4]'
                            : 'text-[#142B5F]/75 dark:text-[#F2CD78]'
                        }`}
                      >
                        · {arabicStatus(invoice.status)}
                      </span>
                    </div>
                    <p className={compactSummary ? 'mt-0.5 text-[9.5px] sm:text-[10.5px] font-semibold leading-snug text-[#5C707C] dark:text-[#9BB4C7] tabular-nums' : 'mt-1 text-sm text-[var(--mn-text-muted)]'}>
                      المستحق {formatMoney(invoice.amountDue)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggle(invoice.id)}
                  className={
                    compactSummary
                      ? 'mn-summary-cta-secondary shrink-0 inline-flex items-center justify-center rounded-lg border border-[#0E7C86]/32 dark:border-[#38C6D4]/35 bg-white hover:bg-gradient-to-l hover:from-[#142B5F] hover:via-[#133A6A] hover:to-[#0E7C86] hover:border-transparent dark:bg-[#111E38] px-2.5 text-[10px] sm:text-[11px] font-bold text-[#142B5F] hover:text-white dark:text-[#EDF5F5] transition-all cursor-pointer whitespace-nowrap'
                      : 'text-xs font-semibold text-[var(--mn-secondary)]'
                  }
                >
                  {paymentsByInvoice[invoice.id] ? 'إخفاء الدفعات' : 'عرض الدفعات'}
                </button>
              </div>
              {paymentsByInvoice[invoice.id] && (
                <div className="mt-2 space-y-1.5 border-t border-[#142B5F]/8 dark:border-white/10 pt-2">
                  {paymentsByInvoice[invoice.id].length ? (
                    paymentsByInvoice[invoice.id].map((payment) => (
                      <p key={payment.id} className="rounded-lg bg-white dark:bg-[#111E38] border border-[#142B5F]/8 dark:border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-[#142B5F] dark:text-[#DCE7F0] tabular-nums">
                        {formatMoney(payment.amount)} — {arabicStatus(payment.status)}
                      </p>
                    ))
                  ) : (
                    <p className="text-[10px] text-[#5C707C] dark:text-[#9BB4C7]">لا توجد دفعات مسجلة.</p>
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
    <SummarySectionCard
      title="الفواتير والدفعات"
      icon={Receipt}
      metaLabel={`${invoices.length} فاتورة`}
    >
      {content}
    </SummarySectionCard>
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
