import { Linking, Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ContentItem } from '../types';

const TIKTOK_APP_URL = 'snssdk1233://';
const TIKTOK_PACKAGE = 'com.zhiliaoapp.musically';
const TIKTOK_STORE_URL = Platform.select({
  android: `market://details?id=${TIKTOK_PACKAGE}`,
  ios: 'https://apps.apple.com/app/tiktok/id835599320',
  default: 'https://www.tiktok.com',
});

// ==================== TIKTOK APP CHECK ====================

export async function isTikTokInstalled(): Promise<boolean> {
  try {
    return await Linking.canOpenURL(TIKTOK_APP_URL);
  } catch {
    return false;
  }
}

export async function openTikTok(): Promise<void> {
  const installed = await isTikTokInstalled();
  if (installed) {
    await Linking.openURL(TIKTOK_APP_URL);
  } else {
    Alert.alert(
      'TikTok Bulunamadı',
      'TikTok uygulaması yüklü değil. Mağazadan indirmek ister misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'İndir',
          onPress: () => {
            if (TIKTOK_STORE_URL) {
              Linking.openURL(TIKTOK_STORE_URL);
            }
          },
        },
      ]
    );
  }
}

// ==================== SHARING ====================

export async function shareToTikTok(content: ContentItem): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Hata', 'Paylaşım bu cihazda kullanılamıyor.');
      return false;
    }

    // Build caption for the post
    const caption = buildCaption(content);

    // Ensure the file exists and is accessible
    const fileInfo = await FileSystem.getInfoAsync(content.uri);
    if (!fileInfo.exists) {
      Alert.alert('Hata', 'Medya dosyası bulunamadı.');
      return false;
    }

    // Share the media file - user can choose TikTok from share sheet
    await Sharing.shareAsync(content.uri, {
      mimeType: content.type === 'video' ? 'video/mp4' : 'image/jpeg',
      dialogTitle: 'TikTok\'a Paylaş',
      UTI: content.type === 'video' ? 'public.movie' : 'public.image',
    });

    // Copy caption to clipboard-like approach via alert
    Alert.alert(
      'Başlık Kopyalandı',
      `Aşağıdaki başlığı TikTok\'a yapıştırın:\n\n${caption}`,
      [{ text: 'Tamam' }]
    );

    return true;
  } catch (error) {
    console.error('Error sharing to TikTok:', error);
    Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    return false;
  }
}

// ==================== CAPTION BUILDER ====================

export function buildCaption(content: ContentItem): string {
  const correctLabel = content.isCorrect ? '✅ DOĞRU' : '❌ YANLIŞ';
  const levelTag = `#${content.level}`;

  let caption = `🇩🇪 "${content.germanSentence}"\n\n`;
  caption += `${correctLabel}\n`;

  if (!content.isCorrect && content.correctVersion) {
    caption += `\n✅ Doğrusu: "${content.correctVersion}"\n`;
  }

  caption += `\n📚 Seviye: ${content.level}\n`;
  caption += `\n${content.caption || ''}\n`;
  caption += `\n#DeutschMitAnna #Almanca #AlmancaÖğren ${levelTag} #deutsch #german #learngerman #türkçe #almancadersi`;

  return caption;
}

// ==================== DIRECT OPEN TIKTOK CAMERA ====================

export async function openTikTokCamera(): Promise<void> {
  try {
    // Try to open TikTok's camera/create page directly
    const canOpen = await Linking.canOpenURL('snssdk1233://camera');
    if (canOpen) {
      await Linking.openURL('snssdk1233://camera');
    } else {
      await openTikTok();
    }
  } catch {
    await openTikTok();
  }
}

// ==================== PROFILE LINK ====================

export async function openTikTokProfile(username: string): Promise<void> {
  const profileUrl = `https://www.tiktok.com/${username}`;
  try {
    await Linking.openURL(profileUrl);
  } catch (error) {
    console.error('Error opening TikTok profile:', error);
    Alert.alert('Hata', 'TikTok profili açılamadı.');
  }
}
