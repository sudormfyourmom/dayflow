# DayFlow — Osobiste Centrum Produktywności & Przeglądarka Desktopowa Windows

DayFlow to nowoczesna, profesjonalna aplikacja desktopowa Windows (`.exe`) łącząca w jednym spójnym środowisku roboczym:
1. **Organizator dnia & Zarządzanie czasem**: Zadania, priorytety, kategorie, terminy, kalendarz miesięczny oraz harmonogram godzinowy z wykrywaniem konfliktów czasowych.
2. **Zaawansowany Notatnik**: Edytor tekstu sformatowanego oparty na Tiptap (nagłówki, listy zadań, bloki kodu, cytaty) z automatycznym zapisem (debounced sync), folderami i eksportem do Markdown / TXT.
3. **Zintegrowana Przeglądarka z wieloma kartami**: Oparta na natywnym silniku `WebContentsView` Chromium w Electronie, z nawigacją, inteligentnym paskiem adresu, zakładkami i historią.
4. **Podzielony Ekran (Split View)**:
   - **Tryb A (Przeglądarka + Notatka)**: Umożliwia jednoczesne przeglądanie witryny i sporządzanie notatek z zachowaniem proporcji paneli, zamianą stron oraz automatycznym powiązaniem źródła URL.
   - **Tryb B (Dwie strony internetowe)**: Dwie niezależne witryny internetowe wyświetlane obok siebie z osobną nawigacją.
5. **Dashboard z podsumowaniem dnia**: Zegar cyfrowy na żywo, powitanie, wskaźniki KPI (zadania na dziś, ukończone, do zrobienia, przeterminowane), priorytety i ostatnio edytowane notatki.
6. **Praca lokalna i opcjonalna chmura**: Zadania, notatki, zakładki, historia i ustawienia są dostępne lokalnie bez konta. Dane lokalne są zachowywane po ponownym uruchomieniu aplikacji. Supabase zapewnia osobny tryb logowania do chmury.
7. **Design System Dark Minimalism**: Nowoczesny ciemny motyw inspirowany estetyką Linear, Arc, Notion i Things 3 z subtelnymi akcentami i płynnymi mikrointerakcjami.

---

## Wymagania systemowe

- **System operacyjny**: Windows 10 / Windows 11 (64-bit).
- **Dla programistów**: Node.js 20+ lub 22+, npm 10+.
- **Dla użytkowników końcowych**: Samodzielny instalator `DayFlow-Setup-1.0.0.exe` (nie wymaga instalowania Node.js ani Pythona).

---

## Szybki start (Development)

1. **Sklonuj lub przejdź do katalogu projektu**:
   ```bash
   cd dayflow
   ```

2. **Zainstaluj zależności**:
   ```bash
   npm install
   ```

3. **Opcjonalnie skonfiguruj Supabase** (pomijając ten krok, uruchomisz aplikację lokalnie offline):
   Skopiuj plik `.env.example` do `.env`:
   ```bash
   cp .env.example .env
   ```
   Wprowadź adres URL projektu Supabase oraz publiczny anonimowy klucz klienta:
   ```env
   VITE_SUPABASE_URL=https://twoj-projekt.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Uruchom w trybie deweloperskim**:
   ```bash
   npm run dev:electron
   ```
   Aplikacja uruchomi serwer deweloperski Vite z Hot Module Replacement (HMR) i wystartuje okno aplikacji Electron.

---

## Tryb offline

DayFlow uruchamia lokalny tryb gościa, gdy Supabase nie jest skonfigurowany. Można wtedy tworzyć i edytować zadania, notatki, foldery, zakładki, historię oraz ustawienia bez logowania do chmury. Dane są przechowywane lokalnie na tym komputerze.

Gdy Supabase jest skonfigurowany, wybierz **Kontynuuj w trybie offline (Gość)** na ekranie logowania. Aplikacja zapamiętuje wybór i przywraca lokalną sesję po ponownym uruchomieniu. Wylogowanie kończy sesję gościa.

Tryb offline obejmuje lokalne funkcje DayFlow. Wbudowana przeglądarka otwiera strony internetowe wymagające połączenia z internetem.

## Konfiguracja Supabase (Krok po kroku)

Supabase jest opcjonalny i służy do logowania oraz pracy na koncie w chmurze. Do pracy lokalnej nie trzeba go konfigurować.

1. Zarejestruj się lub zaloguj na [supabase.com](https://supabase.com) i utwórz nowy projekt.
2. Przejdź do zakładki **SQL Editor** w panelu projektu Supabase.
3. Otwórz plik migracji znajdujący się w repozytorium:
   `supabase/migrations/20261022000000_dayflow_schema.sql`
4. Wklej jego zawartość do edytora SQL Supabase i kliknij **Run**.
   Skrypt automatycznie:
   - Włączy rozszerzenie `uuid-ossp`.
   - Utworzy wszystkie tabele: `profiles`, `user_settings`, `tasks`, `notes`, `note_folders`, `tags`, `note_tags`, `task_tags`, `bookmarks`, `browser_history`, `note_task_links`.
   - Skonfiguruje indeksy wydajnościowe.
   - Włączy **Row Level Security (RLS)** na wszystkich tabelach.
   - Doda polityki bezpieczeństwa sprawdzające `auth.uid() = user_id`.
   - Zdefiniuje wyzwalacz `handle_new_user()` automatycznie tworzący profil i domyślne ustawienia przy rejestracji użytkownika.
5. Skopiuj **Project URL** oraz **anon public key** z `Settings -> API` i umieść je w pliku `.env`.

> [!IMPORTANT]
> W aplikacji desktopowej używany jest wyłącznie klucz publiczny `anon`. Nigdy nie umieszczaj w plikach aplikacji klucza `service_role` ani haseł do bazy danych! Pełna ochrona danych gwarantowana jest przez reguły RLS.

---

## Skróty klawiszowe

| Skrót | Działanie |
|---|---|
| `Ctrl + K` | Globalna wyszukiwarka Command Palette (zadania, notatki, zakładki, foldery) |
| `Ctrl + N` | Nowa notatka |
| `Ctrl + Shift + N` | Nowe zadanie |
| `Ctrl + T` | Nowa karta w przeglądarce |
| `Ctrl + W` | Zamknięcie bieżącej karty |
| `Ctrl + ,` | Otwarcie Ustawień aplikacji |
| `Alt + Left` | Wstecz w historii strony |
| `Alt + Right` | Dalej w historii strony |

---

## Budowanie i dystrybucja Windows EXE

### 1. Sprawdzenie typów TypeScript:
```bash
npm run typecheck
```

### 2. Uruchomienie testów jednostkowych i integracyjnych:
```bash
npm run test
```

### 3. Zbudowanie paczki produkcyjnej (Vite + Electron):
```bash
npm run build
```

### 4. Wygenerowanie instalatora Windows (.exe):
```bash
npm run dist:win
```
Wygenerowany instalator instalacyjny NSIS `DayFlow-Setup-1.0.0.exe` znajdzie się w katalogu:
`release/`

Instalator umożliwia:
- Instalację na dysku w wybranym folderze.
- Utworzenie skrótu na pulpicie.
- Utworzenie skrótu w Menu Start Windows.
- Czystą deinstalację przez standardowy panel Dodaj/Usuń programy.

---

## Architektura Bezpieczeństwa (Electron Security)

1. **Izolacja kontekstu**: Główny proces renderujący działa z `contextIsolation: true` oraz `nodeIntegration: false`.
2. **Bezpieczny Preload**: Do okna renderującego przekazywane jest tylko ściśle określone API przez `contextBridge.exposeInMainWorld('electronAPI', ...)`.
3. **WebContentsView zamiast iframe**: Strony internetowe ładowane są w niezależnych natywnych widokach Chromium z włączonym `sandbox: true`, bez jakiegokolwiek dostępu do tokenów Supabase, danych aplikacji ani systemu plików.
4. **Filtrowanie schematów URL**: Blokowane są niebezpieczne schematy protokołów (`file:`, `javascript:`, `data:`). Dozwolone są wyłącznie `http:`, `https:` oraz `about:blank`.
5. **Restrykcyjne CSP**: Zdefiniowana polityka Content Security Policy dla interfejsu aplikacji.

---

## Struktura katalogów

```text
dayflow/
  electron/                  # Główny proces Electron & Preload
    main.ts                  # Inicjalizacja okna, obsługa IPC, cykl życia
    preload.ts               # Bezpieczny bridge dla API renderera
    browser/
      BrowserManager.ts      # Zarządzanie WebContentsView, synchronizacja bounds, split screen
      BrowserSecurity.ts     # Walidacja URL, filtrowanie protokołów, sandbox
    notifications/
      NotificationManager.ts # Natywne powiadomienia Windows
  src/
    app/
      App.tsx                # Główny router widoków i sesji
      providers.tsx          # TanStack Query & Auth Providers
    components/
      layout/                # Topbar, Sidebar, MainLayout
      ui/                    # Button, Input, Modal, Badge
      dialogs/               # CommandPalette (Ctrl+K), NewTaskModal, NewNoteModal
    features/
      auth/                  # Logowanie, rejestracja, weryfikacja
      dashboard/             # Zegar, metryki, priorytety, podsumowanie dnia
      tasks/                 # Lista zadań, Kalendarz, Harmonogram dnia (Timeline)
      notes/                 # Edytor Tiptap, foldery, auto-save, eksport
      browser/               # TabBar, NavigationBar, Split View
      bookmarks/             # Menedżer zakładek zintegrowany z Supabase
      history/               # Historia przeglądania z poszanowaniem prywatności
      settings/              # Ustawienia profilu, motywu, przeglądarki, powiadomień
    hooks/                   # useAuth, useTasks, useNotes, useBookmarks, etc.
    lib/                     # Supabase client, utils
    services/                # Warstwa dostępu do danych Supabase
    styles/                  # Tailwind CSS, motyw Dark Minimalism, style Tiptap
    types/                   # Typy bazy danych, electron IPC, modele domenowe
  supabase/
    migrations/              # Kompletny schemat SQL i polityki RLS
    seed.sql                 # Przykładowe dane początkowe
  tests/                     # Testy jednostkowe Vitest
  public/                    # Zasoby publiczne, ikona aplikacji
  package.json
  vite.config.ts
  vite.electron.config.ts
  electron-builder.yml
  tsconfig.json
```
