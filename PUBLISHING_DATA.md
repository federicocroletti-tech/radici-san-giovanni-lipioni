# Publishing Data

This file records non-secret publishing data for the web/mobile app. Do not store passwords, private keys, identity documents, or payment information in this repository.

## App Identity

- App name: Radici San Giovanni Lipioni
- Android package / Capacitor app ID: `com.radici.sangiovannilipioni`
- Developer display name: Federico Croletti
- Public/support email: `federico.croletti@gmail.com`
- Website: `https://federico-croletti-site.onrender.com`

## Amazon Appstore

- App title: Radici San Giovanni Lipioni
- App SKU: `radici-san-giovanni-lipioni`
- Category: Travel
- Subcategory: Travel Guides
- Amazon App ID: `amzn1.devportal.mobileapp.e4582c347c2a41f2b5b9f10c375be609`
- Amazon Release ID: `amzn1.devportal.apprelease.796e69b419c646bf9ef95d0377c95fef`
- APK for Amazon upload: `android/app/build/outputs/apk/release/radici-san-giovanni-lipioni-amazon-release-signed.apk`

Build a fresh signed APK with:

```bash
npm run mobile:android:apk
```

## Google Play Alternative

Google Play requires a paid developer account. If used later, the signed Android App Bundle is generated here:

- AAB for Play upload: `android/app/build/outputs/bundle/release/radici-san-giovanni-lipioni-release-signed.aab`

Build a fresh signed AAB with:

```bash
npm run mobile:android:release
```

## Local Signing Material

The upload key and signing properties are stored outside the repository:

- Keystore: `C:/Users/fcrolett/AppData/Local/RadiciSanGiovanniLipioni/play-upload-key.jks`
- Signing properties: `C:/Users/fcrolett/AppData/Local/RadiciSanGiovanniLipioni/play-upload-key.properties`
- Key alias: `radici-upload`

Important: back up the keystore and signing properties securely. Future Android updates must be signed with the same key. Never commit these files to Git.

## Local Build Tooling

- Android SDK: `C:/Users/fcrolett/AppData/Local/Android/Sdk`
- JDK 21: `C:/Users/fcrolett/AppData/Local/Programs/jdk-21`

## Store Text Draft

Short description:

```text
Guida digitale interattiva dedicata a San Giovanni Lipioni.
```

Full description:

```text
Radici San Giovanni Lipioni e una guida digitale interattiva dedicata al borgo di San Giovanni Lipioni. L'app permette di esplorare luoghi, mappa, itinerari lenti e racconti locali attraverso contenuti organizzati e facilmente consultabili.

Include una mappa interattiva, schede dei luoghi, itinerari, racconti dimostrativi e un assistente chatbot basato sui contenuti interni dell'app. I contenuti sono pensati per valorizzare memoria locale, radici familiari e turismo lento.

Le informazioni storiche e territoriali devono essere considerate come contenuti culturali e dimostrativi, da verificare con fonti locali prima di un uso ufficiale.
```

Keywords:

```text
San Giovanni Lipioni, guida, turismo, borgo, Abruzzo, itinerari, mappa, racconti, cultura
```