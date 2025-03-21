# Zarządzanie stałym portem dla serwera

Serwer zawsze używa portu 3001. Jeśli port jest zajęty, zostanie automatycznie zwolniony.

## Jak to działa

1. Funkcja `ensurePortAvailable` w `app.ts` automatycznie sprawdza, czy port 3001 jest zajęty
2. Jeśli port jest zajęty, funkcja automatycznie zatrzymuje proces, który go używa
3. Serwer zostaje uruchomiony na porcie 3001

## Dostępne komendy

### Automatyczne uruchamianie z czyszczeniem portu

```
npm run dev:clean
```

lub

```
npm run restart
```

Te komendy automatycznie:
1. Sprawdzą, czy port 3001 jest zajęty
2. Jeśli tak, zatrzymają proces używający tego portu
3. Uruchomią serwer na porcie 3001

### Ręczne zwalnianie portu z interaktywnym menu

```
npm run free-port
```

Ta komenda:
1. Wyświetli wszystkie procesy używające portu 3001
2. Zatrzyma te procesy
3. Zapyta, czy chcesz uruchomić serwer

## W razie problemów

Jeśli wystąpią problemy z automatycznym zwalnianiem portu, możesz:

1. Uruchomić PowerShell jako administrator
2. Wykonać komendę:
   ```
   netstat -ano | findstr :3001
   ```
3. Zatrzymać znalezione procesy:
   ```
   taskkill /F /PID <znalezione_PID>
   ```

## Jak to zaimplementowano

1. W pliku `app.ts` dodano funkcję `ensurePortAvailable`
2. W PowerShell stworzono skrypt `scripts/free-port.ps1`
3. W `package.json` dodano skróty do tych funkcji
4. W `cursor.rules` dodano automatyczne formatowanie kodu

Rozwiązanie zapewnia stały numer portu (3001) i automatyczne zwalnianie tego portu w przypadku konfliktu. 