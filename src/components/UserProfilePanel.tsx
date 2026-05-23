/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Award, 
  Flame, 
  CheckCircle, 
  Sparkles, 
  Settings, 
  BookOpen, 
  Sun, 
  Moon, 
  Heart, 
  Gift, 
  Edit3, 
  Check, 
  Trophy, 
  HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PrayerLog, 
  DhikrLog, 
  QuranLog, 
  SadaqaLog, 
  DuaItem 
} from '../types';
import { 
  ALL_BADGES, 
  getSalatStreak, 
  getQuranStreak, 
  getDhikrStreak, 
  evaluateEarnedBadges, 
  calculatePointsForDate 
} from '../utils/gamification';

interface UserProfilePanelProps {
  currentDate: string;
  prayerLog: PrayerLog;
  quranLogs: QuranLog[];
  dhikrLog: DhikrLog;
  sadaqaLogs: SadaqaLog[];
  duaList: DuaItem[];
  // Profile settings
  profileName: string;
  setProfileName: (name: string) => void;
  profileAvatar: string;
  setProfileAvatar: (avatar: string) => void;
  // Goals
  goals: {
    salat: { daily: number; weekly: number; overall: number };
    quran: { daily: number; weekly: number; overall: number };
    dhikr: { daily: number; weekly: number; overall: number };
    dua: { daily: number; weekly: number; overall: number };
    sadaqa: { daily: number; weekly: number; overall: number };
  };
  onUpdateGoals: (category: 'salat' | 'quran' | 'dhikr' | 'dua' | 'sadaqa', period: 'daily' | 'weekly' | 'overall', value: number) => void;
}

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({
  currentDate,
  prayerLog,
  quranLogs,
  dhikrLog,
  sadaqaLogs,
  duaList,
  profileName,
  setProfileName,
  profileAvatar,
  setProfileAvatar,
  goals,
  onUpdateGoals
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(profileName);
  const [activeGoalPeriod, setActiveGoalPeriod] = useState<'daily' | 'weekly' | 'overall'>('daily');
  const [selectedBadgeDetails, setSelectedBadgeDetails] = useState<typeof ALL_BADGES[0] | null>(null);

  const avatars = ['🌙', '🕌', ' Lantern 🏮', '💖', '⭐', '💫', '🦅', '🦁', '🌿'];

  // Helper date lists
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${dateVal}`);
    }
    return dates;
  };

  const last7Days = getLast7Days();

  // Streaks
  const salatStreak = getSalatStreak(prayerLog);
  const quranStreak = getQuranStreak(quranLogs);
  const dhikrStreak = getDhikrStreak(dhikrLog);

  // Points calculations
  const totalPoints = last7Days.reduce((acc, date) => {
    return acc + calculatePointsForDate(date, prayerLog, quranLogs, dhikrLog, sadaqaLogs, duaList);
  }, 0) + (quranLogs.length * 10) + (sadaqaLogs.length * 20); // add historical bonuses

  const todayPoints = calculatePointsForDate(currentDate, prayerLog, quranLogs, dhikrLog, sadaqaLogs, duaList);

  const earnedBadges = evaluateEarnedBadges(prayerLog, quranLogs, dhikrLog, sadaqaLogs, duaList);

  // Category values calculation
  // 1. Salat (obligatory)
  const getSalatCount = (period: 'daily' | 'weekly' | 'overall') => {
    if (period === 'daily') {
      const dayData = prayerLog[currentDate] || {};
      return Object.keys(dayData).filter(p => ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(p) && dayData[p]?.completed).length;
    } else if (period === 'weekly') {
      let sum = 0;
      last7Days.forEach(date => {
        const dayData = prayerLog[date] || {};
        sum += Object.keys(dayData).filter(p => ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(p) && dayData[p]?.completed).length;
      });
      return sum;
    } else {
      let sum = 0;
      Object.values(prayerLog).forEach(dayData => {
        sum += Object.keys(dayData).filter(p => ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(p) && dayData[p]?.completed).length;
      });
      return sum;
    }
  };

  // 2. Quran
  const getQuranCount = (period: 'daily' | 'weekly' | 'overall') => {
    if (period === 'daily') {
      return quranLogs.filter(l => l.date === currentDate).reduce((sum, l) => sum + (l.endPage - l.startPage + 1), 0);
    } else if (period === 'weekly') {
      return quranLogs.filter(l => last7Days.includes(l.date)).reduce((sum, l) => sum + (l.endPage - l.startPage + 1), 0);
    } else {
      return quranLogs.reduce((sum, l) => sum + (l.endPage - l.startPage + 1), 0);
    }
  };

  // 3. Dhikr
  const getDhikrCount = (period: 'daily' | 'weekly' | 'overall') => {
    if (period === 'daily') {
      const dayData = dhikrLog[currentDate] || {};
      const vals = Object.values(dayData) as number[];
      return vals.reduce((sum, val) => sum + val, 0);
    } else if (period === 'weekly') {
      let sum = 0;
      last7Days.forEach(date => {
        const dayData = dhikrLog[date] || {};
        const vals = Object.values(dayData) as number[];
        sum += vals.reduce((s, val) => s + val, 0);
      });
      return sum;
    } else {
      let sum = 0;
      Object.values(dhikrLog).forEach(dayData => {
        const vals = Object.values(dayData || {}) as number[];
        sum += vals.reduce((s, val) => s + val, 0);
      });
      return sum;
    }
  };

  // 4. Dua
  const getDuaCount = (period: 'daily' | 'weekly' | 'overall') => {
    let result = 0;
    duaList.forEach(dua => {
      if (period === 'daily') {
        const reads = (dua.timesRead && (dua.timesRead[currentDate] as number)) || 0;
        result += reads;
      } else if (period === 'weekly') {
        last7Days.forEach(date => {
          const reads = (dua.timesRead && (dua.timesRead[date] as number)) || 0;
          result += reads;
        });
      } else {
        const vals = Object.values(dua.timesRead || {}) as number[];
        vals.forEach(count => {
          result += count;
        });
      }
    });
    return result;
  };

  // 5. Sadaqa
  const getSadaqaCount = (period: 'daily' | 'weekly' | 'overall') => {
    if (period === 'daily') {
      return sadaqaLogs.filter(l => l.date === currentDate).length;
    } else if (period === 'weekly') {
      return sadaqaLogs.filter(l => last7Days.includes(l.date)).length;
    } else {
      return sadaqaLogs.length;
    }
  };

  const categories = [
    { id: 'salat', label: 'Salat (Fard)', icon: Sun, unit: 'prayers', calc: getSalatCount, color: 'from-[#E8C98B] to-[#F3DFA2]' },
    { id: 'quran', label: 'Quran Recitation', icon: BookOpen, unit: 'pages', calc: getQuranCount, color: 'from-[#1B3B32] to-[#2E6B5A]' },
    { id: 'dhikr', label: 'Adhkar / Dhikr', icon: Moon, unit: 'reps', calc: getDhikrCount, color: 'from-amber-500 to-amber-300' },
    { id: 'dua', label: 'Duas Recited', icon: Heart, unit: 'reads', calc: getDuaCount, color: 'from-[#E8C98B]/80 to-[#E8C98B]' },
    { id: 'sadaqa', label: 'Sadaqa & Kindness', icon: Gift, unit: 'actions', calc: getSadaqaCount, color: 'from-emerald-400 to-emerald-200' },
  ] as const;

  const handleProfileSave = () => {
    if (tempName.trim()) {
      setProfileName(tempName.trim());
      setIsEditingProfile(false);
    }
  };

  return (
    <div className="space-y-6" id="user-profile-panel">
      
      {/* Header Profile Summary Block */}
      <div className="bg-[#143028] border border-[#E8C98B]/10 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left relative overflow-hidden" id="profile-summary-header">
        {/* Glowing background halo */}
        <div className="absolute -left-20 -top-20 w-44 h-44 rounded-full bg-[#E8C98B]/5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          {/* Avatar sphere */}
          <div className="w-20 h-20 rounded-2xl bg-[#E8C98B]/10 border border-[#E8C98B]/30 flex items-center justify-center text-4xl shadow-inner relative group select-none">
            {profileAvatar}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isEditingProfile ? (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      id="edit-profile-name-input"
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value.slice(0, 20))}
                      className="bg-[#0B1E19] border border-[#E8C98B]/30 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:border-[#E8C98B] outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleProfileSave()}
                    />
                    <button
                      id="save-profile-name-btn"
                      onClick={handleProfileSave}
                      className="p-1.5 rounded-lg bg-[#E8C98B] text-[#0B1E19] transition hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#E8C98B]">{profileName}</h2>
                    <button
                      id="trigger-profile-edit-btn"
                      onClick={() => {
                        setTempName(profileName);
                        setIsEditingProfile(true);
                      }}
                      className="p-1 text-[#A98E64] hover:text-white transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-[#A98E64] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E8C98B]" /> Dedicated Noor Pilgrim
            </p>
          </div>
        </div>

        {/* Gamification scoring summary tags */}
        <div className="flex flex-wrap items-center gap-4 z-10 w-full md:w-auto">
          {/* Points sphere */}
          <div className="bg-[#0B1E19]/80 border border-[#E8C98B]/15 rounded-2xl p-4 flex-1 md:flex-initial min-w-[120px] text-center shadow-lg">
            <span className="text-[10px] uppercase font-mono text-[#A98E64] font-bold tracking-widest block">Accumulated Points</span>
            <div className="flex justify-center items-baseline gap-1 mt-1">
              <span className="text-2.5xl font-mono font-bold text-[#E8C98B]">{totalPoints}</span>
              <span className="text-[9px] text-[#A98E64] font-bold">PTS</span>
            </div>
            <span className="text-[9px] text-[#E8C98B]/95 font-semibold font-mono block mt-0.5">+{todayPoints} gained today</span>
          </div>

          {/* Badges accumulated */}
          <div className="bg-[#0B1E19]/80 border border-[#E8C98B]/15 rounded-2xl p-4 flex-1 md:flex-initial min-w-[120px] text-center shadow-lg">
            <span className="text-[10px] uppercase font-mono text-[#A98E64] font-bold tracking-widest block">Unlocked Badges</span>
            <div className="flex justify-center items-baseline gap-1 mt-1">
              <span className="text-2.5xl font-mono font-bold text-[#E8C98B]">{earnedBadges.length}</span>
              <span className="text-[9px] text-[#A98E64] font-bold">/ {ALL_BADGES.length}</span>
            </div>
            <span className="text-[9px] text-[#E8C98B]/95 font-semibold block mt-0.5">Keep logging to unlock</span>
          </div>
        </div>
      </div>

      {/* Avatar Changer Selection (if editing) */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0B1E19]/90 border border-[#E8C98B]/20 p-5 rounded-3xl text-left overflow-hidden shadow-2xl"
            id="avatar-picker-panel"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8C98B] mb-2.5">Choose Your Pilgrim Symbol</h4>
            <div className="flex flex-wrap gap-2.5">
              {avatars.map(avatar => (
                <button
                  key={avatar}
                  id={`avatar-option-${avatar}`}
                  onClick={() => setProfileAvatar(avatar)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95 ${
                    profileAvatar === avatar 
                      ? 'bg-[#E8C98B] border border-[#E8C98B]' 
                      : 'bg-[#143028] border border-[#E8C98B]/10 hover:border-[#E8C98B]/35'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="profile-detailed-grid">
        
        {/* Left Column: Streaks and Badges list */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Consecutive Streaks */}
          <div className="bg-[#143028] border border-[#E8C98B]/10 p-5 rounded-3xl text-left" id="streaks-bento-box">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8C98B] mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#E8C98B] animate-pulse" /> My Devote Streaks
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {/* Salat streak */}
              <div className="p-3 bg-[#0B1E19]/80 rounded-2xl border border-[#E8C98B]/10 text-center relative overflow-hidden">
                <span className="text-lg leading-none block">🕌</span>
                <span className="text-[9px] text-[#A98E64] font-bold block mt-1.5 uppercase">Salat Day</span>
                <span className="text-2xl font-mono font-bold text-[#E8C98B] block">{salatStreak.current}</span>
                <span className="text-[8px] text-[#A98E64] font-bold block mt-1">Max: {salatStreak.max}d</span>
              </div>

              {/* Quran streak */}
              <div className="p-3 bg-[#0B1E19]/80 rounded-2xl border border-[#E8C98B]/10 text-center relative overflow-hidden">
                <span className="text-lg leading-none block">📖</span>
                <span className="text-[9px] text-[#A98E64] font-bold block mt-1.5 uppercase">Quran Day</span>
                <span className="text-2xl font-mono font-bold text-[#E8C98B] block">{quranStreak.current}</span>
                <span className="text-[8px] text-[#A98E64] font-bold block mt-1">Max: {quranStreak.max}d</span>
              </div>

              {/* Dhikr streak */}
              <div className="p-3 bg-[#0B1E19]/80 rounded-2xl border border-[#E8C98B]/10 text-center relative overflow-hidden">
                <span className="text-lg leading-none block">📿</span>
                <span className="text-[9px] text-[#A98E64] font-bold block mt-1.5 uppercase">Tasbih Day</span>
                <span className="text-2xl font-mono font-bold text-[#E8C98B] block">{dhikrStreak.current}</span>
                <span className="text-[8px] text-[#A98E64] font-bold block mt-1">Max: {dhikrStreak.max}d</span>
              </div>
            </div>
          </div>

          {/* Badges Display Shelf */}
          <div className="bg-[#143028] border border-[#E8C98B]/10 p-5 rounded-3xl text-left" id="badges-shelf-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8C98B] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#E8C98B]" /> Achievements Desk
              </h3>
              <span className="text-[9px] bg-[#E8C98B]/10 text-[#E8C98B] px-2 py-0.5 rounded-md font-mono font-bold">
                {earnedBadges.length} UNLOCKED
              </span>
            </div>

            <p className="text-[11px] text-[#A98E64] mb-4 leading-relaxed font-semibold">
              Complete deeds streaks and volume targets to unlock prestigious badges. Click badge for details.
            </p>

            <div className="grid grid-cols-4 gap-3" id="badges-grid-list">
              {ALL_BADGES.map((badge) => {
                const isEarned = earnedBadges.includes(badge.id);
                return (
                  <button
                    key={badge.id}
                    id={`badge-shelf-item-${badge.id}`}
                    onClick={() => setSelectedBadgeDetails(badge)}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer group hover:scale-102 hover:border-[#E8C98B]/35 ${
                      isEarned 
                        ? 'bg-[#0B1E19] border-[#E8C98B]/30' 
                        : 'bg-[#0B1E19]/35 border-[#E8C98B]/5 opacity-40 hover:opacity-60'
                    }`}
                    title={badge.title}
                  >
                    <span className="text-2xl md:text-3xl filter drop-shadow-md select-none">{badge.icon}</span>
                    {isEarned && (
                      <span className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center text-[9px] text-[#0B1E19] font-bold shadow border border-[#143028]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Badge Dialog block */}
            <AnimatePresence>
              {selectedBadgeDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-[#0B1E19]/80 border border-[#E8C98B]/20 rounded-2xl p-4 mt-5 relative text-left"
                  id="selected-badge-info-popup"
                >
                  <button
                    onClick={() => setSelectedBadgeDetails(null)}
                    className="absolute right-3 top-3 text-xs text-[#A98E64] hover:text-[#E8C98B] font-bold cursor-pointer"
                  >
                    x
                  </button>
                  <div className="flex items-start gap-3.5 pr-4">
                    <span className="text-4xl filter drop-shadow select-none">{selectedBadgeDetails.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#E8C98B] uppercase tracking-wider">{selectedBadgeDetails.title}</h4>
                      <p className="text-[11px] text-slate-100 italic leading-snug mt-1 font-medium">{selectedBadgeDetails.description}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#A98E64]">Requirement:</span>
                        <span className="text-[9px] font-bold bg-[#E8C98B]/10 text-[#E8C98B] px-1.5 py-0.5 rounded">
                          {selectedBadgeDetails.requirement}
                        </span>
                        {earnedBadges.includes(selectedBadgeDetails.id) ? (
                          <span className="text-[8px] bg-emerald-950 text-emerald-400 font-bold px-1 py-0.2 rounded font-mono ml-auto">UNLOCKED</span>
                        ) : (
                          <span className="text-[8px] bg-neutral-900 text-neutral-400 font-bold px-1 py-0.2 rounded font-mono ml-auto">LOCKED</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Goal configuring and progress sheets */}
        <div className="lg:col-span-7 space-y-6" id="goals-controller-box">
          <div className="bg-[#143028] border border-[#E8C98B]/10 p-5 md:p-6 rounded-3xl text-left">
            
            {/* Header + tab picker */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8C98B]/10 pb-4 mb-5">
              <div>
                <h3 className="text-base font-serif font-bold text-[#E8C98B] flex items-center gap-2">
                  🎯 Ramadan Goals Configuration
                </h3>
                <p className="text-xs text-[#A98E64] mt-0.5 font-semibold">
                  Personalize and track your daily, weekly, or overall Ramadan parameters
                </p>
              </div>

              {/* Days scale tabs selector */}
              <div className="flex bg-[#0B1E19] border border-[#E8C98B]/15 rounded-xl overflow-hidden h-9">
                {(['daily', 'weekly', 'overall'] as const).map((period) => (
                  <button
                    key={period}
                    id={`btn-period-${period}`}
                    onClick={() => setActiveGoalPeriod(period)}
                    className={`px-3.5 text-[10px] font-bold uppercase tracking-wider select-none outline-none transition-all cursor-pointer ${
                      activeGoalPeriod === period
                        ? 'bg-[#E8C98B] text-[#0B1E19]'
                        : 'text-[#A98E64] hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Goals Category Form Sliders Sheet */}
            <div className="space-y-5" id="goals-sliders-container">
              {categories.map((cat) => {
                const target = goals[cat.id][activeGoalPeriod];
                const achieved = cat.calc(activeGoalPeriod);
                const percent = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;

                return (
                  <div 
                    key={cat.id} 
                    className="p-4 rounded-2xl bg-[#0B1E19]/80 border border-[#E8C98B]/10 shadow-inner flex flex-col justify-between gap-3.5"
                    id={`goal-item-${cat.id}`}
                  >
                    {/* Visual details header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#143028] rounded-xl text-[#E8C98B] border border-[#E8C98B]/10">
                          <cat.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{cat.label}</h4>
                          <span className="text-[10px] text-[#A98E64] font-semibold leading-none">
                            Completed: <span className="text-white font-bold">{achieved}</span> / {target} {cat.unit}
                          </span>
                        </div>
                      </div>

                      {/* Manual target config input field */}
                      <div className="flex items-center gap-1.5 bg-[#143028] border border-[#E8C98B]/15 rounded-xl px-2.5 py-1 text-xs">
                        <span className="text-[9px] text-[#A98E64] font-bold uppercase font-mono">Target:</span>
                        <input
                          id={`goal-input-${cat.id}-${activeGoalPeriod}`}
                          type="number"
                          min="1"
                          max="99999"
                          value={target}
                          onChange={(e) => onUpdateGoals(cat.id, activeGoalPeriod, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 bg-transparent text-[#E8C98B] border-none font-semibold font-mono text-center outline-none"
                        />
                      </div>
                    </div>

                    {/* Progress Slider scale line */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#A98E64]">
                        <span className="text-[9px] font-mono">COMPLETION: {percent}%</span>
                        {percent >= 100 ? (
                          <span className="text-[#E8C98B] bg-[#E8C98B]/15 px-2 py-0.5 rounded text-[8px] uppercase font-bold flex items-center gap-0.5">
                            ★ TARGET REACHED
                          </span>
                        ) : (
                          <span className="text-[#A98E64]/80 text-[8px] tracking-wide uppercase">In Progress</span>
                        )}
                      </div>
                      <div className="w-full bg-[#143028] h-2 rounded-full overflow-hidden border border-[#E8C98B]/10">
                        <div 
                          className="bg-gradient-to-r from-[#E8C98B] to-amber-400 h-full transition-all duration-300 relative rounded-full"
                          style={{ width: `${percent}%` }}
                        >
                          <div className="absolute right-0 top-0 w-1.5 h-1.5 bg-white rounded-full animate-ping whitespace-nowrap pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 bg-[#0B1E19]/45 border border-[#E8C98B]/10 rounded-2xl p-4 flex gap-2.5 items-start">
              <HelpCircle className="w-4 h-4 text-[#E8C98B] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#A98E64] font-medium leading-normal">
                <span className="font-bold text-[#E8C98B]">Goals Strategy:</span> Change target limits by typing coordinates directly. Your Daily and Weekly goals automatically calculate percentages based on historic log timelines, updating your composite point gains dynamically! Use these parameters with caution to raise your bar of spiritual self-improvement.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
