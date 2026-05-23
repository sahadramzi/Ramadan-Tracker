/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, Volume2, Award, ArrowUp, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRESET_DHIKR, DhikrItem, DhikrLog } from '../types';

interface DhikrTrackerProps {
  currentDate: string;
  dhikrLog: DhikrLog;
  onUpdateDhikrCount: (date: string, dhikrId: string, countToAdd: number) => void;
}

export const DhikrTracker: React.FC<DhikrTrackerProps> = ({
  currentDate,
  dhikrLog,
  onUpdateDhikrCount
}) => {
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrItem>(PRESET_DHIKR[0]);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [customTarget, setCustomTarget] = useState<number>(selectedDhikr.defaultTarget);
  const [enableSound, setEnableSound] = useState<boolean>(true);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Update target when selected dhikr changes
  useEffect(() => {
    setCustomTarget(selectedDhikr.defaultTarget);
    setSessionCount(0);
  }, [selectedDhikr]);

  const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Generate ripple coordinates relative to the button
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    // Play click audio oscillator (haptic audio sound)
    if (enableSound) {
      playClickSound();
    }

    const nextCount = sessionCount + 1;
    setSessionCount(nextCount);

    // Persist this single click immediately to global state logs
    onUpdateDhikrCount(currentDate, selectedDhikr.id, 1);

    // Celebration when target met
    if (nextCount === customTarget && enableSound) {
      playSuccessSound();
    }
  };

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      // High pitch short click
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // Ignored
    }
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Fun little arpeggio
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playNote(523.25, now, 0.15); // C5
      playNote(659.25, now + 0.12, 0.15); // E5
      playNote(783.99, now + 0.24, 0.15); // G5
      playNote(1046.50, now + 0.36, 0.3); // C6
    } catch (e) {
      // Ignored
    }
  };

  const handleResetSession = () => {
    setSessionCount(0);
  };

  // Safe checks for accumulated count
  const todayAccumCount = dhikrLog[currentDate]?.[selectedDhikr.id] || 0;
  const progressRatio = Math.min(100, (sessionCount / customTarget) * 100);

  return (
    <div className="bg-[#143028] backdrop-blur-md rounded-3xl border border-[#E8C98B]/10 p-6 md:p-8 shadow-xl text-left" id="dhikr-tracker-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#E8C98B]/10 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#E8C98B] flex items-center gap-2">
            <span className="text-2xl">📿</span> Interactive Tasbih (Dhikr)
          </h2>
          <p className="text-xs text-[#A98E64] mt-1 leading-relaxed font-semibold">
            Tap the clicker to count state of dhikr and increase your scales of devotion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-tasbih-sound"
            onClick={() => setEnableSound(!enableSound)}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              enableSound
                ? 'bg-[#E8C98B]/10 border-[#E8C98B]/30 text-[#E8C98B]'
                : 'bg-[#0B1E19] border-[#E8C98B]/10 text-[#A98E64]'
            }`}
            title={enableSound ? 'Mute click sound' : 'Unmute click sound'}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Preset Phrase Selector */}
        <div className="md:col-span-5 space-y-3" id="dhikr-selector-column">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8C98B]/90 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E8C98B]"></span> Select Remembrance (Dhikr)
          </h3>
          
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#0B1E19]">
            {PRESET_DHIKR.map((item) => {
              const isSelected = selectedDhikr.id === item.id;
              const completedCount = dhikrLog[currentDate]?.[item.id] || 0;

              return (
                <button
                  key={item.id}
                  id={`dhikr-option-${item.id}`}
                  onClick={() => setSelectedDhikr(item)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    isSelected
                      ? 'bg-[#E8C98B] border-[#E8C98B] text-[#0B1E19]'
                      : 'bg-[#0B1E19] border-[#E8C98B]/10 hover:border-[#E8C98B]/30 text-[#A98E64] hover:text-[#E8C98B]'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className={`font-serif text-xs md:text-sm font-bold tracking-wide truncate ${isSelected ? 'text-[#0B1E19]' : 'text-slate-100'}`}>
                        {item.phrase}
                      </span>
                      <span className={`font-serif text-xs text-right opacity-90 tracking-wide font-extrabold flex-shrink-0 ${isSelected ? 'text-[#0B1E19]/90' : 'text-[#E8C98B]'}`}>
                        {item.arabic}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-medium truncate max-w-[200px] ${isSelected ? 'text-[#0B1E19]/80' : 'text-[#A98E64]'}`}>{item.translation}</span>
                      {completedCount > 0 && (
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex-shrink-0 ml-1.5 ${isSelected ? 'bg-[#0B1E19]/15 text-[#0B1E19]' : 'bg-[#E8C98B]/10 text-[#E8C98B]'}`}>
                          Today: {completedCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ml-1 flex-shrink-0 transition ${isSelected ? 'transform translate-x-0.5 text-[#0B1E19]' : 'text-[#A98E64]'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Interactive Clicker */}
        <div className="md:col-span-7 flex flex-col items-center justify-center bg-[#0B1E19]/40 rounded-3xl border border-[#E8C98B]/10 p-6 relative overflow-hidden" id="tasbih-interactive-area">
          {/* Subtle water-mark of Arabic lettering under clicker */}
          <div className="absolute text-[#E8C98B] select-none text-[10rem] font-serif font-extrabold rotate-12 opacity-[0.03] pointer-events-none">
            {selectedDhikr.arabic.slice(-5)}
          </div>

          <div className="flex flex-col items-center w-full max-w-sm z-10">
            {/* Arabic displayed in high size */}
            <div className="h-10 flex items-center justify-center mb-2" id="tasbih-phrase-arabic">
              <AnimatePresence mode="wait">
                <motion.p
                  key={selectedDhikr.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="font-serif text-xl tracking-wide text-[#E8C98B] font-extrabold text-center"
                >
                  {selectedDhikr.arabic}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Config target row */}
            <div className="flex items-center gap-4 mb-6 text-xs text-[#A98E64] font-bold">
              <div className="flex items-center gap-1.5">
                <span>Daily Target:</span>
                <input
                  id="tasbih-target-input"
                  type="number"
                  min="1"
                  max="10000"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-[#143028] border border-[#E8C98B]/20 rounded-xl px-2.5 py-0.5 text-center font-mono font-bold text-[#E8C98B] focus:border-[#E8C98B] outline-none h-7"
                />
              </div>

              <span>•</span>

              <div className="flex items-center gap-1">
                <span>Sum Today:</span>
                <span className="font-mono font-bold text-white">{todayAccumCount}</span>
              </div>
            </div>

            {/* Click Button Bead Ring */}
            <div className="relative w-60 h-60 flex items-center justify-center mb-6">
              {/* SVG Ring Background & Progress Indicator */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="120"
                  cy="120"
                  r="92"
                  className="stroke-[#143028]"
                  strokeWidth="6"
                  fill="transparent"
                />
                <motion.circle
                  cx="120"
                  cy="120"
                  r="92"
                  className="stroke-[#E8C98B]"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="578"
                  strokeDashoffset={578 - (578 * progressRatio) / 100}
                  strokeLinecap="round"
                  transition={{ type: 'spring', damping: 20 }}
                />
              </svg>

              {/* The clickable center button */}
              <motion.button
                id="tap-tasbih-btn"
                whileTap={{ scale: 0.94 }}
                onClick={handleIncrement}
                className="w-44 h-44 rounded-full bg-gradient-to-tr from-[#0B1E19] to-[#143028] border border-[#E8C98B]/20 hover:border-[#E8C98B]/40 shadow-2xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden select-none group"
              >
                {/* Ripples dynamic list */}
                {ripples.map((r) => (
                  <span
                    key={r.id}
                    className="absolute bg-[#E8C98B]/20 rounded-full animate-ping pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: r.x,
                      top: r.y,
                      width: '120px',
                      height: '120px',
                    }}
                  />
                ))}

                <span className="text-[10px] text-[#A98E64] uppercase tracking-widest font-bold group-hover:text-[#E8C98B] transition-colors">
                  TAP TO REPEAT
                </span>

                <motion.span
                  key={sessionCount}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-mono font-bold text-[#E8C98B] my-1 font-serif tracking-tighter"
                >
                  {sessionCount}
                </motion.span>

                <div className="text-[10px] font-mono font-bold text-[#A98E64]/80">
                  Target: {customTarget}
                </div>

                {sessionCount >= customTarget && (
                  <div className="absolute top-2 w-full flex justify-center animate-bounce text-[9px] text-[#0B1E19] bg-[#E8C98B] py-1 flex items-center justify-center gap-1 font-bold tracking-wider">
                    <Check className="w-3.5 h-3.5 stroke-[3] text-[#0B1E19]" /> TARGET REACHED
                  </div>
                )}
              </motion.button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex gap-4 w-full">
              <button
                id="reset-tasbih-session-btn"
                onClick={handleResetSession}
                className="flex-1 py-3 rounded-xl border border-[#E8C98B]/15 bg-[#143028] hover:bg-[#1B3B32] text-[#E8C98B]/80 hover:text-[#E8C98B] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Tap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
