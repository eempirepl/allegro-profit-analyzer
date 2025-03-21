# Dokumentacja projektu Allegro Profit Analyzer

## 1. Przegląd projektu

Allegro Profit Analyzer to aplikacja umożliwiająca automatyzację obliczania zysków ze sprzedaży w e-commerce, ze szczególnym uwzględnieniem platformy Allegro. Aplikacja integruje się z API BaseLinker oraz pozwala na import plików CSV z Allegro Billing w celu kompleksowej analizy przychodów i kosztów.

Główne funkcjonalności:
- Automatyczne pobieranie danych o produktach, zamówieniach i pozycjach zamówień z BaseLinker
- Import i przetwarzanie danych z plików CSV Allegro Billing
- Obliczanie rzeczywistych zysków ze sprzedaży z uwzględnieniem wszystkich kosztów
- Prezentacja danych w formie dashboardu z wykresami i tabelami
- Eksport raportów w formatach CSV/PDF

Aplikacja działa jako system lokalny, bez konieczności uwierzytelniania użytkowników, ale z zachowaniem bezpieczeństwa danych poprzez przechowywanie tokenów API w zmiennych środowiskowych.

## 2. Wymagania wstępne

### Wymagania systemowe
- Node.js v18.0.0 lub nowszy
- NPM 9.0.0 lub nowszy
- System operacyjny: Windows, MacOS lub Linux

### Zależności główne
- **Frontend**:
  - Next.js 14.0.0
  - React 18.2.0
  - React DOM 18.2.0
  - SWR 2.2.4
  - TailwindCSS 3.3.5
  - Recharts 2.9.0
  - @heroicons/react 2.2.0

- **Backend**:
  - Node.js
  - Express.js 4.18.2 
  - TypeScript 5.2.2
  - Prisma 5.6.0
  - axios 1.8.3
  - bottleneck 2.19.5
  - dotenv 16.4.7
  - winston 3.17.0
  - cors 2.8.5
  - csv-parser 3.0.0
  - express-async-errors 3.1.1

### Narzędzia deweloperskie i testowe
- ESLint 8.52.0
- Jest 29.7.0
- Nodemon 3.0.1
- TypeScript 5.2.2
- Concurrently 8.2.2

## 3. Struktura projektu

```
allegro-profit-analyzer/
├── backend/                  # Kod backendu aplikacji
│   ├── prisma/               # Schemat bazy danych i migracje
│   ├── src/                  # Kod źródłowy backendu
│   │   ├── config/           # Konfiguracja aplikacji
│   │   ├── controllers/      # Kontrolery obsługujące żądania HTTP
│   │   ├── middlewares/      # Middleware Express.js
│   │   ├── routes/           # Definicje tras API
│   │   ├── services/         # Serwisy biznesowe i integracje
│   │   ├── types/            # Definicje typów TypeScript
│   │   ├── utils/            # Narzędzia pomocnicze
│   │   └── app.ts            # Główny plik aplikacji Express.js
│   ├── .env                  # Zmienne środowiskowe backendu
│   ├── package.json          # Zależności backendu
│   └── tsconfig.json         # Konfiguracja TypeScript dla backendu
│
├── frontend/                 # Kod frontendu aplikacji
│   ├── components/           # Komponenty React
│   ├── hooks/                # Niestandardowe hooki React
│   ├── pages/                # Strony Next.js
│   ├── public/               # Statyczne pliki
│   ├── styles/               # Style CSS/Tailwind
│   ├── utils/                # Narzędzia pomocnicze
│   ├── next.config.js        # Konfiguracja Next.js
│   ├── package.json          # Zależności frontendu
│   ├── tailwind.config.js    # Konfiguracja Tailwind CSS
│   └── tsconfig.json         # Konfiguracja TypeScript dla frontendu
│
├── .gitignore                # Lista ignorowanych plików git
├── package.json              # Główny plik zależności i skrypty projektu
├── plan.md                   # Plan implementacji
├── README.md                 # Readme projektu
└── dokumentacja.md           # Ta dokumentacja
```

### Kluczowe pliki

#### Backend
- **app.ts**: Główny plik aplikacji Express.js, konfiguruje middleware, trasy i obsługę błędów
- **baseLinkerService.ts**: Serwis odpowiedzialny za integrację z API BaseLinker
- **baselinkerController.ts**: Kontroler obsługujący żądania HTTP związane z BaseLinker
- **baselinkerRoutes.ts**: Definicja tras API dla danych BaseLinker
- **logger.ts**: Konfiguracja systemu logowania przy użyciu Winston
- **db.ts**: Konfiguracja bazy danych i modeli Prisma

#### Frontend
- **pages/**: Strony aplikacji Next.js, w tym dashboard, ustawienia, listy produktów i zamówień
- **components/Layout.tsx**: Główny komponent układu aplikacji
- **components/Sidebar.tsx**: Komponent nawigacji bocznej
- **hooks/useProducts.ts**: Hook do pobierania danych o produktach
- **pages/settings.tsx**: Strona konfiguracji API BaseLinker

## 4. Instrukcje konfiguracji krok po kroku

### 1. Klonowanie repozytorium
```bash
git clone https://github.com/eempirepl/allegro-profit-analyzer.git
cd allegro-profit-analyzer
```

### 2. Instalacja zależności
```bash
npm install
```

Ta komenda instaluje zależności dla głównego projektu oraz zależności dla katalogów frontend i backend.

### 3. Konfiguracja zmiennych środowiskowych

#### Backend (.env)
Utwórz plik `.env` w katalogu `backend/` z następującą zawartością:
```
# API BaseLinker
BASELINKER_API_TOKEN=your_baselinker_token_here

# Konfiguracja bazy danych
DATABASE_URL="file:./dev.db"

# Konfiguracja serwera
PORT=3001
NODE_ENV=development

# Konfiguracja logowania
LOG_LEVEL=info
```

### 4. Inicjalizacja bazy danych
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
cd ..
```

### 5. Budowanie projektu
```bash
npm run build
```

## 5. Wyjaśnienie kodu

### Integracja z BaseLinker API

Kluczowym elementem aplikacji jest serwis `baseLinkerService.ts`, który obsługuje komunikację z API BaseLinker:

```typescript
// Funkcja pomocnicza do wykonania zapytania do BaseLinker z zastosowaniem limitera
const makeBaseLinkerRequest = async (method: string, parameters: Record<string, any> = {}) => {
  try {
    // Użycie limitera do ograniczenia liczby zapytań
    return await limiter.schedule(() => {
      logger.info(`Wywołanie BaseLinker API: ${method}`);
      
      const params = new URLSearchParams();
      params.append('token', config.baseLinkerToken);
      params.append('method', method);
      
      if (Object.keys(parameters).length > 0) {
        params.append('parameters', JSON.stringify(parameters));
      }
      
      return baseLinkerClient.post('', params);
    });
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas wywołania BaseLinker API (${method}): ${baseLinkerError.message}`);
    throw error;
  }
};
```

Ta funkcja wykorzystuje bibliotekę `Bottleneck` do limitowania liczby zapytań do API BaseLinker zgodnie z dokumentacją API (100 zapytań na minutę).

### Pobieranie produktów z BaseLinker

```typescript
export const getProducts = async (inventoryId?: string, page = 1, limit = 100) => {
  try {
    const parameters = {
      inventory_id: inventoryId || '',
      filter_category_id: 0,
      filter_ean: '',
      filter_sku: '',
      filter_name: '',
      filter_price_from: 0,
      filter_price_to: 0,
      filter_quantity_from: 0,
      filter_quantity_to: 0,
      filter_sort: 'id-asc',
      page: page,
      filter_id: '',
    };

    const response = await makeBaseLinkerRequest('getInventoryProductsList', parameters);
    
    logger.info(`Pobrano ${response.data.products ? response.data.products.length : 0} produktów`);
    return response.data;
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas pobierania produktów: ${baseLinkerError.message}`);
    throw error;
  }
};
```

### Synchronizacja danych z BaseLinker

```typescript
export const syncBaseLinkerData = async (dateFrom: number, dateTo: number) => {
  try {
    logger.info('Rozpoczęcie synchronizacji danych z BaseLinker');
    
    // Pobierz produkty
    const productsData = await getProducts();
    
    // Pobierz zamówienia
    const ordersData = await getOrders(dateFrom, dateTo);
    
    // Dla każdego zamówienia pobierz pozycje
    const orderItems: OrderItem[] = [];
    for (const order of ordersData.orders || []) {
      const items = await getOrderItems(order.order_id);
      orderItems.push(...items.map((item: BaseLinkerOrderItem) => ({ ...item, order_id: order.order_id })));
    }
    
    logger.info('Synchronizacja danych z BaseLinker zakończona pomyślnie');
    
    return {
      products: productsData.products || [],
      orders: ordersData.orders || [],
      orderItems
    };
  } catch (error) {
    const baseLinkerError = error as BaseLinkerError;
    logger.error(`Błąd podczas synchronizacji danych z BaseLinker: ${baseLinkerError.message}`);
    throw error;
  }
};
```

### Strona ustawień API

Frontend zawiera stronę ustawień API, która pozwala użytkownikowi na wprowadzenie i zapisanie tokenu API BaseLinker:

```typescript
const Settings: React.FC = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<null | { success: boolean; message: string }>(null);

  // Pobranie tokenu przy ładowaniu strony
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('/api/settings/token');
        if (response.data.token) {
          setToken(response.data.token);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania tokenu API', error);
      }
    };

    fetchToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    setTestResult(null);

    try {
      const response = await axios.post('/api/settings/token', { token });
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 2000); // Przekierowanie na stronę główną po 2 sekundach
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas zapisywania tokenu API');
    } finally {
      setLoading(false);
    }
  };
```

## 6. Jak uruchomić projekt

### Uruchomienie w trybie deweloperskim

```bash
npm run dev
```

Ta komenda uruchamia zarówno backend (na porcie 3001) jak i frontend (na porcie 3000) w trybie deweloperskim, z automatycznym odświeżaniem przy zmianach.

### Uruchomienie w trybie produkcyjnym

```bash
npm run build
npm run start
```

Pierwsza komenda buduje zarówno backend jak i frontend, a druga uruchamia aplikację w trybie produkcyjnym.

### Testy

```bash
npm run test
```

Ta komenda uruchamia testy jednostkowe dla backendu i frontendu.

### Dostęp do aplikacji

Po uruchomieniu, aplikacja jest dostępna:
- Frontend: `http://localhost:3000`
- API Backend: `http://localhost:3001`

## 7. Przepływ danych w aplikacji

1. **Pobieranie danych z API BaseLinker**:
   - Serwis `baseLinkerService.ts` pobiera dane o produktach, zamówieniach i pozycjach zamówień
   - Dane są zapisywane w bazie danych

2. **Import danych z CSV**:
   - Użytkownik może zaimportować pliki CSV z Allegro Billing
   - Dane z CSV są parsowane i łączone z odpowiednimi zamówieniami i pozycjami zamówień

3. **Wizualizacja danych**:
   - Frontend pobiera dane z API backendu
   - Dane są wyświetlane w formie dashboardu, tabel i wykresów

4. **Obliczanie zysków**:
   - System oblicza rzeczywiste zyski, uwzględniając wszystkie koszty (prowizje, wysyłka, reklamy)
   - Wyniki są prezentowane w formie tabel i wykresów

## 8. Rozszerzenia i przyszły rozwój

Na podstawie planu implementacji, przyszłe rozszerzenia obejmują:

1. **Analizy zaawansowane**:
   - Analiza ROAS (Return on Advertising Spend)
   - Analiza marży jednostkowej

2. **Automatyczne sugestie optymalizacyjne**:
   - Rekomendacje dotyczące optymalizacji cen
   - Sugestie dotyczące zarządzania zapasami

3. **Integracje z innymi platformami**:
   - Rozszerzenie na Amazon, eBay i inne platformy e-commerce

4. **Zaawansowane wizualizacje**:
   - Dodatkowe wykresy i raporty
   - Interaktywne dashboardy z możliwością dostosowania

## 9. Podsumowanie

Allegro Profit Analyzer to kompleksowe narzędzie dla sprzedawców e-commerce, automatyzujące obliczanie zysków ze sprzedaży. Dzięki integracji z API BaseLinker oraz importowi danych z Allegro Billing, aplikacja dostarcza precyzyjne analizy i wizualizacje, wspierając podejmowanie decyzji biznesowych.

Projekt wykorzystuje nowoczesny stack technologiczny (Node.js, Express, Next.js, Tailwind CSS) i jest zaprojektowany z myślą o skalowalności i łatwej rozbudowie o nowe funkcjonalności. 