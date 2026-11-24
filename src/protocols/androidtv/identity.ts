import AsyncStorage from '@react-native-async-storage/async-storage';
import forge from 'node-forge';

export interface ClientIdentity {
  certPem: string;
  /** Chave privada em PKCS#8 (exigido pelo react-native-tcp-socket). */
  keyPem: string;
  modulusHex: string;
  exponentHex: string;
}

const STORAGE_KEY = 'androidtv.identity.v1';

let cached: ClientIdentity | undefined;
let pending: Promise<ClientIdentity> | undefined;

/**
 * Certificado de cliente usado para emparelhar com TVs Android/Google TV.
 * É gerado uma única vez (RSA 2048) e guardado no dispositivo.
 */
export function getIdentity(): Promise<ClientIdentity> {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        cached = JSON.parse(raw) as ClientIdentity;
        return cached;
      }
      const id = await generateIdentity();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(id));
      cached = id;
      return id;
    })().finally(() => {
      pending = undefined;
    });
  }
  return pending;
}

export function generateRsaKeyPair(): Promise<forge.pki.rsa.KeyPair> {
  return new Promise((resolve, reject) => {
    // API existente no node-forge mas ausente dos tipos @types/node-forge.
    const rsa = forge.pki.rsa as any;
    const state = rsa.createKeyPairGenerationState(2048, 0x10001);
    const step = () => {
      try {
        // Passos curtos para não bloquear a interface.
        if (rsa.stepKeyPairGenerationState(state, 50)) {
          resolve(state.keys);
        } else {
          setTimeout(step, 0);
        }
      } catch (e) {
        reject(e);
      }
    };
    step();
  });
}

export async function generateIdentity(): Promise<ClientIdentity> {
  const keys = await generateRsaKeyPair();
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01' + forge.util.bytesToHex(forge.random.getBytesSync(8));
  cert.validity.notBefore = new Date(Date.now() - 24 * 3600 * 1000);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 20);
  const attrs = [{ name: 'commonName', value: 'atvremote' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    { name: 'basicConstraints', cA: true, pathLenConstraint: 0 },
    { name: 'subjectAltName', altNames: [{ type: 2, value: 'atvremote' }] },
  ]);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const pkcs8 = forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(keys.privateKey));
  return {
    certPem: forge.pki.certificateToPem(cert),
    keyPem: forge.pki.privateKeyInfoToPem(pkcs8),
    modulusHex: keys.publicKey.n.toString(16),
    exponentHex: keys.publicKey.e.toString(16),
  };
}
