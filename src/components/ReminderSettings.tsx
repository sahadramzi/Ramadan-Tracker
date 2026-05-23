/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, BellOff, Play, Shield, AlarmClock } from 'lucide-react';
import { NotificationSetting } from '../types';

interface ReminderSettingsProps {
  notifications: NotificationSetting[];
  onToggleNotification: (id: string) => void;
  onUpdateTime: (id: string, time: string) => void;
  onTriggerTestNotification: (notif: NotificationSetting) => void;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  notifications,
  onToggleNotification,
  onUpdateTime,
  onTriggerTestNotification
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const requestNativePermissions = () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    Notification.requestPermission().then((status) => {
      setPermissionStatus(status);
    });
  };

  const getTaskIcon = (type: NotificationSetting['taskType']) => {
    switch (type) {
      case 'salat':
        return 'Fajr 🕌';
      case 'quran':
        return 'Hafidh 📖';
      case 'dhikr':
        return 'Tasbih 📿';
      case 'dua':
        return 'Supplication 🤲';
      default:
        return 'Grace ❤️';
    }
  };

  return (
    <div className="bg-[#143028] backdrop-blur-md rounded-3xl border border-[#E8C98B]/10 p-6 md:p-8 shadow-xl text-left" id="notifications-settings-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#E8C98B]/10 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-[#E8C98B] flex items-center gap-2">
            <span className="text-2xl">⏰</span> Supplication & Task Reminders
          </h2>
          <p className="text-xs text-[#A98E64] mt-1 leading-relaxed font-semibold">
            Toggle notifications for prayers, charity alerts, Quran time, and evening remembrance
          </p>
        </div>
      </div>

      {/* Permissions banner */}
      <div className="bg-[#0B1E19]/80 p-5 rounded-3xl border border-[#E8C98B]/15 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="native-notif-permissions">
        <div className="flex items-start gap-4 text-left">
          <div className="p-2.5 rounded-xl bg-[#E8C98B]/10 border border-[#E8C98B]/20 text-[#E8C98B] mt-0.5 flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#E8C98B] font-serif">Desktop System Notifications</h4>
            <p className="text-xs text-[#A98E64]/90 mt-1 max-w-lg leading-relaxed font-medium">
              Enable native system notifications to receive alerts on your computer or telephone, even when browsing other screens.
            </p>
            <div className="mt-2.5 flex items-center gap-2 text-[10px] font-mono font-bold">
              <span className="text-[#A98E64]">Status:</span>
              {permissionStatus === 'granted' && (
                <span className="text-[#E8C98B] bg-[#E8C98B]/10 border border-[#E8C98B]/15 px-2.5 py-0.5 rounded-md uppercase">● Granted / Allowed</span>
              )}
              {permissionStatus === 'denied' && (
                <span className="text-rose-400 bg-rose-950/20 px-2.5 py-0.5 rounded-md uppercase">● Denied / Blocked</span>
              )}
              {(permissionStatus === 'default' || permissionStatus === 'unsupported') && (
                <span className="text-[#E8C98B]/80 bg-[#143028] px-2.5 py-0.5 rounded-md uppercase">● Pending approval</span>
              )}
            </div>
          </div>
        </div>

        {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
          <button
            id="grant-notif-permission-btn"
            onClick={requestNativePermissions}
            className="w-full sm:w-auto bg-[#E8C98B] text-[#0B1E19] text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition select-none flex items-center justify-center gap-1.5 shadow-md active:scale-95"
          >
            Enable System Alerts
          </button>
        )}
      </div>

      {/* Grid of notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="notifications-grid">
        {notifications.map((notif) => {
          const isEnabled = notif.enabled;

          return (
            <div
              key={notif.id}
              id={`notif-card-${notif.id}`}
              className={`p-4 rounded-2xl border transition-all ${
                isEnabled
                  ? 'bg-[#0B1E19] border-[#E8C98B]/20 shadow-md'
                  : 'bg-[#0B1E19]/45 border-[#E8C98B]/5 opacity-60'
              } flex items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0 text-left">
                <div className="text-xs font-bold font-mono px-2 py-1.5 rounded-lg bg-[#143028] text-[#E8C98B] flex-shrink-0 border border-[#E8C98B]/10">
                  {getTaskIcon(notif.taskType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                    <span className="text-[9px] text-[#A98E64] uppercase tracking-wider font-mono font-bold">
                      ({notif.taskType})
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A98E64] mt-1 truncate leading-relaxed font-semibold">
                    {notif.description}
                  </p>
                  
                  {/* Time Config setting */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[10px] text-[#A98E64] font-bold">Trigger Time:</span>
                    <input
                      id={`time-notif-${notif.id}`}
                      type="time"
                      value={notif.time}
                      onChange={(e) => onUpdateTime(notif.id, e.target.value)}
                      disabled={!isEnabled}
                      className="bg-[#143028] border border-[#E8C98B]/15 rounded-lg px-2 py-0.5 text-xs text-white outline-none focus:border-[#E8C98B] font-mono disabled:opacity-40 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Controls Toggle & Test */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Instant Demo Alert Trigger */}
                <button
                  id={`test-trigger-btn-${notif.id}`}
                  onClick={() => onTriggerTestNotification(notif)}
                  className="p-2 hover:bg-[#143028] text-[#A98E64] hover:text-[#E8C98B] rounded-xl transition cursor-pointer"
                  title="Test alarm alert"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>

                {/* Main Alarm Toggle */}
                <button
                  id={`toggle-notif-btn-${notif.id}`}
                  onClick={() => onToggleNotification(notif.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                    isEnabled
                      ? 'bg-[#E8C98B]/10 border-[#E8C98B]/30 text-[#E8C98B]'
                      : 'bg-[#143028] border-[#E8C98B]/10 text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-[#0B1E19]/50 border border-[#E8C98B]/10 rounded-2xl p-4 flex items-start gap-2.5 text-left">
        <AlarmClock className="w-4 h-4 text-[#E8C98B] flex-shrink-0 mt-0.5 animate-pulse" />
        <p className="text-[11px] text-[#A98E64] leading-normal font-medium">
          <span className="font-bold text-slate-200">How Reminders Work:</span> Standard in-app notifications run continuously inside the active tab. When the scheduled clock matches, a beautiful spiritual reminder and gentle audio tone triggers directly in the dashboard margin. If desk alert privileges are authorized (above), native system buzz alarms will also raise. Click any play trigger (<Play className="w-3 h-3 inline text-[#E8C98B]" />) at the right of cards to test instantly!
        </p>
      </div>
    </div>
  );
};
