import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { dictionary } from '@/data/dictionary';
import { achievements } from '@/data/achievements';
import { houses, houseById, avatars } from '@/data/houses';
import { tutors, tutorById } from '@/data/tutors';
import { HandDemo } from '@/components/HandDemo';
import { useAuthStore, useCurrentUser } from '@/store/useAuthStore';
import { useAppStore, useProgress, lastWeek, levelInfo, rankFor, DAILY_GOALS } from '@/store/useAppStore';
import { Button3D } from '@/components/Button3D';
import { StarField } from '@/components/StarField';
import { feedback } from '@/utils/feedback';
import { REMINDER_HOUR, remindersSupported, requestReminderPermission } from '@/utils/reminders';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const updateName = useAuthStore((s) => s.updateName);
  const updatePrefs = useAppStore((s) => s.updatePrefs);
  const progress = useProgress();

  const [picker, setPicker] = useState<'avatar' | 'house' | 'tutor' | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? '');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const house = houseById(progress.house);
  const tutor = tutorById(progress.tutorId);
  const accent = house?.color ?? theme.color.accent;
  const level = levelInfo(progress.xp);
  const week = lastWeek(progress);
  const maxWeek = Math.max(progress.dailyGoal, ...week.map((d) => d.xp));
  const joined = user?.createdAt ? new Date(user.createdAt) : null;
  const unlocked = achievements.filter((a) => a.progress(progress) >= 1).length;
  const badge = achievements.find((a) => a.id === selectedBadge);

  const [reminderNote, setReminderNote] = useState<string | null>(null);
  const toggleReminders = async (on: boolean) => {
    setReminderNote(null);
    if (!on) return updatePrefs({ reminders: false });
    if (!remindersSupported) return setReminderNote('Bildirimler tarayıcıda ve Expo Go’da çalışmaz; yüklü uygulamada çalışır.');
    if (await requestReminderPermission()) updatePrefs({ reminders: true });
    else setReminderNote('Bildirim izni kapalı. Telefonun ayarlarından izin verebilirsin.');
  };

  const saveName = () => {
    if (!updateName(draftName)) setEditing(false);
  };

  return (
    <View style={styles.root}>
      <StarField />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Kapak */}
        <LinearGradient colors={[accent, accent + '55', theme.color.bg]} locations={[0, 0.55, 1]} style={styles.cover}>
          <SafeAreaView edges={['top']}>
            <View style={styles.coverBar}>
              <Pressable onPress={() => router.back()} hitSlop={10} style={styles.roundBtn}>
                <Ionicons name="chevron-back" size={22} color="#FFF" />
              </Pressable>
              <Text style={styles.coverTitle}>Profil</Text>
              <View style={{ width: 38 }} />
            </View>
          </SafeAreaView>

          <Pressable onPress={() => setPicker('avatar')} style={[styles.avatar, { borderColor: accent }]}>
            <Text style={styles.avatarEmoji}>{progress.avatar}</Text>
            <View style={[styles.avatarEdit, { backgroundColor: accent }]}>
              <Ionicons name="pencil" size={13} color="#FFF" />
            </View>
          </Pressable>
        </LinearGradient>

        <View style={styles.content}>
          {/* Isim */}
          {editing ? (
            <View style={styles.nameEdit}>
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                autoFocus
                onSubmitEditing={saveName}
                style={styles.nameInput}
                maxLength={24}
              />
              <Pressable onPress={saveName} hitSlop={8}>
                <Ionicons name="checkmark-circle" size={30} color={theme.color.success} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.nameRow}
              onPress={() => {
                setDraftName(user?.name ?? '');
                setEditing(true);
              }}
            >
              <Text style={styles.name}>{user?.name}</Text>
              <Ionicons name="create-outline" size={18} color={theme.color.fgDim} />
            </Pressable>
          )}
          <Text style={styles.meta}>
            {user?.email}
            {joined ? ` · ${MONTHS[joined.getMonth()]} ${joined.getFullYear()}'den beri` : ''}
          </Text>

          {house && (
            <Pressable onPress={() => setPicker('house')} style={[styles.houseChip, { borderColor: house.color }]}>
              <Ionicons name={house.icon as never} size={14} color={house.color} />
              <Text style={[styles.houseChipText, { color: house.color }]}>{house.name}</Text>
            </Pressable>
          )}

          {/* Seviye */}
          <View style={styles.card}>
            <View style={styles.levelHead}>
              <View style={[styles.levelBadge, { backgroundColor: accent }]}>
                <Text style={styles.levelNum}>{level.level}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.levelTitle}>{rankFor(level.level)}</Text>
                <Text style={styles.levelSub}>
                  Seviye {level.level + 1} için {level.need - level.into} XP daha
                </Text>
              </View>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${level.pct * 100}%`, backgroundColor: accent }]} />
            </View>
          </View>

          {/* Istatistikler */}
          <Text style={styles.section}>İstatistikler</Text>
          <View style={styles.grid}>
            <Stat icon="flame" color={theme.color.amber} value={progress.streak} label="Günlük seri" sub={`En iyi: ${progress.bestStreak}`} />
            <Stat icon="sparkles" color={theme.color.accentBright} value={progress.xp} label="Toplam XP" sub={`${progress.lessonsCompleted} ders`} />
            <Stat
              icon="book"
              color={theme.color.success}
              value={`${progress.learnedWordIds.length}/${dictionary.length}`}
              label="Öğrenilen işaret"
              sub={`${progress.perfectLessons} kusursuz`}
            />
            <Stat icon="videocam" color="#1FA8B5" value={progress.cameraWins} label="Kamera zaferi" sub="Doğru hareket" />
          </View>

          {/* Haftalik */}
          <Text style={styles.section}>Bu hafta</Text>
          <View style={styles.card}>
            <View style={styles.chart}>
              <View
                style={[styles.goalLine, { bottom: `${(progress.dailyGoal / maxWeek) * 100}%` }]}
                pointerEvents="none"
              >
                <Text style={styles.goalLineText}>hedef</Text>
              </View>
              {week.map((d) => (
                <View key={d.label} style={styles.barCol}>
                  <Text style={styles.barValue}>{d.xp > 0 ? d.xp : ''}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barCell,
                        {
                          height: `${(d.xp / maxWeek) * 100}%`,
                          backgroundColor: d.xp >= progress.dailyGoal ? theme.color.success : d.today ? accent : theme.color.accentDeep,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, d.today && { color: theme.color.fg }]}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rozetler */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>Rozetler</Text>
            <Text style={styles.sectionNote}>
              {unlocked}/{achievements.length}
            </Text>
          </View>
          <View style={styles.badges}>
            {achievements.map((a) => {
              const pct = a.progress(progress);
              const done = pct >= 1;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => {
                    feedback.select();
                    setSelectedBadge(selectedBadge === a.id ? null : a.id);
                  }}
                  style={styles.badgeCell}
                >
                  <View
                    style={[
                      styles.badge,
                      done ? { backgroundColor: a.color + '26', borderColor: a.color } : styles.badgeLocked,
                      selectedBadge === a.id && { transform: [{ scale: 1.08 }] },
                    ]}
                  >
                    <Ionicons
                      name={(done ? a.icon : 'lock-closed') as never}
                      size={done ? 26 : 20}
                      color={done ? a.color : theme.color.fgMuted}
                    />
                  </View>
                  <View style={styles.badgeBar}>
                    <View style={[styles.badgeBarFill, { width: `${pct * 100}%`, backgroundColor: done ? a.color : theme.color.fgMuted }]} />
                  </View>
                  <Text style={[styles.badgeTitle, !done && { color: theme.color.fgMuted }]} numberOfLines={2}>
                    {a.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {badge && (
            <View style={[styles.badgeInfo, { borderColor: badge.color }]}>
              <Ionicons name={badge.icon as never} size={20} color={badge.color} />
              <Text style={styles.badgeInfoText}>
                <Text style={{ fontFamily: theme.font.bodyBold, color: theme.color.fg }}>{badge.title}: </Text>
                {badge.description} ({Math.round(badge.progress(progress) * 100)}%)
              </Text>
            </View>
          )}

          {/* Ayarlar */}
          <Text style={styles.section}>Ayarlar</Text>
          <View style={styles.card}>
            <Text style={styles.settingLabel}>Günlük hedef</Text>
            <View style={styles.segment}>
              {DAILY_GOALS.map((g) => {
                const active = progress.dailyGoal === g.xp;
                return (
                  <Pressable
                    key={g.xp}
                    onPress={() => {
                      feedback.select();
                      updatePrefs({ dailyGoal: g.xp });
                    }}
                    style={StyleSheet.flatten([styles.segItem, active && { backgroundColor: accent }])}
                  >
                    <Text style={[styles.segText, active && styles.segTextActive]}>{g.label}</Text>
                    <Text style={[styles.segSub, active && styles.segTextActive]}>{g.xp} XP</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.settingRow} onPress={() => setPicker('house')}>
              <Ionicons name="home-outline" size={20} color={theme.color.fgDim} />
              <Text style={styles.settingText}>Takım</Text>
              <Text style={styles.settingValue}>{house?.name ?? 'Seçilmedi'}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.color.fgMuted} />
            </Pressable>

            <Pressable style={styles.settingRow} onPress={() => setPicker('tutor')}>
              <Ionicons name="happy-outline" size={20} color={theme.color.fgDim} />
              <Text style={styles.settingText}>Eğitmen avatarı</Text>
              <Text style={styles.settingValue}>{tutor.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.color.fgMuted} />
            </Pressable>

            <View style={styles.settingRow}>
              <Ionicons name="phone-portrait-outline" size={20} color={theme.color.fgDim} />
              <Text style={styles.settingText}>Titreşim</Text>
              <Switch
                value={progress.haptics}
                onValueChange={(v) => updatePrefs({ haptics: v })}
                trackColor={{ true: accent, false: theme.color.locked }}
                thumbColor="#FFF"
                {...{ activeThumbColor: '#FFF' }}
              />
            </View>

            <View style={styles.settingRow}>
              <Ionicons name="videocam-outline" size={20} color={theme.color.fgDim} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingText}>Kamerayı sormadan aç</Text>
                <Text style={styles.settingHint}>Kapalıyken kamera her açılışta sana sorulur</Text>
              </View>
              <Switch
                value={progress.cameraAlways}
                onValueChange={(v) => updatePrefs({ cameraAlways: v })}
                trackColor={{ true: accent, false: theme.color.locked }}
                thumbColor="#FFF"
                {...{ activeThumbColor: '#FFF' }}
              />
            </View>

            <View style={styles.settingRow}>
              <Ionicons name="notifications-outline" size={20} color={theme.color.fgDim} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingText}>Hatırlatmalar</Text>
                <Text style={styles.settingHint}>
                  {reminderNote ?? `Her gün saat ${REMINDER_HOUR}.00'de kısa bir bildirim`}
                </Text>
              </View>
              <Switch
                value={progress.reminders}
                onValueChange={toggleReminders}
                trackColor={{ true: accent, false: theme.color.locked }}
                thumbColor="#FFF"
                {...{ activeThumbColor: '#FFF' }}
              />
            </View>
          </View>

          <Button3D
            title="ÇIKIŞ YAP"
            variant="ghost"
            icon={<Ionicons name="log-out-outline" size={18} color={theme.color.fg} />}
            onPress={logout}
            style={styles.logout}
          />
        </View>
      </ScrollView>

      {/* Secim pencereleri */}
      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPicker(null)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{picker === 'avatar' ? 'Simgeni seç' : picker === 'tutor' ? 'Eğitmenini seç' : 'Takımını seç'}</Text>
          {picker === 'avatar' ? (
            <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.avatarGrid}>
              {avatars.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => {
                    feedback.select();
                    updatePrefs({ avatar: a });
                    setPicker(null);
                  }}
                  style={StyleSheet.flatten([styles.avatarOption, progress.avatar === a && { borderColor: accent }])}
                >
                  <Text style={styles.avatarOptionEmoji}>{a}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : picker === 'tutor' ? (
            <View style={styles.tutorSheet}>
              <View style={styles.tutorPreview}>
                <HandDemo wordId="merhaba" color={accent} showLabel={false} />
              </View>
              <ScrollView style={styles.tutorScroll} contentContainerStyle={styles.tutorGrid}>
                {tutors.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => {
                      feedback.select();
                      updatePrefs({ tutorId: t.id });
                    }}
                    style={StyleSheet.flatten([styles.tutorOption, tutor.id === t.id && { borderColor: accent }])}
                  >
                    <View style={[styles.tutorHair, { backgroundColor: t.hair }]}>
                      <View style={[styles.tutorFace, { backgroundColor: t.skin }]} />
                    </View>
                    <Text style={styles.tutorName}>{t.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Button3D title="TAMAM" onPress={() => setPicker(null)} />
            </View>
          ) : (
            <View style={{ gap: theme.space.sm }}>
              {houses.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => {
                    feedback.select();
                    updatePrefs({ house: h.id });
                    setPicker(null);
                  }}
                  style={StyleSheet.flatten([styles.houseOption, progress.house === h.id && { borderColor: h.color }])}
                >
                  <View style={[styles.houseIcon, { backgroundColor: h.color }]}>
                    <Ionicons name={h.icon as never} size={20} color="#FFF" />
                  </View>
                  <Text style={styles.houseName}>{h.name}</Text>
                  <Text style={styles.houseTrait}>{h.trait}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
  sub,
}: {
  icon: string;
  color: string;
  value: number | string;
  label: string;
  sub: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon as never} size={22} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statSub}>{sub}</Text>
      </View>
    </View>
  );
}

const AVATAR = 104;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  scroll: { paddingBottom: 48 },
  cover: { height: 200, paddingHorizontal: theme.space.xl },
  coverBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: theme.space.sm },
  coverTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 18 },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    position: 'absolute',
    bottom: -AVATAR / 2,
    alignSelf: 'center',
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 4,
    backgroundColor: theme.color.panelRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 52 },
  avatarEdit: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.color.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: theme.space.xl, paddingTop: AVATAR / 2 + theme.space.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  name: { fontFamily: theme.font.displayBlack, color: theme.color.fg, fontSize: 26 },
  nameEdit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nameInput: {
    minWidth: 180,
    fontFamily: theme.font.display,
    color: theme.color.fg,
    fontSize: 22,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: theme.color.accent,
    paddingVertical: 4,
  },
  meta: { fontFamily: theme.font.body, color: theme.color.fgDim, fontSize: 15, textAlign: 'center', marginTop: 2 },
  houseChip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: theme.space.md,
  },
  houseChipText: { fontFamily: theme.font.display, fontSize: 12, letterSpacing: 1 },
  card: {
    backgroundColor: theme.color.panel,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: theme.color.locked,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    marginTop: theme.space.xl,
  },
  levelHead: { flexDirection: 'row', alignItems: 'center', gap: theme.space.md, marginBottom: theme.space.md },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  levelNum: { fontFamily: theme.font.displayBlack, color: '#FFF', fontSize: 20, transform: [{ rotate: '-45deg' }] },
  levelTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 18 },
  levelSub: { fontFamily: theme.font.body, color: theme.color.fgDim, fontSize: 15 },
  bar: { height: 14, borderRadius: 7, backgroundColor: theme.color.locked, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 7 },
  section: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 18, marginTop: theme.space.xxl },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionNote: { fontFamily: theme.font.bodyBold, color: theme.color.accent, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.md, marginTop: theme.space.md },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    backgroundColor: theme.color.panel,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: theme.color.locked,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
  },
  statValue: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 20 },
  statLabel: { fontFamily: theme.font.bodyBold, color: theme.color.fgDim, fontSize: 14 },
  statSub: { fontFamily: theme.font.italic, color: theme.color.fgMuted, fontSize: 13 },
  chart: { flexDirection: 'row', height: 150, alignItems: 'flex-end', gap: 6 },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginBottom: 22,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.color.success,
  },
  goalLineText: { position: 'absolute', right: 0, top: -16, fontFamily: theme.font.italic, color: theme.color.success, fontSize: 12 },
  barCol: { flex: 1, alignItems: 'center', height: '100%' },
  barValue: { fontFamily: theme.font.bodyBold, color: theme.color.fgDim, fontSize: 11, height: 16 },
  barTrack: { flex: 1, width: '70%', justifyContent: 'flex-end', marginBottom: 4 },
  barCell: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontFamily: theme.font.bodyBold, color: theme.color.fgMuted, fontSize: 12, height: 18 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.space.md, rowGap: theme.space.lg },
  badgeCell: { width: '25%', alignItems: 'center', paddingHorizontal: 4 },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLocked: { backgroundColor: theme.color.panel, borderColor: theme.color.locked },
  badgeBar: { width: 44, height: 4, borderRadius: 2, backgroundColor: theme.color.locked, marginTop: 6, overflow: 'hidden' },
  badgeBarFill: { height: '100%' },
  badgeTitle: { fontFamily: theme.font.bodyBold, color: theme.color.fg, fontSize: 12, textAlign: 'center', marginTop: 4 },
  badgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    marginTop: theme.space.lg,
    backgroundColor: theme.color.panel,
  },
  badgeInfoText: { flex: 1, fontFamily: theme.font.body, color: theme.color.fgDim, fontSize: 15 },
  settingLabel: { fontFamily: theme.font.display, color: theme.color.fgDim, fontSize: 12, letterSpacing: 1, marginBottom: 8 },
  segment: {
    flexDirection: 'row',
    backgroundColor: theme.color.bgDeep,
    borderRadius: theme.radius.md,
    padding: 4,
    gap: 4,
  },
  segItem: { flex: 1, alignItems: 'center', borderRadius: theme.radius.sm, paddingVertical: 8 },
  segText: { fontFamily: theme.font.bodyBold, color: theme.color.fgDim, fontSize: 14 },
  segSub: { fontFamily: theme.font.body, color: theme.color.fgMuted, fontSize: 12 },
  segTextActive: { color: '#FFF' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    paddingVertical: theme.space.md,
    marginTop: theme.space.sm,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
  },
  settingText: { flex: 1, fontFamily: theme.font.bodyBold, color: theme.color.fg, fontSize: 16 },
  settingHint: { fontFamily: theme.font.italic, color: theme.color.fgMuted, fontSize: 13 },
  settingValue: { fontFamily: theme.font.body, color: theme.color.fgDim, fontSize: 15 },
  logout: { marginTop: theme.space.xxl },
  tutorSheet: { gap: theme.space.md },
  tutorPreview: {
    alignSelf: 'center',
    width: 170,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.color.bgDeep,
    overflow: 'hidden',
  },
  tutorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.space.sm },
  tutorOption: {
    width: 92,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.color.locked,
    backgroundColor: theme.color.panel,
  },
  tutorHair: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'flex-end' },
  tutorFace: { width: 36, height: 34, borderRadius: 18, marginBottom: 2 },
  tutorName: { fontFamily: theme.font.bodyBold, color: theme.color.fg, fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: theme.color.panelRaised,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.space.xl,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: theme.color.border,
  },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: theme.color.fgMuted, marginBottom: theme.space.md },
  sheetTitle: { fontFamily: theme.font.display, color: theme.color.fg, fontSize: 20, marginBottom: theme.space.lg, textAlign: 'center' },
  sheetScroll: { maxHeight: 340 },
  tutorScroll: { maxHeight: 210 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.md, justifyContent: 'center' },
  avatarOption: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.color.locked,
    backgroundColor: theme.color.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionEmoji: { fontSize: 32 },
  houseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    borderWidth: 2,
    borderColor: theme.color.locked,
    backgroundColor: theme.color.panel,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
  },
  houseIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  houseName: { flex: 1, fontFamily: theme.font.display, color: theme.color.fg, fontSize: 16 },
  houseTrait: { fontFamily: theme.font.italic, color: theme.color.fgDim, fontSize: 15 },
});
