/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrayerLog, DhikrLog, QuranLog, SadaqaLog, DuaItem } from '../types';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'salat_streak' | 'quran_streak' | 'dhikr_streak' | 'sadaqa_king' | 'dua_master' | 'devotion_score';
  requirement: string;
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'badge-fard-3',
    title: 'Salat Disciple',
    description: 'Completed all 5 Fard prayers for 3 consecutive days.',
    icon: '🕌',
    type: 'salat_streak',
    requirement: '3-day Fard Salat streak'
  },
  {
    id: 'badge-fard-7',
    title: 'Prayer Warrior',
    description: 'Completed all 5 Fard prayers for 7 consecutive days.',
    icon: '👑',
    type: 'salat_streak',
    requirement: '7-day Fard Salat streak'
  },
  {
    id: 'badge-quran-scholar',
    title: 'Quran Scholar',
    description: 'Read a total of 50 or more Quran pages.',
    icon: '📖',
    type: 'quran_streak',
    requirement: '50 total pages'
  },
  {
    id: 'badge-quran-streak-5',
    title: 'Hafiz Aspirant',
    description: 'Read Quran for 5 consecutive days.',
    icon: '✨',
    type: 'quran_streak',
    requirement: '5-day Quran streak'
  },
  {
    id: 'badge-tasbih-master',
    title: 'Tasbih Master',
    description: 'Recited 1000 or more total Dhikr repetitions.',
    icon: '📿',
    type: 'dhikr_streak',
    requirement: '1000 total dhikr'
  },
  {
    id: 'badge-generosity-champion',
    title: 'Merciful Caretaker',
    description: 'Logged 5 or more acts of Sadaqa or kindness.',
    icon: '❤️',
    type: 'sadaqa_king',
    requirement: '5 charity / kindness items'
  },
  {
    id: 'badge-dua-supplicant',
    title: 'Dua Devotee',
    description: 'Read at least 15 supplications from the library.',
    icon: '🤲',
    type: 'dua_master',
    requirement: '15 dua read counts'
  },
  {
    id: 'badge-spiritual-peak',
    title: 'Divine Ascent',
    description: 'Achieve a daily spiritual index score of 90% or more.',
    icon: '🌟',
    type: 'devotion_score',
    requirement: '90%+ Daily Score'
  }
];

export const formatDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dateVal = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dateVal}`;
};

// Compute points for a specific date
export function calculatePointsForDate(
  date: string,
  prayerLog: PrayerLog,
  quranLogs: QuranLog[],
  dhikrLog: DhikrLog,
  sadaqaLogs: SadaqaLog[],
  duaList: DuaItem[]
): number {
  let points = 0;

  // 1. Salat:
  // Obligatory: 10 pts each. Sunnah/extra: 5 pts each
  const dayPrayers = prayerLog[date] || {};
  Object.entries(dayPrayers).forEach(([prayerId, p]) => {
    if (p.completed) {
      if (
        prayerId === 'fajr' ||
        prayerId === 'dhuhr' ||
        prayerId === 'asr' ||
        prayerId === 'maghrib' ||
        prayerId === 'isha'
      ) {
        points += 10;
      } else {
        points += 5; // Sunnah, Taraweeh, Tahajjud, Duha, Witr
      }
    }
  });

  // 2. Quran:
  // 15 pts per page read
  const pagesRead = quranLogs
    .filter((l) => l.date === date)
    .reduce((sum, l) => sum + (l.endPage - l.startPage + 1), 0);
  points += pagesRead * 15;

  // 3. Dhikr:
  // 1 pt per tap
  const dayDhikr = dhikrLog[date] || {};
  const dhikrCount = Object.values(dayDhikr).reduce((sum, val) => sum + val, 0);
  points += dhikrCount;

  // 4. Sadaqa:
  // 50 pts for money donations, 30 pts for acts of kindness/food/volunteer
  const daySadaqa = sadaqaLogs.filter((l) => l.date === date);
  daySadaqa.forEach((l) => {
    if (l.type === 'money') {
      points += 50;
    } else {
      points += 30;
    }
  });

  // 5. Duas:
  // 20 pts per read
  duaList.forEach((dua) => {
    const times = (dua.timesRead && dua.timesRead[date]) || 0;
    points += times * 20;
  });

  return points;
}

// Calculate streaks
interface Streak {
  current: number;
  max: number;
}

export function getSalatStreak(prayerLog: PrayerLog): Streak {
  let current = 0;
  let max = 0;
  const today = new Date();
  
  // Look back 45 days
  const dates: string[] = [];
  for (let i = 45; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(formatDateStr(d));
  }

  const todayStr = formatDateStr(today);

  for (const date of dates) {
    const dayData = prayerLog[date] || {};
    const completedFard = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].every(
      (p) => dayData[p]?.completed
    );

    if (completedFard) {
      current++;
      if (current > max) max = current;
    } else {
      if (date !== todayStr) {
        current = 0; // broken
      }
    }
  }

  return { current, max };
}

export function getQuranStreak(quranLogs: QuranLog[]): Streak {
  let current = 0;
  let max = 0;
  const today = new Date();
  const todayStr = formatDateStr(today);

  const dates: string[] = [];
  for (let i = 45; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(formatDateStr(d));
  }

  for (const date of dates) {
    const hasRead = quranLogs.some(
      (l) => l.date === date && (l.endPage - l.startPage + 1) > 0
    );

    if (hasRead) {
      current++;
      if (current > max) max = current;
    } else {
      if (date !== todayStr) {
        current = 0;
      }
    }
  }

  return { current, max };
}

export function getDhikrStreak(dhikrLog: DhikrLog): Streak {
  let current = 0;
  let max = 0;
  const today = new Date();
  const todayStr = formatDateStr(today);

  const dates: string[] = [];
  for (let i = 45; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(formatDateStr(d));
  }

  for (const date of dates) {
    const dayData = dhikrLog[date] || {};
    const sumTaps = Object.values(dayData).reduce((sum, val) => sum + val, 0);

    if (sumTaps > 0) {
      current++;
      if (current > max) max = current;
    } else {
      if (date !== todayStr) {
        current = 0;
      }
    }
  }

  return { current, max };
}

// Compute daily composite score for "badge-spiritual-peak"
function getSpiritualScoreForDate(
  date: string,
  prayerLog: PrayerLog,
  quranLogs: QuranLog[],
  dhikrLog: DhikrLog,
  sadaqaLogs: SadaqaLog[]
): number {
  const dayPrayers = prayerLog[date] || {};
  const salatCount = Object.keys(dayPrayers).filter(
    (k) => !dayPrayers[k]?.isSunnah && dayPrayers[k]?.completed
  ).length;
  const salatScore = (salatCount / 5) * 100;

  const quranPages = quranLogs
    .filter((l) => l.date === date)
    .reduce((sum, l) => sum + (l.endPage - l.startPage + 1), 0);
  const quranScore = quranPages > 0 ? Math.min(100, (quranPages / 10) * 100) : 0;

  const dayDhikr = dhikrLog[date] || {};
  const dhikrCount = Object.values(dayDhikr).reduce((sum, val) => sum + val, 0);
  const dhikrScore = dhikrCount > 0 ? Math.min(100, (dhikrCount / 100) * 100) : 0;

  const hasSadaqa = sadaqaLogs.some((l) => l.date === date);
  const sadaqaScore = hasSadaqa ? 100 : 0;

  return Math.round((salatScore + quranScore + dhikrScore + sadaqaScore) / 4);
}

export function evaluateEarnedBadges(
  prayerLog: PrayerLog,
  quranLogs: QuranLog[],
  dhikrLog: DhikrLog,
  sadaqaLogs: SadaqaLog[],
  duaList: DuaItem[]
): string[] {
  const earnedIds: string[] = [];

  // 1. Salat Streaks
  const salatS = getSalatStreak(prayerLog);
  if (salatS.max >= 3) earnedIds.push('badge-fard-3');
  if (salatS.max >= 7) earnedIds.push('badge-fard-7');

  // 2. Quran scholar (50+ total pages)
  const totalPages = quranLogs.reduce(
    (sum, l) => sum + (l.endPage - l.startPage + 1),
    0
  );
  if (totalPages >= 50) earnedIds.push('badge-quran-scholar');

  // 3. Quran streaks (5+ days)
  const quranS = getQuranStreak(quranLogs);
  if (quranS.max >= 5) earnedIds.push('badge-quran-streak-5');

  // 4. Tasbih master (1000+ total taps)
  let totalDhikrTaps = 0;
  Object.values(dhikrLog).forEach((dayDhikrs) => {
    Object.values(dayDhikrs).forEach((val) => {
      totalDhikrTaps += val;
    });
  });
  if (totalDhikrTaps >= 1000) earnedIds.push('badge-tasbih-master');

  // 5. Sadaqa caretaker (5+ kindness or charity actions)
  if (sadaqaLogs.length >= 5) earnedIds.push('badge-generosity-champion');

  // 6. Dua Master (15+ read count)
  let totalDuaReads = 0;
  duaList.forEach((dua) => {
    Object.values(dua.timesRead).forEach((count) => {
      totalDuaReads += count;
    });
  });
  if (totalDuaReads >= 15) earnedIds.push('badge-dua-supplicant');

  // 7. Spiritual Peak (90%+ composite score on any day)
  const today = new Date();
  let hasMetPeak = false;
  for (let i = 45; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = formatDateStr(d);
    if (getSpiritualScoreForDate(dateStr, prayerLog, quranLogs, dhikrLog, sadaqaLogs) >= 90) {
      hasMetPeak = true;
      break;
    }
  }
  if (hasMetPeak) earnedIds.push('badge-spiritual-peak');

  return earnedIds;
}
