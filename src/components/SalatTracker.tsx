/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, CheckCircle, Crosshair, Star, Clock, Trophy } from 'lucide-react';
import { PrayerLog } from '../types';

interface SalatTrackerProps {
  currentDate: string;
  prayerLog: PrayerLog;
  onTogglePrayer: (date: string, prayerId: string, isSunnah?: boolean) => void;
}

const FARD_PRAYERS = [
  { id: 'fajr', name: 'Fajr', time: '04:45 AM', color: 'from-amber-700/20 to-amber-900/10 border-amber-500/20 text-amber-300' },
  { id: 'dhuhr', name: 'Dhuhr', time: '12:30 PM', color: 'from-sky-700/20 to-sky-900/10 border-sky-500/20 text-sky-300' },
  { id: 'asr', name: 'Asr', time: '03:45 PM', color: 'from-orange-700/20 to-orange-900/10 border-orange-500/20 text-orange-300' },
  { id: 'maghrib', name: 'Maghrib', time: '06:30 PM', color: 'from-rose-700/20 to-rose-900/10 border-rose-500/20 text-rose-300' },
  { id: 'isha', name: 'Isha', time: '08:00 PM', color: 'from-indigo-700/20 to-indigo-900/10 border-indigo-500/20 text-indigo-300' }
];

const SUNNAH_PRAYERS = [
  { id: 'taraweeh', name: 'Taraweeh', reward: 'Forgiveness of past sins', icon: Star, color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' },
  { id: 'tahajjud', name: 'Tahajjud (Night)', reward: 'Spiritual proximity', icon: Trophy, color: 'border-purple-500/30 text-purple-400 bg-purple-950/20' },
  { id: 'duha', name: 'Duha (Morning)', reward: 'Charity for every joint', icon: Clock, color: 'border-teal-500/30 text-teal-400 bg-teal-950/20' },
  { id: 'witr', name: 'Witr', reward: 'Highly recommended', icon: Crosshair, color: 'border-yellow-500/30 text-yellow-400 bg-yellow-950/20' }
];

export const SalatTracker: React.FC<SalatTrackerProps> = ({
  currentDate,
  prayerLog,
  onTogglePrayer
}) => {
  const [showOptional, setShowOptional] = useState<boolean>(true);

  const getPrayerState = (prayerId: string) => {
    return prayerLog[currentDate]?.[prayerId]?.completed || false;
  };

  const getPrayerTimeLog = (prayerId: string) => {
    return prayerLog[currentDate]?.[prayerId]?.time || '';
  };

  // Counting completed Fard prayers for today
  const completedFardCount = FARD_PRAYERS.filter(p => getPrayerState(p.id)).length;
  const completedSunnahCount = SUNNAH_PRAYERS.filter(p => getPrayerState(p.id)).length;

  return (
    <div className="bg-[#143028] backdrop-blur-md rounded-3xl border border-[#E8C98B]/10 p-6 md:p-8 shadow-xl text-left" id="salat-tracker-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#E8C98B]/10 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#E8C98B] flex items-center gap-2">
            <span className="text-2xl">🕌</span> Daily Salat Tracking
          </h2>
          <p className="text-xs text-[#A98E64] mt-1 leading-relaxed font-semibold">
            Track your daily Obligatory (Fard) and Voluntary (Sunnah/Nafilah) prayers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="toggle-optional-btn"
            onClick={() => setShowOptional(!showOptional)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E8C98B]/20 text-[#E8C98B] hover:bg-[#1B3B32] transition cursor-pointer"
          >
            {showOptional ? 'Hide Voluntary' : 'View Voluntary'}
          </button>
          
          <div className="bg-[#E8C98B]/10 border border-[#E8C98B]/20 rounded-xl px-4 py-1.5 text-center">
            <div className="text-2xl font-bold font-mono text-[#E8C98B]">
              {completedFardCount}/5
            </div>
            <div className="text-[10px] text-[#A98E64] uppercase font-bold tracking-widest">Fard</div>
          </div>
        </div>
      </div>

      {/* Progress overview banner */}
      {completedFardCount === 5 && (
        <div className="bg-[#E8C98B]/10 border border-[#E8C98B]/30 text-[#E8C98B] rounded-2xl p-4 flex items-center gap-3 mb-6 text-xs font-semibold leading-relaxed" id="salat-congrats-banner">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-[#E8C98B]" />
          <span>Mashallah! You have completed all five obligatory prayers for today! May your prayers be accepted in your scales.</span>
        </div>
      )}

      {/* Fard Prayers */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8C98B] mb-5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#E8C98B]"></span> Obligatory Prayers (Fard)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8" id="fard-prayers-grid">
        {FARD_PRAYERS.map((prayer) => {
          const isDone = getPrayerState(prayer.id);
          const loggedTime = getPrayerTimeLog(prayer.id);

          return (
            <button
              key={prayer.id}
              id={`prayer-card-${prayer.id}`}
              onClick={() => onTogglePrayer(currentDate, prayer.id, false)}
              className={`relative overflow-hidden p-5 rounded-2xl border text-left transition duration-300 flex flex-col justify-between h-36 group cursor-pointer ${
                isDone
                  ? 'bg-[#E8C98B] border-[#E8C98B] text-[#0B1E19] shadow-md'
                  : 'bg-[#0B1E19] border-[#E8C98B]/15 text-[#E8C98B]/85 hover:border-[#E8C98B]/40 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-xs font-bold opacity-75 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {prayer.time}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-[#0B1E19] text-[#E8C98B]'
                      : 'border border-[#E8C98B]/20 bg-[#1B3B32]/30'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-serif font-semibold tracking-wide capitalize">{prayer.name}</h4>
                {isDone ? (
                  <span className="text-[9px] text-[#E8C98B] bg-[#0B1E19]/80 px-2.5 py-0.5 rounded-md inline-block mt-1 font-mono font-bold uppercase tracking-wider">
                    {loggedTime ? `@ ${loggedTime}` : 'Praised'}
                  </span>
                ) : (
                  <span className="text-[9px] text-[#A98E64] inline-block mt-1 uppercase tracking-wider font-bold">
                    Mark Prayed
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sunnah Prayers */}
      {showOptional && (
        <div className="border-t border-[#E8C98B]/10 pt-6 animate-fade-in" id="sunnah-prayers-panel text-left">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8C98B] mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8C98B]"></span> Voluntary & Ramadan Night Prayers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" id="sunnah-prayers-grid">
            {SUNNAH_PRAYERS.map((prayer) => {
              const isDone = getPrayerState(prayer.id);
              const Icon = prayer.icon;

              return (
                <div
                  key={prayer.id}
                  id={`sunnah-card-${prayer.id}`}
                  onClick={() => onTogglePrayer(currentDate, prayer.id, true)}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition duration-300 select-none hover:scale-[1.01] active:scale-95 text-left ${
                    isDone
                      ? 'bg-[#1B3B32]/85 border-[#E8C98B]/40 text-[#E8C98B]'
                      : 'bg-[#0B1E19] border-[#E8C98B]/10 text-[#E8C98B]/80 hover:border-[#E8C98B]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${isDone ? 'bg-[#E8C98B]/10' : 'bg-[#143028]'}`}>
                      <Icon className="w-5 h-5 text-[#E8C98B]" />
                    </div>
                    <div>
                      <h4 className="font-serif font-semibold text-sm leading-none text-[#E8C98B]">{prayer.name}</h4>
                      <p className="text-[10px] text-[#A98E64] font-medium mt-1 leading-tight">
                        ✨ {prayer.reward}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-shrink-0 items-center justify-center transition-all ${
                      isDone
                        ? 'bg-[#E8C98B] border-[#E8C98B] text-[#0B1E19]'
                        : 'border-[#E8C98B]/20 bg-[#143028]'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
