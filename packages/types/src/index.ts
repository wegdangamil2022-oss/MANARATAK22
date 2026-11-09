export type Locale = 'ar' | 'en';
export type SupportedLocale = 'ar' | 'en';

export interface BaseEntity {
  id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
