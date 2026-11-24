import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RemoteButton } from '../components/RemoteButton';
import { createRemote } from '../protocols';
import { NotPairedError, startPairing } from '../protocols/androidtv/remote';
import { PairingSession } from '../protocols/androidtv/pairing';
import { colors } from '../theme';
import { ConnectionStatus, PROTOCOL_LABEL, RemoteKey, TvDevice, TvRemote } from '../types';

interface Props {
  device: TvDevice;
  onBack: () => void;
  onDeviceUpdate: (patch: Partial<TvDevice>) => void;
}

type PairingState = { step: 'starting' } | { step: 'code'; session: PairingSession } | null;

export function RemoteScreen({ device, onBack, onDeviceUpdate }: Props) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [numpad, setNumpad] = useState(false);
  const [pairing, setPairing] = useState<PairingState>(null);
  const [code, setCode] = useState('');
  const [pairError, setPairError] = useState<string | null>(null);
  const [pairBusy, setPairBusy] = useState(false);

  const remoteRef = useRef<TvRemote | null>(null);
  const deviceRef = useRef(device);
  deviceRef.current = device;

  const updateDevice = useCallback(
    (patch: Partial<TvDevice>) => {
      deviceRef.current = { ...deviceRef.current, ...patch };
      onDeviceUpdate(patch);
    },
    [onDeviceUpdate],
  );

  const beginPairing = useCallback(async () => {
    setPairing({ step: 'starting' });
    setPairError(null);
    setCode('');
    setStatus('waiting_tv');
    try {
      const session = await startPairing(deviceRef.current.ip);
      setPairing({ step: 'code', session });
    } catch (e: any) {
      setPairing(null);
      setStatus('error');
      setError(e?.message ?? 'Falha ao iniciar o emparelhamento');
    }
  }, []);

  const connect = useCallback(async () => {
    remoteRef.current?.disconnect();
    setError(null);
    const dev = deviceRef.current;
    if (dev.protocol === 'androidtv' && !dev.paired) {
      beginPairing();
      return;
    }
    const remote = createRemote(dev, {
      onDeviceUpdate: updateDevice,
      onWaitingForTv: () => setStatus('waiting_tv'),
      onDisconnect: () => setStatus('idle'),
    });
    remoteRef.current = remote;
    setStatus('connecting');
    try {
      await remote.connect();
      if (remoteRef.current === remote) setStatus('connected');
    } catch (e: any) {
      if (remoteRef.current !== remote) return;
      if (e instanceof NotPairedError) {
        updateDevice({ paired: false });
        beginPairing();
        return;
      }
      setStatus('error');
      setError(e?.message ?? 'Erro de ligação');
    }
  }, [beginPairing, updateDevice]);

  useEffect(() => {
    connect();
    return () => {
      remoteRef.current?.disconnect();
      remoteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.id]);

  const submitCode = async () => {
    if (pairing?.step !== 'code') return;
    setPairBusy(true);
    setPairError(null);
    try {
      await pairing.session.finish(code);
      updateDevice({ paired: true });
      setPairing(null);
      connect();
    } catch (e: any) {
      setPairError(e?.message ?? 'Falha no emparelhamento');
      if (!/incorreto/i.test(String(e?.message))) {
        pairing.session.close();
        setPairing(null);
        setStatus('error');
        setError(e?.message ?? 'Falha no emparelhamento');
      }
    } finally {
      setPairBusy(false);
    }
  };

  const cancelPairing = () => {
    if (pairing?.step === 'code') pairing.session.close();
    setPairing(null);
    setStatus('error');
    setError('Emparelhamento cancelado.');
  };

  const press = useCallback(async (key: RemoteKey) => {
    const remote = remoteRef.current;
    if (!remote) return;
    try {
      await remote.send(key);
      setStatus('connected');
      setError(null);
    } catch (e: any) {
      if (e instanceof NotPairedError) {
        updateDevice({ paired: false });
        beginPairing();
        return;
      }
      setStatus('error');
      setError(e?.message ?? 'Falha ao enviar comando');
    }
  }, [beginPairing, updateDevice]);

  const has = useCallback((k: RemoteKey) => remoteRef.current?.supports(k) ?? true, []);

  return (
    <KeyContext.Provider value={{ press, has }}>
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="Voltar">
          {ic('chevron-back', 28)}
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.title} numberOfLines={1}>
            {device.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {PROTOCOL_LABEL[device.protocol]} · {device.ip}
          </Text>
        </View>
        <StatusBadge status={status} onRetry={connect} />
      </View>

      {error ? (
        <Pressable style={styles.errorBox} onPress={connect}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorRetry}>Tocar para tentar novamente</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.row}>
          <Btn k="POWER" icon={ic('power', 26, '#fff')} style={styles.power} a11y="Ligar/Desligar" />
          <Btn k="SOURCE" icon={<MaterialCommunityIcons name="import" size={24} color={colors.text} />} a11y="Fonte" />
          <Btn k="MUTE" icon={ic('volume-mute')} a11y="Sem som" />
          <Pressable
            onPress={() => setNumpad((v) => !v)}
            style={[styles.toggle, numpad && styles.toggleOn]}
            accessibilityLabel="Teclado numérico"
          >
            <Text style={styles.toggleText}>123</Text>
          </Pressable>
        </View>

        {numpad ? (
          <View style={styles.numpad}>
            {(['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const).map((n) => (
              <Btn key={n} k={`NUM_${n}` as RemoteKey} label={n} style={styles.num} />
            ))}
            <View style={styles.num} />
            <Btn k="NUM_0" label="0" style={styles.num} />
            <View style={styles.num} />
          </View>
        ) : (
          <View style={styles.dpad}>
            <Btn k="UP" icon={ic('chevron-up', 32)} repeat style={[styles.dpadBtn, styles.dUp]} a11y="Cima" />
            <Btn k="LEFT" icon={ic('chevron-back', 32)} repeat style={[styles.dpadBtn, styles.dLeft]} a11y="Esquerda" />
            <Btn k="OK" label="OK" style={styles.ok} />
            <Btn k="RIGHT" icon={ic('chevron-forward', 32)} repeat style={[styles.dpadBtn, styles.dRight]} a11y="Direita" />
            <Btn k="DOWN" icon={ic('chevron-down', 32)} repeat style={[styles.dpadBtn, styles.dDown]} a11y="Baixo" />
          </View>
        )}

        <View style={styles.row}>
          <Btn k="BACK" icon={ic('arrow-undo')} style={styles.flex} a11y="Voltar" />
          <Btn k="HOME" icon={ic('home')} style={styles.flex} a11y="Início" />
          <Btn k="MENU" icon={ic('menu')} style={styles.flex} a11y="Menu" />
        </View>

        <View style={styles.row}>
          <View style={styles.rocker}>
            <Btn k="VOL_UP" icon={ic('add', 28)} repeat style={styles.rockerBtn} a11y="Volume +" />
            <Text style={styles.rockerLabel}>VOL</Text>
            <Btn k="VOL_DOWN" icon={ic('remove', 28)} repeat style={styles.rockerBtn} a11y="Volume -" />
          </View>
          <View style={styles.middleCol}>
            <Btn k="INFO" icon={ic('information-circle-outline')} style={styles.flex} a11y="Info" />
            <Btn k="GUIDE" icon={ic('list')} style={styles.flex} a11y="Guia" />
          </View>
          <View style={styles.rocker}>
            <Btn k="CH_UP" icon={ic('chevron-up', 28)} repeat style={styles.rockerBtn} a11y="Canal +" />
            <Text style={styles.rockerLabel}>CH</Text>
            <Btn k="CH_DOWN" icon={ic('chevron-down', 28)} repeat style={styles.rockerBtn} a11y="Canal -" />
          </View>
        </View>

        <View style={styles.row}>
          <Btn k="REWIND" icon={ic('play-back')} style={styles.flex} a11y="Recuar" />
          <Btn k="PLAY" icon={ic('play')} style={styles.flex} a11y="Reproduzir" />
          <Btn k="PAUSE" icon={ic('pause')} style={styles.flex} a11y="Pausa" />
          <Btn k="STOP" icon={ic('stop')} style={styles.flex} a11y="Parar" />
          <Btn k="FAST_FORWARD" icon={ic('play-forward')} style={styles.flex} a11y="Avançar" />
        </View>

        <View style={styles.row}>
          <Btn k="RED" style={[styles.flex, styles.color, { backgroundColor: colors.red }]} a11y="Vermelho" />
          <Btn k="GREEN" style={[styles.flex, styles.color, { backgroundColor: colors.green }]} a11y="Verde" />
          <Btn k="YELLOW" style={[styles.flex, styles.color, { backgroundColor: colors.yellow }]} a11y="Amarelo" />
          <Btn k="BLUE" style={[styles.flex, styles.color, { backgroundColor: colors.blue }]} a11y="Azul" />
        </View>
      </ScrollView>

      <Modal visible={pairing !== null} transparent animationType="fade" onRequestClose={cancelPairing}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Emparelhar com a TV</Text>
            {pairing?.step === 'starting' ? (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.modalText}>
                  A preparar o emparelhamento… (na primeira vez a app gera um certificado, pode demorar alguns segundos)
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalText}>Introduz o código de 6 caracteres que aparece no ecrã da TV.</Text>
                <TextInput
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 6))}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus
                  maxLength={6}
                  placeholder="A1B2C3"
                  placeholderTextColor={colors.textDim}
                  style={styles.codeInput}
                  onSubmitEditing={submitCode}
                />
                {pairError ? <Text style={styles.pairError}>{pairError}</Text> : null}
              </>
            )}
            <View style={styles.modalActions}>
              <Pressable onPress={cancelPairing} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </Pressable>
              {pairing?.step === 'code' ? (
                <Pressable
                  onPress={submitCode}
                  disabled={code.length !== 6 || pairBusy}
                  style={[styles.modalBtn, styles.modalBtnPrimary, (code.length !== 6 || pairBusy) && { opacity: 0.5 }]}
                >
                  {pairBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Emparelhar</Text>}
                </Pressable>
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
    </KeyContext.Provider>
  );
}

const KeyContext = createContext<{ press: (k: RemoteKey) => void; has: (k: RemoteKey) => boolean }>({
  press: () => {},
  has: () => true,
});

function Btn(p: { k: RemoteKey; label?: string; icon?: ReactNode; repeat?: boolean; style?: any; a11y?: string }) {
  const { press, has } = useContext(KeyContext);
  return (
    <RemoteButton
      onPress={() => press(p.k)}
      label={p.label}
      icon={p.icon}
      repeat={p.repeat}
      disabled={!has(p.k)}
      style={p.style}
      accessibilityLabel={p.a11y}
    />
  );
}

const ic = (name: keyof typeof Ionicons.glyphMap, size = 24, color = colors.text) => (
  <Ionicons name={name} size={size} color={color} />
);

function StatusBadge({ status, onRetry }: { status: ConnectionStatus; onRetry: () => void }) {
  const map: Record<ConnectionStatus, { color: string; text: string }> = {
    idle: { color: colors.textDim, text: 'Desligado' },
    connecting: { color: colors.warning, text: 'A ligar…' },
    waiting_tv: { color: colors.warning, text: 'Ver na TV' },
    connected: { color: colors.success, text: 'Ligado' },
    error: { color: colors.danger, text: 'Erro' },
  };
  const s = map[status];
  return (
    <Pressable onPress={onRetry} style={styles.badge} accessibilityLabel={`Estado: ${s.text}`}>
      <View style={[styles.dot, { backgroundColor: s.color }]} />
      <Text style={styles.badgeText}>{s.text}</Text>
    </Pressable>
  );
}

const DPAD = 240;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  errorBox: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#3A1D20',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: { color: colors.text, fontSize: 13 },
  errorRetry: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  body: { padding: 16, gap: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' },
  flex: { flex: 1 },
  power: { backgroundColor: colors.danger, width: 60, height: 60, borderRadius: 30 },
  toggle: {
    minWidth: 60,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  toggleText: { color: colors.text, fontWeight: '700' },
  dpad: {
    width: DPAD,
    height: DPAD,
    alignSelf: 'center',
    borderRadius: DPAD / 2,
    backgroundColor: colors.surface,
    marginVertical: 4,
  },
  dpadBtn: { position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: 'transparent' },
  dUp: { top: 6, left: (DPAD - 72) / 2 },
  dDown: { bottom: 6, left: (DPAD - 72) / 2 },
  dLeft: { left: 6, top: (DPAD - 72) / 2 },
  dRight: { right: 6, top: (DPAD - 72) / 2 },
  ok: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    left: (DPAD - 92) / 2,
    top: (DPAD - 92) / 2,
    backgroundColor: colors.accent,
  },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  num: { width: '31%', height: 60 },
  rocker: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 4,
    width: 72,
  },
  rockerBtn: { backgroundColor: 'transparent', width: 64, height: 60 },
  rockerLabel: { color: colors.textDim, fontSize: 12, fontWeight: '700', marginVertical: 2 },
  middleCol: { flex: 1, gap: 12, alignSelf: 'stretch', justifyContent: 'center' },
  color: { height: 36, minHeight: 36 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: colors.surface, borderRadius: 20, padding: 20 },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalText: { color: colors.textDim, fontSize: 14, marginTop: 8, textAlign: 'left' },
  codeInput: {
    marginTop: 16,
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: 28,
    letterSpacing: 8,
    textAlign: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    fontWeight: '700',
  },
  pairError: { color: colors.danger, marginTop: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  modalBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.surfaceHigh },
  modalBtnPrimary: { backgroundColor: colors.accent },
  modalBtnText: { color: '#fff', fontWeight: '600' },
});
