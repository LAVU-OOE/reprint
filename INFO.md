
## 📦 Externe Datenquellen (JSON)

Die App bezieht ihre dynamischen Daten aus zwei zentralen JSON-Dateien, die in diesem Repository gepflegt werden:

1.  **`sortiment.json`** – Enthält das Artikel-Sortiment mit Artikelnnummer, Bezeichnung und optionalem Gebinde-Suffix.
2.  **`locations.json`** – Enthält die Liste der ASZ-Standorte mit Name, Standortcode, Postleitzahl und Region.

Diese Dateien werden über die GitHub-Raw-URLs geladen und können unabhängig von der App selbst aktualisiert werden.

## 🚀 Erste Schritte & Nutzung

1.  **App öffnen:** Rufe die Seite über den bereitgestellten Link auf oder installiere sie als PWA.
2.  **Standort wählen:** Wähle im Header den gewünschten ASZ-Standort aus der dynamisch geladenen Liste.
3.  **Artikel auswählen:** Suche den gewünschten Artikel entweder über die **Art.Nr.** (numerisch gruppiert) oder die **Bezeichnung** (alphabetisch gruppiert).
4.  **Drucklayout anpassen (optional):**
    *   Klicke auf das Vorschaubild, um den interaktiven A4-Druckbogen zu öffnen.
    *   Klicke auf beliebige Positionen im Bogen, um Etiketten hinzuzufügen oder zu entfernen.
5.  **Drucken:** Klicke auf den Haupt-Button **"Jetzt Drucken"**, um den A4-Bogen mit deinen Etiketten zu drucken.

## ⚙️ Anpassung der Datenbank (CRUD)

Über den **"Optionen"**-Button kannst du auf den integrierten Datenbank-Manager zugreifen:

*   **Sortiment wählen:** Zeigt die aktuelle Artikelliste an.
*   **Datenbank verwalten:** Hier kannst du:
    *   Neue Artikel hinzufügen.
    *   Bestehende Artikel bearbeiten oder löschen.
    *   Die gesamte Datenbank als JSON-Datei exportieren.
*   **Standard sichern:** Speichert die aktuellen Einstellungen (Standort, Format, Anzahl, Startposition) als Standard im Browser.

## 🔧 Technische Details & Entwicklung

*   **Sprache:** Reines HTML, CSS und JavaScript (ES6+).
*   **Speicherung:** Verwendet `localStorage` für benutzerspezifische Einstellungen, den Sortiments-Cache und den Standort-Cache.
*   **Netzwerk:** Nutzt die `fetch`-API mit "no-store"-Cache-Strategie für die JSON-Daten, um immer aktuelle Daten zu priorisieren.
*   **Service Worker:** Der `sw.js` implementiert eine **Network-First-Strategie** für die JSON-Datenbanken und eine **Cache-First-Strategie** für statische Assets, was eine robuste Offline-Nutzung ermöglicht.
*   **Ordnerstruktur:** Die Hauptanwendung befindet sich im `/`-Ordner, alle Assets (Icons, Bilder) im `/assets/`-Ordner. Eine `index.html` im Root leitet auf die App weiter.

## 🤝 Beitrag leisten

Beiträge sind willkommen! Bitte beachte die folgenden Punkte:

1.  Forke das Repository.
2.  Erstelle einen neuen Branch für dein Feature (`git checkout -b feature/neues-feature`).
3.  Committe deine Änderungen (`git commit -m 'feat: Neues Feature hinzugefügt'`).
4.  Pushe den Branch (`git push origin feature/neues-feature`).
5.  Erstelle einen Pull Request.

**Wichtige Hinweise für Änderungen an den JSON-Datenbanken:**

*   Stelle sicher, dass die JSON-Struktur gültig ist.
*   Teste die Änderungen lokal, bevor du sie in den Hauptbranch mergst.

## 📄 Lizenz

Dieses Projekt ist Open Source und steht unter der [MIT-Lizenz](LICENSE).