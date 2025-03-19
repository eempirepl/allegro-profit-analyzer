# Backend Structure Document

## 1. Overview
Backend aplikacji jest odpowiedzialny za pobieranie i przetwarzanie danych z API BaseLinker oraz import danych z plików CSV Allegro Billing. Kluczowe zadania backendu obejmują:
- Pobieranie danych (produkty magazynowe, zamówienia, pozycje zamówień) z API BaseLinker.
- Import i parsowanie danych z CSV (Allegro Billing) oraz łączenie ich z danymi zamówień.
- Łączenie i synchronizację danych między różnymi źródłami.
- Udostępnianie danych dla frontendu poprzez REST API.
- Obsługę logowania, error handlingu oraz kolejkowania zapytań (aby nie przekroczyć limitów API).

## 2. Tech Stack
- **Platforma:** Node.js
- **Framework:** Express.js
- **Język:** TypeScript
- **ORM:** Prisma
- **Baza danych:** SQLite (dla rozwoju lokalnego) lub PostgreSQL (dla skalowalności)
- **Inne biblioteki:** 
  - axios/ node-fetch – do komunikacji z API BaseLinker,
  - csv-parser lub PapaParse – do parsowania plików CSV,
  - Bottleneck lub inny mechanizm kolejkowania – do ograniczenia liczby zapytań,
  - dotenv – do zarządzania zmiennymi środowiskowymi.

## 3. Struktura Folderów i Plików
Poniżej przedstawiono przykładową strukturę folderów projektu backendowego:

/backend ├── prisma │ ├── schema.prisma # Definicja modeli bazy danych │ └── migrations/ # Migracje bazy danych ├── src │ ├── config │ │ └── index.ts # Konfiguracja aplikacji (env, ustawienia DB, token API BaseLinker) │ ├── controllers │ │ ├── productsController.ts # Obsługa żądań dotyczących produktów magazynowych │ │ ├── ordersController.ts # Obsługa żądań dotyczących zamówień │ │ ├── orderItemsController.ts # Obsługa żądań dotyczących pozycji zamówień │ │ └── apiSettingsController.ts# (opcjonalnie) Zarządzanie ustawieniami API │ ├── routes │ │ ├── productsRoutes.ts # Definicje endpointów dla produktów │ │ ├── ordersRoutes.ts # Definicje endpointów dla zamówień │ │ ├── orderItemsRoutes.ts# Definicje endpointów dla pozycji zamówień │ │ └── apiRoutes.ts # Endpointy związane z konfiguracją API │ ├── middlewares │ │ ├── errorHandler.ts # Globalna obsługa błędów │ │ └── logger.ts # Middleware do logowania zdarzeń │ ├── models │ │ └── index.ts # Integracja z Prisma (inicjalizacja klienta) │ ├── services │ │ ├── baseLinkerService.ts # Logika komunikacji z API BaseLinker (pobieranie danych, kolejkowanie zapytań) │ │ ├── csvImportService.ts # Import i parsowanie CSV Allegro Billing │ │ └── dataSyncService.ts # Łączenie danych z różnych źródeł (synchronizacja zamówień, pozycji, produktów) │ ├── utils │ │ ├── formatter.ts # Funkcje pomocnicze (formatowanie dat, walut, przeliczanie na PLN) │ │ └── queue.ts # Mechanizm kolejkowania zapytań do BaseLinker │ └── app.ts # Główna konfiguracja Express (inicjalizacja aplikacji, montowanie middleware, routing) ├── .env # Plik konfiguracyjny środowiska (token API, connection string do DB) ├── package.json # Zależności i skrypty (dev, build, start) └── README.md # Dokumentacja projektu backend

markdown
Kopiuj

## 4. Opis Kluczowych Modułów

### 4.1. Konfiguracja (`src/config/index.ts`)
- Odczytuje zmienne środowiskowe (np. `BASELINKER_API_TOKEN`, `DATABASE_URL`).
- Ustawia konfigurację aplikacji, np. limity zapytań, timeouty, logowanie.
- Eksportuje obiekt konfiguracyjny używany przez inne moduły.

### 4.2. Kontrolery (`src/controllers`)
- **productsController.ts:** Obsługuje żądania GET dla endpointu `/api/products`, zwracając listę produktów magazynowych.
- **ordersController.ts:** Obsługuje żądania GET dla endpointu `/api/orders`, zwracając dane o zamówieniach.
- **orderItemsController.ts:** Obsługuje żądania GET dla endpointu `/api/order-items`, zwracając szczegóły pozycji zamówień.
- **apiSettingsController.ts:** (Opcjonalnie) Umożliwia aktualizację ustawień API BaseLinker.

### 4.3. Routes (`src/routes`)
- Mapowanie tras na odpowiednie kontrolery.
- Przykładowe trasy:
  - `GET /api/products` → `productsController.getProducts`
  - `GET /api/orders` → `ordersController.getOrders`
  - `GET /api/order-items` → `orderItemsController.getOrderItems`
  - `POST /api/import-csv` → (jeśli ręczny import CSV) → `csvImportService.importCSV`

### 4.4. Middleware (`src/middlewares`)
- **errorHandler.ts:** Globalny middleware przechwytujący błędy i zwracający czytelne komunikaty.
- **logger.ts:** Middleware logujący każde żądanie oraz wyniki operacji (np. liczba pobranych rekordów, czas odpowiedzi).

### 4.5. Modele (`src/models`)
- Integracja z Prisma – inicjalizacja klienta Prisma, dostęp do modeli takich jak:
  - **Product:** Przechowuje dane produktu (ID, nazwa, SKU, cena zakupu, stan magazynowy).
  - **Order:** Przechowuje dane zamówienia (ORDER ID, źródło, data, status, dane klienta, wartości, waluta, numer zewnętrzny).
  - **OrderItem:** Przechowuje dane pozycji zamówień (cena brutto, waluta, ID produktu, identyfikator oferty).

### 4.6. Usługi (`src/services`)
- **baseLinkerService.ts:** 
  - Realizuje komunikację z API BaseLinker.
  - Implementuje mechanizm kolejkowania i batching, aby nie przekroczyć limitu 100 zapytań na minutę.
  - Pobiera dane o produktach, zamówieniach i pozycjach zamówień.
  
- **csvImportService.ts:**
  - Importuje i parsuje pliki CSV Allegro Billing.
  - Łączy dane z CSV z danymi pozycji zamówień przy użyciu identyfikatora zamówienia.
  
- **dataSyncService.ts:**
  - Łączy dane z API BaseLinker i CSV.
  - Aktualizuje bazę danych, zapewniając spójność między tabelami (produkty, zamówienia, pozycje).

### 4.7. Narzędzia Pomocnicze (`src/utils`)
- **formatter.ts:** Funkcje do formatowania dat, przeliczania walut (np. konwersja na PLN), formatowania komunikatów.
- **queue.ts:** Mechanizm kolejkowania zapytań do BaseLinker, który pozwala na kontrolę tempa wywołań API.

### 4.8. Główna Aplikacja (`src/app.ts`)
- Inicjalizacja instancji Express.
- Montowanie globalnych middleware (np. logger, parser JSON, errorHandler).
- Rejestracja tras z folderu `routes`.
- Start serwera (nasłuchiwanie na wybranym porcie).

## 5. Database & Prisma
- **Plik `schema.prisma`:** Znajduje się w folderze `prisma/` i definiuje modele danych (Product, Order, OrderItem).
- **Migracje:** Narzędzie Prisma używane do migracji schematu bazy danych.
- **Inicjalizacja:** Połączenie z bazą danych jest konfigurowane w `src/config/index.ts` i używane przez Prisma Client w `src/models/index.ts`.

## 6. API Endpoints
Przykładowe endpointy:
- **GET /api/products:** Zwraca listę produktów magazynowych.
- **GET /api/orders:** Zwraca listę zamówień.
- **GET /api/order-items:** Zwraca szczegóły pozycji zamówień.
- **POST /api/import-csv:** (Opcjonalnie) Inicjuje ręczny import pliku CSV Allegro Billing.
- **POST /api/api-settings:** (Opcjonalnie) Aktualizacja klucza API BaseLinker.

## 7. Logging, Error Handling & Monitoring
- **Logowanie:** Użycie middleware `logger.ts` do rejestrowania informacji o każdym żądaniu oraz operacjach wewnętrznych.
- **Error Handling:** Globalny middleware `errorHandler.ts` wychwytuje błędy i zwraca uporządkowane odpowiedzi.
- **Monitorowanie:** Możliwe rozszerzenie o zewnętrzne narzędzia monitorujące (np. Sentry) dla lepszej diagnostyki w środowisku produkcyjnym.

## 8. Skalowalność i Wydajność
- **Batch Processing & Kolejkowanie:** Usługa `baseLinkerService.ts` implementuje kolejkowanie, aby kontrolować liczbę zapytań do API BaseLinker.
- **Transakcje:** Użycie transakcji Prisma podczas aktualizacji bazy, aby zapewnić spójność danych przy łączeniu importu CSV z danymi z API.
- **Caching:** Możliwość implementacji cache’owania najczęściej pobieranych danych (np. produkty magazynowe) dla lepszej wydajności.

## 9. Podsumowanie
Backend aplikacji został zaprojektowany modularnie z podziałem na:
- **Konfigurację i ustawienia** (config),
- **Logikę przetwarzania danych** (kontrolery, usługi, modele),
- **Obsługę tras i middleware** (routes, middlewares),
- **Narzędzia pomocnicze** (utils).

Takie podejście ułatwia utrzymanie, testowanie oraz przyszłe rozszerzenia, gwarantując spójność danych i efektywne przetwarzanie informacji z API BaseLinker oraz plików CSV Allegro Billing.





