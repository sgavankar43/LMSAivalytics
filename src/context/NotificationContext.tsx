'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { BroadcastNotification } from '@/types';
import { initialBroadcasts } from '@/data/adminMockData';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

export interface LMSNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  unread: boolean;
  type: 'broadcast' | 'system' | 'session' | 'ticket' | 'info' | 'warning' | 'success' | 'alert';
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
const CHANNEL_NAME = 'realtime:notifications';

// Helper for human-readable relative time
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (isNaN(seconds) || seconds < 30) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Map Postgres row to LMSNotification
function mapDbRowToNotif(row: any, readIds: Record<string, boolean>): LMSNotification {
  const isAlert = row.type === 'alert' || row.type === 'warning';
  const priority: 'Normal' | 'Important' | 'Urgent' =
    row.type === 'alert' ? 'Urgent' : row.type === 'warning' ? 'Important' : 'Normal';

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    time: row.createdAt ? formatTimeAgo(new Date(row.createdAt)) : 'Just now',
    priority,
    unread: !row.read && !readIds[row.id],
    type: row.type || 'info',
    targetType: row.userId ? 'individual' : 'all',
    targetValue: row.userId || undefined,
    broadcastId: row.id,
    createdAt: row.createdAt ? new Date(row.createdAt).getTime() : Date.now(),
  };
}

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

  // Local broadcasts list (for admin broadcast history)
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(BROADCASTS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to load broadcasts from localStorage', err);
      }
    }
    return initialBroadcasts;
  });

  // DB-synced notifications
  const [dbNotifications, setDbNotifications] = useState<LMSNotification[]>([]);

  // Read notifications set (notificationId -> boolean)
  const [readIds, setReadIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(READ_NOTIFICATIONS_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to load read notifications from localStorage', err);
      }
    }
    return {};
  });

  // Dismissed notifications set
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
        if (saved) return JSON.parse(saved);
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

  // Supabase Realtime & Postgres Synchronization Engine
  useEffect(() => {
    // 1. Fetch initial notifications from Supabase Postgres
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('Notification')
          .select('*')
          .order('createdAt', { ascending: false })
          .limit(30);

        if (error) {
          console.warn('Supabase fetch initial notifications notice:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setDbNotifications(data.map((row) => mapDbRowToNotif(row, readIds)));
        } else {
          // If the table is brand new, seed default broadcast rows into Postgres
          const initialRows = [
            {
              title: 'Campus Maintenance & Quiz Deadline Extended',
              message: 'All LMS quizzes for Module 3 have been extended by 48 hours due to scheduled server upgrades.',
              type: 'alert',
              userId: null,
            },
            {
              title: 'Session Live Now',
              message: 'Session 2: Grading & Evaluation is currently active in Academic Information.',
              type: 'alert',
              userId: null,
            },
            {
              title: 'Support Ticket Updated',
              message: 'Faculty responded to ticket on Research Design quiz access.',
              type: 'info',
              userId: null,
            },
            {
              title: 'Certificate Ready to Download',
              message: 'Foundations of Modern Data Literacy certificate is verified & available to download.',
              type: 'success',
              userId: null,
            },
          ];
          await supabase.from('Notification').insert(initialRows);
          const { data: seeded } = await supabase
            .from('Notification')
            .select('*')
            .order('createdAt', { ascending: false });
          if (seeded) {
            setDbNotifications(seeded.map((row) => mapDbRowToNotif(row, readIds)));
          }
        }
      } catch (err) {
        console.error('Error fetching initial notifications:', err);
      }
    };

    fetchInitial();

    // 2. Subscribe to incoming notifications and broadcasts via Supabase Realtime
    const channel = supabase
      .channel(CHANNEL_NAME)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Notification' },
        (payload) => {
          const row = payload.new;
          const newNotif = mapDbRowToNotif(row, readIds);

          setDbNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });

          // Check targeting
          const currentUserEmail = user?.email?.toLowerCase();
          const isTargeted =
            newNotif.targetType === 'all' ||
            (newNotif.targetType === 'individual' && newNotif.targetValue?.toLowerCase() === currentUserEmail);

          if (isTargeted) {
            playNotificationChime();
            setActiveAlert(newNotif);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Notification' },
        (payload) => {
          const row = payload.new;
          setDbNotifications((prev) =>
            prev.map((n) => (n.id === row.id ? { ...n, unread: !row.read } : n))
          );
        }
      )
      .on(
        'broadcast',
        { event: 'announcement' },
        ({ payload }) => {
          if (!payload) return;
          playNotificationChime();
          const ephemeralNotif: LMSNotification = {
            id: `ephemeral_${Date.now()}`,
            title: payload.title,
            message: payload.message,
            time: 'Just now',
            priority: payload.priority || (payload.type === 'alert' ? 'Urgent' : 'Important'),
            unread: true,
            type: payload.type || 'broadcast',
            targetType: payload.targetType || 'all',
            targetValue: payload.targetValue,
            createdAt: Date.now(),
          };
          setActiveAlert(ephemeralNotif);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

      const notifType =
        data.priority === 'Urgent' ? 'alert' : data.priority === 'Important' ? 'warning' : 'info';

      // 1. Send Ephemeral Broadcast via Supabase Realtime channel
      try {
        const channel = supabase.channel(CHANNEL_NAME);
        channel.send({
          type: 'broadcast',
          event: 'announcement',
          payload: {
            title: data.title,
            message: data.message,
            priority: data.priority,
            type: notifType,
            targetType: data.targetType,
            targetValue: data.targetValue,
            totalTargetCount: data.totalTargetCount,
          },
        });
      } catch (err) {
        console.error('Supabase broadcast send failed:', err);
      }

      // 2. Persistent Database Insert to Supabase Postgres 'Notification' table
      (async () => {
        try {
          await supabase.from('Notification').insert([
            {
              title: data.title,
              message: data.message,
              type: notifType,
              userId: data.targetType === 'individual' ? data.targetValue : null,
              read: false,
            },
          ]);
        } catch (err) {
          console.error('Supabase Notification DB insert failed:', err);
        }
      })();

      // Trigger local sound & alert banner
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

    return dbNotifications
      .filter((n) => {
        if (dismissedIds[n.id]) return false;
        if (isAdmin) return true;
        if (n.targetType === 'all') return true;
        if (n.targetType === 'individual') {
          return n.targetValue?.toLowerCase() === userEmail;
        }
        return true;
      })
      .map((n) => ({
        ...n,
        unread: !readIds[n.id] && n.unread,
      }));
  }, [dbNotifications, user, readIds, dismissedIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => ({ ...prev, [id]: true }));
    // Also update Supabase database asynchronously
    (async () => {
      try {
        await supabase.from('Notification').update({ read: true }).eq('id', id);
      } catch (err) {
        console.error('Failed to mark read in DB:', err);
      }
    })();
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = { ...prev };
      notifications.forEach((n) => {
        next[n.id] = true;
      });
      return next;
    });

    // Also update Supabase database asynchronously
    (async () => {
      try {
        await supabase.from('Notification').update({ read: true }).eq('read', false);
      } catch (err) {
        console.error('Failed to mark all read in DB:', err);
      }
    })();
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
