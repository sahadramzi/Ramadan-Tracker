/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Heart, Plus, Trash2, ShieldAlert, Sparkles, Receipt, Coins } from 'lucide-react';
import { SadaqaLog } from '../types';

interface SadaqaTrackerProps {
  currentDate: string;
  sadaqaLogs: SadaqaLog[];
  onAddSadaqa: (log: Omit<SadaqaLog, 'id'>) => void;
  onDeleteSadaqa: (id: string) => void;
}

export const SadaqaTracker: React.FC<SadaqaTrackerProps> = ({
  currentDate,
  sadaqaLogs,
  onAddSadaqa,
  onDeleteSadaqa
}) => {
  const [type, setType] = useState<SadaqaLog['type']>('money');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const totalDonations = sadaqaLogs
    .filter(log => log.type === 'money' && log.amount)
    .reduce((sum, log) => sum + (log.amount || 0), 0);

  const totalKindActs = sadaqaLogs.filter(log => log.type !== 'money').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please write a brief description of your charity/deed.');
      return;
    }

    let parsedAmount: number | undefined = undefined;
    if (type === 'money') {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid donation amount.');
        return;
      }
    }

    onAddSadaqa({
      date: currentDate,
      type,
      description: description.trim(),
      amount: parsedAmount
    });

    setDescription('');
    setAmount('');
  };

  const getSadaqaBadge = (category: SadaqaLog['type']) => {
    switch (category) {
      case 'money':
        return { label: '💳 Financial Donation', cls: 'bg-[#E8C98B]/15 border border-[#E8C98B]/20 text-[#E8C98B]' };
      case 'food':
        return { label: '🍎 Sharing Food', cls: 'bg-[#E8C98B]/10 border border-[#E8C98B]/15 text-[#E8C98B]/90' };
      case 'volunteer':
        return { label: '🤝 Volunteering', cls: 'bg-[#1B3B32] border border-[#E8C98B]/15 text-[#E8C98B]' };
      case 'kindness':
        return { label: '😊 Smiling / Kindness', cls: 'bg-[#0B1E19] border border-[#E8C98B]/15 text-[#E8C98B]' };
      default:
        return { label: '⭐ Good Deed', cls: 'bg-[#0B1E19]/50 border border-[#E8C98B]/10 text-slate-400' };
    }
  };

  return (
    <div className="bg-[#143028] backdrop-blur-md rounded-3xl border border-[#E8C98B]/10 p-6 md:p-8 shadow-xl text-left" id="sadaqa-tracker-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#E8C98B]/10 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#E8C98B] flex items-center gap-2">
            <span className="text-2xl">❤️</span> Sadaqa & Acts of Kindness
          </h2>
          <p className="text-xs text-[#A98E64] mt-1 leading-relaxed font-semibold">
            "Your smiling in the face of your brother is charity (Sadaqa)" — Prophet Muhammad (pbuh)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#E8C98B]/10 border border-[#E8C98B]/20 rounded-xl px-4 py-1.5 text-center">
            <div className="text-xl font-bold font-mono text-[#E8C98B]">${totalDonations.toFixed(2)}</div>
            <div className="text-[9px] text-[#A98E64] uppercase font-bold tracking-wider">Financial Gift</div>
          </div>
          <div className="bg-[#E8C98B]/10 border border-[#E8C98B]/20 rounded-xl px-4 py-1.5 text-center">
            <div className="text-xl font-bold font-mono text-[#E8C98B]">{totalKindActs}</div>
            <div className="text-[9px] text-[#A98E64] uppercase font-bold tracking-wider">Acts of Mercy</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Log Form */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-5">
          {/* Inspiration Card */}
          <div className="bg-[#0B1E19]/60 border border-[#E8C98B]/10 rounded-2xl p-4">
            <h4 className="text-[10px] font-bold text-[#E8C98B] font-mono tracking-widest uppercase mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Generosity Guidance
            </h4>
            <p className="text-[11px] text-slate-100 italic leading-snug font-medium">
              "The example of those who spend their wealth in the way of Allah is like a seed [of grain] which grows seven spikes; in each spike is a hundred grains." (Surah Al-Baqarah, 2:261)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#0B1E19]/40 border border-[#E8C98B]/10 p-5 rounded-3xl space-y-4" id="sadaqa-log-form">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#E8C98B] flex items-center gap-1.5 mb-1">
              <Plus className="w-4 h-4 text-[#E8C98B]" /> Log Generosity Element
            </h3>

            {error && (
              <div id="sadaqa-form-error" className="bg-rose-950/30 border border-rose-500/30 text-rose-350 text-xs p-2.5 rounded-xl flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-450" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="sadaqa-type">
                Category
              </label>
              <select
                id="sadaqa-type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as any);
                  setError('');
                }}
                className="w-full bg-[#143028] border border-[#E8C98B]/15 text-[#E8C98B] text-xs rounded-xl p-2.5 outline-none focus:border-[#E8C98B]"
              >
                <option value="money" className="bg-[#143028]">💳 Financial Gift / Donation</option>
                <option value="food" className="bg-[#143028]">🍎 Sharing / Giving Food</option>
                <option value="volunteer" className="bg-[#143028]">🤝 Helping Out / Volunteering</option>
                <option value="kindness" className="bg-[#143028]">😊 Smile / Act of Kindness</option>
                <option value="other" className="bg-[#143028]">⭐ Other Propitious Deed</option>
              </select>
            </div>

            {type === 'money' && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="sadaqa-amount">
                  Monetary Amount ($)
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#E8C98B]" />
                  <input
                    id="sadaqa-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#143028] border border-[#E8C98B]/15 text-white text-xs rounded-xl outline-none focus:border-[#E8C98B] font-mono font-extrabold"
                    required={type === 'money'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="sadaqa-desc">
                Log Description / Record
              </label>
              <textarea
                id="sadaqa-desc"
                placeholder={
                  type === 'money'
                    ? 'e.g., Donated to Orphanage fund / local soup kitchen'
                    : type === 'food'
                    ? 'e.g., Provided dates and water to neighbors for Iftar'
                    : 'e.g., Shared a smile / helped clear trash from street'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#143028] border border-[#E8C98B]/15 text-white text-xs rounded-xl p-2.5 outline-none focus:border-[#E8C98B] resize-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              id="sadaqa-log-submit-btn"
              className="w-full bg-[#E8C98B] text-[#0B1E19] text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-xl"
            >
              <Heart className="w-4 h-4 fill-[#0B1E19] stroke-none" /> Log Charity / Action
            </button>
          </form>
        </div>

        {/* History Stream */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col justify-start">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#A98E64] mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#E8C98B]" /> Mercy Log History
          </h3>

          <div className="flex-1 overflow-y-auto max-h-[360px] pr-2 space-y-3.5 scrollbar-thin scrollbar-thumb-[#0B1E19]" id="sadaqa-history-list">
            {sadaqaLogs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#E8C98B]/10 rounded-3xl text-[#A98E64] bg-[#0B1E19]/25">
                <Heart className="w-8 h-8 text-[#E8C98B]/40 mx-auto mb-2.5" />
                <p className="text-sm font-bold">No charity / kindness logs recorded yet.</p>
                <p className="text-xs text-[#A98E64]/70 mt-1 font-semibold">Remember, even the smallest positive gesture propagates light elsewhere.</p>
              </div>
            ) : (
              [...sadaqaLogs].reverse().map((log) => {
                const bDetails = getSadaqaBadge(log.type);
                return (
                  <div
                    key={log.id}
                    id={`sadaqa-log-item-${log.id}`}
                    className="p-4 rounded-2xl bg-[#0B1E19]/70 border border-[#E8C98B]/10 hover:border-[#E8C98B]/30 transition-all flex justify-between items-start gap-4"
                  >
                    <div className="space-y-1.5 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase ${bDetails.cls}`}>
                          {bDetails.label}
                        </span>
                        <span className="text-[10px] text-[#A98E64] font-semibold">{log.date}</span>
                      </div>

                      <p className="text-xs text-white leading-relaxed font-bold">
                        {log.description}
                      </p>

                      {log.type === 'money' && log.amount !== undefined && (
                        <div className="text-xs font-mono font-bold text-[#E8C98B] bg-[#E8C98B]/10 border border-[#E8C98B]/10 px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5">
                          🎁 Contribution: ${log.amount.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <button
                      id={`delete-sadaqa-log-${log.id}`}
                      onClick={() => onDeleteSadaqa(log.id)}
                      className="p-1.5 text-[#A98E64] hover:text-rose-400 hover:bg-[#143028] rounded-xl transition cursor-pointer"
                      title="De-register entry"
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
