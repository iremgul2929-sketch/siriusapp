import type { ReactNode } from 'react';
import { Pressable, type PressableProps, Text, View } from 'react-native';

export function Card({
  title,
  subtitle,
  right,
  ...props
}: PressableProps & { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <Pressable
      className="mb-2.5 flex-row items-center justify-between rounded-xl border border-line bg-panel p-4 active:opacity-80"
      {...props}
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-fg">{title}</Text>
        {subtitle ? <Text className="mt-1 text-xs text-dim">{subtitle}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}
