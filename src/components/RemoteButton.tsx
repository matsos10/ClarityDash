import { ReactNode, useEffect, useRef } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  onPress: () => void;
  label?: string;
  icon?: ReactNode;
  /** Repete o comando enquanto o botão está pressionado (volume, setas...). */
  repeat?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function RemoteButton({ onPress, label, icon, repeat, disabled, style, accessibilityLabel }: Props) {
  const delay = useRef<ReturnType<typeof setTimeout>>(undefined);
  const interval = useRef<ReturnType<typeof setInterval>>(undefined);
  const pressRef = useRef(onPress);
  pressRef.current = onPress;

  const stop = () => {
    clearTimeout(delay.current);
    clearInterval(interval.current);
  };
  useEffect(() => stop, []);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPressIn={() => {
        pressRef.current();
        if (repeat) {
          delay.current = setTimeout(() => {
            interval.current = setInterval(() => pressRef.current(), 160);
          }, 450);
        }
      }}
      onPressOut={stop}
      style={({ pressed }) => [
        styles.btn,
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon}
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 16,
    minHeight: 52,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pressed: { backgroundColor: colors.border, transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.3 },
  label: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
