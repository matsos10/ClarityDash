import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  title: string;
  hint?: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel: string;
  /** Mantém o modal aberto e limpa o campo depois de confirmar (ex.: teclado). */
  keepOpen?: boolean;
  onConfirm: (value: string) => Promise<void> | void;
  onClose: () => void;
}

/** Modal com um campo de texto (renomear TV, escrever na TV). */
export function TextPromptModal({
  visible,
  title,
  hint,
  initialValue = '',
  placeholder,
  confirmLabel,
  keepOpen,
  onConfirm,
  onClose,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setError(null);
    }
  }, [visible, initialValue]);

  const confirm = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm(value);
      if (keepOpen) setValue('');
      else onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Erro');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={colors.textDim}
            autoFocus
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={confirm}
            blurOnSubmit={!keepOpen}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable style={styles.btn} onPress={onClose}>
              <Text style={styles.btnText}>{keepOpen ? 'Fechar' : 'Cancelar'}</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.primary, (!value.trim() || busy) && { opacity: 0.5 }]}
              onPress={confirm}
              disabled={!value.trim() || busy}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{confirmLabel}</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 10 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  hint: { color: colors.textDim, fontSize: 13 },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: 18,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  error: { color: colors.danger, fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  btn: {
    paddingHorizontal: 18,
    height: 46,
    minWidth: 90,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.accent },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
