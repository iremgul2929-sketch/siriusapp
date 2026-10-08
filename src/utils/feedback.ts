import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

/** Kullanici titresimi kapattiysa hicbir sey yapmaz. */
function enabled() {
  if (Platform.OS === 'web') return false;
  const key = useAuthStore.getState().currentEmail ?? 'guest';
  return useAppStore.getState().byUser[key]?.haptics !== false;
}

export const feedback = {
  tap: () => enabled() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  select: () => enabled() && Haptics.selectionAsync().catch(() => {}),
  success: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  error: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
};
