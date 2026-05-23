/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PrayerLog {
  [date: string]: {
    [prayer: string]: {
      completed: boolean;
      time?: string; // e.g., '18:35'
      isSunnah?: boolean;
    };
  };
}

export interface DhikrLog {
  [date: string]: {
    [dhikrId: string]: number; // Accumulated count for that dhikr on that date
  };
}

export interface QuranLog {
  id: string;
  date: string;
  startPage: number;
  endPage: number;
  surahStart?: string;
  surahEnd?: string;
  notes?: string;
}

export interface SadaqaLog {
  id: string;
  date: string;
  type: 'money' | 'food' | 'volunteer' | 'kindness' | 'other';
  amount?: number; // Optional monetary value
  description: string;
}

export interface DuaItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  category: 'fasting' | 'evening' | 'morning' | 'forgiveness' | 'protection' | 'general' | 'custom';
  timesRead: { [date: string]: number };
  favorite?: boolean;
  isCustom?: boolean;
}

export interface DhikrItem {
  id: string;
  phrase: string;
  arabic: string;
  translation: string;
  defaultTarget: number;
  category: string;
}

export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  time: string; // HH:MM
  enabled: boolean;
  taskType: 'salat' | 'sadaqa' | 'dhikr' | 'dua' | 'quran';
}

export interface MonthlyDeedProgress {
  date: string; // YYYY-MM-DD
  salatPercentage: number;
  quranPagesRead: number;
  dhikrCount: number;
  sadaqaDone: boolean;
  duaCompleted: boolean;
  score: number; // calculated spiritual value
}

// Preset Dhikr Dhikr list
export const PRESET_DHIKR: DhikrItem[] = [
  {
    id: 'subhanallah',
    phrase: 'Subhan Allah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    translation: 'Glory be to Allah',
    defaultTarget: 33,
    category: 'Daily'
  },
  {
    id: 'alhamdulillah',
    phrase: 'Alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    translation: 'Praise be to Allah',
    defaultTarget: 33,
    category: 'Daily'
  },
  {
    id: 'allahuakbar',
    phrase: 'Allahu Akbar',
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    defaultTarget: 34,
    category: 'Daily'
  },
  {
    id: 'astaghfirullah',
    phrase: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    translation: 'I seek forgiveness from Allah',
    defaultTarget: 100,
    category: 'Forgiveness'
  },
  {
    id: 'la_ilaha_illallah',
    phrase: 'La ilaha illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    translation: 'There is no deity except Allah',
    defaultTarget: 100,
    category: 'Declaration'
  },
  {
    id: 'salawat',
    phrase: 'Salawat on the Prophet (pbuh)',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ',
    translation: 'O Allah, send blessings upon Muhammad and the family of Muhammad',
    defaultTarget: 100,
    category: 'Blessings'
  },
  {
    id: 'subhanallahi_wa_bihamdihi',
    phrase: 'Subhanallahi wa bihamdihi',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    translation: 'Glory be to Allah, and all praise is for Him',
    defaultTarget: 100,
    category: 'Daily'
  }
];

// Preset Ramadan and Daily Duas
export const PRESET_DUAS: DuaItem[] = [
  {
    id: 'dua-iftar',
    title: 'Dua for Breaking the Fast (Iftar)',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Dhahaba-dh-dhama\'u, wabtallati-l-\'urooqu, wa thabata-l-ajru in sha\'a-llah.',
    translation: 'The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
    reference: 'Abu Dawud',
    category: 'fasting',
    timesRead: {}
  },
  {
    id: 'dua-suhoor',
    title: 'Intention for Starting the Fast (Suhoor)',
    arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: 'Wa bi-sawmi ghadin nawaytu min shahri ramadhan.',
    translation: 'I intend to keep the fast tomorrow in the month of Ramadan.',
    reference: 'Traditional',
    category: 'fasting',
    timesRead: {}
  },
  {
    id: 'dua-laylatul-qadr',
    title: 'Dua for Laylatul Qadr',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: 'Allahumma innaka \'afuwwun, tuhibbul-\'afwa, fa\'fu \'annee.',
    translation: 'O Allah, indeed You are forgiving and You love forgiveness, so forgive me.',
    reference: 'Tirmidhi',
    category: 'forgiveness',
    timesRead: {}
  },
  {
    id: 'dua-parents',
    title: 'Dua for Parents',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbi-rhamhuma kama rabbayanee sagheera.',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
    reference: 'Surah Al-Isra, 17:24',
    category: 'general',
    timesRead: {}
  },
  {
    id: 'dua-guidance',
    title: 'Dua for Constant Guidance',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
    transliteration: 'Rabbana la tuzigh quloobana ba\'da idh hadaytana wa hab lana mil-ladunka rahmah, innaka antal-wahhab.',
    translation: 'Our Lord, let not our hearts deviate after You have guided us, and grant us from Yourself mercy. Indeed, You are the Bestower.',
    reference: 'Surah Ali \'Imran, 3:8',
    category: 'general',
    timesRead: {}
  },
  {
    id: 'dua-forgiveness-short',
    title: 'Sayyid al-Istighfar (The Master of Forgiveness)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: 'Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana \'abduka, wa ana \'ala \'ahdika wa wa\'dika ma-stata\'tu. A\'oodhu bika min sharri ma sana\'tu, aboo\'u laka bini\'matika \'alayya, wa aboo\'u laka bidhanbee faghfir lee fainnahu la yaghfiru-dh-dhunooba illa anta.',
    translation: 'O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant, and I am abiding by Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge to You Your blessing upon me, and I acknowledge my sin, so forgive me, for indeed, none can forgive sins except You.',
    reference: 'Sahih Al-Bukhari',
    category: 'forgiveness',
    timesRead: {}
  }
];

// Default notification settings
export const DEFAULT_NOTIFICATIONS: NotificationSetting[] = [
  {
    id: 'notif-fajr',
    title: 'Fajr Prayer',
    description: 'Prepare for Fajr prayer and morning Dhikr',
    time: '04:45',
    enabled: true,
    taskType: 'salat'
  },
  {
    id: 'notif-dhuhr',
    title: 'Dhuhr Prayer Reminder',
    description: 'Time to take a midday break to connect with Allah',
    time: '12:30',
    enabled: true,
    taskType: 'salat'
  },
  {
    id: 'notif-asr',
    title: 'Asr Prayer Reminder',
    description: 'Protect your afternoon Salat',
    time: '15:45',
    enabled: true,
    taskType: 'salat'
  },
  {
    id: 'notif-maghrib',
    title: 'Maghrib & Fast-Breaking',
    description: 'Recite the Iftar Dua and prepare for Maghrib Salat',
    time: '18:30',
    enabled: true,
    taskType: 'salat'
  },
  {
    id: 'notif-isha',
    title: 'Isha & Taraweeh Prayers',
    description: 'Conclude your day with prayer, Taraweeh, and Quran reading',
    time: '20:00',
    enabled: true,
    taskType: 'salat'
  },
  {
    id: 'notif-quran',
    title: 'Daily Quran Recitation',
    description: 'Dedicate some time to read and reflect on the Holy Quran',
    time: '09:00',
    enabled: true,
    taskType: 'quran'
  },
  {
    id: 'notif-dhikr',
    title: 'Afternoon Dhikr Session',
    description: 'Elevate your day by chanting beautiful words of remembrance',
    time: '17:00',
    enabled: true,
    taskType: 'dhikr'
  },
  {
    id: 'notif-sadaqa',
    title: 'Daily Charity (Sadaqa)',
    description: 'Have you made a contribution, smiled or helped someone today?',
    time: '10:00',
    enabled: false,
    taskType: 'sadaqa'
  }
];

// List of Quran Surahs for user selection
export const QURAN_SURAHS = [
  { number: 1, name: 'Al-Fatihah', pages: '1-1' },
  { number: 2, name: 'Al-Baqarah', pages: '2-49' },
  { number: 3, name: 'Ali \'Imran', pages: '50-76' },
  { number: 4, name: 'An-Nisa', pages: '77-106' },
  { number: 5, name: 'Al-Ma\'idah', pages: '106-127' },
  { number: 6, name: 'Al-An\'am', pages: '128-150' },
  { number: 7, name: 'Al-A\'raf', pages: '151-176' },
  { number: 8, name: 'Al-Anfal', pages: '177-186' },
  { number: 9, name: 'At-Tawbah', pages: '187-207' },
  { number: 10, name: 'Yunus', pages: '208-221' },
  { number: 11, name: 'Hud', pages: '221-235' },
  { number: 12, name: 'Yusuf', pages: '235-248' },
  { number: 13, name: 'Ar-Ra\'d', pages: '249-255' },
  { number: 14, name: 'Ibrahim', pages: '255-261' },
  { number: 15, name: 'Al-Hijr', pages: '262-267' },
  { number: 16, name: 'An-Nahl', pages: '267-281' },
  { number: 17, name: 'Al-Isra', pages: '282-293' },
  { number: 18, name: 'Al-Kahf', pages: '293-304' },
  { number: 19, name: 'Maryam', pages: '305-312' },
  { number: 20, name: 'Ta-Ha', pages: '312-321' },
  { number: 21, name: 'Al-Anbiya', pages: '322-331' },
  { number: 22, name: 'Al-Hajj', pages: '332-341' },
  { number: 23, name: 'Al-Mu\'minun', pages: '342-349' },
  { number: 24, name: 'An-Nur', pages: '350-359' },
  { number: 25, name: 'Al-Furqan', pages: '359-366' },
  { number: 26, name: 'Ash-Shu\'ara', pages: '367-376' },
  { number: 27, name: 'An-Naml', pages: '377-385' },
  { number: 28, name: 'Al-Qasas', pages: '385-396' },
  { number: 29, name: 'Al-\'Ankabut', pages: '396-404' },
  { number: 30, name: 'Ar-Rum', pages: '404-410' },
  { number: 31, name: 'Luqman', pages: '411-414' },
  { number: 32, name: 'As-Sajdah', pages: '415-417' },
  { number: 33, name: 'Al-Ahzab', pages: '418-427' },
  { number: 34, name: 'Saba', pages: '428-434' },
  { number: 35, name: 'Fatir', pages: '434-439' },
  { number: 36, name: 'Ya-Sin', pages: '440-445' },
  { number: 37, name: 'As-Saffat', pages: '446-452' },
  { number: 38, name: 'Sad', pages: '453-458' },
  { number: 39, name: 'Az-Zumar', pages: '458-467' },
  { number: 40, name: 'Ghafir', pages: '467-476' },
  { number: 41, name: 'Fussilat', pages: '476-482' },
  { number: 42, name: 'Ash-Shura', pages: '483-489' },
  { number: 43, name: 'Az-Zukhruf', pages: '489-495' },
  { number: 44, name: 'Ad-Dukhan', pages: '496-498' },
  { number: 45, name: 'Al-Jasiah', pages: '499-502' },
  { number: 46, name: 'Al-Ahqaf', pages: '502-506' },
  { number: 47, name: 'Muhammad', pages: '507-510' },
  { number: 48, name: 'Al-Fath', pages: '511-515' },
  { number: 49, name: 'Al-Hujurat', pages: '515-517' },
  { number: 50, name: 'Qaf', pages: '518-520' },
  { number: 51, name: 'Adh-Dhariyat', pages: '520-523' },
  { number: 52, name: 'At-Tur', pages: '523-525' },
  { number: 53, name: 'An-Najm', pages: '525-527' },
  { number: 54, name: 'Al-Qamar', pages: '528-531' },
  { number: 55, name: 'Ar-Rahman', pages: '531-534' },
  { number: 56, name: 'Al-Waqi\'ah', pages: '534-537' },
  { number: 57, name: 'Al-Hadid', pages: '537-541' },
  { number: 58, name: 'Al-Mujadila', pages: '542-545' },
  { number: 59, name: 'Al-Hashr', pages: '545-548' },
  { number: 60, name: 'Al-Mumtahanah', pages: '549-551' },
  { number: 61, name: 'As-Saff', pages: '551-553' },
  { number: 62, name: 'Al-Jumu\'ah', pages: '553-554' },
  { number: 63, name: 'Al-Munafiqun', pages: '554-555' },
  { number: 64, name: 'At-Taghabun', pages: '556-557' },
  { number: 65, name: 'At-Talaq', pages: '558-559' },
  { number: 66, name: 'At-Tahrim', pages: '560-561' },
  { number: 67, name: 'Al-Mulk', pages: '562-564' },
  { number: 68, name: 'Al-Qalam', pages: '564-566' },
  { number: 69, name: 'Al-Haqqah', pages: '566-568' },
  { number: 70, name: 'Al-Ma\'arij', pages: '568-570' },
  { number: 71, name: 'Nuh', pages: '570-571' },
  { number: 72, name: 'Al-Jinn', pages: '572-573' },
  { number: 73, name: 'Al-Muzzammil', pages: '574-575' },
  { number: 74, name: 'Al-Muddaththir', pages: '575-577' },
  { number: 75, name: 'Al-Qiyamah', pages: '577-578' },
  { number: 76, name: 'Al-Insan', pages: '578-580' },
  { number: 77, name: 'Al-Mursalat', pages: '580-581' },
  { number: 78, name: 'An-Naba', pages: '582-583' },
  { number: 79, name: 'An-Nazi\'at', pages: '583-584' },
  { number: 80, name: 'Abasa', pages: '585-586' },
  { number: 81, name: 'At-Takwir', pages: '586-587' },
  { number: 82, name: 'Al-Infitar', pages: '587-588' },
  { number: 83, name: 'Al-Mutaffifin', pages: '588-589' },
  { number: 84, name: 'Al-Inshiqaq', pages: '589-590' },
  { number: 85, name: 'Al-Buruj', pages: '590-591' },
  { number: 86, name: 'At-Tariq', pages: '591-592' },
  { number: 87, name: 'Al-A\'la', pages: '592-592' },
  { number: 88, name: 'Al-Ghashiyah', pages: '592-593' },
  { number: 89, name: 'Al-Fajr', pages: '593-594' },
  { number: 90, name: 'Al-Balad', pages: '595-595' },
  { number: 91, name: 'Ash-Shams', pages: '595-596' },
  { number: 92, name: 'Al-Lail', pages: '596-597' },
  { number: 93, name: 'Ad-Duha', pages: '597-597' },
  { number: 94, name: 'Ash-Sharh', pages: '597-597' },
  { number: 95, name: 'At-Tin', pages: '597-598' },
  { number: 96, name: 'Al-Alaq', pages: '598-598' },
  { number: 97, name: 'Al-Qadr', pages: '598-599' },
  { number: 98, name: 'Al-Bayyinah', pages: '599-599' },
  { number: 99, name: 'Az-Zalzalah', pages: '599-600' },
  { number: 100, name: 'Al-Adiyat', pages: '600-600' },
  { number: 101, name: 'Al-Qari\'ah', pages: '600-601' },
  { number: 102, name: 'At-Takathur', pages: '601-601' },
  { number: 103, name: 'Al-Asr', pages: '601-601' },
  { number: 104, name: 'Al-Humazah', pages: '601-602' },
  { number: 105, name: 'Al-Fil', pages: '602-602' },
  { number: 106, name: 'Quraish', pages: '602-602' },
  { number: 107, name: 'Al-Ma\'un', pages: '602-603' },
  { number: 108, name: 'Al-Kauthar', pages: '603-603' },
  { number: 109, name: 'Al-Kafirun', pages: '603-603' },
  { number: 110, name: 'An-Nasr', pages: '603-603' },
  { number: 111, name: 'Al-Masad', pages: '603-604' },
  { number: 112, name: 'Al-Ikhlas', pages: '604-604' },
  { number: 113, name: 'Al-Falaq', pages: '604-604' },
  { number: 114, name: 'An-Nas', pages: '604-604' }
];

export const MOHAMMEDAN_QUOTES = [
  { quotes: "The best charity is that given in Ramadan.", author: "Prophet Muhammad (peace be upon him)", source: "Tirmidhi" },
  { quotes: "Fast is a shield, so the fasting person should avoid obscene speech and ignorant behavior.", author: "Prophet Muhammad (peace be upon him)", source: "Bukhari & Muslim" },
  { quotes: "When the month of Ramadan starts, the gates of the heaven are opened and the gates of Hell are closed and the devils are chained.", author: "Prophet Muhammad (peace be upon him)", source: "Bukhari" },
  { quotes: "He who fasts Ramadan out of sincere faith and hoping for reward, all his previous sins will be forgiven.", author: "Prophet Muhammad (peace be upon him)", source: "Bukhari & Muslim" },
  { quotes: "Take Suhoor, for in Suhoor there is blessing.", author: "Prophet Muhammad (peace be upon him)", source: "Bukhari" },
  { quotes: "Indeed, Allah has a group of angels who travel around seeking out gatherings of Dhikr.", author: "Prophet Muhammad (peace be upon him)", source: "Bukhari" }
];
