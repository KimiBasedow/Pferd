# Anmeldung mit Google und Apple einrichten

Die Oberfläche und Firebase-Anbindung sind vorbereitet. Bis zur Konfiguration bleiben die Anbieter-Schaltflächen deaktiviert; Gasttraining funktioniert weiter. Es gibt keine simulierte Anmeldung.

## 1. Firebase-Projekt anlegen

1. Öffne https://console.firebase.google.com/ und erstelle ein Projekt, z. B. „Athlet“. Analytics ist für die Anmeldung nicht erforderlich.
2. Registriere im Projekt eine **Web-App** (Symbol `</>`).
3. Kopiere die öffentliche `firebaseConfig` aus den Projekteinstellungen in `dist/auth-config.js` anstelle von `firebase: null`, beispielsweise:

```js
export const authConfig = {
  firebase: {
    apiKey: 'DEIN_WEB_API_KEY',
    authDomain: 'DEIN_PROJEKT.firebaseapp.com',
    projectId: 'DEIN_PROJEKT',
    appId: 'DEINE_WEB_APP_ID'
  },
  providers: { google: true, apple: false }
};
```

Diese Web-Konfiguration ist für den Browser bestimmt. Keine Service-Account-Dateien, OAuth-Client-Secrets oder privaten Apple-Schlüssel hier eintragen. Auch keine Zugangstoken in den Chat schicken. Benötigt wird nur das öffentliche Konfigurationsobjekt deiner Web-App.

4. Aktiviere **Authentication**. Ergänze unter den autorisierten Domains:
   - `athlet-wochenplan.choicesnipe2048.chatgpt.site`
   - `localhost`, falls du lokal testest; neue Projekte enthalten dies eventuell nicht standardmäßig.
5. Nach Änderungen an `auth-config.js` muss die Site neu veröffentlicht werden. Die Konfiguration wird mit der App verteilt.

## 2. Google aktivieren

1. In Firebase Authentication unter **Sign-in method / Anmeldemethode** den Anbieter **Google** aktivieren.
2. Support-E-Mail auswählen und speichern.
3. Bei einem eigenen Google-OAuth-Client dessen autorisierte Weiterleitungs-URI prüfen: `https://DEIN_PROJEKT.firebaseapp.com/__/auth/handler`.
4. Die Anmeldedialoge und ggf. den OAuth-Zustimmungsbildschirm im eigenen Projekt korrekt konfigurieren. Bei einem Projekt im Testbetrieb sind gegebenenfalls Testnutzer erforderlich.

Quelle: https://firebase.google.com/docs/auth/web/google-signin

## 3. Apple aktivieren

Voraussetzung: Mitgliedschaft im **Apple Developer Program**. Ohne diese Einrichtung kann die Apple-Anmeldung nicht live getestet oder genutzt werden. Google kann unabhängig davon bereits aktiviert werden.

1. In Apple Developer eine App-ID mit **Sign in with Apple** konfigurieren.
2. Eine **Services ID** für die Web-Anmeldung erstellen und der App-ID zuordnen.
3. Als Domain `DEIN_PROJEKT.firebaseapp.com` und als Return URL `https://DEIN_PROJEKT.firebaseapp.com/__/auth/handler` hinterlegen. Falls eine eigene Auth-Domain verwendet wird, müssen die Angaben entsprechend übereinstimmen.
4. Einen Sign-in-with-Apple-Schlüssel erstellen. **Team ID, Key ID, Services ID und privaten Schlüssel ausschließlich in der Firebase-Konsole** beim Apple-Anbieter konfigurieren.
5. In `dist/auth-config.js` den Anbieter mit `apple: true` einschalten und neu veröffentlichen.
6. Mit einem geeigneten Apple-Testkonto die erste Anmeldung und „E-Mail-Adresse verbergen“ prüfen.

Quelle: https://firebase.google.com/docs/auth/web/apple

## Verhalten und Grenzen

- Das Firebase-SDK verifiziert und erneuert die Sitzung und verwaltet deren Persistenz. Die Oberfläche übernimmt nur die von Firebase gemeldete Identität.
- Die Anmeldung öffnet ein Anbieterfenster. Bei blockierten Fenstern zeigt die App einen Hinweis an. Auf Safari, Android und installierten PWAs muss der echte Anmeldeablauf nach Freischaltung zusätzlich geprüft werden.
- Weiterleitung statt Popup würde bei Browsern mit blockiertem Drittanbieter-Speicher eine passende Auth-Domain/Hosting-Einrichtung verlangen. Deshalb ist hier das dokumentierte Popup-Verfahren vorbereitet: https://firebase.google.com/docs/auth/web/redirect-best-practices
- Trainingsdaten werden weiterhin nur auf dem Gerät gespeichert, getrennt nach Firebase-Nutzer-ID. Gastdaten werden nicht automatisch übernommen. Der bestehende Sicherungsexport/-import erlaubt eine bewusste Übertragung.
- Die Anmeldung ist noch **keine Cloud-Synchronisierung** und schützt lokale Browserdaten nicht durch serverseitige Zugriffsregeln. Für spätere Online-Trainingsdaten sind eine Datenbank und geprüfte Nutzerberechtigungen notwendig.
- Google- und Apple-Identitäten werden nicht automatisch zusammengeführt.
- Die private Sites-Zugriffsbeschränkung bleibt erhalten. Sie ist von der Firebase-Anmeldung getrennt. Für öffentliche Endnutzer muss später die gewünschte Hosting-Zugriffsart festgelegt werden.

## Prüfen

`node auth-test.mjs` prüft die Anmeldung mit SDK-Testdoubles (Google/Apple, Abmeldung, Fehler, unkonfigurierter Zustand). Echte Anbieteranmeldungen benötigen die oben beschriebene Einrichtung.

Nach Konfiguration im echten Projekt prüfen: beide Anbieter, Abbruch, Popup-Blockade, Neuladen mit bestehender Sitzung, Abmeldung, Kontowechsel, getrennte Trainingsprofile sowie iPhone/iPad/Android.
