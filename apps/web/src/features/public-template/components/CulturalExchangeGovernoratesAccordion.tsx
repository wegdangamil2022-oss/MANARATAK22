import React, { useMemo, useState } from 'react';
import {
  ArrowDownNarrowWide,
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  MapPin,
  PlaneTakeoff,
  Search,
  Stethoscope,
} from 'lucide-react';

export interface GovernorateSeats {
  id: number;
  name: string;
  isSpecialCategory?: boolean;
  bachelorTotal: number;
  bachelorDistribution: { country: string; count: number }[];
  masterTotal: number;
  masterDistribution: { country: string; count: number }[];
  medicineTotal: number;
  medicineDistribution: { country: string; count: number }[];
}

export const GOVERNORATES_2026_DATA: GovernorateSeats[] = [
  {
    id: 1,
    name: 'عدن',
    bachelorTotal: 22,
    bachelorDistribution: [
      { country: 'الأردن', count: 11 },
      { country: 'المجر', count: 5 },
      { country: 'الجزائر', count: 3 },
      { country: 'المغرب', count: 2 },
      { country: 'الصين', count: 1 },
      { country: 'كوبا', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 7,
    masterDistribution: [
      { country: 'المجر', count: 4 },
      { country: 'الصين', count: 3 },
    ],
    medicineTotal: 5,
    medicineDistribution: [
      { country: 'الأردن', count: 3 },
      { country: 'المجر', count: 1 },
      { country: 'الصين', count: 1 },
    ],
  },
  {
    id: 2,
    name: 'لحج',
    bachelorTotal: 19,
    bachelorDistribution: [
      { country: 'الأردن', count: 8 },
      { country: 'المجر', count: 5 },
      { country: 'الجزائر', count: 2 },
      { country: 'المغرب', count: 2 },
      { country: 'كوبا', count: 2 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'الصين', count: 1 }],
    medicineTotal: 7,
    medicineDistribution: [
      { country: 'الأردن', count: 4 },
      { country: 'كوبا', count: 2 },
      { country: 'المجر', count: 1 },
    ],
  },
  {
    id: 3,
    name: 'أبين',
    bachelorTotal: 10,
    bachelorDistribution: [
      { country: 'الجزائر', count: 5 },
      { country: 'المجر', count: 3 },
      { country: 'الأردن', count: 1 },
      { country: 'المغرب', count: 1 },
      { country: 'كوبا', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 2,
    masterDistribution: [
      { country: 'المجر', count: 1 },
      { country: 'الصين', count: 1 },
    ],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الجزائر', count: 1 }],
  },
  {
    id: 4,
    name: 'تعز',
    bachelorTotal: 14,
    bachelorDistribution: [
      { country: 'الأردن', count: 6 },
      { country: 'المغرب', count: 4 },
      { country: 'المجر', count: 3 },
      { country: 'الصين', count: 1 },
      { country: 'الجزائر', count: 0 },
      { country: 'كوبا', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 2,
    masterDistribution: [{ country: 'الصين', count: 2 }],
    medicineTotal: 2,
    medicineDistribution: [
      { country: 'المغرب', count: 1 },
      { country: 'المجر', count: 1 },
    ],
  },
  {
    id: 5,
    name: 'إب',
    bachelorTotal: 14,
    bachelorDistribution: [
      { country: 'الأردن', count: 5 },
      { country: 'المجر', count: 4 },
      { country: 'كوبا', count: 2 },
      { country: 'الجزائر', count: 1 },
      { country: 'المغرب', count: 1 },
      { country: 'الصين', count: 1 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 2,
    masterDistribution: [
      { country: 'المجر', count: 1 },
      { country: 'الصين', count: 1 },
    ],
    medicineTotal: 4,
    medicineDistribution: [
      { country: 'كوبا', count: 2 },
      { country: 'الأردن', count: 1 },
      { country: 'الصين', count: 1 },
    ],
  },
  {
    id: 6,
    name: 'حضرموت',
    bachelorTotal: 16,
    bachelorDistribution: [
      { country: 'المجر', count: 5 },
      { country: 'الأردن', count: 4 },
      { country: 'المغرب', count: 4 },
      { country: 'الجزائر', count: 2 },
      { country: 'الصين', count: 1 },
      { country: 'كوبا', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 4,
    masterDistribution: [
      { country: 'المجر', count: 3 },
      { country: 'الصين', count: 1 },
    ],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الجزائر', count: 1 }],
  },
  {
    id: 7,
    name: 'مأرب',
    bachelorTotal: 8,
    bachelorDistribution: [
      { country: 'الأردن', count: 3 },
      { country: 'المغرب', count: 2 },
      { country: 'المجر', count: 2 },
      { country: 'الجزائر', count: 1 },
      { country: 'كوبا', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'الصين', count: 1 }],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الجزائر', count: 1 }],
  },
  {
    id: 8,
    name: 'شبوة',
    bachelorTotal: 13,
    bachelorDistribution: [
      { country: 'الأردن', count: 4 },
      { country: 'الجزائر', count: 3 },
      { country: 'المجر', count: 3 },
      { country: 'المغرب', count: 2 },
      { country: 'كوبا', count: 1 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 3,
    masterDistribution: [
      { country: 'المجر', count: 2 },
      { country: 'الصين', count: 1 },
    ],
    medicineTotal: 3,
    medicineDistribution: [
      { country: 'الأردن', count: 1 },
      { country: 'المغرب', count: 1 },
      { country: 'كوبا', count: 1 },
    ],
  },
  {
    id: 9,
    name: 'الضالع',
    bachelorTotal: 14,
    bachelorDistribution: [
      { country: 'الجزائر', count: 5 },
      { country: 'المجر', count: 4 },
      { country: 'المغرب', count: 3 },
      { country: 'الأردن', count: 1 },
      { country: 'كوبا', count: 1 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 3,
    masterDistribution: [
      { country: 'المجر', count: 2 },
      { country: 'الصين', count: 1 },
    ],
    medicineTotal: 4,
    medicineDistribution: [
      { country: 'المجر', count: 2 },
      { country: 'الجزائر', count: 1 },
      { country: 'كوبا', count: 1 },
    ],
  },
  {
    id: 10,
    name: 'المهرة',
    bachelorTotal: 4,
    bachelorDistribution: [
      { country: 'الأردن', count: 1 },
      { country: 'كوبا', count: 1 },
      { country: 'الصين', count: 1 },
      { country: 'PMU السعودية', count: 1 },
      { country: 'الجزائر', count: 0 },
      { country: 'المغرب', count: 0 },
      { country: 'المجر', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'الصين', count: 1 }],
    medicineTotal: 2,
    medicineDistribution: [
      { country: 'كوبا', count: 1 },
      { country: 'الصين', count: 1 },
    ],
  },
  {
    id: 11,
    name: 'صنعاء',
    bachelorTotal: 5,
    bachelorDistribution: [
      { country: 'المجر', count: 2 },
      { country: 'الأردن', count: 1 },
      { country: 'الجزائر', count: 1 },
      { country: 'المغرب', count: 1 },
      { country: 'الصين', count: 0 },
      { country: 'كوبا', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'المجر', count: 1 }],
    medicineTotal: 2,
    medicineDistribution: [
      { country: 'الجزائر', count: 1 },
      { country: 'المجر', count: 1 },
    ],
  },
  {
    id: 12,
    name: 'أمانة العاصمة',
    bachelorTotal: 14,
    bachelorDistribution: [
      { country: 'الأردن', count: 4 },
      { country: 'المغرب', count: 4 },
      { country: 'الصين', count: 3 },
      { country: 'المجر', count: 2 },
      { country: 'الجزائر', count: 1 },
      { country: 'كوبا', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 2,
    masterDistribution: [
      { country: 'المجر', count: 1 },
      { country: 'الصين', count: 1 },
    ],
    medicineTotal: 2,
    medicineDistribution: [
      { country: 'المغرب', count: 1 },
      { country: 'الصين', count: 1 },
    ],
  },
  {
    id: 13,
    name: 'ذمار',
    bachelorTotal: 6,
    bachelorDistribution: [
      { country: 'الأردن', count: 3 },
      { country: 'الجزائر', count: 2 },
      { country: 'المغرب', count: 1 },
      { country: 'كوبا', count: 0 },
      { country: 'المجر', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'الصين', count: 1 }],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الأردن', count: 1 }],
  },
  {
    id: 14,
    name: 'عمران',
    bachelorTotal: 5,
    bachelorDistribution: [
      { country: 'المجر', count: 2 },
      { country: 'الأردن', count: 1 },
      { country: 'الجزائر', count: 1 },
      { country: 'المغرب', count: 1 },
      { country: 'كوبا', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 0,
    masterDistribution: [],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الجزائر', count: 1 }],
  },
  {
    id: 15,
    name: 'حجة',
    bachelorTotal: 9,
    bachelorDistribution: [
      { country: 'المغرب', count: 3 },
      { country: 'الجزائر', count: 2 },
      { country: 'المجر', count: 2 },
      { country: 'الأردن', count: 1 },
      { country: 'PMU السعودية', count: 1 },
      { country: 'كوبا', count: 0 },
      { country: 'الصين', count: 0 },
    ],
    masterTotal: 0,
    masterDistribution: [],
    medicineTotal: 2,
    medicineDistribution: [
      { country: 'الجزائر', count: 1 },
      { country: 'المجر', count: 1 },
    ],
  },
  {
    id: 16,
    name: 'الحديدة',
    bachelorTotal: 8,
    bachelorDistribution: [
      { country: 'الأردن', count: 4 },
      { country: 'الجزائر', count: 2 },
      { country: 'المغرب', count: 2 },
      { country: 'كوبا', count: 0 },
      { country: 'المجر', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 3,
    masterDistribution: [{ country: 'الصين', count: 3 }],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'المغرب', count: 1 }],
  },
  {
    id: 17,
    name: 'المحويت',
    bachelorTotal: 3,
    bachelorDistribution: [
      { country: 'الأردن', count: 1 },
      { country: 'كوبا', count: 1 },
      { country: 'المجر', count: 1 },
      { country: 'الجزائر', count: 0 },
      { country: 'المغرب', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'الصين', count: 1 }],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'كوبا', count: 1 }],
  },
  {
    id: 18,
    name: 'ريمة',
    bachelorTotal: 3,
    bachelorDistribution: [
      { country: 'المغرب', count: 1 },
      { country: 'كوبا', count: 1 },
      { country: 'المجر', count: 1 },
      { country: 'الأردن', count: 0 },
      { country: 'الجزائر', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 0,
    masterDistribution: [],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'كوبا', count: 1 }],
  },
  {
    id: 19,
    name: 'البيضاء',
    bachelorTotal: 1,
    bachelorDistribution: [
      { country: 'الجزائر', count: 1 },
      { country: 'الأردن', count: 0 },
      { country: 'المغرب', count: 0 },
      { country: 'كوبا', count: 0 },
      { country: 'المجر', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'الصين', count: 1 }],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الجزائر', count: 1 }],
  },
  {
    id: 20,
    name: 'الجوف',
    bachelorTotal: 4,
    bachelorDistribution: [
      { country: 'الجزائر', count: 2 },
      { country: 'المجر', count: 2 },
      { country: 'الأردن', count: 0 },
      { country: 'المغرب', count: 0 },
      { country: 'كوبا', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 0,
    masterDistribution: [],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الجزائر', count: 1 }],
  },
  {
    id: 21,
    name: 'صعدة',
    bachelorTotal: 5,
    bachelorDistribution: [
      { country: 'الجزائر', count: 2 },
      { country: 'المغرب', count: 1 },
      { country: 'كوبا', count: 1 },
      { country: 'المجر', count: 1 },
      { country: 'الأردن', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 0,
    masterDistribution: [],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'كوبا', count: 1 }],
  },
  {
    id: 22,
    name: 'سقطرى',
    bachelorTotal: 3,
    bachelorDistribution: [
      { country: 'الجزائر', count: 2 },
      { country: 'المغرب', count: 1 },
      { country: 'الأردن', count: 0 },
      { country: 'كوبا', count: 0 },
      { country: 'المجر', count: 0 },
      { country: 'الصين', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'الصين', count: 1 }],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الجزائر', count: 1 }],
  },
  {
    id: 23,
    name: 'فئة الخارج (أبناء المغتربين والدارسين بالخارج)',
    isSpecialCategory: true,
    bachelorTotal: 5,
    bachelorDistribution: [
      { country: 'المغرب', count: 2 },
      { country: 'الصين', count: 2 },
      { country: 'الأردن', count: 1 },
      { country: 'الجزائر', count: 0 },
      { country: 'كوبا', count: 0 },
      { country: 'المجر', count: 0 },
      { country: 'PMU السعودية', count: 0 },
    ],
    masterTotal: 1,
    masterDistribution: [{ country: 'الصين', count: 1 }],
    medicineTotal: 1,
    medicineDistribution: [{ country: 'الصين', count: 1 }],
  },
];

export function CulturalExchangeGovernoratesAccordion() {
  const [openIds, setOpenIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<'desc_seats' | 'official' | 'asc_seats'>('desc_seats');

  const toggleGov = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const expandAll = () => {
    setOpenIds(GOVERNORATES_2026_DATA.map((g) => g.id));
  };

  const collapseAll = () => {
    setOpenIds([]);
  };

  const filtered = useMemo(() => {
    const list = GOVERNORATES_2026_DATA.filter((g) =>
      g.name.includes(searchQuery.trim()),
    );

    return [...list].sort((a, b) => {
      if (a.isSpecialCategory && !b.isSpecialCategory) return 1;
      if (!a.isSpecialCategory && b.isSpecialCategory) return -1;

      if (sortMode === 'desc_seats') {
        const totalA = a.bachelorTotal + a.masterTotal;
        const totalB = b.bachelorTotal + b.masterTotal;
        if (totalB !== totalA) return totalB - totalA;
        if (b.bachelorTotal !== a.bachelorTotal) return b.bachelorTotal - a.bachelorTotal;
        return a.id - b.id;
      }
      if (sortMode === 'asc_seats') {
        const totalA = a.bachelorTotal + a.masterTotal;
        const totalB = b.bachelorTotal + b.masterTotal;
        if (totalA !== totalB) return totalA - totalB;
        return a.id - b.id;
      }
      return a.id - b.id;
    });
  }, [searchQuery, sortMode]);

  return (
    <div className="rounded-xl bg-[var(--mn-page)] border border-[var(--mn-border)] shadow-xs overflow-hidden flex flex-col w-full font-['Cairo',sans-serif]">
      {/* Intro & Clarification Banner */}
      <div className="p-3 sm:p-4 bg-[#142B5F]/5 dark:bg-white/[0.02] border-b border-[var(--mn-border)] space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0E7C86] border-[1.5px] border-[#142B5F] ring-1 ring-[#142B5F]/40 text-white mn-sub-item-icon flex items-center justify-center shrink-0 shadow-2xs">
              <MapPin className="w-3 h-3" />
            </div>
            <span className="text-[12px] font-bold font-['Cairo',sans-serif] text-[var(--mn-heading)]">
              بيانات جميع المحافظات (22 محافظة) + فئة الخارج لدورة 2026/2027 المدققة
            </span>
          </div>
          <span className="text-[11px] font-bold font-['Cairo',sans-serif] text-[#0E7C86] dark:text-[#21A7B4] bg-[#0E7C86]/10 px-2.5 py-0.5 rounded-md border border-[#0E7C86]/25">
            23 بطاقة تفاعلية — انقر للتفاصيل
          </span>
        </div>

        {/* Note Card with side border */}
        <div className="border-r-2 border-[#0E7C86] pr-2.5 py-1">
          <p className="text-[11.5px] font-bold font-['Cairo',sans-serif] text-[var(--mn-text)] leading-[1.85] text-justify">
            لكل محافظة نعرض إجمالي البكالوريوس، ثم توزيع البكالوريوس على كل دولة، ثم الماجستير، ثم الطب البشري مع توضيح الدولة.{' '}
            <strong className="text-[var(--mn-heading)] font-bold">تنبيه جوهري:</strong> مقاعد الطب البشري محسوبة أصلًا ضمن إجمالي مقاعد البكالوريوس وليست مقاعد إضافية منفصلة.
          </p>
        </div>
      </div>

      {/* Interactive Controls Bar: Search & Sort */}
      <div className="p-3 sm:p-3.5 bg-[var(--mn-surface)] border-b border-[var(--mn-border)] flex flex-col md:flex-row md:items-center justify-between gap-2.5 font-['Cairo',sans-serif]">
        {/* Search Input */}
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن محافظة (مثال: عدن، تعز، حضرموت...)"
            className="w-full pr-8 pl-3 py-1.5 text-[11.5px] font-bold font-['Cairo',sans-serif] rounded-lg border border-[var(--mn-border)] bg-[var(--mn-page)] text-[var(--mn-text)] placeholder:text-[var(--mn-text-muted)] focus:outline-none focus:border-[#0E7C86] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-[var(--mn-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort and expand/collapse controls */}
        <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end font-['Cairo',sans-serif]">
          <div className="flex items-center gap-1 bg-[var(--mn-page)] p-1 rounded-lg border border-[var(--mn-border)] text-[11px] font-bold font-['Cairo',sans-serif]">
            <button
              type="button"
              onClick={() => setSortMode('desc_seats')}
              className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1.5 cursor-pointer text-[11px] font-['Cairo',sans-serif] ${
                sortMode === 'desc_seats'
                  ? 'bg-[#142B5F] text-white'
                  : 'text-[var(--mn-text-muted)] hover:text-[var(--mn-heading)]'
              }`}
            >
              <ArrowDownNarrowWide className="w-3 h-3" />
              <span>الأكثر مقاعداً</span>
            </button>
            <button
              type="button"
              onClick={() => setSortMode('official')}
              className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer text-[11px] font-['Cairo',sans-serif] ${
                sortMode === 'official'
                  ? 'bg-[#142B5F] text-white'
                  : 'text-[var(--mn-text-muted)] hover:text-[var(--mn-heading)]'
              }`}
            >
              <span>الترتيب الرسمي</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1 rounded-md border border-[var(--mn-border)] hover:bg-[var(--mn-surface-muted)] text-[11px] font-bold font-['Cairo',sans-serif] text-[var(--mn-heading)] transition-colors cursor-pointer"
            >
              فتح الكل
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1 rounded-md border border-[var(--mn-border)] hover:bg-[var(--mn-surface-muted)] text-[11px] font-bold font-['Cairo',sans-serif] text-[var(--mn-text-muted)] hover:text-[var(--mn-heading)] transition-colors cursor-pointer"
            >
              طي الكل
            </button>
          </div>
        </div>
      </div>

      {/* Governorates List */}
      <div className="divide-y divide-[var(--mn-border)]">
        {filtered.length === 0 ? (
          <div className="p-5 text-center text-[11.5px] font-bold font-['Cairo',sans-serif] text-[var(--mn-text-muted)]">
            لا توجد محافظة تطابق بحثك
          </div>
        ) : (
          filtered.map((gov, index) => {
            const isOpen = openIds.includes(gov.id);
            const totalAll = gov.bachelorTotal + gov.masterTotal;
            const rankOrId = sortMode === 'desc_seats' ? index + 1 : gov.id;

            return (
              <div key={gov.id} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleGov(gov.id)}
                  className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 text-right transition-colors cursor-pointer select-none font-['Cairo',sans-serif] ${
                    isOpen ? 'bg-[var(--mn-surface-muted)]/60' : 'hover:bg-[var(--mn-surface-muted)]/40'
                  }`}
                >
                  <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
                    <div className="px-2.5 py-1 rounded-lg bg-[#142B5F] text-white border border-[#142B5F] shadow-2xs flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[10.5px] font-bold opacity-85">
                        {gov.isSpecialCategory ? (
                          <PlaneTakeoff className="w-3 h-3 inline-block" />
                        ) : (
                          `${rankOrId}.`
                        )}
                      </span>
                      <span className="text-[12px] font-bold font-['Cairo',sans-serif]">
                        {gov.name}
                      </span>
                      {gov.isSpecialCategory && (
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold font-['Cairo',sans-serif] bg-white/20 text-white">
                          الخارج
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-bold font-['Cairo',sans-serif]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold bg-[#142B5F]/10 text-[var(--mn-heading)] border border-[#142B5F]/20">
                        <span className="font-mono ml-1">{totalAll}</span> الإجمالي
                      </span>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold bg-[var(--mn-surface)] text-[var(--mn-text)] border border-[var(--mn-border)]">
                        <span className="font-mono ml-1">{gov.bachelorTotal}</span> بكالوريوس
                      </span>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold bg-[var(--mn-surface)] text-[var(--mn-text)] border border-[var(--mn-border)]">
                        <span className="font-mono ml-1">{gov.masterTotal}</span> ماجستير
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#21A7B4] border border-[#0E7C86]/25">
                        <Stethoscope className="w-3 h-3 text-[#0E7C86] dark:text-[#21A7B4]" />
                        <span className="font-mono ml-0.5">{gov.medicineTotal}</span> طب بشري
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-bold font-['Cairo',sans-serif] text-[var(--mn-text-muted)] hidden sm:inline">
                      {isOpen ? 'إخفاء' : 'عرض التفاصيل'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0E7C86]' : 'text-[var(--mn-text-muted)]'
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-2 bg-[var(--mn-surface)]/50 border-t border-[var(--mn-border)]/70 space-y-3 font-['Cairo',sans-serif]">
                    <div className="flex items-center gap-2 text-[11px] font-bold font-['Cairo',sans-serif] text-[var(--mn-heading)] bg-[#0E7C86]/8 border-r-2 border-[#0E7C86] px-3 py-2 rounded-l-lg border-y border-l border-[var(--mn-border)]/60">
                      <Stethoscope className="w-3.5 h-3.5 shrink-0 text-[#0E7C86]" />
                      <span>
                        مقاعد الطب البشري ({gov.medicineTotal}) محسوبة أصلًا ضمن مقاعد البكالوريوس الـ ({gov.bachelorTotal})، وليست مقاعد إضافية منفصلة.
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-[#0E7C86] border border-[#142B5F] text-white mn-sub-item-icon flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3 h-3" />
                        </div>
                        <h6 className="text-[11.5px] font-bold text-[var(--mn-heading)] font-['Cairo',sans-serif]">
                          توزيع مقاعد البكالوريوس ({gov.bachelorTotal} مقعداً):
                        </h6>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {gov.bachelorDistribution.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 text-[11px] font-bold font-['Cairo',sans-serif] transition-colors ${
                              item.count > 0
                                ? 'bg-[var(--mn-page)] border-[var(--mn-border)] shadow-2xs hover:border-[#0E7C86]/40'
                                : 'bg-[var(--mn-page)]/40 border-[var(--mn-border)]/50 opacity-45'
                            }`}
                          >
                            <span className="font-bold text-[var(--mn-heading)] truncate">
                              {item.country}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10.5px] font-bold shrink-0 ${
                                item.count > 0
                                  ? 'bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#21A7B4]'
                                  : 'bg-[var(--mn-surface-muted)] text-[var(--mn-text-muted)]'
                              }`}
                            >
                              {item.count} {item.count === 1 ? 'مقعد' : item.count === 2 ? 'مقعدان' : 'مقاعد'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                      <div className="p-2.5 rounded-lg bg-[var(--mn-page)] border border-[var(--mn-border)] border-r-2 border-r-[#142B5F] space-y-2 font-['Cairo',sans-serif]">
                        <h6 className="text-[11.5px] font-bold text-[var(--mn-heading)] flex items-center gap-1.5 font-['Cairo',sans-serif]">
                          <BriefcaseBusiness className="w-3.5 h-3.5 text-[#0E7C86]" />
                          مقاعد الماجستير ({gov.masterTotal} {gov.masterTotal === 1 ? 'مقعد' : gov.masterTotal === 2 ? 'مقعدان' : 'مقاعد'}):
                        </h6>
                        {gov.masterDistribution.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {gov.masterDistribution.map((m, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#142B5F]/10 text-[var(--mn-heading)] border border-[#142B5F]/20 text-[11px] font-bold font-['Cairo',sans-serif]"
                              >
                                <span>{m.country}:</span>
                                <span className="font-mono">{m.count}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] font-bold font-['Cairo',sans-serif] text-[var(--mn-text-muted)]">
                            لا توجد مقاعد ماجستير مخصصة في هذه الدورة
                          </p>
                        )}
                      </div>

                      <div className="p-2.5 rounded-lg bg-[var(--mn-page)] border border-[var(--mn-border)] border-r-2 border-r-[#0E7C86] space-y-2 font-['Cairo',sans-serif]">
                        <h6 className="text-[11.5px] font-bold text-[var(--mn-heading)] flex items-center gap-1.5 font-['Cairo',sans-serif]">
                          <Stethoscope className="w-3.5 h-3.5 text-[#0E7C86]" />
                          توزيع الطب البشري ({gov.medicineTotal} {gov.medicineTotal === 1 ? 'مقعد' : gov.medicineTotal === 2 ? 'مقعدان' : 'مقاعد'}):
                        </h6>
                        {gov.medicineDistribution.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {gov.medicineDistribution.map((med, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0E7C86]/10 text-[#0E7C86] dark:text-[#21A7B4] border border-[#0E7C86]/25 text-[11px] font-bold font-['Cairo',sans-serif]"
                              >
                                <span>{med.country}:</span>
                                <span className="font-mono">{med.count}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] font-bold font-['Cairo',sans-serif] text-[var(--mn-text-muted)]">
                            لا توجد مقاعد طب بشري مخصصة في هذه الدورة
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
