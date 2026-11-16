export const AcademicTaxonomyDeterministicKey = 'isced-f-2013';

export const iscedFBaselineNodes = [
  { code: '00', nameAr: 'برامج عامة', nameEn: 'Generic programmes and qualifications' },
  { code: '01', nameAr: 'التعليم', nameEn: 'Education' },
  { code: '02', nameAr: 'الفنون والعلوم الإنسانية', nameEn: 'Arts and humanities' },
  { code: '03', nameAr: 'العلوم الاجتماعية والصحافة والإعلام', nameEn: 'Social sciences, journalism and information' },
  { code: '04', nameAr: 'الأعمال والإدارة والقانون', nameEn: 'Business, administration and law' },
  { code: '05', nameAr: 'العلوم الطبيعية والرياضيات والإحصاء', nameEn: 'Natural sciences, mathematics and statistics' },
  { code: '06', nameAr: 'تكنولوجيا المعلومات والاتصالات', nameEn: 'Information and Communication Technologies (ICTs)' },
  { code: '07', nameAr: 'الهندسة والتصنيع والبناء', nameEn: 'Engineering, manufacturing and construction' },
  { code: '08', nameAr: 'الزراعة والحراجة ومصائد الأسماك والبيطرة', nameEn: 'Agriculture, forestry, fisheries and veterinary' },
  { code: '09', nameAr: 'الصحة والرفاه', nameEn: 'Health and welfare' },
  { code: '10', nameAr: 'الخدمات', nameEn: 'Services' },
];

export enum AssetLifecycleState {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DEPRECATED = 'DEPRECATED',
}

export enum AssetSecurityClassification {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
}

export enum AssetRetentionCategory {
  PERMANENT = 'PERMANENT',
  OPERATIONAL = 'OPERATIONAL',
  TEMPORARY = 'TEMPORARY',
}

export type AdmissionVersionScale = 'PERCENTAGE' | 'GPA_4' | 'GPA_5' | 'RAW_SCORE';

export function evaluateAdmissionScores(scores: any, profile: any): any {
  return { eligible: true, score: 100, reason: 'Eligible' };
}

export enum ExternalCourseProviderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export const MAJOR_REVIEW_TEMPLATE = {
  sections: [
    { key: 'overview', titleAr: 'نظرة عامة', required: true },
    { key: 'career_prospects', titleAr: 'الآفاق الوظيفية', required: false },
    { key: 'admission_requirements', titleAr: 'شروط القبول', required: false },
  ],
};

export enum ReferenceLifecycleState {
  PROPOSED = 'PROPOSED',
  ACTIVE = 'ACTIVE',
  RETIRED = 'RETIRED',
}

export const REFERENCE_QUALITY_ISSUES = [
  'MISSING_REQUIRED_NAME_AR',
  'MISSING_REQUIRED_NAME_EN',
  'DUPLICATE_CODE',
  'MALFORMED_IDENTIFIER',
] as const;

export type ReferenceQualityIssueKind = typeof REFERENCE_QUALITY_ISSUES[number];

export interface ReferenceQualityReport {
  score: number;
  totalIssues: number;
  issues: Array<{ kind: ReferenceQualityIssueKind; message: string; entityId: string }>;
}

export const REQUIRED_REFERENCE_STANDARD_FAMILIES = [
  'ISO_3166_COUNTRY',
  'ISO_4217_CURRENCY',
  'ISO_639_LANGUAGE',
];

export const STUDY_DESTINATION_READINESS_KEYS = [
  'COUNTRY_OVERVIEW',
  'ADMISSION_HIGHLIGHTS',
  'VISA_REQUIREMENTS',
  'COST_SUMMARY',
  'STUDENT_LIFE',
];

export type AcademicLifecycleDecision = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

export interface CanonicalAcademicUsageSummary {
  usedByProgramsCount: number;
  usedByMajorsCount: number;
}

export interface AdministrativeRegionDto {
  id: string;
  name: string;
  nameAr?: string;
  countryCode: string;
}

export interface ReferenceAliasInput {
  alias: string;
  locale: string;
}

export interface ReferenceDataPage<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ReferenceVersionDto {
  version: number;
  author: string;
  createdAt: string;
}

export interface AdmissionScoreProfile {
  minimumScore: number;
  scale: AdmissionVersionScale;
}

export interface CareerJobPostingDto {
  id: string;
  title: string;
  employerName: string;
  location: string;
  workMode: string;
  status: string;
}

export interface CareerEmployerDto {
  id: string;
  name: string;
  verified: boolean;
}

export interface CareerApplicationDto {
  id: string;
  jobId: string;
  studentId: string;
  status: string;
}

export interface CourseProviderRegistryFilters {
  status?: string;
  search?: string;
}

export interface ExternalCourseProviderDto {
  id: string;
  name: string;
  status: ExternalCourseProviderStatus;
  apiEndpoint?: string;
}

export interface UpdateCourseProviderMappings {
  providerId: string;
  mappings: Record<string, string>;
}

export interface FinanceInvoiceDto {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  recipientName: string;
  createdAt: string;
}

export interface WalletOperationsDto {
  balance: number;
  currency: string;
  available: number;
}

export interface FinancialAccountDto {
  id: string;
  name: string;
  balance: number;
}

export interface PaginatedFinanceResult<T = any> {
  items: T[];
  total: number;
}

export interface FinancialApprovalDto {
  id: string;
  status: string;
  approverId?: string;
  comment?: string;
}

export interface FinancialTransactionDto {
  id: string;
  amount: number;
  type: string;
  date: string;
}

export interface InternationalTestDto {
  id: string;
  name: string;
  code: string;
  category: string;
}

export interface InternationalTestVersionDto {
  id: string;
  version: number;
}

export type InternationalTestStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface LearningPathDto {
  id: string;
  title: string;
  coursesCount: number;
}

export interface LearningPathCourseDto {
  courseId: string;
  order: number;
}

export interface MajorConsumerPage {
  consumers: Array<{ id: string; name: string }>;
}

export interface MajorDto {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  degreeLevel?: string;
}

export interface MajorContentSectionDto {
  title: string;
  body: string;
}

export interface MajorVersionDto {
  version: number;
}

export interface MajorImportReview {
  id: string;
  status: string;
}

export interface NewMajorCandidateComparison {
  candidateId: string;
  matchedId?: string;
}

export interface ReferenceDataCollection {
  countries: any[];
  cities: any[];
}

export interface ReferenceDataFilters {
  search?: string;
}

export interface ReferenceProviderMappingInput {
  externalId: string;
  canonicalId: string;
}

export interface ReferenceImportScreeningReviewPage {
  records: any[];
}

export interface ReferenceOwnerReview {
  approved: boolean;
}

export interface ReferenceSnapshotRecord {
  id: string;
  snapshot: any;
}

export interface ResolvedSetting {
  key: string;
  value: any;
}

export interface ServiceCatalogItemDto {
  id: string;
  name: string;
  audience: string;
}

export interface TaxonomyCrosswalkReport {
  mappedNodes: number;
}

export interface TaxonomyDiagnosticsReport {
  orphans: number;
}
