# Frontend Guidelines

## 1. Overview
Niniejszy dokument określa wytyczne dotyczące implementacji interfejsu użytkownika dla aplikacji e-commerce, której głównym zadaniem jest prezentacja danych pobieranych z API BaseLinker oraz importowanych z CSV Allegro Billing. Aplikacja działa wyłącznie w trybie odczytu i składa się z kilku kluczowych zakładek: Dashboard, Lista Produktów, Zamówienia, Pozycje Zamówień oraz API. Guidelines mają na celu zapewnienie spójności, czytelności i wysokiej jakości kodu, a także zoptymalizowanie doświadczenia użytkownika.

## 2. Tech Stack
- **Framework:** Next.js (React)
- **Język:** TypeScript
- **Styling:** Tailwind CSS
- **Wizualizacje:** Recharts
- **State Management:** React Context (opcjonalnie) lub SWR do pobierania danych
- **Testowanie:** React Testing Library, Cypress (dla e2e)
- **Narzędzia developerskie:** ESLint, Prettier (konfiguracja wspólna dla całego projektu)

## 3. Struktura Folderów
Zalecana struktura folderów dla aplikacji Next.js:
/frontend ├── components/ # Reużywalne komponenty UI (np. Navbar, ProductCard, OrderTable) ├── pages/ # Strony aplikacji (Dashboard, lista produktów, zamówienia, pozycje, API) │ ├── index.tsx # Dashboard – główna strona z podsumowaniem metryk │ ├── products.tsx # Lista Produktów │ ├── orders.tsx # Zakładka Zamówienia │ ├── order-items.tsx # Zakładka Pozycje Zamówień │ └── api-settings.tsx # Zakładka API (konfiguracja klucza API) ├── styles/ # Globalne style i konfiguracja Tailwind CSS │ ├── globals.css │ └── tailwind.config.js ├── public/ # Statyczne zasoby (obrazy, czcionki) ├── hooks/ # Własne hooki (np. useProducts, useOrders, useOrderItems) ├── utils/ # Narzędzia pomocnicze (np. formatowanie dat, walut, helper do obliczeń) └── context/ # Kontekst aplikacji (np. API context, global state)

markdown
Kopiuj

## 4. Code Style & Best Practices
- **TypeScript:** Używaj typów i interfejsów dla komponentów oraz propsów. Staraj się unikać `any`.
- **ESLint & Prettier:** Skonfiguruj ESLint oraz Prettier, aby wymusić spójny styl kodu. Używaj reguł takich jak:
  - Preferowanie funkcji strzałkowych dla komponentów.
  - Unikanie zbędnych importów.
  - Stosowanie nazewnictwa PascalCase dla komponentów.
- **Komentarze:** Komentuj złożone fragmenty kodu, ale unikaj nadmiernej dokumentacji oczywistych elementów.
- **Testowanie:** Pisz testy jednostkowe dla krytycznych komponentów i hooków.

## 5. UI/UX Guidelines
- **Responsywność:** 
  - Używaj Tailwind CSS do tworzenia responsywnych layoutów (klasy takie jak `sm:`, `md:`, `lg:`) – projekt musi działać na różnych rozdzielczościach.
  - Testuj widoki na urządzeniach mobilnych i desktopowych.
  
- **Spójny Design:**
  - Wprowadź system designu oparty na Atomic Design – oddzielaj małe elementy (przyciski, ikony) od większych komponentów (karty, tabele).
  - Używaj ustalonej palety kolorów i typografii zdefiniowanej w Tailwind CSS.
  
- **Nawigacja:**
  - Zapewnij intuicyjną nawigację między zakładkami (np. pasek nawigacyjny lub menu boczne).
  - Upewnij się, że każda zakładka jest łatwo dostępna i czytelna.
  
- **Interaktywność:**
  - Wykorzystuj animacje i przejścia (np. `transition` w Tailwind), aby poprawić doświadczenie użytkownika.
  - Elementy interaktywne (przyciski, linki) powinny mieć efekty hover i focus.

## 6. Komponenty i Struktura UI
- **Dashboard:**
  - Prezentacja kluczowych metryk: liczba produktów, liczba zamówień, łączna wartość sprzedaży.
  - Wykresy (Recharts) do prezentacji trendów – np. wykres słupkowy sprzedaży, linowy trend zysków.
  
- **Lista Produktów:**
  - Tabela lub siatka z informacjami: ID produktu, nazwa, SKU, cena zakupu, stan magazynowy.
  - Komponent `ProductCard` do prezentacji szczegółów produktu.
  
- **Zakładka Zamówienia:**
  - Tabela z danymi: ORDER ID, źródło zamówienia, data, status, nazwa statusu, imię i nazwisko, login, wartość zamówienia, wartość dostawy, waluta, przeliczenie na PLN, numer zewnętrzny.
  - Możliwość filtrowania i sortowania wyników.
  
- **Zakładka Pozycje Zamówień:**
  - Tabela prezentująca: cena brutto pozycji, waluta, ID produktu, identyfikator oferty z marketplace.
  - Pozycje powiązane z zamówieniami poprzez ORDER ID – zastosowanie hooków do pobierania powiązanych danych.
  
- **Zakładka API:**
  - Formularz umożliwiający wprowadzenie i zapisanie klucza API BaseLinker.
  - Walidacja wprowadzonych danych i informacja o statusie połączenia.

## 7. Responsiveness i Dostępność (Accessibility)
- **Responsywność:** 
  - Używaj responsywnych jednostek i klas Tailwind CSS.
  - Testuj na różnych urządzeniach i przeglądarkach.
  
- **Dostępność (Accessibility):**
  - Stosuj odpowiednie atrybuty ARIA w elementach interaktywnych.
  - Upewnij się, że kontrasty kolorów są odpowiednie.
  - Wszystkie obrazy powinny mieć opisy (`alt`), a formularze etykiety (label) powiązane z inputami.

## 8. Performance
- **Lazy Loading:** 
  - Lazy-loaduj komponenty lub dane, które nie są potrzebne natychmiast przy starcie aplikacji (np. wykresy w zakładce, która nie jest widoczna przy ładowaniu strony).
- **Optymalizacja zasobów:** 
  - Używaj wbudowanego komponentu Next.js `<Image>` do optymalizacji ładowania obrazów.
  - Stosuj code-splitting, aby zmniejszyć początkowy rozmiar ładowanego kodu.

## 9. Testing i CI
- **Testowanie Komponentów:**
  - Używaj React Testing Library do testowania zachowania komponentów oraz interakcji użytkownika.
- **Integracja z CI:**
  - Skonfiguruj testy w GitHub Actions, aby przy każdym pushu uruchamiały się testy jednostkowe.
  - Monitoruj pokrycie kodu i reaguj na ewentualne spadki jakości.

## 10. Dokumentacja i Komunikacja
- **Komentarze:** 
  - Upewnij się, że wszystkie złożone komponenty i hooki posiadają komentarze wyjaśniające ich działanie.
- **README:** 
  - Dołącz szczegółowy README z instrukcjami dotyczącymi uruchomienia i rozwoju frontendu.
- **Storybook (opcjonalnie):**
  - Rozważ integrację Storybook do prezentacji i testowania komponentów UI w izolacji.

## 11. Podsumowanie
Frontend aplikacji musi być responsywny, dostępny i spójny wizualnie. Wyżej opisane wytyczne mają na celu ułatwienie pracy zespołu developerskiego, zapewnienie wysokiej jakości kodu oraz poprawę doświadczenia użytkownika. Stosując się do tych zasad, aplikacja będzie łatwa w utrzymaniu i rozwoju, co jest kluczowe przy integracjach z zewnętrznymi systemami, takimi jak API BaseLinker i dane z CSV Allegro Billing.