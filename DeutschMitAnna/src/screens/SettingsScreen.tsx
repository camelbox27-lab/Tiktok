import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppSettings } from '../types';
import { loadSettings, saveSettings, clearAllData } from '../services/storage';
import {
  registerBackgroundFetch,
  unregisterBackgroundFetch,
  setupNotifications,
} from '../services/scheduler';
import { openTikTokProfile } from '../services/tiktokShare';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    morningTime: '08:00',
    noonTime: '13:00',
    eveningTime: '19:00',
    autoPost: false,
    tiktokUsername: '@deutschmitanna0',
  });
  const [editingField, setEditingField] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSave = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleTimeChange = (
    field: 'morningTime' | 'noonTime' | 'eveningTime',
    value: string
  ) => {
    // Validate time format HH:MM
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(value) && value.length === 5) {
      Alert.alert('Hata', 'Geçerli bir saat girin (ör: 08:00)');
      return;
    }
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    if (value.length === 5 && timeRegex.test(value)) {
      handleSave(newSettings);
      setEditingField(null);
    }
  };

  const handleAutoPostToggle = async (value: boolean) => {
    const newSettings = { ...settings, autoPost: value };
    await handleSave(newSettings);

    if (value) {
      await setupNotifications();
      await registerBackgroundFetch();
      Alert.alert(
        'Otomatik Paylaşım Aktif',
        'Belirlenen saatlerde bildirim alacaksınız.'
      );
    } else {
      await unregisterBackgroundFetch();
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Bu işlem tüm içeriklerinizi, takvim verilerinizi ve ayarlarınızı silecektir. Bu işlem geri alınamaz!',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await loadData();
            Alert.alert('Başarılı', 'Tüm veriler silindi.');
          },
        },
      ]
    );
  };

  const renderTimeInput = (
    label: string,
    emoji: string,
    field: 'morningTime' | 'noonTime' | 'eveningTime'
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingEmoji}>{emoji}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.timeInput}
        onPress={() => setEditingField(field)}
      >
        {editingField === field ? (
          <TextInput
            style={styles.timeInputText}
            value={settings[field]}
            onChangeText={(v) => handleTimeChange(field, v)}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            placeholder="HH:MM"
            placeholderTextColor="#666"
            autoFocus
            onBlur={() => setEditingField(null)}
          />
        ) : (
          <Text style={styles.timeInputText}>{settings[field]}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ayarlar</Text>
        </View>

        {/* Post Times Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paylaşım Saatleri</Text>
          <View style={styles.sectionCard}>
            {renderTimeInput('Sabah', '🌅', 'morningTime')}
            <View style={styles.divider} />
            {renderTimeInput('Öğlen', '☀️', 'noonTime')}
            <View style={styles.divider} />
            {renderTimeInput('Akşam', '🌙', 'eveningTime')}
          </View>
        </View>

        {/* TikTok Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TikTok</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🎵</Text>
                <Text style={styles.settingLabel}>Kullanıcı Adı</Text>
              </View>
              <TextInput
                style={styles.textInputInline}
                value={settings.tiktokUsername}
                onChangeText={(v) => {
                  const newSettings = { ...settings, tiktokUsername: v };
                  setSettings(newSettings);
                }}
                onBlur={() => handleSave(settings)}
                placeholder="@kullaniciadi"
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => openTikTokProfile(settings.tiktokUsername)}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🔗</Text>
                <Text style={styles.settingLabel}>Profili Aç</Text>
              </View>
              <Text style={styles.arrowText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Auto Post Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Otomasyon</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🤖</Text>
                <View>
                  <Text style={styles.settingLabel}>Otomatik Paylaşım</Text>
                  <Text style={styles.settingHint}>
                    Belirlenen saatlerde bildirim gönderir
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoPost}
                onValueChange={handleAutoPostToggle}
                trackColor={{ false: '#333', true: '#00f2ea55' }}
                thumbColor={settings.autoPost ? '#00f2ea' : '#888'}
              />
            </View>
          </View>
        </View>

        {/* Content Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şablonlar</Text>
          <View style={styles.sectionCard}>
            <View style={styles.templateRow}>
              <Text style={styles.templateLabel}>Hashtag Şablonu:</Text>
              <Text style={styles.templateValue}>
                #DeutschMitAnna #Almanca #AlmancaÖğren #deutsch
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.templateRow}>
              <Text style={styles.templateLabel}>Başlık Formatı:</Text>
              <Text style={styles.templateValue}>
                Cümle + Doğru/Yanlış + Seviye + Hashtag
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tehlikeli Bölge</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
              <Text style={styles.dangerButtonText}>Tüm Verileri Sil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkında</Text>
          <View style={styles.sectionCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Uygulama</Text>
              <Text style={styles.aboutValue}>DeutschMitAnna</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Sürüm</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Amaç</Text>
              <Text style={styles.aboutValue}>
                TikTok Almanca öğrenme botu
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Hesap</Text>
              <Text style={[styles.aboutValue, { color: '#00f2ea' }]}>
                @deutschmitanna0
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingEmoji: {
    fontSize: 20,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  settingHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  timeInput: {
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  timeInputText: {
    color: '#00f2ea',
    fontSize: 16,
    fontWeight: '700',
  },
  textInputInline: {
    color: '#00f2ea',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 120,
  },
  arrowText: {
    color: '#666',
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 16,
  },
  templateRow: {
    padding: 16,
  },
  templateLabel: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
  },
  templateValue: {
    color: '#fff',
    fontSize: 14,
  },
  dangerButton: {
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#ff0050',
    fontSize: 15,
    fontWeight: '700',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  aboutLabel: {
    color: '#888',
    fontSize: 14,
  },
  aboutValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
