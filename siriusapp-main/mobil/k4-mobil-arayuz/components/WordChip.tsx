import { Text, View } from 'react-native';

export function WordChip({
  title,
  confidence,
  tone = 'accent',
}: {
  title: string;
  confidence: number;
  tone?: 'accent' | 'ok';
}) {
  const border = tone === 'ok' ? 'border-ok' : 'border-accent/40';
  const confColor = tone === 'ok' ? 'text-ok' : 'text-accent';
  return (
    <View
      className={`flex-row items-center justify-between rounded-2xl border bg-ink/80 px-4 py-3 ${border}`}
    >
      <Text className="text-lg font-bold tracking-wide text-fg">
        {title.toLocaleUpperCase('tr-TR')}
      </Text>
      <Text className={`text-xs ${confColor}`}>%{Math.round(confidence * 100)} güven</Text>
    </View>
  );
}
