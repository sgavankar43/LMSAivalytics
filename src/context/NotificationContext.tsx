'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { BroadcastNotification } from '@/types';
import { initialBroadcasts } from '@/data/adminMockData';
import { useAuth } from '@/context/AuthContext';

export interface LMSNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  unread: boolean;
  type: 'broadcast' | 'system' | 'session' | 'ticket';
  targetType: 'all' | 'course' | 'individual';
  targetValue?: string;
  broadcastId?: string;
  createdAt: number;
}

interface NotificationContextType {
  broadcasts: BroadcastNotification[];
  notifications: LMSNotification[];
  unreadCount: number;
  sendBroadcast: (data: Omit<BroadcastNotification, 'id' | 'sentAt' | 'readCount'>) => BroadcastNotification;
  deleteBroadcast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  activeAlert: LMSNotification | null;
  dismissAlert: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const BROADCASTS_STORAGE_KEY = 'aivalytics_broadcasts_v1';
const READ_NOTIFICATIONS_KEY = 'aivalytics_read_notifications_v1';
const DISMISSED_NOTIFICATIONS_KEY = 'aivalytics_dismissed_notifications_v1';
const CHANNEL_NAME = 'aivalytics_lms_broadcast_channel';

// Default static system notifications
const initialSystemNotifications: LMSNotification[] = [
  {
    id: 'sys_notif_1',
    title: 'Session Live Now',
    message: 'Session 2: Grading & Evaluation is currently active in Academic Information.',
    time: 'Just now',
    priority: 'Urgent',
    unread: true,
    type: 'session',
    targetType: 'all',
    createdAt: Date.now() - 5 * 60 * 1000,
  },
  {
    id: 'sys_notif_2',
    title: 'Support Ticket Updated',
    message: 'Faculty responded to ticket TKT-8492 on Research Design quiz access.',
    time: '2 hours ago',
    priority: 'Important',
    unread: true,
    type: 'ticket',
    targetType: 'all',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'sys_notif_3',
    title: 'Certificate Ready to Download',
    message: 'Foundations of Modern Data Literacy certificate is verified & available to download.',
    time: '1 day ago',
    priority: 'Normal',
    unread: false,
    type: 'system',
    targetType: 'all',
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
  },
];

// Web Audio API notification chime generator (zero external assets needed)
const playNotificationChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant two-tone chime: D5 (587Hz) then A5 (880Hz)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio autoplay restrictions
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Broadcasts state
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(BROADCASTS_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.error('Failed to load broadcasts from localStorage', err);
      }
    }
    return initialBroadcasts;
  });

  // Read notifications set (notificationId -> boolean)
  const [readIds, setReadIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(READ_NOTIFICATIONS_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.error('Failed to load read notifications from localStorage', err);
      }
    }
    return { sys_notif_3: true };
  });

  // Dismissed notifications set
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.error('Failed to load dismissed notifications from localStorage', err);
      }
    }
    return {};
  });

  // Active incoming alert for real-time pop-up notification
  const [activeAlert, setActiveAlert] = useState<LMSNotification | null>(null);

  // Sync broadcasts to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(broadcasts));
      } catch (err) {
        console.error('Failed to persist broadcasts to localStorage', err);
      }
    }
  }, [broadcasts]);

  // Sync read state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readIds));
      } catch (err) {
        console.error('Failed to persist read notifications to localStorage', err);
      }
    }
  }, [readIds]);

  // Sync dismissed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(dismissedIds));
      } catch (err) {
        console.error('Failed to persist dismissed notifications to localStorage', err);
      }
    }
  }, [dismissedIds]);

  // Real-time cross-tab / cross-window BroadcastChannel Pub/Sub
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_BROADCAST' && event.data?.payload) {
          const newBc: BroadcastNotification = event.data.payload;
          setBroadcasts((prev) => {
            if (prev.some((b) => b.id === newBc.id)) return prev;
            return [newBc, ...prev];
          });

          // Check if this broadcast targets the current user
          const currentUserEmail = user?.email?.toLowerCase();
          const isTargeted =
            newBc.targetType === 'all' ||
            (newBc.targetType === 'individual' && newBc.targetValue?.toLowerCase() === currentUserEmail) ||
            newBc.targetType === 'course'; // All learners take the program courses

          if (isTargeted) {
            playNotificationChime();
            setActiveAlert({
              id: `notif_${newBc.id}`,
              title: `📢 ${newBc.title}`,
              message: newBc.message,
              time: 'Just now',
              priority: newBc.priority,
              unread: true,
              type: 'broadcast',
              targetType: newBc.targetType,
              targetValue: newBc.targetValue,
              broadcastId: newBc.id,
              createdAt: Date.now(),
            });
          }
        }
      };
    } catch {
      // Fallback for browsers without BroadcastChannel
    }

    // Also listen to storage events across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === BROADCASTS_STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setBroadcasts(updated);
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [user]);

  // Send Broadcast function (callable by Admin)
  const sendBroadcast = useCallback(
    (data: Omit<BroadcastNotification, 'id' | 'sentAt' | 'readCount'>): BroadcastNotification => {
      const newBroadcast: BroadcastNotification = {
        ...data,
        id: `bc_${Date.now()}`,
        sentAt: 'Just now',
        readCount: 0,
      };

      setBroadcasts((prev) => [newBroadcast, ...prev]);

      // Publish to BroadcastChannel for instant cross-tab & cross-role delivery
      if (typeof window !== 'undefined') {
        try {
          const channel = new BroadcastChannel(CHANNEL_NAME);
          channel.postMessage({ type: 'NEW_BROADCAST', payload: newBroadcast });
          channel.close();
        } catch {
          // ignore
        }
      }

      // Play local sound and trigger alert
      playNotificationChime();
      setActiveAlert({
        id: `notif_${newBroadcast.id}`,
        title: `📢 ${newBroadcast.title}`,
        message: newBroadcast.message,
        time: 'Just now',
        priority: newBroadcast.priority,
        unread: true,
        type: 'broadcast',
        targetType: newBroadcast.targetType,
        targetValue: newBroadcast.targetValue,
        broadcastId: newBroadcast.id,
        createdAt: Date.now(),
      });

      return newBroadcast;
    },
    []
  );

  const deleteBroadcast = useCallback((id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Compute targeted notifications for the current active user
  const notifications: LMSNotification[] = useMemo(() => {
    const userEmail = user?.email?.toLowerCase() || '';
    const isAdmin = user?.role === 'admin';

    // 1. Convert broadcasts into user-targeted notifications
    const broadcastNotifs: LMSNotification[] = broadcasts
      .filter((bc) => {
        if (isAdmin) return true; // Admins see all announcements
        if (bc.targetType === 'all') return true;
        if (bc.targetType === 'individual') {
          return bc.targetValue?.toLowerCase() === userEmail;
        }
        if (bc.targetType === 'course') {
          // In the AI-Native PM program, learners are enrolled in ACA-101, BRM-204, AML-305
          return true;
        }
        return false;
      })
      .map((bc) => {
        const notifId = `bc_notif_${bc.id}`;
        return {
          id: notifId,
          title: bc.title,
          message: bc.message,
          time: bc.sentAt,
          priority: bc.priority,
          unread: !readIds[notifId],
          type: 'broadcast',
          targetType: bc.targetType,
          targetValue: bc.targetValue,
          broadcastId: bc.id,
          createdAt: Date.now(),
        };
      });

    // 2. Combine with system notifications
    const combined = [...broadcastNotifs, ...initialSystemNotifications]
      .filter((n) => !dismissedIds[n.id])
      .map((n) => ({
        ...n,
        unread: !readIds[n.id],
      }));

    return combined;
  }, [broadcasts, user, readIds, dismissedIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => ({ ...prev, [id]: true }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = { ...prev };
      notifications.forEach((n) => {
        next[n.id] = true;
      });
      return next;
    });
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => ({ ...prev, [id]: true }));
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        broadcasts,
        notifications,
        unreadCount,
        sendBroadcast,
        deleteBroadcast,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        activeAlert,
        dismissAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
