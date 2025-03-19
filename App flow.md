# App Flow Document

## 1. Overview
Aplikacja e-commerce służy do wizualizacji i analizy danych pobieranych z API BaseLinker oraz importu danych z CSV Allegro Billing. System działa wyłącznie w trybie odczytu – użytkownik nie składa zamówień, a jedynie przegląda dane dotyczące:

- **Magazynu produktów:** Lista produktów magazynowych pobierana z BaseLinker.
- **Zamówień:** Informacje o zamówieniach pobierane z BaseLinker.
- **Pozycji zamówień:** Szczegółowe pozycje zamówień powiązane z danymi zamówień oraz produktami magazynowymi.
- **API:** Ustawienia (np. klucz API BaseLinker) wprowadzane przez użytkownika.
- **CSV Allegro Billing:** Dane z plików CSV, które są powiązane z pozycjami zamówień na podstawie identyfikatora zamówienia.

Główne okno aplikacji to **dashboard**, prezentujące podsumowanie kluczowych metryk, a dodatkowo aplikacja udostępnia następujące zakładki:
- Lista Produktów
- Zamówienia
- Pozycje Zamówień
- API

## 2. Architecture Overview
Aplikacja składa się z dwóch głównych części:

- **Backend (Node.js / Express.js):**
  - Pobiera dane z API BaseLinker (produkty, zamówienia, pozycje zamówień).
  - Importuje i przetwarza dane z plików CSV (Allegro Billing).
  - Łączy dane – powiązanie zamówień z pozycjami oraz danych produktów magazynowych z pozycjami zamówień.
  - Udostępnia REST API dla frontendu.

- **Frontend (Next.js):**
  - Prezentuje interfejs użytkownika w formie dashboardu z kilkoma zakładkami:
    - **Dashboard:** Podsumowanie kluczowych metryk.
    - **Lista Produktów:** Widok produktów magazynowych z danymi: ID produktu, nazwa, SKU, cena zakupu, stan magazynowy.
    - **Zamówienia:** Widok zamówień z informacjami: ORDER ID, źródło zamówienia, data zamówienia, status, nazwa statusu, imię i nazwisko, login zamawiającego, wartość zamówienia, wartość dostawy, waluta, przeliczenie na PLN (dla walut innych niż PLN) oraz numer zewnętrzny zamówienia.
    - **Pozycje Zamówień:** Lista pozycji zamówień, powiązana z zamówieniami po ORDER ID, zawierająca dane: cena brutto pozycji, waluta, ID produktu, identyfikator oferty z marketplace. ID produktu jest powiązane z danymi z listy produktów magazynowych.
    - **API:** Umożliwia wprowadzenie oraz konfigurację klucza API BaseLinker.

## 3. User Flow
### 3.1. Wejście do Aplikacji
- Użytkownik uruchamia aplikację, która domyślnie wyświetla **dashboard** z podsumowaniem najważniejszych danych (np. liczba produktów, zamówień, łączna wartość sprzedaży, alerty synchronizacji).

### 3.2. Przeglądanie Danych
- **Zakładka Lista Produktów:**
  - Wyświetlana jest tabela z produktami magazynowymi pobranymi z API BaseLinker.
  - Kolumny: ID produktu, nazwa, SKU, cena zakupu, stan magazynowy.
  
- **Zakładka Zamówienia:**
  - Wyświetlana jest lista zamówień pobierana z API BaseLinker.
  - Kolumny: ORDER ID, źródło zamówienia, data zamówienia, status, nazwa statusu, imię i nazwisko, login zamawiającego, wartość zamówienia, wartość dostawy, waluta, przeliczenie na PLN, numer zewnętrzny zamówienia.
  
- **Zakładka Pozycje Zamówień:**
  - Wyświetlana jest tabela z pozycjami zamówień.
  - Kolumny: cena brutto pozycji, waluta, ID produktu, identyfikator oferty z marketplace.
  - Pozycje te są powiązane z zamówieniami na podstawie ORDER ID oraz z danymi produktów magazynowych przez ID produktu.
  
- **Zakładka API:**
  - Użytkownik wprowadza klucz API BaseLinker, który jest wykorzystywany do autoryzacji i pobierania danych.

### 3.3. Import i Synchronizacja Danych
- **Import CSV Allegro Billing:**
  - System importuje pliki CSV zawierające dane z Allegro Billing.
  - Dane CSV są parsowane i łączone z pozycjami zamówień na podstawie identyfikatora zamówienia.
  
- **Synchronizacja z API BaseLinker:**
  - Backend okresowo lub na żądanie pobiera dane z API BaseLinker:
    - Produkty magazynowe.
    - Zamówienia.
    - Pozycje zamówień.
  - Mechanizmy kolejkowania oraz batch processing zapewniają, że nie zostaną przekroczone limity API (100 zapytań na minutę).

## 4. Data Flow (Backend Flow)
### 4.1. Pobieranie Danych z API BaseLinker
- **Produkty Magazynowe:**
  - Backend wysyła zapytania do API BaseLinker w celu pobrania listy produktów magazynowych.
  - Otrzymane dane (ID produktu, nazwa, SKU, cena zakupu, stan magazynowy) są zapisywane w bazie danych.

- **Zamówienia:**
  - Pobierane są dane zamówień, zawierające: ORDER ID, źródło, datę, status, nazwy statusów, dane klienta (imię, nazwisko, login), wartość zamówienia, wartość dostawy, walutę, przeliczenie na PLN, numer zewnętrzny.
  - Dane te trafiają do tabeli zamówień w bazie danych.

- **Pozycje Zamówień:**
  - Pobierane są szczegółowe dane pozycji zamówień.
  - Otrzymane informacje (cena brutto, waluta, ID produktu, identyfikator oferty z marketplace) są zapisywane i powiązane z odpowiadającymi zamówieniami przy użyciu ORDER ID.

### 4.2. Import Danych z CSV Allegro Billing
- Plik CSV jest przetwarzany przez moduł importu:
  - Dane z CSV są parsowane i wyodrębniane.
  - Na podstawie identyfikatora zamówienia, dane z CSV są łączone z odpowiadającymi pozycjami zamówień, wzbogacając je o dodatkowe koszty (np. prowizje, koszty wysyłki).

### 4.3. Łączenie Danych
- Po pobraniu danych z API oraz imporcie CSV:
  - Pozycje zamówień są uzupełniane o dane z CSV.
  - Dane zamówień i pozycji są powiązane poprzez ORDER ID.
  - ID produktu z pozycji zamówień jest wykorzystywane do łączenia z danymi produktów magazynowych.

## 5. Integration Flow
### 5.1. Flow dla Synchronizacji Danych
```mermaid
flowchart TD
    A[API BaseLinker] -->|Pobierz produkty| B(Baza Danych: Produkty Magazynowe)
    A -->|Pobierz zamówienia| C(Baza Danych: Zamówienia)
    A -->|Pobierz pozycje zamówień| D(Baza Danych: Pozycje Zamówień)
    E[CSV Allegro Billing] -->|Import i parsowanie| D
    B -->|Powiązanie przez ID produktu| D
    C -->|Powiązanie przez ORDER ID| D
