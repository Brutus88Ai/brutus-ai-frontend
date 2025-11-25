# 🚀 Brutus AI - Interactive Deployment Script
# Server: 72.62.40.139 | Domain: brutus-ai.de

$ServerIP = "72.62.40.139"
$ServerUser = "root"
$ServerPath = "/var/www/brutus-ai"
$LocalPath = "c:\Users\pasca\Desktop\Brutus Ai code\src"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BRUTUS AI - DEPLOYMENT CONSOLE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Server Status:" -ForegroundColor Yellow
    Write-Host "  IP: $ServerIP" -ForegroundColor Gray
    Write-Host "  Domain: brutus-ai.de" -ForegroundColor Gray
    Write-Host "  SSH Port: 22 (Online)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployment Optionen:" -ForegroundColor Yellow
    Write-Host "  [1] Server Setup (Nginx + PM2 + SSL)" -ForegroundColor White
    Write-Host "  [2] Code hochladen (SCP)" -ForegroundColor White
    Write-Host "  [3] Code deployen (Git Pull)" -ForegroundColor White
    Write-Host "  [4] Backend deployen" -ForegroundColor White
    Write-Host "  [5] PM2 Status prüfen" -ForegroundColor White
    Write-Host "  [6] Logs anzeigen" -ForegroundColor White
    Write-Host "  [7] App neu starten" -ForegroundColor White
    Write-Host "  [8] Komplettes Deployment (Alles)" -ForegroundColor Green
    Write-Host "  [9] Server-Verbindung testen" -ForegroundColor White
    Write-Host "  [0] Beenden" -ForegroundColor Red
    Write-Host ""
}

function Test-ServerConnection {
    Write-Host "Teste Serververbindung..." -ForegroundColor Yellow
    $result = Test-NetConnection -ComputerName $ServerIP -Port 22 -WarningAction SilentlyContinue
    
    if ($result.TcpTestSucceeded) {
        Write-Host "✅ Server erreichbar!" -ForegroundColor Green
        Write-Host "   IP: $($result.RemoteAddress)" -ForegroundColor Gray
        Write-Host "   Port: $($result.RemotePort)" -ForegroundColor Gray
        return $true
    } else {
        Write-Host "❌ Server nicht erreichbar!" -ForegroundColor Red
        return $false
    }
}

function Upload-SetupScript {
    Write-Host ""
    Write-Host "📤 Lade Setup-Script hoch..." -ForegroundColor Yellow
    
    if (Test-Path "$LocalPath\setup-server.sh") {
        Write-Host "Verwende SCP zum Upload..." -ForegroundColor Gray
        Write-Host "Befehl: scp setup-server.sh ${ServerUser}@${ServerIP}:/root/" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Bitte führe diesen Befehl aus:" -ForegroundColor Yellow
        Write-Host "scp setup-server.sh ${ServerUser}@${ServerIP}:/root/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Dann auf dem Server:" -ForegroundColor Yellow
        Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor Cyan
        Write-Host "chmod +x /root/setup-server.sh" -ForegroundColor Cyan
        Write-Host "/root/setup-server.sh" -ForegroundColor Cyan
    } else {
        Write-Host "❌ setup-server.sh nicht gefunden!" -ForegroundColor Red
    }
}

function Upload-Code {
    Write-Host ""
    Write-Host "📤 Lade Code hoch (SCP)..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Bitte führe diesen Befehl aus:" -ForegroundColor Yellow
    Write-Host "scp -r * ${ServerUser}@${ServerIP}:${ServerPath}/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Oder einzelne Dateien:" -ForegroundColor Gray
    Write-Host "scp -r dist ${ServerUser}@${ServerIP}:${ServerPath}/" -ForegroundColor Cyan
    Write-Host "scp -r package.json ${ServerUser}@${ServerIP}:${ServerPath}/" -ForegroundColor Cyan
    Write-Host "scp -r ecosystem.config.js ${ServerUser}@${ServerIP}:${ServerPath}/" -ForegroundColor Cyan
}

function Show-PM2Status {
    Write-Host ""
    Write-Host "📊 PM2 Status..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verbinde mit Server und führe aus:" -ForegroundColor Yellow
    Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor Cyan
    Write-Host "pm2 status" -ForegroundColor Cyan
    Write-Host "pm2 monit" -ForegroundColor Cyan
}

function Show-Logs {
    Write-Host ""
    Write-Host "📝 Logs anzeigen..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verbinde mit Server:" -ForegroundColor Yellow
    Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor Cyan
    Write-Host "pm2 logs brutus-ai --lines 50" -ForegroundColor Cyan
    Write-Host "pm2 logs --err" -ForegroundColor Cyan
}

function Restart-App {
    Write-Host ""
    Write-Host "🔄 App neu starten..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verbinde mit Server:" -ForegroundColor Yellow
    Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor Cyan
    Write-Host "pm2 restart brutus-ai" -ForegroundColor Cyan
    Write-Host "pm2 save" -ForegroundColor Cyan
}

function Deploy-Backend {
    Write-Host ""
    Write-Host "🔧 Backend deployen..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Backend-Dateien hochladen:" -ForegroundColor Yellow
    Write-Host "scp -r server ${ServerUser}@${ServerIP}:${ServerPath}/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Auf dem Server installieren:" -ForegroundColor Yellow
    Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor Cyan
    Write-Host "cd ${ServerPath}/server" -ForegroundColor Cyan
    Write-Host "npm install" -ForegroundColor Cyan
    Write-Host "pm2 start index.js --name brutus-backend" -ForegroundColor Cyan
    Write-Host "pm2 save" -ForegroundColor Cyan
}

function Full-Deployment {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   KOMPLETTES DEPLOYMENT STARTEN" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📋 Deployment Checkliste:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SCHRITT 1: Server Setup" -ForegroundColor Cyan
    Write-Host "-----------------------------------------" -ForegroundColor Gray
    Write-Host "scp setup-server.sh ${ServerUser}@${ServerIP}:/root/" -ForegroundColor White
    Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor White
    Write-Host "chmod +x /root/setup-server.sh && /root/setup-server.sh" -ForegroundColor White
    Write-Host ""
    
    Write-Host "SCHRITT 2: Code hochladen" -ForegroundColor Cyan
    Write-Host "-----------------------------------------" -ForegroundColor Gray
    Write-Host "scp -r dist package.json ecosystem.config.js ${ServerUser}@${ServerIP}:${ServerPath}/" -ForegroundColor White
    Write-Host ""
    
    Write-Host "SCHRITT 3: PM2 starten" -ForegroundColor Cyan
    Write-Host "-----------------------------------------" -ForegroundColor Gray
    Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor White
    Write-Host "cd ${ServerPath}" -ForegroundColor White
    Write-Host "pm2 start ecosystem.config.js" -ForegroundColor White
    Write-Host "pm2 save" -ForegroundColor White
    Write-Host ""
    
    Write-Host "SCHRITT 4: DNS konfigurieren" -ForegroundColor Cyan
    Write-Host "-----------------------------------------" -ForegroundColor Gray
    Write-Host "Gehe zu deinem Domain-Provider und füge hinzu:" -ForegroundColor White
    Write-Host "A Record: @ → 72.62.40.139" -ForegroundColor White
    Write-Host "A Record: www → 72.62.40.139" -ForegroundColor White
    Write-Host ""
    
    Write-Host "SCHRITT 5: Website testen" -ForegroundColor Cyan
    Write-Host "-----------------------------------------" -ForegroundColor Gray
    Write-Host "https://brutus-ai.de" -ForegroundColor Green
    Write-Host "http://72.62.40.139 (vor DNS-Propagation)" -ForegroundColor Yellow
    Write-Host ""
}

# Main Loop
do {
    Show-Menu
    $choice = Read-Host "Wähle eine Option"
    
    switch ($choice) {
        "1" { Upload-SetupScript }
        "2" { Upload-Code }
        "3" {
            Write-Host ""
            Write-Host "Git Pull auf Server:" -ForegroundColor Yellow
            Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor Cyan
            Write-Host "cd ${ServerPath} && git pull && npm install && npm run build" -ForegroundColor Cyan
        }
        "4" { Deploy-Backend }
        "5" { Show-PM2Status }
        "6" { Show-Logs }
        "7" { Restart-App }
        "8" { Full-Deployment }
        "9" { Test-ServerConnection }
        "0" {
            Write-Host ""
            Write-Host "Deployment-Konsole beendet." -ForegroundColor Yellow
            Write-Host ""
            exit
        }
        default {
            Write-Host "Ungültige Auswahl!" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Drücke eine Taste zum Fortfahren..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Clear-Host
} while ($true)
