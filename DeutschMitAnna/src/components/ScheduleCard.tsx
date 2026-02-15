import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { ScheduleSlot, ContentItem, AppSettings } from '../types';
import { getTimeSlotLabel, getTimeForSlot } from '../services/scheduler';

interface ScheduleCardProps {
  slot: ScheduleSlot | null;
  timeSlot: 'morning' | 'noon' | 'evening';
  content?: ContentItem;
  settings: AppSettings;
  onPostNow?: (slot: ScheduleSlot) => void;
  onAssign?: (timeSlot: 'morning' | 'noon' | 'evening') => void;
}

export default function ScheduleCard({
  slot,
  timeSlot,
  content,
  settings,
  onPostNow,
  onAssign,
}: ScheduleCardProps) {
  const label = getTimeSlotLabel(timeSlot);
  const time = getTimeForSlot(timeSlot, settings);
  const isPosted = slot?.posted ?? false;

  const getSlotIcon = () => {
    switch (timeSlot) {
      case 'morning':
        return '🌅';
      case 'noon':
        return '☀️';
      case 'evening':
        return '🌙';
    }
  };

  const getStatusColor = () => {
    if (isPosted) return '#00c853';
    if (slot && content) return '#ffc107';
    return '#666';
  };

  const getStatusText = () => {
    if (isPosted) return 'Paylaşıldı';
    if (slot && content) return 'Hazır';
    return 'Boş';
  };

  return (
    <View style={[styles.card, isPosted && styles.postedCard]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{getSlotIcon()}</Text>
          <View>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '33' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Content Preview */}
      {content ? (
        <View style={styles.contentPreview}>
          {content.uri ? (
            <Image source={{ uri: content.uri }} style={styles.previewImage} />
          ) : (
            <View style={[styles.previewImage, styles.placeholderImage]}>
              <Text style={styles.placeholderEmoji}>
                {content.type === 'video' ? '🎬' : '🖼️'}
              </Text>
            </View>
          )}
          <View style={styles.previewInfo}>
            <Text style={styles.previewSentence} numberOfLines={2}>
              "{content.germanSentence}"
            </Text>
            <View style={styles.previewBadges}>
              <View
                style={[
                  styles.miniBadge,
                  content.isCorrect ? styles.correctMini : styles.incorrectMini,
                ]}
              >
                <Text style={styles.miniBadgeText}>
                  {content.isCorrect ? 'Doğru' : 'Yanlış'}
                </Text>
              </View>
              <View style={styles.levelMini}>
                <Text style={styles.levelMiniText}>{content.level}</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>Henüz içerik atanmadı</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!isPosted && slot && content && onPostNow && (
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => onPostNow(slot)}
          >
            <Text style={styles.postButtonText}>Şimdi Paylaş</Text>
          </TouchableOpacity>
        )}
        {!slot && onAssign && (
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() => onAssign(timeSlot)}
          >
            <Text style={styles.assignButtonText}>İçerik Ata</Text>
          </TouchableOpacity>
        )}
        {isPosted && (
          <View style={styles.postedIndicator}>
            <Text style={styles.postedCheckText}>Tamamlandı</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  postedCard: {
    borderColor: '#00c85333',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    color: '#aaa',
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentPreview: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  previewImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 24,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  previewSentence: {
    color: '#ddd',
    fontSize: 13,
    marginBottom: 6,
  },
  previewBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  correctMini: {
    backgroundColor: 'rgba(0, 242, 234, 0.2)',
  },
  incorrectMini: {
    backgroundColor: 'rgba(255, 0, 80, 0.2)',
  },
  miniBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  levelMini: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelMiniText: {
    color: '#00f2ea',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContent: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  postButton: {
    backgroundColor: '#00f2ea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  assignButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00f2ea',
  },
  assignButtonText: {
    color: '#00f2ea',
    fontSize: 13,
    fontWeight: '600',
  },
  postedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postedCheckText: {
    color: '#00c853',
    fontSize: 13,
    fontWeight: '600',
  },
});
