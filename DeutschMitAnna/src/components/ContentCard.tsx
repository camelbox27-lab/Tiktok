import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { ContentItem } from '../types';

interface ContentCardProps {
  item: ContentItem;
  onDelete: (id: string) => void;
  onPress?: (item: ContentItem) => void;
}

const { width } = Dimensions.get('window');

export default function ContentCard({ item, onDelete, onPress }: ContentCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Silme Onayı',
      'Bu içeriği silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(item)}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {item.uri ? (
          <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumb]}>
            <Text style={styles.placeholderText}>
              {item.type === 'video' ? '🎬' : '🖼️'}
            </Text>
          </View>
        )}
        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {item.type === 'video' ? 'Video' : 'Resim'}
          </Text>
        </View>
      </View>

      {/* Content Info */}
      <View style={styles.infoContainer}>
        {/* German Sentence */}
        <Text style={styles.sentence} numberOfLines={2}>
          "{item.germanSentence}"
        </Text>

        {/* Badges Row */}
        <View style={styles.badgeRow}>
          {/* Doğru/Yanlış Badge */}
          <View
            style={[
              styles.badge,
              item.isCorrect ? styles.correctBadge : styles.incorrectBadge,
            ]}
          >
            <Text style={styles.badgeText}>
              {item.isCorrect ? 'Doğru' : 'Yanlış'}
            </Text>
          </View>

          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{item.level}</Text>
          </View>

          {/* Schedule Status */}
          {item.posted ? (
            <View style={styles.postedBadge}>
              <Text style={styles.postedBadgeText}>Paylaşıldı</Text>
            </View>
          ) : item.scheduled ? (
            <View style={styles.scheduledBadge}>
              <Text style={styles.scheduledBadgeText}>Planlandı</Text>
            </View>
          ) : null}
        </View>

        {/* Correct version for incorrect sentences */}
        {!item.isCorrect && item.correctVersion && (
          <Text style={styles.correctVersion} numberOfLines={1}>
            Doğrusu: {item.correctVersion}
          </Text>
        )}
      </View>

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  placeholderThumb: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 9,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  sentence: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  correctBadge: {
    backgroundColor: 'rgba(0, 242, 234, 0.2)',
  },
  incorrectBadge: {
    backgroundColor: 'rgba(255, 0, 80, 0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00f2ea',
  },
  postedBadge: {
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  postedBadgeText: {
    fontSize: 11,
    color: '#00c853',
    fontWeight: '600',
  },
  scheduledBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  scheduledBadgeText: {
    fontSize: 11,
    color: '#ffc107',
    fontWeight: '600',
  },
  correctVersion: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 0, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#ff0050',
    fontSize: 14,
    fontWeight: '700',
  },
});
