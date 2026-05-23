/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Map, 
  BookOpen, 
  Bell, 
  Moon, 
  Sun, 
  Compass, 
  Gift, 
  Award, 
  CheckCircle, 
  ChevronRight, 
  X, 
  HelpCircle, 
  Star,
  Sparkles,
  Info,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import { SalatTracker } from './components/SalatTracker';
import { QuranTracker } from './components/QuranTracker';
import { DhikrTracker } from './components/DhikrTracker';
import { DuaGallery } from './components/DuaGallery';
import { SadaqaTracker } from './components/SadaqaTracker';
import { ProgressCharts } from './components/ProgressCharts';
import { ReminderSettings } from './components/ReminderSettings';
import { UserProfilePanel } from './components/UserProfilePanel';

// Types
import { 
  PrayerLog, 
  DhikrLog, 
  QuranLog, 
  SadaqaLog, 
  DuaItem, 
  NotificationSetting, 
  PRESET_DUAS, 
  DEFAULT_NOTIFICATIONS, 
  MOHAMMEDAN_QUOTES 
} from './types';

// Simple helper to get date string YYYY-MM-DD
const formatDateStr = (dateObj: Date) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dVal = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${dVal}`;
};

// Formulate date indexes for historical seeding
const getOffsetDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysOffset);
  return formatDateStr(d);
};

// Seed Data
const initialPrayerLog: PrayerLog = {
  [getOffsetDate(3)]: {
    fajr: { completed: true, time: '04:47 AM' },
    dhuhr: { completed: true, time: '12:31 PM' },
    asr: { completed: true, time: '03:47 PM' },
    maghrib: { completed: true, time: '06:31 PM' },
    isha: { completed: true, time: '08:02 PM' },
    taraweeh: { completed: true }
  },
  [getOffsetDate(2)]: {
    fajr: { completed: true, time: '04:46 AM' },
    dhuhr: { completed: true, time: '12:30 PM' },
    asr: { completed: false },
    maghrib: { completed: true, time: '06:31 PM' },
    isha: { completed: true, time: '08:05 PM' },
    taraweeh: { completed: true },
    tahajjud: { completed: true }
  },
  [getOffsetDate(1)]: {
    fajr: { completed: true, time: '04:45 AM' },
    dhuhr: { completed: true, time: '12:30 PM' },
    asr: { completed: true, time: '03:45 PM' },
    maghrib: { completed: true, time: '06:30 PM' },
    isha: { completed: true, time: '08:00 PM' },
    taraweeh: { completed: true }
  }
};

const initialQuranLogs: QuranLog[] = [
  { id: 'seed-q-1', date: getOffsetDate(3), startPage: 1, endPage: 10, surahStart: 'Al-Fatihah', surahEnd: 'Al-Baqarah', notes: 'Began the beautiful Juz 1 journey with focus.' },
  { id: 'seed-q-2', date: getOffsetDate(2), startPage: 11, endPage: 25, surahStart: 'Al-Baqarah', surahEnd: 'Al-Baqarah', notes: 'Reflected on the stories of Prophet Adam.' },
  { id: 'seed-q-3', date: getOffsetDate(1), startPage: 26, endPage: 40, surahStart: 'Al-Baqarah', surahEnd: 'Al-Baqarah', notes: 'Read evening session after taraweeh.' }
];

const initialDhikrLog: DhikrLog = {
  [getOffsetDate(3)]: { subhanallah: 33, alhamdulillah: 33, allahuakbar: 34, astaghfirullah: 100 },
  [getOffsetDate(2)]: { subhanallah: 33, alhamdulillah: 33, allahuakbar: 34, astaghfirullah: 100, la_ilaha_illallah: 100 },
  [getOffsetDate(1)]: { subhanallah: 66, alhamdulillah: 66, allahuakbar: 68, astaghfirullah: 150 }
};

const initialSadaqaLogs: SadaqaLog[] = [
  { id: 'seed-s-1', date: getOffsetDate(3), type: 'money', amount: 15, description: 'Donated to feeding poor in neighborhood' },
  { id: 'seed-s-2', date: getOffsetDate(2), type: 'kindness', description: 'Visited sick aunt and made dua for her health' },
  { id: 'seed-s-3', date: getOffsetDate(1), type: 'food', description: 'Bought dates and juices to distribute at Mosque during Iftar' }
];

const initialDuaList: DuaItem[] = PRESET_DUAS.map(dua => ({
  ...dua,
  timesRead: { [getOffsetDate(1)]: 1 }
}));

interface InAppAlert {
  id: string;
  title: string;
  description: string;
  taskType: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>(formatDateStr(new Date()));
  const [ramadanDay, setRamadanDay] = useState<number>(7); // Simulation fallback
  
  // States
  const [prayerLog, setPrayerLog] = useState<PrayerLog>(() => {
    const saved = localStorage.getItem('ramadan_prayers_v1');
    return saved ? JSON.parse(saved) : initialPrayerLog;
  });

  const [quranLogs, setQuranLogs] = useState<QuranLog[]>(() => {
    const saved = localStorage.getItem('ramadan_quran_v1');
    return saved ? JSON.parse(saved) : initialQuranLogs;
  });

  const [dhikrLog, setDhikrLog] = useState<DhikrLog>(() => {
    const saved = localStorage.getItem('ramadan_dhikr_v1');
    return saved ? JSON.parse(saved) : initialDhikrLog;
  });

  const [sadaqaLogs, setSadaqaLogs] = useState<SadaqaLog[]>(() => {
    const saved = localStorage.getItem('ramadan_sadaqa_v1');
    return saved ? JSON.parse(saved) : initialSadaqaLogs;
  });

  const [duaList, setDuaList] = useState<DuaItem[]>(() => {
    const saved = localStorage.getItem('ramadan_duas_v1');
    return saved ? JSON.parse(saved) : initialDuaList;
  });

  const [notifications, setNotifications] = useState<NotificationSetting[]>(() => {
    const saved = localStorage.getItem('ramadan_notif_v1');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  // User Profile & Custom Goals States
  const [profileName, setProfileName] = useState<string>(() => {
    return localStorage.getItem('ramadan_profile_name_v1') || 'Pilgrim';
  });

  const [profileAvatar, setProfileAvatar] = useState<string>(() => {
    return localStorage.getItem('ramadan_profile_avatar_v1') || '🕌';
  });

  const [goals, setGoals] = useState(() => {
    const defaultGoals = {
      salat: { daily: 5, weekly: 35, overall: 150 },
      quran: { daily: 4, weekly: 28, overall: 120 },
      dhikr: { daily: 100, weekly: 700, overall: 3000 },
      dua: { daily: 2, weekly: 10, overall: 50 },
      sadaqa: { daily: 1, weekly: 5, overall: 15 }
    };
    const saved = localStorage.getItem('ramadan_goals_v1');
    return saved ? { ...defaultGoals, ...JSON.parse(saved) } : defaultGoals;
  });

  const [activeAlert, setActiveAlert] = useState<InAppAlert | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ramadan_prayers_v1', JSON.stringify(prayerLog));
  }, [prayerLog]);

  useEffect(() => {
    localStorage.setItem('ramadan_quran_v1', JSON.stringify(quranLogs));
  }, [quranLogs]);

  useEffect(() => {
    localStorage.setItem('ramadan_dhikr_v1', JSON.stringify(dhikrLog));
  }, [dhikrLog]);

  useEffect(() => {
    localStorage.setItem('ramadan_sadaqa_v1', JSON.stringify(sadaqaLogs));
  }, [sadaqaLogs]);

  useEffect(() => {
    localStorage.setItem('ramadan_duas_v1', JSON.stringify(duaList));
  }, [duaList]);

  useEffect(() => {
    localStorage.setItem('ramadan_notif_v1', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ramadan_profile_name_v1', profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem('ramadan_profile_avatar_v1', profileAvatar);
  }, [profileAvatar]);

  useEffect(() => {
    localStorage.setItem('ramadan_goals_v1', JSON.stringify(goals));
  }, [goals]);

  const handleUpdateGoals = (
    category: 'salat' | 'quran' | 'dhikr' | 'dua' | 'sadaqa',
    period: 'daily' | 'weekly' | 'overall',
    value: number
  ) => {
    setGoals(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [period]: value
      }
    }));
  };

  // Rotate quotes every 20 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % MOHAMMEDAN_QUOTES.length);
    }, 20000);
    return () => clearInterval(quoteInterval);
  }, []);

  // Check scheduled alarms every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const HH = String(now.getHours()).padStart(2, '0');
      const MM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${HH}:${MM}`;

      notifications.forEach((notif) => {
        if (notif.enabled && notif.time === currentTimeStr) {
          // Trigger alarm!
          triggerAlarm(notif);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [notifications]);

  const triggerAlarm = (notif: NotificationSetting) => {
    // 1. In-app alert state
    setActiveAlert({
      id: String(Date.now()),
      title: notif.title,
      description: notif.description,
      taskType: notif.taskType
    });

    // 2. Browser native desktop alert if authorized
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.title, {
        body: notif.description,
        icon: 'https://cdn-icons-png.flaticon.com/512/3661/3661541.png'
      });
    }

    // 3. Play success harmonic buzzer
    playNotificationBuzzer();
  };

  const playNotificationBuzzer = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const playFreq = (f: number, t: number, d: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + d);
      };
      // Cozy double-tone chord
      playFreq(440, now, 0.2); // A4
      playFreq(554, now + 0.15, 0.35); // C#5
    } catch (e) {
      // Ignored
    }
  };

  // State log modifiers
  const handleTogglePrayer = (date: string, prayerId: string, isSunnah?: boolean) => {
    setPrayerLog((prev) => {
      const dayData = prev[date] || {};
      const targetPrayer = dayData[prayerId] || { completed: false };
      const nextCompleted = !targetPrayer.completed;

      // Log time for obligatory prayer completion
      let logTime: string | undefined = undefined;
      if (nextCompleted && !isSunnah) {
        const nowObj = new Date();
        const hrs = String(nowObj.getHours() % 12 || 12).padStart(2, '0');
        const mins = String(nowObj.getMinutes()).padStart(2, '0');
        const ampm = nowObj.getHours() >= 12 ? 'PM' : 'AM';
        logTime = `${hrs}:${mins} ${ampm}`;
      }

      const updatedDay = {
        ...dayData,
        [prayerId]: {
          completed: nextCompleted,
          time: logTime,
          isSunnah
        }
      };

      return {
        ...prev,
        [date]: updatedDay
      };
    });
  };

  const handleUpdateDhikrCount = (date: string, dhikrId: string, countToAdd: number) => {
    setDhikrLog((prev) => {
      const dayData = prev[date] || {};
      const currentCount = dayData[dhikrId] || 0;
      return {
        ...prev,
        [date]: {
          ...dayData,
          [dhikrId]: currentCount + countToAdd
        }
      };
    });
  };

  const handleAddQuranLog = (log: Omit<QuranLog, 'id'>) => {
    const newLog: QuranLog = {
      ...log,
      id: `quran-log-${Date.now()}`
    };
    setQuranLogs((prev) => [...prev, newLog]);
  };

  const handleDeleteQuranLog = (id: string) => {
    setQuranLogs((prev) => prev.filter(l => l.id !== id));
  };

  const handleAddSadaqa = (log: Omit<SadaqaLog, 'id'>) => {
    const newLog: SadaqaLog = {
      ...log,
      id: `sadaqa-log-${Date.now()}`
    };
    setSadaqaLogs((prev) => [...prev, newLog]);
  };

  const handleDeleteSadaqa = (id: string) => {
    setSadaqaLogs((prev) => prev.filter(l => l.id !== id));
  };

  const handleToggleFavoriteDua = (id: string) => {
    setDuaList((prev) =>
      prev.map(dua => (dua.id === id ? { ...dua, favorite: !dua.favorite } : dua))
    );
  };

  const handleIncrementReadDua = (id: string, date: string) => {
    setDuaList((prev) =>
      prev.map(dua => {
        if (dua.id === id) {
          const times = { ...dua.timesRead };
          times[date] = (times[date] || 0) + 1;
          return { ...dua, timesRead: times };
        }
        return dua;
      })
    );
  };

  const handleAddCustomDua = (dua: Omit<DuaItem, 'id' | 'timesRead'>) => {
    const newDua: DuaItem = {
      ...dua,
      id: `custom-dua-${Date.now()}`,
      timesRead: {}
    };
    setDuaList((prev) => [...prev, newDua]);
  };

  const handleToggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map(notif => (notif.id === id ? { ...notif, enabled: !notif.enabled } : notif))
    );
  };

  const handleUpdateNotificationTime = (id: string, time: string) => {
    setNotifications((prev) =>
      prev.map(notif => (notif.id === id ? { ...notif, time } : notif))
    );
  };

  // Calculate stats for Dashboard display rings
  const getFardPrayersDoneToday = () => {
    const dayData = prayerLog[currentDate] || {};
    return Object.keys(dayData).filter(p => p !== 'taraweeh' && p !== 'tahajjud' && p !== 'duha' && p !== 'witr' && dayData[p]?.completed).length;
  };

  const getQuranPagesDoneToday = () => {
    return quranLogs
      .filter(l => l.date === currentDate)
      .reduce((sum, l) => sum + (l.endPage - l.startPage + 1), 0);
  };

  const getDhikrTapsToday = (): number => {
    const dayData = dhikrLog[currentDate] || {};
    return (Object.values(dayData) as number[]).reduce((sum, val) => sum + val, 0);
  };

  const getSadaqaDoneToday = () => {
    return sadaqaLogs.filter(l => l.date === currentDate).length;
  };

  const getDuasCountToday = () => {
    let result = 0;
    duaList.forEach(dua => {
      if (dua.timesRead && dua.timesRead[currentDate]) {
        result += dua.timesRead[currentDate];
      }
    });
    return result;
  };

  // Helper to calculate score for a specific offset day (Bento Activity Chart input)
  const getDeedsScoreForDay = (daysOffset: number): { dayLabel: string; percentage: number } => {
    const dateStr = getOffsetDate(daysOffset);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - daysOffset);
    const weekdayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    // 1. Salat progress (max 5)
    const dayPrayers = prayerLog[dateStr] || {};
    const salatCompletedCount = Object.keys(dayPrayers).filter(key => {
      const p = dayPrayers[key];
      return p && !p.isSunnah && p.completed;
    }).length;
    const salatScore = (salatCompletedCount / 5) * 100;

    // 2. Quran pages progress (max 10 pages daily target benchmark)
    const quranPages = quranLogs
      .filter(l => l.date === dateStr)
      .reduce((sum, l) => sum + (l.endPage - l.startPage + 1), 0);
    const quranScore = quranPages > 0 ? Math.min(100, (quranPages / 10) * 100) : 0;

    // 3. Dhikr counts (max 100 target benchmark)
    const dayDhikr = dhikrLog[dateStr] || {};
    const dhikrCount = (Object.values(dayDhikr) as number[]).reduce((sum, val) => sum + val, 0);
    const dhikrScore = dhikrCount > 0 ? Math.min(100, (dhikrCount / 100) * 100) : 0;

    // 4. Sadaqa count
    const hasSadaqa = sadaqaLogs.some(l => l.date === dateStr);
    const sadaqaScore = hasSadaqa ? 100 : 0;

    // Average score across active categories
    const totalScore = Math.round((salatScore + quranScore + dhikrScore + sadaqaScore) / 4);
    return { dayLabel: weekdayName, percentage: totalScore || 5 };
  };

  const playDashboardClick = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // Ignore
    }
  };

  const handleDashboardDhikrClick = () => {
    playDashboardClick();
    // Increment 'subhanallah' dhikr by 33 repetitions instantly
    handleUpdateDhikrCount(currentDate, 'subhanallah', 33);
  };

  // Determine current Ramadan Phase
  const getRamadanPhase = (day: number) => {
    if (day <= 10) return { label: 'Phase of Mercy (Rehmah) 🌙', desc: 'First 10 days of Divine Blessings and Mercy' };
    if (day <= 20) return { label: 'Phase of Forgiveness (Maghfirah) ✨', desc: 'Middle 10 days of Seeking Remission of Sins' };
    return { label: 'Phase of Protection (Najah) 🤲', desc: 'Last 10 days of deliverance and salvation' };
  };

  const activePhase = getRamadanPhase(ramadanDay);
  const activeQuote = MOHAMMEDAN_QUOTES[currentQuoteIndex];

  // Quick reset all data for user's convenience
  const handleClearAllData = () => {
    if (confirm('Are you absolutely sure you want to clear your local logs? This actions is irreversible.')) {
      localStorage.removeItem('ramadan_prayers_v1');
      localStorage.removeItem('ramadan_quran_v1');
      localStorage.removeItem('ramadan_dhikr_v1');
      localStorage.removeItem('ramadan_sadaqa_v1');
      localStorage.removeItem('ramadan_duas_v1');
      localStorage.removeItem('ramadan_notif_v1');
      
      setPrayerLog({});
      setQuranLogs([]);
      setDhikrLog({});
      setSadaqaLogs([]);
      setDuaList(PRESET_DUAS);
      setNotifications(DEFAULT_NOTIFICATIONS);
      alert('Logs reset successfully to factory defaults.');
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'profile', label: 'Profile & Goals', icon: User },
    { id: 'salat', label: 'Salat', icon: Sun },
    { id: 'quran', label: 'Quran', icon: BookOpen },
    { id: 'dhikr', label: 'Tasbih', icon: Moon },
    { id: 'dua', label: 'Duas', icon: Heart },
    { id: 'sadaqa', label: 'Sadaqa', icon: Gift },
    { id: 'analytics', label: 'Analytics', icon: Award },
    { id: 'settings', label: 'Reminders', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-[#0B1E19] text-[#E8C98B] flex flex-col font-sans selection:bg-[#E8C98B] selection:text-[#0B1E19]" id="main-container">
      {/* Dynamic Alert Banner overlay */}
      <AnimatePresence>
        {activeAlert && (
          <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-4" id="floating-alarm-popup">
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-sm bg-[#1B3B32] border border-[#E8C98B]/30 rounded-3xl shadow-2xl p-5 relative overflow-hidden backdrop-blur-lg"
            >
              {/* Decorative ambient pulsing ring */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#E8C98B]/10 animate-pulse pointer-events-none" />

              <div className="flex items-start gap-3">
                <div className="text-3xl">🕌</div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-sm font-bold text-[#E8C98B] font-serif">Spiritual Reminder Alert</h4>
                  <p className="text-xs font-semibold text-slate-100 mt-1 leading-snug">{activeAlert.title}</p>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{activeAlert.description}</p>
                </div>
                <button
                  id="close-active-alarm-btn"
                  onClick={() => setActiveAlert(null)}
                  className="p-1 text-[#E8C98B]/50 hover:text-[#E8C98B] hover:bg-[#143028] rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  id="dismiss-alarm-btn"
                  onClick={() => setActiveAlert(null)}
                  className="bg-[#E8C98B] hover:bg-[#E8C98B]/90 text-[#0B1E19] px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Dismiss Reminders
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Top Header Navigation */}
      <header className="border-b border-[#E8C98B]/10 bg-[#0B1E19]/95 backdrop-blur-md sticky top-0 z-30" id="main-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-2xl bg-[#E8C98B] flex items-center justify-center font-serif text-xl font-bold shadow-md text-[#0B1E19]">
              🌙
            </div>
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-serif italic text-[#E8C98B] tracking-wide leading-none">Noor Ramadan</h1>
              <span className="text-[10px] text-[#A98E64] tracking-widest font-mono font-semibold uppercase">Spiritual Deeds Tracker</span>
            </div>
          </div>

          {/* Simulated Calendar Controls */}
          <div className="flex items-center gap-3">
            <div className="flex bg-[#143028] border border-[#E8C98B]/15 rounded-xl h-10 overflow-hidden items-center text-xs text-[#E8C98B]">
              <span className="px-3 text-[#A98E64] font-medium uppercase tracking-wider text-[10px]">Active Day:</span>
              <select
                id="ramadan-day-selector"
                value={ramadanDay}
                onChange={(e) => setRamadanDay(parseInt(e.target.value) || 1)}
                className="bg-[#1B3B32] border-l border-[#E8C98B]/15 h-full px-3 text-[#E8C98B] font-semibold outline-none cursor-pointer"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>Ramadan {i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Inspirational Banner Block */}
      <section className="bg-[#0B1E19] border-b border-[#E8C98B]/10 py-6" id="hero-banner-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono bg-[#E8C98B]/10 text-[#E8C98B] font-bold tracking-widest border border-[#E8C98B]/20 px-2.5 py-0.5 rounded-full inline-block">
                🕌 Ramadan AH 1447
              </span>
              <span className="text-[10px] text-[#A98E64] font-mono">System Date: {currentDate}</span>
            </div>

            <h2 className="text-2xl font-serif italic text-[#E8C98B] tracking-wide mt-2">
              {activePhase.label}
            </h2>
            <p className="text-xs text-[#A98E64] mt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#E8C98B] flex-shrink-0" />
              <span>{activePhase.desc}</span>
            </p>
          </div>

          {/* Quote Section on Rotation */}
          <div className="w-full md:max-w-md bg-[#1B3B32] border border-[#E8C98B]/10 rounded-2xl p-4 flex items-start gap-3 text-left">
            <div className="text-3xl text-[#E8C98B] font-serif flex-shrink-0">“</div>
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xs text-[#E8C98B]/90 italic leading-relaxed"
                >
                  {activeQuote.quotes}
                </motion.p>
              </AnimatePresence>
              <p className="text-[10px] text-[#A98E64] font-semibold mt-1.5">
                — {activeQuote.author} <span className="opacity-60">({activeQuote.source})</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout splits to horizontal navigation on Desktop, top scrolling bar on mobile */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Responsive Desktop Navigation and Mobile Nav Bar */}
        <aside className="w-full lg:w-56 flex-shrink-0" id="navigation-sidebar">
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 lg:gap-2 border-b lg:border-b-0 border-[#E8C98B]/10 lg:sticky lg:top-24" id="navigation-pills">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-pill-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-3 rounded-2xl text-xs font-medium whitespace-nowrap lg:whitespace-normal transition-all duration-300 cursor-pointer flex items-center gap-3 select-none border border-transparent ${
                    isSelected
                      ? 'bg-[#E8C98B] text-[#0B1E19] font-bold shadow-lg border-[#E8C98B]/20'
                      : 'text-[#E8C98B]/85 bg-[#143028] hover:bg-[#1B3B32]/70 hover:text-[#E8C98B] border-[#E8C98B]/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:block border-t border-[#E8C98B]/15 mt-8 pt-6">
            <button
              id="clear-logs-btn"
              onClick={handleClearAllData}
              className="w-full bg-[#143028] hover:bg-rose-950/40 border border-[#E8C98B]/10 hover:border-rose-500/30 text-[#A98E64] hover:text-rose-300 font-bold py-2.5 px-3 rounded-2xl text-[10px] uppercase tracking-widest transition cursor-pointer"
            >
              Reset local logs
            </button>
          </div>
        </aside>

        {/* Core Component Views switcher */}
        <section className="flex-1 min-w-0" id="core-view-space">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="focus:outline-none"
            >
              
              {/* SCREEN 1: Dashboard overview */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 text-left" id="dashboard-tab">
                  
                  {/* Main Bento Grid layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="dashboard-bento-grid">
                    
                    {/* 1. Quran Progress Card - col-span-5 flex flex-col justify-between */}
                    <div 
                      onClick={() => setActiveTab('quran')}
                      className="md:col-span-12 lg:col-span-5 bg-[#143028] rounded-3xl p-6 border border-[#E8C98B]/15 flex flex-col justify-between hover:border-[#E8C98B]/35 transition duration-300 cursor-pointer text-left overflow-hidden min-h-[300px]"
                      id="bento-quran-card"
                    >
                      <div>
                        <span className="px-3 py-1 bg-[#E8C98B]/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#E8C98B] border border-[#E8C98B]/20">
                          Reading Quran
                        </span>
                        <h2 className="text-3xl font-serif italic text-[#E8C98B] mt-4">Khatm Campaign</h2>
                        <p className="text-[#A98E64] text-xs mt-1.5 leading-relaxed">
                          Currently completed <span className="text-white font-mono font-bold">{getQuranPagesDoneToday()}</span> pages today of the 604 page target.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="w-full bg-[#0B1E19]/80 h-20 rounded-2xl flex items-center px-4 space-x-3 border border-[#E8C98B]/5">
                           <div className="w-12 h-12 bg-[#E8C98B] rounded-full flex items-center justify-center text-[#0B1E19] shadow-md flex-shrink-0">
                             <BookOpen className="w-5 h-5 animate-pulse" />
                           </div>
                           <div className="min-w-0">
                             <p className="text-[10px] text-[#A98E64] uppercase tracking-wider font-bold">Total Quran recited</p>
                             <p className="text-[11px] font-medium text-[#E8C98B] truncate">Logged {quranLogs.reduce((sum, log) => sum + (log.endPage - log.startPage + 1), 0)} standard pages</p>
                           </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-[#A98E64]">
                            <span>TOTAL KHATM PERCENTAGE</span>
                            <span className="font-mono font-bold text-[#E8C98B]">{Math.round((quranLogs.reduce((sum, log) => sum + (log.endPage - log.startPage + 1), 0) / 604) * 100)}%</span>
                          </div>
                          <div className="w-full bg-[#0B1E19] h-2 rounded-full overflow-hidden border border-[#E8C98B]/10">
                            <div 
                              className="bg-[#E8C98B] h-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.round((quranLogs.reduce((sum, log) => sum + (log.endPage - log.startPage + 1), 0) / 604) * 100))}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Salat Tracker Card - col-span-4 (High contrast golden-accent plate!) */}
                    <div 
                      onClick={() => setActiveTab('salat')}
                      className="md:col-span-12 lg:col-span-4 bg-[#E8C98B] text-[#0B1E19] rounded-3xl p-6 flex flex-col justify-between hover:scale-[1.01] transition duration-300 cursor-pointer text-left shadow-lg"
                      id="bento-salat-card"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-[#0B1E19]/10 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#0B1E19]/10">
                            Salat Check
                          </span>
                          <span className="text-2xl font-serif italic text-[#0B1E19] font-extrabold">{getFardPrayersDoneToday()}/5</span>
                        </div>
                        
                        <div className="space-y-2">
                          {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((pId) => {
                            const completed = prayerLog[currentDate]?.[pId]?.completed || false;
                            return (
                              <div key={pId} className="flex justify-between items-center py-2 border-b border-[#0B1E19]/10">
                                <span className="font-bold text-xs capitalize leading-none">{pId}</span>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${completed ? 'bg-[#0B1E19] text-[#E8C98B]' : 'border border-[#0B1E19]/30'}`}>
                                  {completed && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-[#0B1E19]/10 text-[10px] uppercase font-bold tracking-widest opacity-85 flex items-center justify-between">
                        <span>Click to log prayers</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* 3. Dua of the Day Card - col-span-3 */}
                    <div 
                      onClick={() => setActiveTab('dua')}
                      className="md:col-span-12 lg:col-span-3 bg-[#1B3B32] rounded-3xl p-6 border border-[#E8C98B]/10 hover:border-[#E8C98B]/30 transition duration-300 cursor-pointer text-left flex flex-col justify-between min-h-[220px]"
                      id="bento-dua-card"
                    >
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#A98E64] font-bold">Dua of the Day</p>
                        <p className="text-sm italic font-serif text-[#E8C98B] mt-4 leading-relaxed font-semibold">
                          "Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire."
                        </p>
                      </div>
                      <p className="text-[10px] mt-4 text-[#A98E64] font-bold">[Al-Baqarah 2:201]</p>
                    </div>

                    {/* 4. Deeds Activity Weekly Chart - col-span-3 */}
                    <div 
                      onClick={() => setActiveTab('analytics')}
                      className="md:col-span-12 lg:col-span-3 bg-[#143028] rounded-3xl p-6 border border-[#E8C98B]/10 hover:border-[#E8C98B]/30 transition duration-300 cursor-pointer text-left flex flex-col justify-between"
                      id="bento-chart-card"
                    >
                      <div>
                        <h3 className="text-[10px] uppercase tracking-widest text-[#A98E64] font-bold mb-6">Deeds Activity</h3>
                        
                        <div className="flex items-end justify-between space-x-2 px-1 h-32">
                          {[6, 5, 4, 3, 2, 1, 0].map((offset) => {
                            const details = getDeedsScoreForDay(offset);
                            return (
                              <div key={offset} className="w-full flex flex-col items-center group relative">
                                <div 
                                  className={`w-full rounded-t-md transition-all duration-300 ${offset === 0 ? 'bg-[#E8C98B]' : 'bg-[#E8C98B]/20 group-hover:bg-[#E8C98B]/40'}`} 
                                  style={{ height: `${details.percentage}%` }}
                                ></div>
                                <span className={`text-[8px] mt-2 ${offset === 0 ? 'text-[#E8C98B] font-bold' : 'text-[#A98E64] font-semibold'}`}>
                                  {details.dayLabel.slice(0, 3)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-5 border-t border-[#E8C98B]/10">
                        <p className="text-xs text-[#E8C98B]/90 leading-relaxed font-semibold">
                          Your spirit is growing. Click to view full completion metrics.
                        </p>
                      </div>
                    </div>

                    {/* 5. Interactive Dhikr Counter Card - col-span-4 */}
                    <div 
                      onClick={handleDashboardDhikrClick}
                      className="md:col-span-12 lg:col-span-4 bg-[#0B1E19] rounded-3xl p-6 border-2 border-[#E8C98B]/35 flex flex-col items-center justify-between text-center select-none group cursor-pointer active:scale-[0.98] transition min-h-[300px]"
                      id="bento-dhikr-card"
                    >
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#A98E64] font-bold mb-2">Interactive Quick Tasbih</p>
                        <h4 className="text-lg font-serif italic text-[#E8C98B] font-semibold">Subhan-Allahi wa bi-hamdihi</h4>
                        <p className="text-[10px] text-[#A98E64] mt-1 uppercase font-bold tracking-widest">TAP ANYWHERE TO REPEAT (+33)</p>
                      </div>
                      
                      <div className="relative w-32 h-32 flex items-center justify-center my-4">
                        <svg className="absolute w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="44" fill="none" stroke="#E8C98B" strokeOpacity="0.1" strokeWidth="5" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="44" 
                            fill="none" 
                            stroke="#E8C98B" 
                            strokeWidth="5" 
                            strokeDasharray="276" 
                            strokeDashoffset={276 - (276 * Math.min(100, ((getDhikrTapsToday() % 100) / 100) * 100)) / 100} 
                            strokeLinecap="round" 
                            className="transition-all duration-300"
                          />
                        </svg>
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-4xl font-mono text-[#E8C98B] font-bold tracking-tighter">{getDhikrTapsToday()}</span>
                          <span className="text-[8px] uppercase tracking-wider text-[#A98E64] font-semibold mt-0.5">Taps Today</span>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-[#E8C98B]/75 font-bold uppercase tracking-wider mt-1">
                        Daily Repetition Scale
                      </p>
                    </div>

                    {/* 6. Sadaqa Goal Card - col-span-5 */}
                    <div 
                      onClick={() => setActiveTab('sadaqa')}
                      className="md:col-span-12 lg:col-span-5 bg-[#1B3B32] rounded-3xl p-6 border border-[#E8C98B]/10 hover:border-[#E8C98B]/30 transition duration-300 cursor-pointer text-left flex items-center justify-between min-h-[140px]"
                      id="bento-sadaqa-card"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-[#A98E64] font-bold mb-1">Sadaqa Tracking Goal</p>
                        <p className="text-3xl font-serif italic text-[#E8C98B]">${sadaqaLogs.filter(log => log.type === 'money' && log.amount).reduce((sum, log) => sum + (log.amount || 0), 0).toFixed(2)}</p>
                        <p className="text-xs text-[#A98E64] mt-1 font-semibold">Logged {sadaqaLogs.length} deeds of kindness and charity</p>
                      </div>
                      <div className="w-14 h-14 bg-[#E8C98B]/10 rounded-2xl flex items-center justify-center text-[#E8C98B] border border-[#E8C98B]/15 flex-shrink-0">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                    </div>

                  </div>

                  {/* Highlights section with Quick Reminder Feed */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="dashboard-columns">
                    {/* Left block - spiritual quick progress gauge */}
                    <div className="bg-[#143028] border border-[#E8C98B]/10 p-6 rounded-3xl flex flex-col justify-between text-left">
                      <div>
                        <h3 className="font-serif font-semibold text-lg text-[#E8C98B] flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#E8C98B]" /> Today's Spiritual Blueprint
                        </h3>
                        <p className="text-xs text-[#A98E64] mt-1 leading-relaxed">
                          Complete at least one item in each category daily to maintain consistency.
                        </p>
                      </div>

                      <div className="space-y-3.5 my-6" id="quick-blueprint-todos">
                        {/* Salat Todo status check */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B1E19]/70 border border-[#E8C98B]/10">
                          <div className="flex items-center gap-3">
                            <span className="text-lg leading-none">🕌</span>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-[#E8C98B]">Obligatory Prayers</p>
                              {getFardPrayersDoneToday() === 5 ? (
                                <p className="text-[9px] text-[#E8C98B] font-medium">Excellent! Completed all 5 Fard prayers.</p>
                              ) : (
                                <p className="text-[9px] text-[#A98E64]">Logged {getFardPrayersDoneToday()}/5 prayers so far.</p>
                              )}
                            </div>
                          </div>
                          {getFardPrayersDoneToday() === 5 ? (
                            <CheckCircle className="w-5 h-5 text-[#E8C98B]" />
                          ) : (
                            <button
                              id="blueprint-nav-salat"
                              onClick={() => setActiveTab('salat')}
                              className="text-[10px] text-[#E8C98B] hover:underline font-bold"
                            >
                              Log
                            </button>
                          )}
                        </div>

                        {/* Quran Todo status check */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B1E19]/70 border border-[#E8C98B]/10">
                          <div className="flex items-center gap-3">
                            <span className="text-lg leading-none">📖</span>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-[#E8C98B]">Quran Reading Course</p>
                              {getQuranPagesDoneToday() > 0 ? (
                                <p className="text-[9px] text-[#E8C98B] font-medium font-semibold">Praise be to Allah! Read {getQuranPagesDoneToday()} pages.</p>
                              ) : (
                                <p className="text-[9px] text-[#A98E64]">Log pages to maintain Khatm campaign.</p>
                              )}
                            </div>
                          </div>
                          {getQuranPagesDoneToday() > 0 ? (
                            <CheckCircle className="w-5 h-5 text-[#E8C98B]" />
                          ) : (
                            <button
                              id="blueprint-nav-quran"
                              onClick={() => setActiveTab('quran')}
                              className="text-[10px] text-[#E8C98B] hover:underline font-bold"
                            >
                              Log
                            </button>
                          )}
                        </div>

                        {/* Dhikr status check */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B1E19]/70 border border-[#E8C98B]/10">
                          <div className="flex items-center gap-3">
                            <span className="text-lg leading-none">📿</span>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-[#E8C98B]">Adhkar & Tasbih</p>
                              {getDhikrTapsToday() > 0 ? (
                                <p className="text-[9px] text-[#E8C98B] font-medium">Accumulated {getDhikrTapsToday()} repetitions.</p>
                              ) : (
                                <p className="text-[9px] text-[#A98E64]">Increase your scales with morning/evening Dhikr.</p>
                              )}
                            </div>
                          </div>
                          {getDhikrTapsToday() > 0 ? (
                            <CheckCircle className="w-5 h-5 text-[#E8C98B]" />
                          ) : (
                            <button
                              id="blueprint-nav-dhikr"
                              onClick={() => setActiveTab('dhikr')}
                              className="text-[10px] text-[#E8C98B] hover:underline font-bold"
                            >
                              Log
                            </button>
                          )}
                        </div>

                        {/* Sadaqa status check */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B1E19]/70 border border-[#E8C98B]/10">
                          <div className="flex items-center gap-3">
                            <span className="text-lg leading-none">🎁</span>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-[#E8C98B]">Sadaqa & Kindly Gesture</p>
                              {getSadaqaDoneToday() > 0 ? (
                                <p className="text-[9px] text-[#E8C98B] font-medium">Merciful gesture recorded today.</p>
                              ) : (
                                <p className="text-[9px] text-[#A98E64]">Smiles, donations, or helping notes.</p>
                              )}
                            </div>
                          </div>
                          {getSadaqaDoneToday() > 0 ? (
                            <CheckCircle className="w-5 h-5 text-[#E8C98B]" />
                          ) : (
                            <button
                              id="blueprint-nav-sadaqa"
                              onClick={() => setActiveTab('sadaqa')}
                              className="text-[10px] text-[#E8C98B] hover:underline font-bold"
                            >
                              Log
                            </button>
                          )}
                        </div>

                      </div>

                      <div className="bg-[#0B1E19]/50 p-4 rounded-2xl text-[11px] text-[#A98E64] flex items-start gap-2.5 border border-[#E8C98B]/5">
                        <Award className="w-4 h-4 text-[#E8C98B] flex-shrink-0 animate-pulse mt-0.5" />
                        <span>Consistent daily deeds tracking maximizes rewards. Follow up on active navigation items to update variables.</span>
                      </div>
                    </div>

                    {/* Right block - Upcoming notifications & alarms status */}
                    <div className="bg-[#143028] border border-[#E8C98B]/10 p-6 rounded-3xl flex flex-col justify-start text-left">
                      <div className="mb-4 border-b border-[#E8C98B]/10 pb-4">
                        <h3 className="font-serif font-semibold text-lg text-[#E8C98B] flex items-center justify-between">
                          <span>🔔 Task Reminder Feed</span>
                          <button
                            id="dashboard-settings-nav"
                            onClick={() => setActiveTab('settings')}
                            className="text-[10px] text-[#E8C98B] hover:underline font-bold uppercase tracking-wider"
                          >
                            Settings
                          </button>
                        </h3>
                        <p className="text-xs text-[#A98E64] mt-1 leading-relaxed">Upcoming scheduled notification events for today.</p>
                      </div>

                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#0B1E19]">
                        {notifications.filter(n => n.enabled).sort((a,b) => a.time.localeCompare(b.time)).map((notif) => (
                          <div
                            key={notif.id}
                            className="p-3 bg-[#0B1E19]/70 rounded-2xl border border-[#E8C98B]/10 flex justify-between items-center"
                          >
                            <div className="min-w-0 text-left">
                              <h4 className="text-xs font-semibold text-[#E8C98B]">{notif.title}</h4>
                              <p className="text-[10px] text-[#A98E64] truncate mt-0.5 font-medium">{notif.description}</p>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-[#E8C98B] bg-[#E8C98B]/10 px-2.5 py-1 rounded-xl border border-[#E8C98B]/10">
                              {notif.time}
                            </span>
                          </div>
                        ))}

                        {notifications.filter(n => n.enabled).length === 0 && (
                          <div className="text-center py-10 text-[#A98E64]">
                            <p className="text-xs">No active reminders configured.</p>
                            <button
                              id="enable-all-btn"
                              onClick={() => {
                                setNotifications(DEFAULT_NOTIFICATIONS);
                              }}
                              className="text-[#E8C98B] text-[10px] font-bold mt-2 hover:underline tracking-wider uppercase"
                            >
                              Load default presets
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN: Pilgrim Profile & Achievements */}
              {activeTab === 'profile' && (
                <UserProfilePanel
                  currentDate={currentDate}
                  prayerLog={prayerLog}
                  quranLogs={quranLogs}
                  dhikrLog={dhikrLog}
                  sadaqaLogs={sadaqaLogs}
                  duaList={duaList}
                  profileName={profileName}
                  setProfileName={setProfileName}
                  profileAvatar={profileAvatar}
                  setProfileAvatar={setProfileAvatar}
                  goals={goals}
                  onUpdateGoals={handleUpdateGoals}
                />
              )}

              {/* SCREEN 2: Salat Tracker */}
              {activeTab === 'salat' && (
                <SalatTracker
                  currentDate={currentDate}
                  prayerLog={prayerLog}
                  onTogglePrayer={handleTogglePrayer}
                />
              )}

              {/* SCREEN 3: Quran Recitation */}
              {activeTab === 'quran' && (
                <QuranTracker
                  currentDate={currentDate}
                  quranLogs={quranLogs}
                  onAddLog={handleAddQuranLog}
                  onDeleteLog={handleDeleteQuranLog}
                />
              )}

              {/* SCREEN 4: Clicker Tasbih */}
              {activeTab === 'dhikr' && (
                <DhikrTracker
                  currentDate={currentDate}
                  dhikrLog={dhikrLog}
                  onUpdateDhikrCount={handleUpdateDhikrCount}
                />
              )}

              {/* SCREEN 5: Duas Gallery */}
              {activeTab === 'dua' && (
                <DuaGallery
                  currentDate={currentDate}
                  duaList={duaList}
                  onToggleFavorite={handleToggleFavoriteDua}
                  onIncrementReadCount={handleIncrementReadDua}
                  onAddCustomDua={handleAddCustomDua}
                />
              )}

              {/* SCREEN 6: Sadaqa and Good deeds */}
              {activeTab === 'sadaqa' && (
                <SadaqaTracker
                  currentDate={currentDate}
                  sadaqaLogs={sadaqaLogs}
                  onAddSadaqa={handleAddSadaqa}
                  onDeleteSadaqa={handleDeleteSadaqa}
                />
              )}

              {/* SCREEN 7: Analytics charts */}
              {activeTab === 'analytics' && (
                <ProgressCharts
                  prayerLog={prayerLog}
                  dhikrLog={dhikrLog}
                  quranLogs={quranLogs}
                  sadaqaLogs={sadaqaLogs}
                  duaList={duaList}
                />
              )}

              {/* SCREEN 8: Notifications management */}
              {activeTab === 'settings' && (
                <ReminderSettings
                  notifications={notifications}
                  onToggleNotification={handleToggleNotification}
                  onUpdateTime={handleUpdateNotificationTime}
                  onTriggerTestNotification={(notif) => triggerAlarm(notif)}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </section>

      </main>

      {/* Elegant Footer branding of Islamic values */}
      <footer className="border-t border-[#E8C98B]/10 bg-[#0B1E19] py-8 mt-12 text-center" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-center gap-1.5 items-center mb-2">
            <span className="text-[#E8C98B]">✨</span>
            <span className="text-xs font-serif italic text-[#E8C98B]/80">"May your fasting, prayers and charitable efforts be bountifully accepted."</span>
            <span className="text-[#E8C98B]">✨</span>
          </div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#A98E64] font-semibold mt-1">
            NOOR RAMADAN BENTO PORTAL — RAMADAN 1447 AH
          </p>
        </div>
      </footer>
    </div>
  );
}
