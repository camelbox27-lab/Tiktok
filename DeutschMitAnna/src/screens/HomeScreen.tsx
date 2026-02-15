import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScheduleCard from '../components/ScheduleCard';
import { ScheduleSlot, ContentItem, AppSettings } from '../types';
import {
  loadContentItems,
  loadSettings,
  getScheduleSlotsForDate,
  getTodayStats,
} from '../services/storage';
import {
  generateTodaySchedule,
  getTodayDateString,
  formatDate,
  getDayName,
  markSlotAsPosted,
  schedulePostReminders,
} from '../services/scheduler';
import { shareToTikTok } from '../services/tiktokShare';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [contentMap, setContentMap] = useState<Record<string, ContentItem>>({});
  const [settings, setSettings] = useState<AppSettings>({
    morningTime: '08:00',
    noonTime: '13:00',
    eveningTime: '19:00',
    autoPost: false,
    tiktokUsername: '@deutschmitanna0',
  });
  const [stats, setStats] = useState({ totalContent: 0, postedToday: 0, pending: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const today = getTodayDateString();
  const dayName = getDayName(today);
  const dateFormatted = formatDate(today);

  const loadData = useCallback(async () => {
    try {
      const [loadedSettings, loadedStats, allContent] = await Promise.all([
        loadSettings(),
        getTodayStats(),
        loadContentItems(),
      ]);

      setSettings(loadedSettings);
      setStats(loadedStats);

      // Generate today's schedule if needed
      await generateTodaySchedule();
      const todaySlots = await getScheduleSlotsForDate(today);
      setSlots(todaySlots);

      // Build content map
      const map: Record<string, ContentItem> = {};
      allContent.forEach((c) => {
        map[c.id] = c;
      });
      setContentMap(map);

      // Schedule notifications
      await schedulePostReminders();
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  }, [today]);

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

  const handleAssign = (timeSlot: 'morning' | 'noon' | 'evening') => {
    navigation.navigate('ContentTab');
  };

  const getSlotForTime = (time: 'morning' | 'noon' | 'evening') =>
    slots.find((s) => s.time === time) || null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın!';
    if (hour < 18) return 'İyi günler!';
    return 'İyi akşamlar!';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
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
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>
            {dayName}, {dateFormatted}
          </Text>
          <Text style={styles.subtitle}>@deutschmitanna0</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalContent}</Text>
            <Text style={styles.statLabel}>Toplam İçerik</Text>
          </View>
          <View style={[styles.statCard, styles.statCardAccent]}>
            <Text style={[styles.statNumber, styles.statNumberAccent]}>
              {stats.postedToday}
            </Text>
            <Text style={styles.statLabel}>Bugün Paylaşılan</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Bekleyen</Text>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bugünün Programı</Text>
        </View>

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
              onAssign={handleAssign}
            />
          );
        })}

        {/* Quick Add */}
        <TouchableOpacity
          style={styles.quickAdd}
          onPress={() => navigation.navigate('ContentTab', { screen: 'AddContent' })}
        >
          <Text style={styles.quickAddIcon}>+</Text>
          <Text style={styles.quickAddText}>Hızlı İçerik Ekle</Text>
        </TouchableOpacity>

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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  date: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 4,
  },
  subtitle: {
    color: '#00f2ea',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statCardAccent: {
    borderColor: '#00f2ea33',
    backgroundColor: '#0a1a1a',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  statNumberAccent: {
    color: '#00f2ea',
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  quickAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00f2ea33',
    borderStyle: 'dashed',
    gap: 8,
  },
  quickAddIcon: {
    color: '#00f2ea',
    fontSize: 22,
    fontWeight: '700',
  },
  quickAddText: {
    color: '#00f2ea',
    fontSize: 14,
    fontWeight: '600',
  },
});
