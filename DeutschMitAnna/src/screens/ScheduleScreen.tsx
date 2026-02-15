import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScheduleCard from '../components/ScheduleCard';
import { ScheduleSlot, ContentItem, AppSettings } from '../types';
import {
  loadContentItems,
  loadSettings,
  loadScheduleSlots,
} from '../services/storage';
import {
  getWeekDates,
  getDayName,
  formatDate,
  getTodayDateString,
  autoAssignContent,
  markSlotAsPosted,
} from '../services/scheduler';
import { shareToTikTok } from '../services/tiktokShare';

export default function ScheduleScreen() {
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [allSlots, setAllSlots] = useState<ScheduleSlot[]>([]);
  const [contentMap, setContentMap] = useState<Record<string, ContentItem>>({});
  const [settings, setSettings] = useState<AppSettings>({
    morningTime: '08:00',
    noonTime: '13:00',
    eveningTime: '19:00',
    autoPost: false,
    tiktokUsername: '@deutschmitanna0',
  });
  const [refreshing, setRefreshing] = useState(false);

  const today = getTodayDateString();

  const loadData = useCallback(async () => {
    try {
      const [loadedSettings, slots, content] = await Promise.all([
        loadSettings(),
        loadScheduleSlots(),
        loadContentItems(),
      ]);

      setSettings(loadedSettings);
      setAllSlots(slots);
      setWeekDates(getWeekDates());

      const map: Record<string, ContentItem> = {};
      content.forEach((c) => {
        map[c.id] = c;
      });
      setContentMap(map);
    } catch (error) {
      console.error('Error loading schedule data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAutoAssign = async () => {
    try {
      await autoAssignContent();
      await loadData();
      Alert.alert('Başarılı', 'İçerikler otomatik olarak atandı.');
    } catch (error) {
      Alert.alert('Hata', 'İçerik atama sırasında hata oluştu.');
    }
  };

  const handlePostNow = async (slot: ScheduleSlot) => {
    const content = contentMap[slot.contentId];
    if (!content) {
      Alert.alert('Hata', 'İçerik bulunamadı.');
      return;
    }
    const success = await shareToTikTok(content);
    if (success) {
      await markSlotAsPosted(slot.id);
      await loadData();
    }
  };

  const slotsForDate = allSlots.filter((s) => s.date === selectedDate);

  const getSlotForTime = (time: 'morning' | 'noon' | 'evening') =>
    slotsForDate.find((s) => s.time === time) || null;

  const getDateStats = (date: string) => {
    const dateSlots = allSlots.filter((s) => s.date === date);
    const posted = dateSlots.filter((s) => s.posted).length;
    return { total: dateSlots.length, posted };
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00f2ea"
            colors={['#00f2ea']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Takvim</Text>
          <TouchableOpacity style={styles.autoAssignBtn} onPress={handleAutoAssign}>
            <Text style={styles.autoAssignText}>Otomatik Ata</Text>
          </TouchableOpacity>
        </View>

        {/* Week Calendar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.weekScroll}
          contentContainerStyle={styles.weekContainer}
        >
          {weekDates.map((date) => {
            const isSelected = date === selectedDate;
            const isToday = date === today;
            const stats = getDateStats(date);
            const dayName = getDayName(date);
            const dayNumber = new Date(date).getDate();

            return (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardSelected,
                  isToday && !isSelected && styles.dayCardToday,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dayName,
                    isSelected && styles.dayNameSelected,
                  ]}
                >
                  {dayName.substring(0, 3)}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {dayNumber}
                </Text>
                {stats.total > 0 && (
                  <View style={styles.dayDots}>
                    {Array.from({ length: Math.min(stats.total, 3) }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dayDot,
                          i < stats.posted ? styles.dayDotPosted : styles.dayDotPending,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Date Header */}
        <View style={styles.selectedDateHeader}>
          <Text style={styles.selectedDateText}>
            {getDayName(selectedDate)}, {formatDate(selectedDate)}
          </Text>
          {selectedDate === today && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Bugün</Text>
            </View>
          )}
        </View>

        {/* Schedule Cards */}
        {(['morning', 'noon', 'evening'] as const).map((timeSlot) => {
          const slot = getSlotForTime(timeSlot);
          const content = slot ? contentMap[slot.contentId] : undefined;
          return (
            <ScheduleCard
              key={timeSlot}
              slot={slot}
              timeSlot={timeSlot}
              content={content}
              settings={settings}
              onPostNow={handlePostNow}
            />
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  autoAssignBtn: {
    backgroundColor: '#00f2ea',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  autoAssignText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  weekScroll: {
    marginBottom: 16,
  },
  weekContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayCard: {
    width: 56,
    height: 80,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    gap: 4,
  },
  dayCardSelected: {
    backgroundColor: '#00f2ea',
    borderColor: '#00f2ea',
  },
  dayCardToday: {
    borderColor: '#00f2ea55',
  },
  dayName: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
  },
  dayNameSelected: {
    color: '#000',
  },
  dayNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: '#000',
  },
  dayDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dayDotPosted: {
    backgroundColor: '#00c853',
  },
  dayDotPending: {
    backgroundColor: '#ffc107',
  },
  selectedDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  selectedDateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  todayBadge: {
    backgroundColor: '#ff005033',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayBadgeText: {
    color: '#ff0050',
    fontSize: 11,
    fontWeight: '700',
  },
});
