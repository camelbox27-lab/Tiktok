import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentItem, ScheduleSlot, AppSettings } from '../types';

const KEYS = {
  CONTENT: '@deutschmitanna_content',
  SCHEDULE: '@deutschmitanna_schedule',
  SETTINGS: '@deutschmitanna_settings',
  POSTED_COUNT: '@deutschmitanna_posted_count',
};

const DEFAULT_SETTINGS: AppSettings = {
  morningTime: '08:00',
  noonTime: '13:00',
  eveningTime: '19:00',
  autoPost: false,
  tiktokUsername: '@deutschmitanna0',
};

// ==================== CONTENT ====================

export async function saveContentItems(items: ContentItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CONTENT, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving content items:', error);
    throw error;
  }
}

export async function loadContentItems(): Promise<ContentItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CONTENT);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading content items:', error);
    return [];
  }
}

export async function addContentItem(item: ContentItem): Promise<void> {
  const items = await loadContentItems();
  items.push(item);
  await saveContentItems(items);
}

export async function updateContentItem(item: ContentItem): Promise<void> {
  const items = await loadContentItems();
  const index = items.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    items[index] = item;
    await saveContentItems(items);
  }
}

export async function deleteContentItem(id: string): Promise<void> {
  const items = await loadContentItems();
  const filtered = items.filter((i) => i.id !== id);
  await saveContentItems(filtered);
}

export async function getContentItem(id: string): Promise<ContentItem | undefined> {
  const items = await loadContentItems();
  return items.find((i) => i.id === id);
}

// ==================== SCHEDULE ====================

export async function saveScheduleSlots(slots: ScheduleSlot[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(slots));
  } catch (error) {
    console.error('Error saving schedule slots:', error);
    throw error;
  }
}

export async function loadScheduleSlots(): Promise<ScheduleSlot[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SCHEDULE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading schedule slots:', error);
    return [];
  }
}

export async function addScheduleSlot(slot: ScheduleSlot): Promise<void> {
  const slots = await loadScheduleSlots();
  slots.push(slot);
  await saveScheduleSlots(slots);
}

export async function updateScheduleSlot(slot: ScheduleSlot): Promise<void> {
  const slots = await loadScheduleSlots();
  const index = slots.findIndex((s) => s.id === slot.id);
  if (index !== -1) {
    slots[index] = slot;
    await saveScheduleSlots(slots);
  }
}

export async function deleteScheduleSlot(id: string): Promise<void> {
  const slots = await loadScheduleSlots();
  const filtered = slots.filter((s) => s.id !== id);
  await saveScheduleSlots(filtered);
}

export async function getScheduleSlotsForDate(date: string): Promise<ScheduleSlot[]> {
  const slots = await loadScheduleSlots();
  return slots.filter((s) => s.date === date);
}

// ==================== SETTINGS ====================

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// ==================== STATS ====================

export async function getTodayStats(): Promise<{
  totalContent: number;
  postedToday: number;
  pending: number;
}> {
  const items = await loadContentItems();
  const slots = await loadScheduleSlots();
  const today = new Date().toISOString().split('T')[0];
  const todaySlots = slots.filter((s) => s.date === today);
  const postedToday = todaySlots.filter((s) => s.posted).length;
  const pending = items.filter((i) => !i.posted).length;

  return {
    totalContent: items.length,
    postedToday,
    pending,
  };
}

// ==================== UTILITIES ====================

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.CONTENT,
      KEYS.SCHEDULE,
      KEYS.SETTINGS,
      KEYS.POSTED_COUNT,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
