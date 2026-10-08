import { Text, View } from 'react-native';

type Tone = 'accent' | 'amber' | 'dim' | 'bad' | 'ok';

const toneClass: Record<Tone, { dot: string; text: string }> = {
  accent: { dot: 'bg-accent', text: 'text-accent' },
  amber: { dot: 'bg-amber', text: 'text-amber' },
  dim: { dot: 'bg-dim', text: 'text-dim' },
  bad: { dot: 'bg-bad', text: 'text-bad' },
  ok: { dot: 'bg-ok', text: 'text-ok' },
};

export function StatusPill({ label, tone = 'dim' }: { label: string; tone?: Tone }) {
  const t = toneClass[tone];
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full bg-ink/70 px-2.5 py-1">
      <View className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      <Text className={`text-[10px] font-semibold uppercase tracking-wider ${t.text}`}>{label}</Text>
    </View>
  );
}
