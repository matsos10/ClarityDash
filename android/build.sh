#!/bin/sh
# Génère l'APK signé de Base Palmela (TWA) avec Bubblewrap.
#   Prérequis : Node 20+, JDK 17 ; Bubblewrap télécharge le SDK Android au premier lancement.
#   Usage : ./build.sh palmela.mondomaine.pt
set -e
DOMAIN="${1:?Usage: ./build.sh <domaine>}"
cd "$(dirname "$0")"

sed "s/palmela.example.com/${DOMAIN}/g" twa-manifest.json > twa-manifest.local.json
mkdir -p app && cp twa-manifest.local.json app/twa-manifest.json
cd app

if [ ! -f ../android.keystore ]; then
  keytool -genkeypair -v -keystore ../android.keystore -alias palmela -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Base Palmela, O=Circulo Facetado Lda, C=PT"
fi

npx --yes @bubblewrap/cli@1.24.1 update --skipVersionUpgrade
npx --yes @bubblewrap/cli@1.24.1 build

echo
echo "APK : $(pwd)/app-release-signed.apk"
echo "Empreinte SHA-256 à mettre dans TWA_SHA256_FINGERPRINTS (.env du serveur) :"
keytool -list -v -keystore ../android.keystore -alias palmela | grep "SHA256:" | awk '{print $2}'
