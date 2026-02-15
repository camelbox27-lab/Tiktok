import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ContentCard from '../components/ContentCard';
import { ContentItem } from '../types';
import { loadContentItems, deleteContentItem } from '../services/storage';

export default function ContentScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'A1' | 'A2' | 'correct' | 'incorrect'>('all');

  const loadData = useCallback(async () => {
    const content = await loadContentItems();
    // Sort by most recent first
    content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setItems(content);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = async (id: string) => {
    await deleteContentItem(id);
    await loadData();
  };

  const handlePress = (item: ContentItem) => {
    // Could navigate to detail/edit screen
    Alert.alert(
      item.germanSentence,
      `Seviye: ${item.level}\n${item.isCorrect ? 'Doğru' : 'Yanlış'}${
        item.correctVersion ? '\nDoğrusu: ' + item.correctVersion : ''
      }`,
      [{ text: 'Tamam' }]
    );
  };

  const filteredItems = items.filter((item) => {
    switch (filter) {
      case 'A1':
        return item.level === 'A1';
      case 'A2':
        return item.level === 'A2';
      case 'correct':
        return item.isCorrect;
      case 'incorrect':
        return !item.isCorrect;
      default:
        return true;
    }
  });

  const renderFilterButton = (
    label: string,
    value: 'all' | 'A1' | 'A2' | 'correct' | 'incorrect'
  ) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>İçerikler</Text>
        <Text style={styles.count}>{items.length} içerik</Text>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {renderFilterButton('Tümü', 'all')}
        {renderFilterButton('A1', 'A1')}
        {renderFilterButton('A2', 'A2')}
        {renderFilterButton('Doğru', 'correct')}
        {renderFilterButton('Yanlış', 'incorrect')}
      </View>

      {/* Content List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContentCard item={item} onDelete={handleDelete} onPress={handlePress} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>Henüz içerik yok</Text>
            <Text style={styles.emptySubtitle}>
              Yeni içerik eklemek için aşağıdaki butona tıklayın
            </Text>
          </View>
        }
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
      />

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddContent')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  count: {
    color: '#888',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#00f2ea',
    borderColor: '#00f2ea',
  },
  filterButtonText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#000',
  },
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff0050',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#ff0050',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    marginTop: -2,
  },
});
