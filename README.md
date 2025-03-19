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