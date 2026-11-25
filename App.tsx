import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DevicesScreen } from './src/screens/DevicesScreen';
import { RemoteScreen } from './src/screens/RemoteScreen';
import { loadDevices, saveDevices } from './src/storage';
import { TvDevice } from './src/types';

export default function App() {
  const [devices, setDevices] = useState<TvDevice[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    loadDevices().then((d) => {
      setDevices(d);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveDevices(devices);
  }, [devices, loaded]);

  const addDevice = useCallback((d: TvDevice) => {
    setDevices((prev) => [...prev.filter((p) => p.id !== d.id), d]);
  }, []);

  const removeDevice = useCallback((id: string) => {
    setDevices((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const renameDevice = useCallback((id: string, name: string) => {
    setDevices((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const updateCurrent = useCallback(
    (patch: Partial<TvDevice>) => {
      setDevices((prev) => prev.map((p) => (p.id === currentId ? { ...p, ...patch } : p)));
    },
    [currentId],
  );

  const current = devices.find((d) => d.id === currentId);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {current ? (
        <RemoteScreen device={current} onBack={() => setCurrentId(null)} onDeviceUpdate={updateCurrent} />
      ) : (
        <DevicesScreen
          devices={devices}
          onOpen={(d) => setCurrentId(d.id)}
          onAdd={addDevice}
          onRemove={removeDevice}
          onRename={renameDevice}
        />
      )}
    </SafeAreaProvider>
  );
}
