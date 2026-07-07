# Deploy kode lokal ke GitHub (folder src/ yang benar)
# Jalankan: klik kanan -> Run with PowerShell
# Atau di terminal: powershell -ExecutionPolicy Bypass -File deploy-github.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$git = "C:\Program Files\Git\bin\git.exe"
if (-not (Test-Path $git)) {
    Write-Host "Git belum terinstall. Install dari: https://git-scm.com/download/win" -ForegroundColor Red
    Write-Host "Atau jalankan: winget install Git.Git"
    pause
    exit 1
}

Write-Host "=== Deploy SI-TAMU RRI ke GitHub ===" -ForegroundColor Cyan
Write-Host ""

$tempDir = Join-Path $env:TEMP "si-tamu-rri-deploy"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

Write-Host "1. Clone repo GitHub..."
& $git clone https://github.com/diramadhansalsabil-cyber/SI-TAMU-RRI.git $tempDir
Set-Location $tempDir

Write-Host "2. Salin folder src/ dari komputer lokal..."
$localSrc = Join-Path $projectRoot "src"
if (-not (Test-Path $localSrc)) {
    Write-Host "ERROR: folder src lokal tidak ditemukan di $localSrc" -ForegroundColor Red
    pause
    exit 1
}

Remove-Item "src" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item $localSrc "src" -Recurse -Force

# File konfigurasi penting
foreach ($f in @("next.config.ts", "package.json", "tsconfig.json")) {
    $local = Join-Path $projectRoot $f
    if (Test-Path $local) { Copy-Item $local $f -Force }
}

Write-Host "3. Commit perubahan..."
& $git add src/ next.config.ts package.json tsconfig.json
& $git status --short

$hasChanges = & $git status --porcelain
if (-not $hasChanges) {
    Write-Host "Tidak ada perubahan — src/ di GitHub sudah sama dengan lokal." -ForegroundColor Yellow
    pause
    exit 0
}

& $git commit -m "Fix: hapus NIK, Programe, Foto kolom, WITA, hapus tombol Cetak"

Write-Host ""
Write-Host "4. Push ke GitHub (login mungkin diminta)..." -ForegroundColor Yellow
Write-Host "   Username: diramadhansalsabil-cyber"
Write-Host "   Password: gunakan Personal Access Token (bukan password GitHub)"
Write-Host "   Buat token: GitHub -> Settings -> Developer settings -> Personal access tokens"
Write-Host ""

& $git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "BERHASIL! Tunggu deploy Vercel (2-3 menit):" -ForegroundColor Green
    Write-Host "https://vercel.com/diramadhansalsabil-cybers-projects/si-tamu-rri-kdi/deployments"
    Write-Host ""
    Write-Host "Lalu buka https://si-tamu-rri-kdi.vercel.app/register dan tekan Ctrl+Shift+R"
} else {
    Write-Host "Push gagal. Pastikan token GitHub benar." -ForegroundColor Red
}

Set-Location $projectRoot
pause
