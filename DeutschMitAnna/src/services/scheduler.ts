import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { ScheduleSlot, ContentItem, AppSettings } from '../types';
import {
  loadScheduleSlots,
  saveScheduleSlots,
  loadContentItems,
  loadSettings,
  getScheduleSlotsForDate,
  generateId,
} from './storage';

const BACKGROUND_FETCH_TASK = 'DEUTSCH_MIT_ANNA_BG_FETCH';
const POST_REMINDER_TASK = 'DEUTSCH_MIT_ANNA_POST_REMINDER';

// ==================== NOTIFICATION SETUP ====================

export async function setupNotifications(): Promise<void> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// ==================== TIME HELPERS ====================

export function getTimeSlotLabel(slot: 'morning' | 'noon' | 'evening'): string {
  switch (slot) {
    case 'morning':
      return 'Sabah';
    case 'noon':
      return 'Öğlen';
    case 'evening':
      return 'Akşam';
  }
}

export function getTimeSlotIcon(slot: 'morning' | 'noon' | 'evening'): string {
  switch (slot) {
    case 'morning':
      return '🌅';
    case 'noon':
      return '☀️';
    case 'evening':
      return '🌙';
  }
}

export function getTimeForSlot(
  slot: 'morning' | 'noon' | 'evening',
  settings: AppSettings
): string {
  switch (slot) {
    case 'morning':
      return settings.morningTime;
    case 'noon':
      return settings.noonTime;
    case 'evening':
      return settings.eveningTime;
  }
}

export function getNextPostDate(
  slot: 'morning' | 'noon' | 'evening',
  settings: AppSettings
): Date {
  const now = new Date();
  const [hours, minutes] = getTimeForSlot(slot, settings).split(':').map(Number);
  const nextPost = new Date(now);
  nextPost.setHours(hours, minutes, 0, 0);

  if (nextPost <= now) {
    nextPost.setDate(nextPost.getDate() + 1);
  }

  return nextPost;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ==================== SCHEDULE MANAGEMENT ====================

export async function generateTodaySchedule(): Promise<ScheduleSlot[]> {
  const today = getTodayDateString();
  const existingSlots = await getScheduleSlotsForDate(today);

  if (existingSlots.length >= 3) {
    return existingSlots;
  }

  const allSlots = await loadScheduleSlots();
  const contentItems = await loadContentItems();
  const unpostedContent = contentItems.filter((c) => !c.posted && !c.scheduled);

  const timeSlots: Array<'morning' | 'noon' | 'evening'> = ['morning', 'noon', 'evening'];
  const newSlots: ScheduleSlot[] = [];

  for (const timeSlot of timeSlots) {
    const existingForSlot = existingSlots.find((s) => s.time === timeSlot);
    if (existingForSlot) {
      continue;
    }

    const availableContent = unpostedContent.shift();
    if (availableContent) {
      const slot: ScheduleSlot = {
        id: generateId(),
        contentId: availableContent.id,
        time: timeSlot,
        date: today,
        posted: false,
      };
      newSlots.push(slot);
    }
  }

  if (newSlots.length > 0) {
    const updatedSlots = [...allSlots, ...newSlots];
    await saveScheduleSlots(updatedSlots);
  }

  return [...existingSlots, ...newSlots];
}

export async function autoAssignContent(): Promise<void> {
  const today = getTodayDateString();
  const allSlots = await loadScheduleSlots();
  const contentItems = await loadContentItems();

  const todaySlots = allSlots.filter((s) => s.date === today);
  const assignedContentIds = new Set(todaySlots.map((s) => s.contentId));
  const unassignedContent = contentItems.filter(
    (c) => !c.posted && !assignedContentIds.has(c.id)
  );

  const timeSlots: Array<'morning' | 'noon' | 'evening'> = ['morning', 'noon', 'evening'];
  const newSlots: ScheduleSlot[] = [];
  let contentIndex = 0;

  for (const timeSlot of timeSlots) {
    const existingForSlot = todaySlots.find((s) => s.time === timeSlot);
    if (existingForSlot || contentIndex >= unassignedContent.length) {
      continue;
    }

    newSlots.push({
      id: generateId(),
      contentId: unassignedContent[contentIndex].id,
      time: timeSlot,
      date: today,
      posted: false,
    });
    contentIndex++;
  }

  if (newSlots.length > 0) {
    await saveScheduleSlots([...allSlots, ...newSlots]);
  }
}

export async function markSlotAsPosted(slotId: string): Promise<void> {
  const slots = await loadScheduleSlots();
  const slotIndex = slots.findIndex((s) => s.id === slotId);
  if (slotIndex !== -1) {
    slots[slotIndex].posted = true;
    await saveScheduleSlots(slots);
  }
}

// ==================== NOTIFICATIONS ====================

export async function schedulePostReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const settings = await loadSettings();
  const today = getTodayDateString();
  const slots = await getScheduleSlotsForDate(today);

  for (const slot of slots) {
    if (slot.posted) continue;

    const timeStr = getTimeForSlot(slot.time, settings);
    const [hours, minutes] = timeStr.split(':').map(Number);

    const triggerDate = new Date();
    triggerDate.setHours(hours, minutes, 0, 0);

    if (triggerDate > new Date()) {
      const label = getTimeSlotLabel(slot.time);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${label} Paylaşım Zamanı!`,
          body: 'TikTok paylaşımınız hazır. Paylaşmak için tıklayın.',
          data: { slotId: slot.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  }
}

// ==================== BACKGROUND TASKS ====================

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await generateTodaySchedule();
    await schedulePostReminders();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetch(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (error) {
    console.error('Error registering background fetch:', error);
  }
}

export async function unregisterBackgroundFetch(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }
  } catch (error) {
    console.error('Error unregistering background fetch:', error);
  }
}

// ==================== WEEK SCHEDULE ====================

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

export function getDayName(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[date.getDay()];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}
