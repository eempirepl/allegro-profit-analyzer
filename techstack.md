# Tech Stack Document

## 1. Overview
Niniejszy dokument opisuje stos technologiczny (tech stack) użyty w projekcie lokalnej aplikacji e-commerce, której zadaniem jest wizualizacja i analiza danych pobieranych z API BaseLinker oraz import danych z plików CSV Allegro Billing. Projekt jest realizowany jako monorepo z osobnymi sekcjami backendu i frontendu.

## 2. Backend

### 2.1. Platforma i Język
- **Node.js:** Środowisko wykonawcze dla JavaScriptu po stronie serwera.
- **TypeScript:** Zapewnia bezpieczeństwo typów i ułatwia utrzymanie kodu.

### 2.2. Framework i Biblioteki
- **Express.js:** Lekki framework do tworzenia RESTful API, umożliwiający szybkie definiowanie tras i middleware.
- **Prisma:** ORM do zarządzania bazą danych, wspierający migracje, modelowanie danych i zapewniający typowanie.
- **axios / node-fetch:** Klienci HTTP do komunikacji z API BaseLinker.
- **csv-parser / PapaParse:** Biblioteki do parsowania plików CSV, umożliwiające przetwarzanie danych z Allegro Billing.
- **Bottleneck (lub inny mechanizm kolejkowania):** Narzędzie do kontroli tempa zapytań, aby nie przekroczyć limitu 100 zapytań na minutę.
- **dotenv:** Do zarządzania zmiennymi środowiskowymi (np. token API, connection string do bazy danych).

### 2.3. Baza Danych
- **SQLite (dla lokalnego rozwoju) / PostgreSQL (dla środowisk produkcyjnych):**
  - Modele danych: Produkty, Zamówienia, Pozycje Zamówień.
- **Prisma:** Ułatwia zarządzanie schematem bazy danych oraz migracjami.

### 2.4. Narzędzia Developerskie
- **Nodemon:** Do automatycznego restartu serwera podczas pracy nad kodem.
- **Jest / Mocha:** Do testów jednostkowych i integracyjnych backendu.
- **ESLint & Prettier:** Narzędzia do utrzymania spójnego stylu kodu i formatowania.

## 3. Frontend

### 3.1. Platforma i Język
- **Next.js:** Framework oparty na React, umożliwiający server-side rendering (SSR) oraz generowanie statycznych stron (SSG).
- **TypeScript:** Zapewnia bezpieczeństwo typów w aplikacji, ułatwiając utrzymanie i rozwój kodu.

### 3.2. Styling i Biblioteki UI
- **Tailwind CSS:** Framework CSS oparty na podejściu utility-first, umożliwiający szybkie prototypowanie responsywnego interfejsu.
- **Recharts:** Biblioteka do tworzenia interaktywnych wykresów oparta na React, idealna do prezentacji danych analitycznych.

### 3.3. Zarządzanie Stanem i Pobieranie Danych
- **React Context / SWR:** Do zarządzania stanem aplikacji i asynchronicznego pobierania danych.
- **Next.js data fetching methods:** Metody takie jak `getStaticProps` i `getServerSideProps` dla pobierania danych w trakcie renderowania strony.

### 3.4. Narzędzia Developerskie
- **ESLint & Prettier:** Do utrzymania spójności kodu.
- **React Testing Library:** Do testowania komponentów UI.
- **Jest / Cypress:** Do testów jednostkowych i e2e.

## 4. CI/CD

- **GitHub Actions:** 
  - Automatyzuje procesy testowania, budowania i (opcjonalnie) deploymentu aplikacji.
  - Konfiguracja obejmuje uruchamianie testów jednostkowych, lintingu i budowania aplikacji przy każdym pushu lub pull requeście.
  
- **Docker (opcjonalnie):**
  - Możliwość konteneryzacji aplikacji, co ułatwia wdrożenie w środowiskach lokalnych lub chmurowych.

## 5. Rationale (Uzasadnienie Wyboru)
- **TypeScript:** Zapewnia bezpieczeństwo typów, co przekłada się na lepszą jakość i łatwiejsze utrzymanie kodu.
- **Express.js + Next.js:** Elastyczne rozwiązania pozwalające na szybkie prototypowanie i skalowanie aplikacji.
- **Tailwind CSS:** Umożliwia szybkie tworzenie responsywnych i estetycznych interfejsów bez konieczności pisania dużej ilości niestandardowego CSS.
- **Prisma:** Ułatwia pracę z bazą danych dzięki migracjom i automatycznemu generowaniu typów.
- **GitHub Actions:** Automatyzuje procesy CI/CD, co zapewnia ciągłą kontrolę jakości kodu i szybkie wykrywanie błędów.
- **Bottleneck / Mechanizmy kolejkowania:** Umożliwiają efektywne zarządzanie limitami API, co jest kluczowe przy integracji z BaseLinker.

## 6. Podsumowanie
Wybrany stos technologiczny pozwala na szybkie tworzenie i skalowanie lokalnej aplikacji e-commerce. Dzięki połączeniu Node.js/Express.js z Next.js oraz wsparciu narzędzi takich jak Prisma, Tailwind CSS i GitHub Actions, projekt zapewnia wysoką jakość, wydajność i elastyczność, umożliwiając efektywną analizę danych z API BaseLinker oraz import z CSV Allegro Billing.
