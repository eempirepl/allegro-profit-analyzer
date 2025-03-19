Product Requirements Document (PRD)

1\. Cel Projektu

Aplikacja ma na celu automatyzację obliczania zysków ze sprzedaży w e-commerce. Kluczowe cele to:

-   Oszczędność czasu: Zautomatyzowanie czasochłonnych kalkulacji zysków.

-   Zwiększenie precyzji: Redukcja błędów w obliczeniach dzięki automatycznemu przetwarzaniu danych.

-   Wsparcie decyzji biznesowych: Dostarczenie analiz (trendy, wykresy, raporty) wspierających optymalizację sprzedaży.

-   Integracja danych: Okresowe pobieranie danych z API BaseLinker oraz import i przetwarzanie plików CSV z platform takich jak Allegro.

2\. Kontekst Biznesowy i Wyzwania

Kontekst

-   Użytkownik: Właściciel sklepu e-commerce potrzebujący szybkiej i dokładnej analizy zysków.

-   Skalowalność: Docelowo aplikacja ma wspierać małych i średnich sprzedawców, głównie na Allegro.

-   Źródła danych: Połączenie danych z API BaseLinker oraz plików CSV z danymi sprzedażowymi.

Wyzwania

-   Limit API BaseLinker: Maksymalnie 100 zapytań na minutę wymaga optymalizacji (np. batching, kolejkowanie).

-   Synchronizacja danych: Okresowe pobieranie i konsolidacja danych z API oraz CSV dla precyzyjnych obliczeń.

-   Parsowanie CSV: Pliki z Allegro Billing muszą być dokładnie przetwarzane i łączone z danymi z API.

-   Bezpieczeństwo: Lokalny hosting aplikacji wymaga ochrony danych, mimo braku uwierzytelniania.

3\. Zakres Projektu

MVP

-   Integracja z API BaseLinker: Okresowe pobieranie danych o zamówieniach, produktach i stanach magazynowych.

-   Import CSV: Przetwarzanie plików CSV z Allegro Billing i łączenie ich z danymi z API.

-   Obliczanie zysków: Kalkulacja zysku na podstawie cen zakupu, kosztów sprzedaży (Allegro Billing, wysyłka, reklamy).

-   Wizualizacje: Dashboard z wykresami trendów sprzedaży i zysków w wybranym okresie.

-   Eksport: Raporty w formacie CSV lub PDF.

-   CI/CD: Automatyzacja testów i budowania za pomocą GitHub Actions.

Rozszerzenia (po MVP)

-   Analizy zaawansowane (np. ROAS, marża jednostkowa).

-   Automatyczne sugestie optymalizacyjne.

-   Integracje z innymi platformami (Amazon, eBay).

4\. Kluczowe Funkcjonalności MVP

1.  Okresowe pobieranie danych z API BaseLinker

    -   Autoryzacja tokenem (przechowywanym lokalnie).

    -   Okresowe pobieranie zamówień, produktów i stanów magazynowych.

    -   Optymalizacja zapytań (batching, kolejkowanie) w ramach limitu 100 req/min.

2.  Import i przetwarzanie CSV

    -   Obsługa wielu plików CSV (różne rynki/waluty).

    -   Parsowanie i wyodrębnianie identyfikatorów zamówień.

    -   Łączenie danych CSV z danymi z API BaseLinker.

3.  Obliczanie zysków

    -   Kalkulacja zysku: przychody minus koszty (ceny zakupu, prowizje, wysyłka, reklamy).

    -   Uwzględnienie różnych typów kosztów (Allegro Billing, dodatkowe opłaty).

4.  Dashboard i wizualizacje

    -   Intuicyjny dashboard z wykresami (zyski, trendy, stany magazynowe).

    -   Filtrowanie danych według okresu, produktów, kanałów sprzedaży.

    -   Eksport do CSV/PDF.

5.  CI/CD

    -   GitHub Actions do automatycznych testów i buildów.

    -   Weryfikacja kodu (ESLint, Prettier).

5\. Wymagania Niefunkcjonalne

-   Wydajność: Optymalne przetwarzanie danych z API i CSV w okresowych cyklach.

-   Skalowalność: Modularna budowa umożliwiająca dodawanie nowych funkcji.

-   Bezpieczeństwo: Ochrona danych (tokeny w .env, ograniczenie żądań) przy lokalnym hostingu.

-   Utrzymywalność: Czytelny kod z podziałem na warstwy i dokumentacją.

-   Wdrożenie: Stabilność zapewniona przez CI/CD.

6\. Architektura Systemu i Integracje

Architektura

-   Backend: Node.js, Express.js, Prisma, SQLite/PostgreSQL -- obsługa logiki i integracji.

-   Frontend: Next.js, Tailwind CSS, Recharts -- prezentacja danych i raportów.

-   Integracje:

    -   API BaseLinker: Okresowe pobieranie danych.

    -   CSV: Import i parsowanie danych z Allegro Billing.

Proces integracji

1.  Okresowe pobieranie danych z API BaseLinker z optymalizacją.

2.  Import i deduplikacja danych z CSV.

3.  Konsolidacja danych z API i CSV do obliczeń.

4.  Okresowa synchronizacja stanów i zamówień.

7\. Tech Stack

-   Backend: Node.js, Express.js, TypeScript, Prisma, SQLite/PostgreSQL.

-   Frontend: Next.js, React, TypeScript, Tailwind CSS, Recharts.

-   CI/CD: GitHub Actions.

-   Narzędzia: Biblioteki CSV (csv-parse, PapaParse), kolejkowanie (np. Bottleneck).

8\. Interfejs Użytkownika (UI) i Doświadczenie (UX)

-   Dashboard: Prosty widok z filtrami, wykresami i okresowym odświeżaniem danych.

-   Widoki: Lista produktów, szczegóły, panel zamówień, import CSV, synchronizacja BaseLinker.

-   Responsywność: Nacisk na desktop, z dostosowaniem do różnych rozdzielczości.

-   Styl: Tailwind CSS dla spójnego i iteracyjnego projektowania.

9\. Harmonogram i Kamienie Milowe

1.  Inicjalizacja

    -   Konfiguracja repozytorium, TypeScript, Express.js, Next.js.

    -   Kamień milowy: Testowy endpoint API i strona Next.js.

2.  Model danych

    -   Prisma, modele: Product, Order, OrderItem.

    -   Kamień milowy: Migracja bazy i seed danych.

3.  Integracja

    -   Serwisy do importu CSV i okresowego pobierania z API BaseLinker.

    -   Kamień milowy: Testowe pobieranie danych.

4.  Logika biznesowa

    -   Kalkulacja zysków na danych testowych.

    -   Kamień milowy: Poprawność obliczeń.

5.  UI i wizualizacje

    -   Dashboard, wykresy (Recharts), raporty.

    -   Kamień milowy: Dynamiczne wykresy.

6.  CI/CD

    -   GitHub Actions dla testów i buildów.

    -   Kamień milowy: Działający pipeline.

7.  Testy i dokumentacja

    -   Testy, optymalizacja, dokumentacja.

    -   Kamień milowy: Gotowy system.

10\. Metryki Sukcesu

-   Czas: Redukcja obliczeń o 5 godzin tygodniowo.

-   Precyzja: Wzrost dokładności o 20% wobec ręcznych metod.

-   Stabilność: Bezawaryjne okresowe pobieranie danych.

-   UX: Intuicyjny interfejs i szybkie raporty.

-   Skalowalność: Łatwość dodawania funkcji.

11\. Ryzyka i Ograniczenia

-   Limit API: 100 zapytań/min może opóźnić synchronizację.

-   CSV: Zmiana formatu plików wymaga elastyczności parsera.

-   Synchronizacja: Rozbieżności danych między API i CSV.
