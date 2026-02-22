# Dataquard Setup Automation Script
# Für: HP OmniBook X FlipNGAI
# Betriebssystem: Windows 11 Pro
# Zeitaufwand: ~30 Minuten (statt 2-3 Stunden!)

# WICHTIG: Dieses Script muss als ADMINISTRATOR ausgeführt werden!

# ============================================================
# SCHRITT 0: ADMINISTRATOR-CHECK
# ============================================================

Write-Host "🔍 Überprüfe Administrator-Rechte..." -ForegroundColor Yellow

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ FEHLER: Dieses Script muss als Administrator ausgeführt werden!" -ForegroundColor Red
    Write-Host "Bitte:" -ForegroundColor Yellow
    Write-Host "1. PowerShell als Administrator öffnen (Win + X → PowerShell Admin)"
    Write-Host "2. Dieses Script erneut ausführen"
    exit
}

Write-Host "✅ Administrator-Rechte bestätigt!" -ForegroundColor Green
Write-Host ""

# ============================================================
# SCHRITT 1: CHOCOLATEY INSTALLIEREN (Package Manager)
# ============================================================

Write-Host "📦 Installiere Chocolatey Package Manager..." -ForegroundColor Cyan

if (-not (Test-Path "$env:ProgramData\chocolatey\choco.exe")) {
    Write-Host "  → Chocolatey wird installiert (erste Mal)..." -ForegroundColor Yellow
    
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force | Out-Null
    
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    Write-Host "✅ Chocolatey installiert!" -ForegroundColor Green
} else {
    Write-Host "✅ Chocolatey bereits installiert!" -ForegroundColor Green
}

# Refreshe PATH für aktuelle Session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""

# ============================================================
# SCHRITT 2: TOOLS INSTALLIEREN
# ============================================================

Write-Host "🛠️  Installiere Developer-Tools..." -ForegroundColor Cyan

# Array von Tools die installiert werden
$tools = @(
    "git",           # Git Version Control
    "nodejs",        # Node.js (npm kommt mit)
    "vscode",        # Visual Studio Code
    "github-cli",    # GitHub Command Line
    "7zip"           # For compression (optional aber nützlich)
)

foreach ($tool in $tools) {
    Write-Host "  → Installiere $tool..." -ForegroundColor Yellow
    
    try {
        choco install $tool -y --no-progress 2>&1 | Out-Null
        Write-Host "    ✅ $tool installiert" -ForegroundColor Green
    } catch {
        Write-Host "    ⚠️  Fehler bei $tool - Überspringe" -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 2
}

Write-Host ""

# Refreshe PATH erneut
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# ============================================================
# SCHRITT 3: ORDNERSTRUKTUR ERSTELLEN
# ============================================================

Write-Host "📁 Erstelle Ordnerstruktur..." -ForegroundColor Cyan

$basePath = "C:\Development"
$projectPath = "$basePath\Projects\dataquard"

$folders = @(
    $basePath,
    "$basePath\Projects",
    "$projectPath",
    "$basePath\Tools",
    "$basePath\Resources",
    "$basePath\Backups"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  ✅ Erstellt: $folder" -ForegroundColor Green
    } else {
        Write-Host "  ✓ Existiert bereits: $folder" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================================
# SCHRITT 4: GIT KONFIGURIEREN
# ============================================================

Write-Host "🔐 Konfiguriere Git..." -ForegroundColor Cyan

# Benutzer-Input für Git Config
$gitName = Read-Host "  Geben Sie Ihren Namen ein (z.B. 'Richard Rickli')"
$gitEmail = Read-Host "  Geben Sie Ihre E-Mail ein (z.B. 'richard@dataquard.ch')"

git config --global user.name "$gitName"
git config --global user.email "$gitEmail"

Write-Host "  ✅ Git konfiguriert mit:" -ForegroundColor Green
Write-Host "     Name: $gitName" -ForegroundColor Gray
Write-Host "     Email: $gitEmail" -ForegroundColor Gray

Write-Host ""

# ============================================================
# SCHRITT 5: NODE.JS & NPM VERIFIZIEREN
# ============================================================

Write-Host "✔️  Verifiziere Node.js & npm..." -ForegroundColor Cyan

try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "  ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Node.js nicht erkannt - Neustart Windows empfohlen!" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================
# SCHRITT 6: VS CODE EXTENSIONS INSTALLIEREN
# ============================================================

Write-Host "🎨 Installiere VS Code Extensions..." -ForegroundColor Cyan

$extensions = @(
    "dsznajder.es7-react-js-snippets",     # React Snippets
    "Vue.volar",                            # Vue Plugin
    "esbenp.prettier-vscode",               # Prettier
    "dbaeumer.vscode-eslint",               # ESLint
    "GitHub.copilot"                        # GitHub Copilot (optional)
)

foreach ($ext in $extensions) {
    Write-Host "  → Installiere $ext..." -ForegroundColor Yellow
    
    try {
        code --install-extension $ext --force 2>&1 | Out-Null
        Write-Host "    ✅ $ext installiert" -ForegroundColor Green
    } catch {
        Write-Host "    ⚠️  Fehler bei $ext - Überspringe" -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 1
}

Write-Host ""

# ============================================================
# SCHRITT 7: VS CODE SETTINGS ERSTELLEN
# ============================================================

Write-Host "⚙️  Konfiguriere VS Code Settings..." -ForegroundColor Cyan

$vsCodeSettingsPath = "$env:APPDATA\Code\User\settings.json"

if (-not (Test-Path (Split-Path $vsCodeSettingsPath))) {
    New-Item -ItemType Directory -Path (Split-Path $vsCodeSettingsPath) -Force | Out-Null
}

$vsCodeSettings = @"
{
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": false,
  "files.autoSave": "onFocusChange",
  "prettier.tabWidth": 2,
  "prettier.semi": true,
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "workbench.colorTheme": "Dark+",
  "terminal.integrated.shell.windows": "pwsh.exe",
  "git.autofetch": true,
  "git.confirmSync": false
}
"@

$vsCodeSettings | Set-Content -Path $vsCodeSettingsPath -Force

Write-Host "  ✅ VS Code Settings erstellt" -ForegroundColor Green

Write-Host ""

# ============================================================
# SCHRITT 8: .GITIGNORE DATEI ERSTELLEN
# ============================================================

Write-Host "📝 Erstelle .gitignore Datei..." -ForegroundColor Cyan

$gitignoreContent = @"
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env.local
.env.*.local

# Builds
.next/
out/
build/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
"@

$gitignoreContent | Set-Content -Path "$projectPath\.gitignore" -Force

Write-Host "  ✅ .gitignore erstellt" -ForegroundColor Green

Write-Host ""

# ============================================================
# SCHRITT 9: .ENV.LOCAL TEMPLATE ERSTELLEN
# ============================================================

Write-Host "🔑 Erstelle .env.local Template..." -ForegroundColor Cyan

$envTemplate = @"
# Supabase Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# URLs
NEXT_PUBLIC_URL=http://localhost:3000
"@

$envTemplate | Set-Content -Path "$projectPath\.env.local.example" -Force

Write-Host "  ✅ .env.local.example Template erstellt" -ForegroundColor Green
Write-Host "     (Fülle Ihre Keys später ein und speichern als .env.local)" -ForegroundColor Gray

Write-Host ""

# ============================================================
# SCHRITT 10: TERMINAL/POWERSHELL OPTIMIEREN
# ============================================================

Write-Host "🖥️  Optimiere PowerShell..." -ForegroundColor Cyan

$profilePath = $PROFILE

# Stelle sicher das Profil-Verzeichnis existiert
if (-not (Test-Path (Split-Path $profilePath))) {
    New-Item -ItemType Directory -Path (Split-Path $profilePath) -Force | Out-Null
}

# Erstelle PowerShell Profile
$profileContent = @"
# Development Navigation
Set-Alias -Name dev -Value 'Set-Location C:\Development\Projects'
Set-Alias -Name dq -Value 'Set-Location C:\Development\Projects\dataquard'

# Code öffnen im aktuellen Verzeichnis
function code-here { code . }
New-Alias -Name code. -Value code-here -Force

# Git Shortcuts
function git-status { git status }
New-Alias -Name gs -Value git-status -Force

function git-log { git log --oneline -10 }
New-Alias -Name gl -Value git-log -Force

# Navigate to Projects
Set-Location C:\Development\Projects

# Banner
Write-Host ""
Write-Host "🚀 Willkommen bei Dataquard Development!" -ForegroundColor Cyan
Write-Host "   Befehle: dev, dq, code., gs, gl" -ForegroundColor Gray
Write-Host ""
"@

$profileContent | Add-Content -Path $profilePath -Force

Write-Host "  ✅ PowerShell Profile optimiert" -ForegroundColor Green
Write-Host "     (Starten Sie PowerShell neu um Changes zu sehen)" -ForegroundColor Gray

Write-Host ""

# ============================================================
# SCHRITT 11: VERIFIKATION
# ============================================================

Write-Host "✅ FINAL VERIFICATION" -ForegroundColor Cyan

Write-Host ""
Write-Host "Überprüfe instalierte Tools:" -ForegroundColor Yellow

$verifications = @(
    @{name = "Git"; cmd = "git --version"},
    @{name = "Node.js"; cmd = "node --version"},
    @{name = "npm"; cmd = "npm --version"},
    @{name = "VS Code"; cmd = "code --version"}
)

foreach ($verify in $verifications) {
    try {
        $output = & $verify.cmd 2>&1
        Write-Host "  ✅ $($verify.name): $($output[0])" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $($verify.name): NICHT GEFUNDEN" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Ordnerstruktur:" -ForegroundColor Yellow

Get-ChildItem -Path $basePath -Directory | ForEach-Object {
    Write-Host "  ✅ $($_.FullName)" -ForegroundColor Green
}

Write-Host ""

# ============================================================
# FINALE ZUSAMMENFASSUNG
# ============================================================

Write-Host "🎉 ========================================" -ForegroundColor Green
Write-Host "   SETUP ERFOLGREICH ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "   ========================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. NEUSTART (empfohlen):"
Write-Host "   → Windows neu starten, damit alle PATH-Änderungen aktiv sind" -ForegroundColor Gray
Write-Host ""
Write-Host "2. GITHUB KONFIGURIEREN:"
Write-Host "   → Öffne GitHub Desktop und melden Sie sich an" -ForegroundColor Gray
Write-Host ""
Write-Host "3. SUPABASE KONTO:"
Write-Host "   → Erstelle Konto auf https://supabase.com" -ForegroundColor Gray
Write-Host "   → Keys in .env.local eintragen" -ForegroundColor Gray
Write-Host ""
Write-Host "4. STRIPE KONTO:"
Write-Host "   → Erstelle Konto auf https://stripe.com" -ForegroundColor Gray
Write-Host "   → Test Keys in .env.local eintragen" -ForegroundColor Gray
Write-Host ""
Write-Host "5. VERIFIZIERE SETUP:"
Write-Host "   → Öffne PowerShell neu" -ForegroundColor Gray
Write-Host "   → Geben Sie ein: dq" -ForegroundColor Gray
Write-Host "   → Sollte zu C:\Development\Projects\dataquard wechseln" -ForegroundColor Gray
Write-Host ""
Write-Host "6. ERSTE APP:"
Write-Host "   → cd dataquard" -ForegroundColor Gray
Write-Host "   → npx create-next-app@latest . --typescript --tailwind" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Sie sind bereit für Phase 0!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fragen? Schreiben Sie mir!" -ForegroundColor Yellow

Read-Host "Drücke ENTER um fertig zu machen"
