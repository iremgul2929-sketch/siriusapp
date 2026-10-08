import { Pressable, type PressableProps, Text } from 'react-native';

type Variant = 'primary' | 'secondary';

export function Button({
  title,
  variant = 'primary',
  className = '',
  ...props
}: PressableProps & { title: string; variant?: Variant; className?: string }) {
  const base = 'items-center rounded-2xl px-5 py-4 active:opacity-80';
  const look = variant === 'primary' ? 'bg-accent' : 'border border-line bg-panel';
  const text = variant === 'primary' ? 'text-ink' : 'text-fg';
  return (
    <Pressable accessibilityRole="button" className={`${base} ${look} ${className}`} {...props}>
      <Text className={`text-base font-bold ${text}`}>{title}</Text>
    </Pressable>
  );
}
