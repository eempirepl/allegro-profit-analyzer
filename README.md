# Allegro Profit Analyzer

Aplikacja do analizy zysków ze sprzedaży na Allegro, umożliwiająca wizualizację i analizę danych pobieranych z API BaseLinker oraz import danych z plików CSV Allegro Billing.

## Technologie

### Backend
- Node.js z TypeScript
- Express.js
- Prisma ORM
- SQLite (development) / PostgreSQL (produkcja)

### Frontend
- Next.js z TypeScript
- Tailwind CSS
- Recharts (wizualizacja danych)
- SWR (pobieranie danych)

## Struktura projektu

```
allegro-profit-analyzer/
├── backend/                # Aplikacja backend
│   ├── prisma/             # Modele bazy danych Prisma
│   ├── src/                # Kod źródłowy
│   │   ├── config/         # Konfiguracja
│   │   ├── controllers/    # Kontrolery API
│   │   ├── middlewares/    # Middleware Express
│   │   ├── models/         # Modele danych
│   │   ├── routes/         # Definicje tras
│   │   ├── services/       # Warstwa usług
│   │   └── utils/          # Narzędzia pomocnicze
│   └── tests/              # Testy
│
└── frontend/               # Aplikacja frontend
    ├── components/         # Komponenty React
    ├── context/            # Context API
    ├── hooks/              # Hooki React
    ├── pages/              # Strony Next.js
    ├── public/             # Statyczne zasoby
    ├── styles/             # Style CSS/SCSS
    └── utils/              # Funkcje pomocnicze
```

## Instrukcje

### Wymagania

- Node.js (minimum v18.0.0)
- npm (lub yarn)

### Instalacja

1. Sklonuj repozytorium:
   ```
   git clone https://github.com/twoj-login/allegro-profit-analyzer.git
   cd allegro-profit-analyzer
   ```

2. Zainstaluj zależności:
   ```
   npm install
   ```

3. Skonfiguruj zmienne środowiskowe:
   - Skopiuj plik `.env.example` na `.env` w folderze `backend`
   - Uzupełnij wymagane zmienne środowiskowe (tokeny API, itp.)

4. Uruchom migracje bazy danych:
   ```
   npm run prisma:migrate --workspace=backend
   ```

### Uruchamianie aplikacji

Uruchom aplikację w trybie deweloperskim:

```
npm run dev
```

To polecenie uruchomi zarówno backend (port 3001), jak i frontend (port 3000).

### Budowanie do produkcji

```
npm run build
```

## Funkcje

- Importowanie danych z Allegro Billing CSV
- Pobieranie danych o produktach i zamówieniach z BaseLinker API
- Analiza rentowności poszczególnych produktów i zamówień
- Generowanie wykresów i raportów
- Śledzenie kosztów opłat Allegro i innych kosztów
- Obliczanie rzeczywistego zysku po uwzględnieniu wszystkich kosztów

## Licencja

Copyright © 2025 

# Przygotowanie środowiska do implementacji planu

## Podsumowanie wykonanych kroków

1. **Utworzenie modułu do limitowania zapytań API**:
   - Utworzono plik `backend/src/utils/queue.ts` z implementacją mechanizmu limitowania zapytań API BaseLinker
   - Użyto biblioteki Bottleneck do obsługi limitów (100 zapytań na minutę)
   - Dodano logowanie zdarzeń i obsługę błędów

2. **Refaktoryzacja serwisu BaseLinker**:
   - Zmodyfikowano plik `backend/src/services/baseLinkerService.ts` 
   - Zastąpiono bezpośrednie użycie Bottleneck nową implementacją z `queue.ts`
   - Zmieniono funkcję `makeBaseLinkerRequest` do korzystania z `executeWithRateLimit`

3. **Poprawki w konfiguracji bazy danych**:
   - Zaktualizowano plik `backend/src/config/db.ts`
   - Poprawiono eksport `mockPrisma` jako `prisma` dla kontrolerów

4. **Poprawki w kontrolerach**:
   - Zaktualizowano importy w kontrolerach, aby używały poprawnie eksportowanego obiektu `prisma`
   - Naprawiono pliki `productController.ts`, `orderController.ts`, `allegroController.ts`

5. **Kompilacja i testy**:
   - Skompilowano projekt za pomocą TypeScript
   - Zweryfikowano obecność skompilowanych plików w katalogu `dist`
   - Pomyślnie uruchomiono backend w trybie deweloperskim

## Stan przygotowania

Środowisko zostało pomyślnie skonfigurowane do wdrożenia planu implementacji:

1. ✅ Mechanizm limitowania zapytań API jest gotowy
2. ✅ Serwis BaseLinker został zrefaktoryzowany do użycia nowego mechanizmu limitowania
3. ✅ Struktura bazy danych i kontrolery zostały poprawione
4. ✅ Kompilacja TypeScript działa poprawnie
5. ✅ Backend uruchamia się bez błędów

### Następne kroki

Zgodnie z planem implementacji, kolejne kroki to:

1. Implementacja kontrolerów produktów, zamówień i elementów zamówień
2. Implementacja serwisu synchronizacji danych
3. Integracja endpointów w aplikacji Express
4. Implementacja frontendu (hooki, komponenty, strony)

Teraz zespół może przystąpić do realizacji planu, mając przygotowane podstawowe narzędzia i mechanizmy niezbędne do komunikacji z API BaseLinker zgodnie z ograniczeniami dotyczącymi limitów zapytań. 