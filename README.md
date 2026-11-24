# Telecomando Universal (Samsung · TCL)

App móvel (React Native / Expo, Android e iOS) que controla TVs através da rede Wi-Fi.

| TV | Protocolo | Primeira ligação |
| --- | --- | --- |
| Samsung Tizen (2016+) | WebSocket nas portas 8001 / 8002 (wss) | Aceitar o pedido que aparece na TV |
| TCL Android TV / Google TV | Android TV Remote v2 (TLS, portas 6466/6467) | Introduzir na app o código de 6 caracteres mostrado na TV |
| TCL Roku TV | Roku ECP (HTTP, porta 8060) | Ativar *Controlo por apps móveis* nas definições da TV |

## Funcionalidades

- Pesquisa automática de TVs na rede local (ou adicionar pelo IP).
- Ligar/desligar, fonte, setas + OK, voltar, início, menu, volume, canais, sem som, info, guia, teclado numérico, multimédia e botões coloridos.
- Repetição automática ao manter premidos volume, canais e setas.
- Guarda as TVs, o token Samsung e o certificado de emparelhamento Android TV no telemóvel.

## Executar

A app usa módulos nativos (sockets TCP/TLS), por isso **não funciona no Expo Go**: é preciso uma build própria.

```bash
npm install
npx expo run:android      # ou: npx expo run:ios
```

APK para instalar diretamente (via EAS):

```bash
npx eas-cli@latest build -p android --profile preview
```

O telemóvel tem de estar na mesma rede Wi-Fi que a TV.

## Limitações

- Wake-on-LAN não é suportado: ligar a TV a partir do telemóvel só funciona se a TV mantiver a rede ativa em standby.
- TVs TCL com sistema próprio (não Android/Roku) não têm API de rede e não são suportadas.
