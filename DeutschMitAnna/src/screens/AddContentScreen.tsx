import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { ContentItem } from '../types';
import { addContentItem, generateId } from '../services/storage';
import germanContent, { PrebuiltSentence } from '../data/germanContent';

export default function AddContentScreen() {
  const navigation = useNavigation();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [germanSentence, setGermanSentence] = useState('');
  const [isCorrect, setIsCorrect] = useState(true);
  const [correctVersion, setCorrectVersion] = useState('');
  const [level, setLevel] = useState<'A1' | 'A2'>('A1');
  const [caption, setCaption] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const pickMedia = async (type: 'image' | 'video') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image'
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(type);
    }
  };

  const handleSelectTemplate = (template: PrebuiltSentence) => {
    setGermanSentence(template.germanSentence);
    setIsCorrect(template.isCorrect);
    setLevel(template.level);
    if (template.correctVersion) {
      setCorrectVersion(template.correctVersion);
    } else {
      setCorrectVersion('');
    }
    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!germanSentence.trim()) {
      Alert.alert('Hata', 'Almanca cümle girmelisiniz.');
      return;
    }

    if (!isCorrect && !correctVersion.trim()) {
      Alert.alert('Hata', 'Yanlış cümleler için doğru versiyonu girmelisiniz.');
      return;
    }

    const newItem: ContentItem = {
      id: generateId(),
      type: mediaType,
      uri: mediaUri || '',
      caption: caption.trim(),
      germanSentence: germanSentence.trim(),
      isCorrect,
      correctVersion: isCorrect ? undefined : correctVersion.trim(),
      level,
      createdAt: new Date().toISOString(),
      scheduled: false,
      posted: false,
    };

    try {
      await addContentItem(newItem);
      Alert.alert('Başarılı', 'İçerik başarıyla eklendi!', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'İçerik kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>{'< Geri'}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Yeni İçerik</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Media Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Medya</Text>
            {mediaUri ? (
              <View style={styles.mediaPreview}>
                <Image source={{ uri: mediaUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeMedia}
                  onPress={() => setMediaUri(null)}
                >
                  <Text style={styles.removeMediaText}>Kaldır</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mediaButtons}>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => pickMedia('image')}
                >
                  <Text style={styles.mediaButtonIcon}>🖼️</Text>
                  <Text style={styles.mediaButtonText}>Resim Seç</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => pickMedia('video')}
                >
                  <Text style={styles.mediaButtonIcon}>🎬</Text>
                  <Text style={styles.mediaButtonText}>Video Seç</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Template Selector */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.templateButton}
              onPress={() => setShowTemplates(!showTemplates)}
            >
              <Text style={styles.templateButtonText}>
                {showTemplates ? 'Şablonları Gizle' : 'Hazır Cümlelerden Seç'}
              </Text>
            </TouchableOpacity>

            {showTemplates && (
              <ScrollView style={styles.templateList} nestedScrollEnabled>
                {germanContent.map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateItem}
                    onPress={() => handleSelectTemplate(template)}
                  >
                    <View style={styles.templateItemLeft}>
                      <Text style={styles.templateSentence}>
                        {template.germanSentence}
                      </Text>
                      <View style={styles.templateBadges}>
                        <View
                          style={[
                            styles.templateBadge,
                            template.isCorrect
                              ? styles.correctBadge
                              : styles.incorrectBadge,
                          ]}
                        >
                          <Text style={styles.templateBadgeText}>
                            {template.isCorrect ? 'Doğru' : 'Yanlış'}
                          </Text>
                        </View>
                        <View style={styles.templateLevelBadge}>
                          <Text style={styles.templateLevelText}>
                            {template.level}
                          </Text>
                        </View>
                        <Text style={styles.templateCategory}>
                          {template.category}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* German Sentence */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Almanca Cümle</Text>
            <TextInput
              style={styles.textInput}
              value={germanSentence}
              onChangeText={setGermanSentence}
              placeholder="Almanca cümleyi girin..."
              placeholderTextColor="#666"
              multiline
            />
          </View>

          {/* Doğru/Yanlış Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Cümle Durumu</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isCorrect && styles.toggleButtonCorrectActive,
                ]}
                onPress={() => setIsCorrect(true)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    isCorrect && styles.toggleTextActive,
                  ]}
                >
                  Doğru
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isCorrect && styles.toggleButtonIncorrectActive,
                ]}
                onPress={() => setIsCorrect(false)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !isCorrect && styles.toggleTextActive,
                  ]}
                >
                  Yanlış
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Correct Version (if Yanlış) */}
          {!isCorrect && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Doğru Versiyon</Text>
              <TextInput
                style={styles.textInput}
                value={correctVersion}
                onChangeText={setCorrectVersion}
                placeholder="Cümlenin doğru halini girin..."
                placeholderTextColor="#666"
                multiline
              />
            </View>
          )}

          {/* Level Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Seviye</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.levelButton,
                  level === 'A1' && styles.levelButtonActive,
                ]}
                onPress={() => setLevel('A1')}
              >
                <Text
                  style={[
                    styles.levelText,
                    level === 'A1' && styles.levelTextActive,
                  ]}
                >
                  A1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.levelButton,
                  level === 'A2' && styles.levelButtonActive,
                ]}
                onPress={() => setLevel('A2')}
              >
                <Text
                  style={[
                    styles.levelText,
                    level === 'A2' && styles.levelTextActive,
                  ]}
                >
                  A2
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Caption */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ek Açıklama (Opsiyonel)</Text>
            <TextInput
              style={styles.textInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Ek açıklama girin..."
              placeholderTextColor="#666"
              multiline
            />
          </View>

          {/* Preview */}
          {germanSentence.trim() !== '' && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Önizleme</Text>
              <View style={styles.previewCard}>
                {mediaUri && (
                  <Image
                    source={{ uri: mediaUri }}
                    style={styles.previewThumb}
                  />
                )}
                <Text style={styles.previewSentence}>
                  "{germanSentence}"
                </Text>
                <View style={styles.previewBadges}>
                  <View
                    style={[
                      styles.previewBadge,
                      isCorrect
                        ? styles.correctBadge
                        : styles.incorrectBadge,
                    ]}
                  >
                    <Text style={styles.previewBadgeText}>
                      {isCorrect ? 'Doğru' : 'Yanlış'}
                    </Text>
                  </View>
                  <View style={styles.previewLevelBadge}>
                    <Text style={styles.previewLevelText}>{level}</Text>
                  </View>
                </View>
                {!isCorrect && correctVersion && (
                  <Text style={styles.previewCorrect}>
                    Doğrusu: "{correctVersion}"
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    color: '#00f2ea',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  mediaButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mediaButtonText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  mediaPreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  removeMedia: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  removeMediaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  templateButton: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00f2ea33',
  },
  templateButtonText: {
    color: '#00f2ea',
    fontSize: 14,
    fontWeight: '600',
  },
  templateList: {
    maxHeight: 300,
    marginTop: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  templateItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  templateItemLeft: {
    flex: 1,
  },
  templateSentence: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
  },
  templateBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  correctBadge: {
    backgroundColor: 'rgba(0, 242, 234, 0.2)',
  },
  incorrectBadge: {
    backgroundColor: 'rgba(255, 0, 80, 0.2)',
  },
  templateBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  templateLevelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  templateLevelText: {
    color: '#00f2ea',
    fontSize: 10,
    fontWeight: '600',
  },
  templateCategory: {
    color: '#666',
    fontSize: 10,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  toggleButtonCorrectActive: {
    backgroundColor: 'rgba(0, 242, 234, 0.15)',
    borderColor: '#00f2ea',
  },
  toggleButtonIncorrectActive: {
    backgroundColor: 'rgba(255, 0, 80, 0.15)',
    borderColor: '#ff0050',
  },
  toggleText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#fff',
  },
  levelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  levelButtonActive: {
    backgroundColor: 'rgba(0, 242, 234, 0.15)',
    borderColor: '#00f2ea',
  },
  levelText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '800',
  },
  levelTextActive: {
    color: '#00f2ea',
  },
  previewCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  previewThumb: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 12,
  },
  previewSentence: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  previewBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  previewLevelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewLevelText: {
    color: '#00f2ea',
    fontSize: 12,
    fontWeight: '600',
  },
  previewCorrect: {
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#00f2ea',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
});
