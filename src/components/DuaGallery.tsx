/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Star, MessageSquarePlus, Share2, Clipboard, BookOpen, Check } from 'lucide-react';
import { PRESET_DUAS, DuaItem } from '../types';

interface DuaGalleryProps {
  currentDate: string;
  duaList: DuaItem[];
  onToggleFavorite: (id: string) => void;
  onIncrementReadCount: (id: string, date: string) => void;
  onAddCustomDua: (dua: Omit<DuaItem, 'id' | 'timesRead'>) => void;
}

export const DuaGallery: React.FC<DuaGalleryProps> = ({
  currentDate,
  duaList,
  onToggleFavorite,
  onIncrementReadCount,
  onAddCustomDua
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for custom item
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customArabic, setCustomArabic] = useState<string>('');
  const [customTransliteration, setCustomTransliteration] = useState<string>('');
  const [customTranslation, setCustomTranslation] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<'fasting' | 'evening' | 'morning' | 'forgiveness' | 'protection' | 'general' | 'custom'>('custom');
  const [customReference, setCustomReference] = useState<string>('');

  const handleCopy = (dua: DuaItem) => {
    const textToCopy = `${dua.title}\n\nArabic:\n${dua.arabic}\n\nTransliteration:\n${dua.transliteration}\n\nTranslation:\n${dua.translation}\n\nReference: ${dua.reference}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customArabic || !customTranslation) {
      alert('Please fill out Title, Arabic text, and English Translation.');
      return;
    }

    onAddCustomDua({
      title: customTitle,
      arabic: customArabic,
      transliteration: customTransliteration || 'N/A',
      translation: customTranslation,
      reference: customReference || 'Personal Supplication',
      category: customCategory,
      favorite: false,
      isCustom: true
    });

    // Reset fields
    setCustomTitle('');
    setCustomArabic('');
    setCustomTransliteration('');
    setCustomTranslation('');
    setCustomReference('');
    setShowAddCustom(false);
  };

  const categories = [
    { id: 'all', label: 'All Supplications' },
    { id: 'fasting', label: '🌙 Fasting/Ramadan' },
    { id: 'forgiveness', label: '✨ Forgiveness' },
    { id: 'general', label: '🤲 General/Quranic' },
    { id: 'custom', label: '✏️ My Custom Duas' }
  ];

  const filteredDuas = duaList.filter((dua) => {
    const matchesTab = activeTab === 'all' || dua.category === activeTab || (activeTab === 'custom' && dua.isCustom);
    const matchesSearch =
      dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-[#143028] backdrop-blur-md rounded-3xl border border-[#E8C98B]/10 p-6 md:p-8 shadow-xl text-left" id="duas-gallery-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#E8C98B]/10 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#E8C98B] flex items-center gap-2">
            <span className="text-2xl">🤲</span> Supplication Library (Duas)
          </h2>
          <p className="text-xs text-[#A98E64] mt-1 leading-relaxed font-semibold">
            Read, bookmark and reflect upon essential Duas. Add your personal prayers to keep them close.
          </p>
        </div>

        <button
          id="toggle-add-custom-dua-btn"
          onClick={() => setShowAddCustom(!showAddCustom)}
          className="bg-[#E8C98B] text-[#0B1E19] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer select-none shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <MessageSquarePlus className="w-4 h-4" /> Add Custom Dua
        </button>
      </div>

      {/* Custom Dua Creator Form Panel */}
      {showAddCustom && (
        <form onSubmit={handleAddCustom} className="bg-[#0B1E19]/80 border border-[#E8C98B]/20 p-5 rounded-3xl mb-6 space-y-4 animate-fade-in" id="custom-dua-creator-form">
          <div className="flex justify-between items-center pb-2 border-b border-[#E8C98B]/10">
            <h3 className="text-xs font-bold text-[#E8C98B] font-mono tracking-wide uppercase">✏️ Write Your Own Supplication</h3>
            <button
              type="button"
              onClick={() => setShowAddCustom(false)}
              className="text-xs text-[#A98E64] hover:text-white cursor-pointer font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="custom-dua-title">Dua Title *</label>
              <input
                id="custom-dua-title"
                type="text"
                placeholder="e.g., Dua for Success in Exams / Work"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#143028] border border-[#E8C98B]/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#E8C98B]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="custom-dua-ref">Source / Reference</label>
              <input
                id="custom-dua-ref"
                type="text"
                placeholder="e.g., Quran, Hadith, Personal"
                value={customReference}
                onChange={(e) => setCustomReference(e.target.value)}
                className="w-full bg-[#143028] border border-[#E8C98B]/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#E8C98B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="custom-dua-arabic">Arabic Text *</label>
            <textarea
              id="custom-dua-arabic"
              placeholder="Write or paste Arabic text here..."
              value={customArabic}
              onChange={(e) => setCustomArabic(e.target.value)}
              rows={2}
              dir="rtl"
              className="w-full bg-[#143028] border border-[#E8C98B]/15 rounded-xl p-2.5 text-base text-amber-100 font-serif leading-relaxed outline-none focus:border-[#E8C98B] font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="custom-dua-translit">Transliteration (Pronunciation Help)</label>
            <input
              id="custom-dua-translit"
              type="text"
              placeholder="e.g., Rabbana atina fid-dunya hasanatan..."
              value={customTransliteration}
              onChange={(e) => setCustomTransliteration(e.target.value)}
              className="w-full bg-[#143028] border border-[#E8C98B]/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#E8C98B]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#A98E64] font-bold mb-1" htmlFor="custom-dua-translation">English Translation *</label>
            <textarea
              id="custom-dua-translation"
              placeholder="Write the English meaning..."
              value={customTranslation}
              onChange={(e) => setCustomTranslation(e.target.value)}
              rows={2}
              className="w-full bg-[#143028] border border-[#E8C98B]/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#E8C98B]"
              required
            />
          </div>

          <button
            type="submit"
            id="custom-dua-save-btn"
            className="w-full bg-[#E8C98B] text-[#0B1E19] font-bold text-xs py-3 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md"
          >
            <BookOpen className="w-4 h-4" /> Save custom Supplication
          </button>
        </form>
      )}

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-4 border-b border-[#E8C98B]/10">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto" id="duas-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`dua-tab-${cat.id}`}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold select-none transition cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-[#E8C98B]/10 text-[#E8C98B] border border-[#E8C98B]/30 font-extrabold'
                  : 'text-[#A98E64] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A98E64]" />
          <input
            id="dua-search-input"
            type="text"
            placeholder="Search Supplications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-[#0B1E19] border border-[#E8C98B]/15 text-xs rounded-xl text-[#E8C98B] placeholder-[#A98E64] outline-none focus:border-[#E8C98B]"
          />
        </div>
      </div>

      {/* Dua List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="duas-list-grid">
        {filteredDuas.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-[#E8C98B]/10 rounded-3xl bg-[#0B1E19]/25 text-[#A98E64]">
            <p className="text-sm font-semibold">No Supplications found matching filters.</p>
            <p className="text-xs text-[#A98E64]/80 mt-1 font-medium">Start by resetting search fields or writing a fresh daily supplication!</p>
          </div>
        ) : (
          filteredDuas.map((dua) => {
            const isFav = dua.favorite || false;
            const isCopy = copiedId === dua.id;
            const readToday = (dua.timesRead && dua.timesRead[currentDate]) || 0;

            return (
              <div
                key={dua.id}
                id={`dua-card-${dua.id}`}
                className="group p-5 rounded-3xl bg-[#0B1E19] border border-[#E8C98B]/10 hover:border-[#E8C98B]/35 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header metadata */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#E8C98B] bg-[#E8C98B]/10 border border-[#E8C98B]/15 rounded px-2.5 py-0.5">
                      {dua.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Favorite Button */}
                      <button
                        id={`fav-btn-${dua.id}`}
                        onClick={() => onToggleFavorite(dua.id)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isFav
                            ? 'text-yellow-400 bg-yellow-950/20'
                            : 'text-[#A98E64] hover:text-white hover:bg-[#143028]'
                        }`}
                        title="Bookmark"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400' : ''}`} />
                      </button>

                      {/* Copy Supplication Text to Board */}
                      <button
                        id={`copy-btn-${dua.id}`}
                        onClick={() => handleCopy(dua)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isCopy
                            ? 'text-emerald-400 bg-emerald-950/20'
                            : 'text-[#A98E64] hover:text-white hover:bg-[#143028]'
                        }`}
                        title="Copy text content"
                      >
                        {isCopy ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-serif font-semibold text-slate-100 pr-5 tracking-wide leading-snug">
                    {dua.title}
                  </h3>

                  {/* High display Arabic text */}
                  <div className="bg-[#143028]/70 border border-[#E8C98B]/10 rounded-2xl p-4 my-4 font-serif text-lg md:text-xl text-center text-amber-100 font-bold leading-relaxed tracking-wide select-all" dir="rtl">
                    {dua.arabic}
                  </div>

                  {/* Transliteration and English Translation */}
                  <div className="space-y-2.5">
                    <p className="text-xs italic text-[#A98E64] leading-normal pl-2 border-l border-[#E8C98B]/30 font-medium">
                      {dua.transliteration}
                    </p>
                    <p className="text-xs text-slate-350 leading-relaxed font-sans font-medium">
                      {dua.translation}
                    </p>
                  </div>
                </div>

                {/* Footer details + Tracking */}
                <div className="mt-5 border-t border-[#E8C98B]/10 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <span className="text-[10px] text-[#A98E64] italic font-semibold">
                    Source: {dua.reference}
                  </span>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {readToday > 0 && (
                      <span className="text-[10px] text-white font-bold bg-[#E8C98B]/15 px-2.5 py-0.5 rounded-md border border-[#E8C98B]/10 flex-shrink-0">
                        Read: <span className="font-mono text-[#E8C98B]">{readToday}x</span>
                      </span>
                    )}

                    <button
                      id={`mark-read-dua-${dua.id}`}
                      onClick={() => onIncrementReadCount(dua.id, currentDate)}
                      className="flex-1 sm:flex-initial bg-[#143028] hover:bg-[#1B3B32] border border-[#E8C98B]/15 text-[#E8C98B] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Read
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
