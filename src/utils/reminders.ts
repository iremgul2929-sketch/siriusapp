import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

/** Hatirlatmalarin geldigi saat (cihazin yerel saati). */
export const REMINDER_HOUR = 18;
const DAYS_AHEAD = 7;
const CHANNEL = 'reminders';

export interface ReminderContext {
  name: string;
  streak: number;
  /** Bugun en az bir ders yapildi mi? Yapildiysa bugunku hatirlatma atlanir. */
  doneToday: boolean;
  /** Yolda siradaki isaretin adi; hepsi bittiyse null. */
  nextWord: string | null;
}

type Message = { title: string; body: string };

/** Kisa ve sevimli hatirlatmalar; her gun sirayla bir digeri gelir. */
function messages({ name, nextWord }: ReminderContext): Message[] {
  return [
    {
      title: 'Kaldığın yerden devam et ✨',
      body: nextWord
        ? `Sıradaki işaret: “${nextWord}”. Sadece 2 dakika!`
        : 'Öğrendiklerini tekrar etmeye ne dersin?',
    },
    { title: 'Ellerin seni özledi 👋', body: 'Bugün yeni bir işaret öğrenelim mi?' },
    { title: `Merhaba ${name}! 🌟`, body: 'Küçük bir pratik, büyük bir adım.' },
    { title: 'Bir işaret, bir gülümseme 😊', body: 'Bugünkü dersin seni bekliyor.' },
    { title: 'Yıldızlar parlıyor ⭐', body: 'Sen de bugün bir işaretle parla.' },
    { title: 'Minik bir mola zamanı ☕', body: 'İki dakikada bir işaret daha öğren.' },
    { title: 'Sirius seni bekliyor 💛', body: 'Kaldığın yerden birlikte devam edelim.' },
  ];
}

/**
 * Bildirimler tarayicida ve Expo Go'da calismaz (paket Expo Go'da acilista hata
 * firlatir); bu yuzden paket yalnizca desteklenen ortamda, ilk kullanimda yuklenir.
 */
export const remindersSupported = Platform.OS !== 'web' && !isRunningInExpoGo();

type NotificationsModule = typeof import('expo-notifications');
let loaded: NotificationsModule | null = null;

function load(): NotificationsModule | null {
  if (!remindersSupported) return null;
  if (!loaded) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod: NotificationsModule = require('expo-notifications');
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    loaded = mod;
  }
  return loaded;
}

/** Bildirim izni ister; verildiyse true. Desteklenmeyen ortamda her zaman false. */
export async function requestReminderPermission(): Promise<boolean> {
  try {
    const Notifications = load();
    if (!Notifications) return false;
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/**
 * Onumuzdeki gunlerin hatirlatmalarini bastan kurar. Uygulama her acildiginda ve
 * ilerleme degistiginde cagrilir; `enabled` false ise hepsini iptal eder.
 */
export async function syncReminders(enabled: boolean, context: ReminderContext) {
  try {
    const Notifications = load();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled || !(await Notifications.getPermissionsAsync()).granted) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Günlük hatırlatmalar',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const list = messages(context);
    const now = new Date();
    let first = true;
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + i,
        REMINDER_HOUR,
        0,
        0,
      );
      if (date <= now || (i === 0 && context.doneToday)) continue;
      // Devam eden bir seri varsa ilk hatirlatma onu soylesin.
      const content: Message =
        first && context.streak > 0
          ? {
              title: `${context.streak} günlük serin seni bekliyor 🔥`,
              body: 'Bugün bir ders yap, serin devam etsin.',
            }
          : list[date.getDate() % list.length];
      first = false;
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: CHANNEL,
        },
      });
    }
  } catch {
    // Bildirimler kullanilamiyorsa (or. desteklenmeyen ortam) sessizce gec.
  }
}
