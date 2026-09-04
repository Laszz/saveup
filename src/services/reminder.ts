import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// ponytail: single place for channel + schedule, APK needs channel or silent
export const REMINDER_CHANNEL = 'default';

export async function ensureReminderChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: 'Pengingat Menabung',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: undefined,
      lightColor: '#0E5A3A',
      showBadge: false,
    });
  } catch {}
}

export async function scheduleDailyReminder(hour: number, minute: number) {
  await ensureReminderChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();
  const content: any = {
    title: '💰 Saatnya menabung!',
    body: 'Jangan lupa menambahkan tabungan hari ini.',
  };
  if (Platform.OS === 'android') content.channelId = REMINDER_CHANNEL;
  try {
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: (Notifications as any).SchedulableTriggerInputTypes.DAILY, hour, minute } as any,
    });
  } catch {
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: 'daily', hour, minute } as any,
    });
  }
}

export async function cancelReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
