/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Calendar, Award, Sparkles } from 'lucide-react';
import { QuranLog, QURAN_SURAHS } from '../types';

interface QuranTrackerProps {
  currentDate: string;
  quranLogs: QuranLog[];
  onAddLog: (log: Omit<QuranLog, 'id'>) => void;
  onDeleteLog: (id: string) => void;
}

export const QuranTracker: React.FC<QuranTrackerProps> = ({
  currentDate,
  quranLogs,
  onAddLog,
  onDeleteLog
}) => {
  const [startPage, setStartPage] = useState<string>('');
  const [endPage, setEndPage] = useState<string>('');
  const [surahStart, setSurahStart] = useState<string>('Al-Fatihah');
  const [surahEnd, setSurahEnd] = useState<string>('Al-Fatihah');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Calculate stats
  const totalPagesRead = quranLogs.reduce((sum, log) => sum + (log.endPage - log.startPage + 1), 0);
  const totalQuranPages = 604;
  const percentageCompleted = Math.min(100, Math.round((totalPagesRead / totalQuranPages) * 100));

  // Determine Juz states
  const getJuzProgress = (juzNumber: number) => {
    const juzStartPage = (juzNumber - 1) * 20 + 1;
    const juzEndPage = juzNumber === 30 ? 604 : juzNumber * 20;
    
    // Calculate overlap
    let readInJuz = 0;
    for (let p = juzStartPage; p <= juzEndPage; p++) {
      const isRead = quranLogs.some(log => p >= log.startPage && p <= log.endPage);
      if (isRead) readInJuz++;
    }
    const totalInJuz = juzEndPage - juzStartPage + 1;
    return (readInJuz / totalInJuz) * 100;
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const start = parseInt(startPage);
    const end = parseInt(endPage);

    if (isNaN(start) || isNaN(end)) {
      setError('Please enter valid start and end page numbers.');
      return;
    }

    if (start <= 0 || end <= 0) {
      setError('Page numbers must be greater than 0.');
      return;
    }

    if (end < start) {
      setError('End page cannot be less than start page.');
      return;
    }

    if (end > 604) {
      setError('The Quran has exactly 604 pages. End page cannot exceed 604.');
      return;
    }

    onAddLog({
      date: currentDate,
      startPage: start,
      endPage: end,
      surahStart,
      surahEnd,
      notes: notes.trim()
    });

    setStartPage('');
    setEndPage('');
    setNotes('');
  };

  const handleSurahStartChange = (surahName: string) => {
    setSurahStart(surahName);
    const selected = QURAN_SURAHS.find(s => s.name === surahName);
    if (selected) {
      const [start] = selected.pages.split('-');
      setStartPage(start);
    }
  };

  const handleSurahEndChange = (surahName: string) => {
    setSurahEnd(surahName);
    const selected = QURAN_SURAHS.find(s => s.name === surahName);
    if (selected) {
      const [, end] = selected.pages.split('-');
      setEndPage(end);
    }
  };

  return (
    <div className="bg-[#143028] backdrop-blur-md rounded-3xl border border-[#E8C98B]/10 p-6 md:p-8 shadow-xl text-left" id="quran-tracker-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#E8C98B]/10 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#E8C98B] flex items-center gap-2">
            <span className="text-2xl">📖</span> Quran Recitation Journey
          </h2>
          <p className="text-xs text-[#A98E64] mt-1 leading-relaxed font-semibold">
            Log your daily reading progress and complete the Quran during this holy month
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#E8C98B]/10 border border-[#E8C98B]/20 rounded-xl px-4 py-1.5 text-center">
            <div className="text-xl font-bold font-mono text-[#E8C98B]">{totalPagesRead}</div>
            <div className="text-[9px] text-[#A98E64] uppercase font-bold tracking-wider">Pages Read</div>
          </div>
          <div className="bg-[#E8C98B]/10 border border-[#E8C98B]/20 rounded-xl px-4 py-1.5 text-center">
            <div className="text-xl font-bold font-mono text-[#E8C98B]">{percentageCompleted}%</div>
            <div className="text-[9px] text-[#A98E64] uppercase font-bold tracking-wider">Completed</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-[#0B1E19]/80 p-5 rounded-2xl border border-[#E8C98B]/10">
        <div className="flex justify-between items-center text-xs text-[#A98E64] mb-2 font-semibold">
          <span>Khatm Progress (604 standard pages)</span>
          <span className="font-serif italic text-[#E8C98B] font-bold">{604 - totalPagesRead} pages remaining</span>
        </div>
        <div className="w-full bg-[#143028] h-3.5 rounded-full overflow-hidden border border-[#E8C98B]/10">
          <div 
            className="h-full bg-gradient-to-r from-[#E8C98B]/80 to-[#E8C98B] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentageCompleted}%` }}
          />
        </div>

        {/* 30 Juz Visualization */}
        <div className="mt-5">
          <div className="text-xs text-[#E8C98B] font-bold mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#E8C98B]" />
            <span>30 Juz Visualizer</span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2" id="juz-grid">
            {Array.from({ length: 30 }).map((_, index) => {
              const juzNum = index + 1;
              const progress = Math.round(getJuzProgress(juzNum));
              let statusColor = 'bg-[#0B1E19] border-[#E8C98B]/10 text-[#A98E64]';
              if (progress > 0 && progress < 100) {
                statusColor = 'bg-[#E8C98B]/15 border-[#E8C98B]/35 text-[#E8C98B]';
              } else if (progress === 100) {
                statusColor = 'bg-[#E8C98B] border-[#E8C98B] text-[#0B1E19] font-bold';
              }

              return (
                <div
                  key={juzNum}
                  id={`juz-dot-${juzNum}`}
                  className={`p-2 rounded-xl border text-center transition-all ${statusColor} group relative`}
                >
                  <div className="text-[10px] font-mono leading-none">{juzNum}</div>
                  <div className="w-full bg-[#143028]/70 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${progress === 100 ? 'bg-[#0B1E19]' : 'bg-[#E8C98B]'}`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 hidden group-hover:block bg-[#0B1E19] text-white text-[10px] p-2.5 rounded-xl border border-[#E8C98B]/20 pointer-events-none shadow-xl text-left">
                    <div className="font-bold text-[#E8C98B]">Juz {juzNum}</div>
                    <div className="mt-1 font-semibold">Progress: {progress}%</div>
                    <div className="text-[9px] text-[#A98E64] mt-0.5">Pages: {(juzNum-1)*20+1} - {juzNum === 30 ? 604 : juzNum*20}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Log Recitation Form */}
        <form onSubmit={handleAddLog} className="lg:col-span-5 bg-[#0B1E19]/40 border border-[#E8C98B]/10 p-5 rounded-2xl flex flex-col gap-4" id="quran-log-form">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#E8C98B] flex items-center gap-1.5 mb-2">
            <Plus className="w-4 h-4 text-[#E8C98B]" /> Log Recitation Unit
          </h3>

          {error && (
            <div id="quran-form-error" className="bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs p-2.5 rounded-lg flex items-center gap-2 font-semibold">
              <span className="font-bold text-rose-400">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="surahStart-select">
                Start Surah
              </label>
              <select
                id="surahStart-select"
                value={surahStart}
                onChange={(e) => handleSurahStartChange(e.target.value)}
                className="w-full bg-[#143028] border border-[#E8C98B]/15 text-[#E8C98B] text-xs rounded-xl p-2.5 outline-none focus:border-[#E8C98B]"
              >
                {QURAN_SURAHS.map(s => (
                  <option key={s.number} value={s.name} className="bg-[#143028] text-white">{s.number}. {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="surahEnd-select">
                End Surah
              </label>
              <select
                id="surahEnd-select"
                value={surahEnd}
                onChange={(e) => handleSurahEndChange(e.target.value)}
                className="w-full bg-[#143028] border border-[#E8C98B]/15 text-[#E8C98B] text-xs rounded-xl p-2.5 outline-none focus:border-[#E8C98B]"
              >
                {QURAN_SURAHS.map(s => (
                  <option key={s.number} value={s.name} className="bg-[#143028] text-white">{s.number}. {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="startPage-input">
                Start Page
              </label>
              <input
                id="startPage-input"
                type="number"
                min="1"
                max="604"
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                placeholder="e.g., 1"
                className="w-full bg-[#143028] border border-[#E8C98B]/15 text-[#E8C98B] text-xs rounded-xl p-2.5 outline-none focus:border-[#E8C98B] font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="endPage-input">
                End Page
              </label>
              <input
                id="endPage-input"
                type="number"
                min="1"
                max="604"
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                placeholder="e.g., 20"
                className="w-full bg-[#143028] border border-[#E8C98B]/15 text-[#E8C98B] text-xs rounded-xl p-2.5 outline-none focus:border-[#E8C98B] font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="quran-notes-input">
              Reflections & Notes (Optional)
            </label>
            <textarea
              id="quran-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you contemplate in these verses?"
              rows={2}
              className="w-full bg-[#143028] border border-[#E8C98B]/15 text-[#E8C98B] text-xs rounded-xl p-2.5 outline-none focus:border-[#E8C98B] resize-none"
            />
          </div>

          <button
            type="submit"
            id="quran-log-submit-btn"
            className="w-full bg-[#E8C98B] hover:scale-[1.01] active:scale-[0.99] text-[#0B1E19] text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
          >
            <BookOpen className="w-4 h-4" /> Save Reading Session
          </button>
        </form>

        {/* History of logs */}
        <div className="lg:col-span-7 flex flex-col text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#A98E64] mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E8C98B]" /> Session History List
          </h3>

          <div className="flex-1 overflow-y-auto max-h-[340px] pr-2 space-y-3 scrollbar-thin scrollbar-thumb-[#0B1E19]" id="quran-history-list">
            {quranLogs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#E8C98B]/10 rounded-2xl text-[#A98E64] bg-[#0B1E19]/25">
                <p className="text-sm font-semibold">No recitation sessions logged yet.</p>
                <p className="text-xs text-[#A98E64]/70 mt-1 font-medium">Submit your first reading block above to begin your Khatm campaign.</p>
              </div>
            ) : (
              [...quranLogs].reverse().map((log) => {
                const pagesCount = log.endPage - log.startPage + 1;
                return (
                  <div
                    key={log.id}
                    id={`quran-log-item-${log.id}`}
                    className="p-4 rounded-2xl bg-[#0B1E19]/70 border border-[#E8C98B]/10 hover:border-[#E8C98B]/30 transition flex justify-between items-start gap-4"
                  >
                    <div className="flex gap-3">
                      <div className="p-2 rounded-xl bg-[#E8C98B]/10 border border-[#E8C98B]/15 text-[#E8C98B] h-11 w-11 flex items-center justify-center font-bold font-mono text-xs flex-shrink-0">
                        {pagesCount}p
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <span>
                            Surah {log.surahStart} {log.surahStart !== log.surahEnd && `to ${log.surahEnd}`}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#A98E64] font-mono mt-0.5">
                          Pages {log.startPage} – {log.endPage} | {log.date}
                        </div>
                        {log.notes && (
                          <div className="text-[11px] italic text-[#E8C98B]/80 mt-2 flex items-start gap-1 font-medium leading-relaxed">
                            <Sparkles className="w-3 h-3 text-[#E8C98B] flex-shrink-0 mt-0.5" />
                            <span>"{log.notes}"</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      id={`delete-quran-log-${log.id}`}
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1.5 text-[#A98E64] hover:text-rose-400 hover:bg-[#143028] rounded-xl transition cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
