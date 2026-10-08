import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useAppStore, useProgress } from '@/store/useAppStore';
import { feedback } from '@/utils/feedback';
import { Button3D } from './Button3D';
import { Ornament } from './Ornament';

type Choice = 'ask' | 'allowed' | 'denied';

/**
 * Kamerayi acmadan once kullaniciya sorar. "Her zaman" tercihi kalicidir;
 * "yalnizca kullanirken" ve "izin verme" sadece bu ekran acikken gecerlidir,
 * ekrana tekrar girildiginde yeniden sorulur.
 */
export function useCameraConsent() {
  const always = useProgress().cameraAlways;
  const [choice, setChoice] = useState<Choice>('ask');
  return { allowed: always || choice === 'allowed', choice, setChoice };
}

/** Kamera kapaliyken kamera alanini dolduran bilgi kutusu ve izin penceresi. */
export function CameraConsent({
  consent,
  onSkip,
}: {
  consent: ReturnType<typeof useCameraConsent>;
  /** Verilirse "izin verme" sonrasi bu adimi atlama secenegi gosterilir. */
  onSkip?: () => void;
}) {
  const updatePrefs = useAppStore((s) => s.updatePrefs);
  if (consent.allowed) return null;

  const choose = (choice: Choice, always = false) => {
    feedback.select();
    if (always) updatePrefs({ cameraAlways: true });
    consent.setChoice(choice);
  };

  return (
    <View style={styles.closed}>
      <Ionicons name="videocam-off-outline" size={40} color={theme.color.fgMuted} />
      <Text style={styles.closedTitle}>Kamera kapalı</Text>
      <Text style={styles.closedText}>İşaretlerini görebilmem için kamerayı açman gerekiyor.</Text>
      <Button3D
        title="KAMERAYI AÇ"
        icon={<Ionicons name="videocam" size={18} color={theme.color.onAccent} />}
        onPress={() => consent.setChoice('ask')}
      />
      {onSkip && <Button3D title="BU ADIMI ATLA" variant="ghost" onPress={onSkip} />}

      <Modal
        visible={consent.choice === 'ask'}
        transparent
        animationType="fade"
        onRequestClose={() => choose('denied')}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.crest}>
              <Ionicons name="hand-left" size={44} color={theme.color.neon} />
              <View style={styles.crestBadge}>
                <Ionicons name="videocam" size={16} color={theme.color.onAccent} />
              </View>
            </View>
            <Text style={styles.title}>Kamerayı açmak ister misin?</Text>
            <Text style={styles.text}>
              Sirius işaretlerini görüp doğrulamak için ön kamerayı kullanır. Görüntün yalnızca bu
              cihazda işlenir; kaydedilmez ve kimseyle paylaşılmaz.
            </Text>
            <View style={styles.ornament}>
              <Ornament />
            </View>
            <Button3D
              title="HER ZAMAN İZİN VER"
              icon={<Ionicons name="checkmark-done" size={18} color={theme.color.onAccent} />}
              onPress={() => choose('allowed', true)}
            />
            <Button3D
              title="YALNIZCA KULLANIRKEN"
              variant="ghost"
              icon={<Ionicons name="time-outline" size={18} color={theme.color.fg} />}
              onPress={() => choose('allowed')}
            />
            <Pressable
              onPress={() => choose('denied')}
              hitSlop={8}
              style={styles.deny}
              accessibilityRole="button"
            >
              <Text style={styles.denyText}>İzin verme</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  closed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.md,
    padding: theme.space.xl,
  },
  closedTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 18 },
  closedText: {
    fontFamily: theme.font.italic,
    color: theme.color.fgDim,
    fontSize: 15,
    textAlign: 'center',
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space.xl,
    backgroundColor: theme.color.overlay,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    gap: theme.space.sm,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    borderColor: theme.color.borderStrong,
    backgroundColor: theme.color.panelRaised,
    padding: theme.space.xl,
  },
  crest: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: theme.color.neon,
    backgroundColor: theme.color.dark,
    marginBottom: theme.space.sm,
  },
  crestBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.color.panelRaised,
    backgroundColor: theme.color.accent,
  },
  title: {
    fontFamily: theme.font.displayBlack,
    color: theme.color.fg,
    fontSize: 22,
    textAlign: 'center',
  },
  text: {
    fontFamily: theme.font.body,
    color: theme.color.fgDim,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  ornament: { width: '60%', alignSelf: 'center', marginVertical: theme.space.sm },
  deny: { alignSelf: 'center', paddingVertical: theme.space.md, paddingHorizontal: theme.space.lg },
  denyText: { fontFamily: theme.font.bodyBold, color: theme.color.fgDim, fontSize: 16 },
});
