/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Sparkles, Calendar, TrendingUp, Compass, Trophy, Star } from 'lucide-react';
import { PrayerLog, DhikrLog, QuranLog, SadaqaLog, DuaItem } from '../types';
import { calculatePointsForDate, getSalatStreak, evaluateEarnedBadges } from '../utils/gamification';

interface ProgressChartsProps {
  prayerLog: PrayerLog;
  dhikrLog: DhikrLog;
  quranLogs: QuranLog[];
  sadaqaLogs: SadaqaLog[];
  duaList: DuaItem[];
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({
  prayerLog,
  dhikrLog,
  quranLogs,
  sadaqaLogs,
  duaList
}) => {

  // Helper to generate dates for last 7 days (including today)
  const getLast7Days = () => {
    const dates = [];
    const dateObj = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(dateObj.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${dateVal}`);
    }
    return dates;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to construct metrics for a single date
  const generateDailyStatsForDate = (date: string) => {
    // 1. Salat progress %
    const dayPrayers = prayerLog[date] || {};
    const salatCompletedCount = Object.keys(dayPrayers).filter(key => {
      const p = dayPrayers[key];
      return p && !p.isSunnah && p.completed;
    }).length;
    const salatPercent = Math.round((salatCompletedCount / 5) * 100);

    // 2. Quran pages logged for this date
    const quranPages = quranLogs
      .filter(l => l.date === date)
      .reduce((sum, l) => sum + (l.endPage - l.startPage + 1), 0);

    // 3. Dhikr counts on this date
    const dayDhikr = dhikrLog[date] || {};
    const dhikrPhrasesCompleted = (Object.values(dayDhikr) as number[]).reduce((sum, c) => sum + c, 0);

    // 4. Sadaqa count on this date
    const sadaqaCount = sadaqaLogs.filter(l => l.date === date).length;

    // 5. Duas count read on this date
    let duaCount = 0;
    duaList.forEach(dua => {
      if (dua.timesRead && dua.timesRead[date]) {
        duaCount += dua.timesRead[date];
      }
    });

    // 6. Overall score (out of 100)
    const salatScore = salatCompletedCount * 8;
    const quranScore = Math.min(25, quranPages * 5);
    const dhikrScore = Math.min(15, dhikrPhrasesCompleted * 0.15);
    const sadaqaScore = sadaqaCount > 0 ? 10 : 0;
    const duaScore = Math.min(10, duaCount * 5);

    const score = Math.round(salatScore + quranScore + dhikrScore + sadaqaScore + duaScore);
    const points = calculatePointsForDate(date, prayerLog, quranLogs, dhikrLog, sadaqaLogs, duaList);

    const dObj = new Date(date);
    const label = `${dayNames[dObj.getDay()]} ${dObj.getDate()}`;

    return {
      date,
      day: label,
      score,
      points,
      prayerPercent: salatPercent,
      quranPages,
      dhikrTaps: dhikrPhrasesCompleted,
      sadaqaCount,
      duaCount
    };
  };

  const chartData = getLast7Days().map(date => generateDailyStatsForDate(date));

  // Compute stats averages
  const avgScore = Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / 7);
  const totalPagesLastWeek = chartData.reduce((sum, d) => sum + d.quranPages, 0);
  const totalDhikrLastWeek = chartData.reduce((sum, d) => sum + d.dhikrTaps, 0);
  const totalKindActsLastWeek = chartData.reduce((sum, d) => sum + d.sadaqaCount, 0);

  // Custom tooltips styling
  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B1E19]/95 border border-[#E8C98B]/30 p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[150px] text-left">
          <p className="font-bold text-white border-b border-[#E8C98B]/10 pb-1 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E8C98B]" /> {label}
          </p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-mono font-bold">
              <span className="font-sans font-semibold text-slate-300">{p.name}:</span> {p.value}
              {p.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="progress-analytics-panel">
      {/* Aggregated KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="analytics-kpi-cards">
        <div className="bg-[#143028] border border-[#E8C98B]/10 rounded-3xl p-5 flex flex-col justify-between text-left">
          <span className="text-[10px] uppercase font-mono text-[#A98E64] font-bold tracking-wider">Weekly Devotion index</span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-3.5xl font-bold font-mono text-[#E8C98B]">{avgScore}</span>
            <span className="text-[10px] text-[#A98E64] font-semibold">/100 avg</span>
          </div>
          <p className="text-[9px] text-[#A98E64] mt-2.5 flex items-center gap-1 font-semibold leading-none">
            <TrendingUp className="w-3.5 h-3.5 text-[#E8C98B]" /> Computed daily consistency
          </p>
        </div>

        <div className="bg-[#143028] border border-[#E8C98B]/10 rounded-3xl p-5 flex flex-col justify-between text-left">
          <span className="text-[10px] uppercase font-mono text-[#A98E64] font-bold tracking-wider">Quran Pages Read</span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-3.5xl font-bold font-mono text-[#E8C98B]">{totalPagesLastWeek}</span>
            <span className="text-[10px] text-[#A98E64] font-semibold">pages</span>
          </div>
          <p className="text-[9px] text-[#A98E64] mt-2.5 font-semibold leading-none">Khatm progress this week</p>
        </div>

        <div className="bg-[#143028] border border-[#E8C98B]/10 rounded-3xl p-5 flex flex-col justify-between text-left">
          <span className="text-[10px] uppercase font-mono text-[#A98E64] font-bold tracking-wider">Dhikr Recited</span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-3.5xl font-bold font-mono text-[#E8C98B]">{totalDhikrLastWeek}</span>
            <span className="text-[10px] text-[#A98E64] font-semibold">tasbihs</span>
          </div>
          <p className="text-[9px] text-[#A98E64] mt-2.5 font-semibold leading-none">Continuous remembrance</p>
        </div>

        <div className="bg-[#143028] border border-[#E8C98B]/10 rounded-3xl p-5 flex flex-col justify-between text-left">
          <span className="text-[10px] uppercase font-mono text-[#A98E64] font-bold tracking-wider">Merciful Actions</span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-3.5xl font-bold font-mono text-[#E8C98B]">{totalKindActsLastWeek}</span>
            <span className="text-[10px] text-[#A98E64] font-semibold">good deeds</span>
          </div>
          <p className="text-[9px] text-[#A98E64] mt-2.5 font-semibold leading-none">Acts of charity logged</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-wrapper-grid">
        {/* Chart 1: Daily Spiritual Index */}
        <div className="bg-[#143028] border border-[#E8C98B]/10 p-5 rounded-3xl flex flex-col text-left">
          <div className="mb-4">
            <h3 className="font-serif font-semibold text-base text-[#E8C98B] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E8C98B] animate-pulse" /> Comprehensive Spiritual Quotient (CSQ)
            </h3>
            <p className="text-xs text-[#A98E64] mt-1 font-semibold leading-relaxed">
              Composite score calculated based on prayers, Quran volume, Dhikr, charity, and daily Duas.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8C98B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E8C98B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8C98B" strokeOpacity={0.07} />
                <XAxis dataKey="day" stroke="#A98E64" fontSize={10} tickLine={false} />
                <YAxis stroke="#A98E64" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip content={renderTooltip} />
                <Area type="monotone" dataKey="score" name="Spiritual Score" unit="%" stroke="#E8C98B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Stacked comparisons of reading & tasbih */}
        <div className="bg-[#143028] border border-[#E8C98B]/10 p-5 rounded-3xl flex flex-col text-left">
          <div className="mb-4">
            <h3 className="font-serif font-semibold text-base text-[#E8C98B] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#E8C98B]" /> Active Supplications & Quran Volume
            </h3>
            <p className="text-xs text-[#A98E64] mt-1 font-semibold leading-relaxed">
              Detailed tracking of daily Quran pages read vs total Duas repeated across the week.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8C98B" strokeOpacity={0.07} />
                <XAxis dataKey="day" stroke="#A98E64" fontSize={10} tickLine={false} />
                <YAxis stroke="#A98E64" fontSize={10} tickLine={false} />
                <Tooltip content={renderTooltip} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#E8C98B', marginTop: 10, fontWeight: '700' }} />
                <Bar dataKey="quranPages" name="Quran Pages" fill="#1B3B32" stroke="#E8C98B" strokeOpacity={0.2} radius={[4, 4, 0, 0]} />
                <Bar dataKey="duaCount" name="Duas Recited" fill="#E8C98B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Prayer Consistency (Line chart) */}
        <div className="bg-[#143028] border border-[#E8C98B]/10 p-5 rounded-3xl flex flex-col lg:col-span-2 text-left">
          <div className="mb-4">
            <h3 className="font-serif font-semibold text-base text-[#E8C98B] flex items-center gap-1.5">
              🕌 Obligatory Salat Attendance Score
            </h3>
            <p className="text-xs text-[#A98E64] mt-1 font-semibold leading-relaxed">
              The percentage of completed mandatory Fard prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) over the last seven days.
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8C98B" strokeOpacity={0.07} />
                <XAxis dataKey="day" stroke="#A98E64" fontSize={10} tickLine={false} />
                <YAxis stroke="#A98E64" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip content={renderTooltip} />
                <Line type="monotone" dataKey="prayerPercent" name="Fard Salat" unit="%" stroke="#E8C98B" strokeWidth={3} dot={{ stroke: '#E8C98B', strokeWidth: 2, r: 4, fill: '#0B1E19' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Points Accumulation & Gamification */}
        <div className="bg-[#143028] border border-[#E8C98B]/10 p-5 rounded-3xl flex flex-col lg:col-span-2 text-left" id="points-milestones-bento">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-serif font-semibold text-base text-[#E8C98B] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#E8C98B]" /> Spiritual Points & Milestones Journey
              </h3>
              <p className="text-xs text-[#A98E64] mt-1 font-semibold leading-relaxed">
                Track and audit points earned daily from prayers, reading Quran, Tasbih ticks, Dua recitals, and charities.
              </p>
            </div>
            <div className="bg-[#0B1E19] px-3 py-1 border border-[#E8C98B]/25 rounded-xl flex items-center gap-1.5" id="weekly-points-badge">
              <Star className="w-3.5 h-3.5 text-[#E8C98B] fill-[#E8C98B]" />
              <span className="text-[10px] font-mono font-bold text-[#E8C98B]">{chartData.reduce((sum, d) => sum + d.points, 0)} PTS Gained Weekly</span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8C98B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#E8C98B" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8C98B" strokeOpacity={0.07} />
                <XAxis dataKey="day" stroke="#A98E64" fontSize={10} tickLine={false} />
                <YAxis stroke="#A98E64" fontSize={10} tickLine={false} />
                <Tooltip content={renderTooltip} />
                <Area type="monotone" dataKey="points" name="Rewards Accumulated" unit=" pts" stroke="#E8C98B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
