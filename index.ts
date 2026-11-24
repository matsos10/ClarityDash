// Tem de vir primeiro: fornece crypto.getRandomValues ao node-forge.
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
(globalThis as any).Buffer = (globalThis as any).Buffer ?? Buffer;

import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
