# Skrypt do zwalniania portu 3001
#
# Użycie: .\free-port.ps1

Write-Host "Sprawdzam procesy używające portu 3001..." -ForegroundColor Yellow

$portInUse = $false

# Znajdź PID procesów używających portu 3001
$results = netstat -ano | findstr ":3001"

if ($results) {
    Write-Host "Znaleziono procesy używające portu 3001:" -ForegroundColor Yellow
    $results | ForEach-Object {
        $line = $_
        Write-Host $line -ForegroundColor Gray
        
        # Wyodrębnij PID z wyniku
        if ($line -match "\s+(\d+)$") {
            $processPid = $matches[1]
            $processName = (Get-Process -Id $processPid -ErrorAction SilentlyContinue).ProcessName
            
            if ($processName) {
                Write-Host "Zatrzymuję proces: $processName (PID: $processPid)..." -ForegroundColor Yellow
                
                try {
                    Stop-Process -Id $processPid -Force
                    $portInUse = $true
                    Write-Host "Proces $processName (PID: $processPid) zatrzymany." -ForegroundColor Green
                } catch {
                    Write-Host "Błąd podczas zatrzymywania procesu $processName (PID: $processPid): $_" -ForegroundColor Red
                }
            } else {
                Write-Host "Nie można zidentyfikować procesu o PID: $processPid" -ForegroundColor Red
            }
        }
    }
    
    if ($portInUse) {
        Write-Host "Wszystkie procesy blokujące port 3001 zostały zatrzymane." -ForegroundColor Green
    } else {
        Write-Host "Nie znaleziono procesów do zatrzymania." -ForegroundColor Yellow
    }
} else {
    Write-Host "Port 3001 jest wolny." -ForegroundColor Green
}

Write-Host "`nCzy chcesz uruchomić serwer? (T/N)" -ForegroundColor Cyan
$answer = Read-Host

if ($answer -eq "T" -or $answer -eq "t" -or $answer -eq "Y" -or $answer -eq "y") {
    Write-Host "Uruchamiam serwer..." -ForegroundColor Yellow
    # Przejdź do folderu backend i uruchom serwer w oddzielnym oknie PowerShell
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..'; npm run dev"
    Write-Host "Serwer uruchomiony w nowym oknie PowerShell." -ForegroundColor Green
} else {
    Write-Host "Serwer nie został uruchomiony." -ForegroundColor Yellow
} 