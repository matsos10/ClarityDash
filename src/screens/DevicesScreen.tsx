import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deviceId, identify, scanNetwork } from '../discovery';
import { colors } from '../theme';
import { Protocol, PROTOCOL_LABEL, TvDevice } from '../types';

interface Props {
  devices: TvDevice[];
  onOpen: (d: TvDevice) => void;
  onAdd: (d: TvDevice) => void;
  onRemove: (id: string) => void;
}

const BRAND: Record<Protocol, { label: string; color: string }> = {
  samsung: { label: 'SAMSUNG', color: '#1428A0' },
  androidtv: { label: 'TCL', color: '#E4002B' },
  roku: { label: 'TCL', color: '#6C3C97' },
};

export function DevicesScreen({ devices, onOpen, onAdd, onRemove }: Props) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [found, setFound] = useState<TvDevice[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const stopRef = useRef(false);

  const [manualOpen, setManualOpen] = useState(false);
  const [ip, setIp] = useState('');
  const [protocol, setProtocol] = useState<Protocol>('samsung');
  const [adding, setAdding] = useState(false);

  const saved = new Set(devices.map((d) => d.id));

  const startScan = async () => {
    if (scanning) {
      stopRef.current = true;
      return;
    }
    stopRef.current = false;
    setScanError(null);
    setFound([]);
    setProgress(0);
    setScanning(true);
    try {
      await scanNetwork(
        (d) => setFound((prev) => (prev.some((p) => p.id === d.id) ? prev : [...prev, d])),
        (done, total) => setProgress(done / total),
        () => stopRef.current,
      );
    } catch (e: any) {
      setScanError(e?.message ?? 'Erro na pesquisa');
    } finally {
      setScanning(false);
    }
  };

  const addManual = async () => {
    const clean = ip.trim();
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) {
      Alert.alert('IP inválido', 'Escreve um endereço como 192.168.1.50.');
      return;
    }
    setAdding(true);
    try {
      const detected = await identify(clean, 2500).catch(() => null);
      const dev: TvDevice =
        detected && detected.protocol === protocol
          ? detected
          : {
              id: deviceId(clean, protocol),
              ip: clean,
              protocol,
              name: protocol === 'samsung' ? 'Samsung TV' : 'TCL TV',
              secure: protocol === 'samsung' ? true : undefined,
            };
      onAdd(dev);
      setManualOpen(false);
      setIp('');
    } finally {
      setAdding(false);
    }
  };

  const confirmRemove = (d: TvDevice) =>
    Alert.alert('Remover TV', `Remover "${d.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => onRemove(d.id) },
    ]);

  const newFound = found.filter((d) => !saved.has(d.id));

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Telecomando</Text>
        <Text style={styles.subtitle}>Samsung · TCL</Text>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="tv-outline" size={48} color={colors.textDim} />
            <Text style={styles.emptyText}>
              Ainda não tens TVs. Liga o telemóvel à mesma rede Wi-Fi da TV e procura.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <DeviceCard device={item} onPress={() => onOpen(item)} onLongPress={() => confirmRemove(item)} />
        )}
        ListFooterComponent={
          <View style={{ gap: 12, marginTop: 8 }}>
            {scanError ? <Text style={styles.error}>{scanError}</Text> : null}
            {scanning || newFound.length ? (
              <Text style={styles.section}>
                {scanning ? `A procurar na rede… ${Math.round(progress * 100)}%` : 'TVs encontradas'}
              </Text>
            ) : null}
            {newFound.map((d) => (
              <DeviceCard key={d.id} device={d} action="Adicionar" onPress={() => onAdd(d)} />
            ))}
            {!scanning && found.length === 0 && progress === 1 ? (
              <Text style={styles.hint}>Nenhuma TV encontrada. Verifica se a TV está ligada ou adiciona pelo IP.</Text>
            ) : null}
          </View>
        }
      />

      <View style={styles.actions}>
        <Pressable style={[styles.action, styles.primary]} onPress={startScan}>
          {scanning ? <ActivityIndicator color="#fff" /> : <Ionicons name="search" size={20} color="#fff" />}
          <Text style={styles.actionText}>{scanning ? 'Parar' : 'Procurar TVs'}</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={() => setManualOpen(true)}>
          <Ionicons name="add" size={22} color={colors.text} />
          <Text style={styles.actionText}>Por IP</Text>
        </Pressable>
      </View>

      <Modal visible={manualOpen} transparent animationType="fade" onRequestClose={() => setManualOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Adicionar TV pelo IP</Text>
            <Text style={styles.hint}>O IP está nas definições de rede da TV.</Text>
            <TextInput
              value={ip}
              onChangeText={setIp}
              placeholder="192.168.1.50"
              placeholderTextColor={colors.textDim}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            {(Object.keys(PROTOCOL_LABEL) as Protocol[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setProtocol(p)}
                style={[styles.option, protocol === p && styles.optionOn]}
              >
                <Ionicons
                  name={protocol === p ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={protocol === p ? colors.accent : colors.textDim}
                />
                <Text style={styles.optionText}>{PROTOCOL_LABEL[p]}</Text>
              </Pressable>
            ))}
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtn} onPress={() => setManualOpen(false)}>
                <Text style={styles.actionText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.primary]} onPress={addManual} disabled={adding}>
                {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Adicionar</Text>}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function DeviceCard({
  device,
  onPress,
  onLongPress,
  action,
}: {
  device: TvDevice;
  onPress: () => void;
  onLongPress?: () => void;
  action?: string;
}) {
  const brand = BRAND[device.protocol];
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.brand, { backgroundColor: brand.color }]}>
        <Text style={styles.brandText}>{brand.label}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {device.name}
        </Text>
        <Text style={styles.cardSub}>
          {PROTOCOL_LABEL[device.protocol]} · {device.ip}
        </Text>
      </View>
      {action ? (
        <Text style={styles.cardAction}>{action}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.textDim, fontSize: 14, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: colors.textDim, textAlign: 'center', fontSize: 15, maxWidth: 280 },
  section: { color: colors.textDim, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  hint: { color: colors.textDim, fontSize: 13 },
  error: { color: colors.danger, fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 16,
  },
  brand: { width: 64, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  cardAction: { color: colors.accent, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, padding: 16 },
  action: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: 14,
    height: 52,
  },
  primary: { backgroundColor: colors.accent },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 10 },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: 18,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10 },
  optionOn: { backgroundColor: colors.surfaceHigh },
  optionText: { color: colors.text, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  modalBtn: {
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
  },
});
