# Athlet

Installierbare, responsive Web-App für ergänzendes Sporttraining. Ohne Build oder Server-Abhängigkeiten; `dist/index.html` ist der Einstieg.

## Lokal starten

**Einzelne HTML-Datei:** `Athlet.html` direkt per Doppelklick im Browser öffnen. CSS, JavaScript und Symbol sind eingebettet; es wird kein Server benötigt. Nach Änderungen an `dist/` mit `node make-html.mjs` neu erzeugen. In dieser lokalen Variante bleibt die Kontoanmeldung deaktiviert.

Im Projektordner: `python3 -m http.server 8080 --directory dist`

Dann `http://localhost:8080` öffnen. Für Installation und Service Worker wird HTTPS oder localhost benötigt.

## Umfang

- Wochenpläne für 1–6 Einheiten mit 15–90 Minuten; mehrere Sportarten, Geräte und Ziele.
- Geräteabhängige Übungen; Aufwärmen, Kraft, Koordination, Ausdauer, Mobilität und Dehnen.
- Lockere Aktivierung bei Wettkämpfen am selben Tag oder innerhalb der folgenden zwei Tage.
- Geführte Einheiten mit Timer, Pausen, optionaler Sprachausgabe und manuellem Wiederholungszähler. Seitenwechsel erfolgen eigenständig nach Übungsanweisung.
- Sonntagsabfrage beim Öffnen, wiederkehrende Kalendererinnerung als ICS.
- Lokale Speicherung, JSON-Sicherung und Wiederherstellung; Offlinebetrieb nach erstem Laden.
- Google-/Apple-Anmeldung über Firebase vorbereitet; Einrichtung siehe [AUTH_SETUP.md](AUTH_SETUP.md). Ohne Projektkonfiguration ist weiterhin Gastnutzung möglich. Nach Freischaltung getrennte lokale Trainingsdaten pro Konto.

Die Planung ist regelbasiert, kein KI- oder medizinisches Modell. Sie erfasst weder Trainingshistorie des Hauptsports noch Verletzungen oder Leistungsniveau. Ziele steuern Schwerpunkte, keine messbare individuelle Periodisierung. Wiederholungen werden manuell gezählt; keine Kamera- oder Sensorerkennung. Kein Trainingsdaten-Backend, Pushdienst oder automatische Planung bei geschlossener App. Keine nativen Store-Apps und keine automatische Synchronisierung zwischen Geräten. Echte Google-/Apple-Anmeldung ist erst nach externer Einrichtung möglich; die bestehende private Sites-Zugriffsbeschränkung bleibt separat bestehen.

## Prüfung

`node test.cjs` prüft Planlänge, Zeitbudgets, alle Sportarten, Geräte, Koordination und Wettkampfentlastung. `node --check dist/app.js` prüft die JavaScript-Syntax. `node auth-test.mjs` prüft die Authentifizierung mit einem SDK-Testdouble. Echte Anbieteranmeldungen stehen bis zur Projektkonfiguration als ungeprüft aus.
