$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$installer = Get-ChildItem -LiteralPath (Join-Path $projectRoot 'release') -Filter 'DayFlow-Setup-*.exe' -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $installer) {
  throw 'Nie znaleziono instalatora. Najpierw uruchom: npm run dist:win'
}

$downloadDirectory = Join-Path $projectRoot 'public\downloads'
New-Item -ItemType Directory -Path $downloadDirectory -Force | Out-Null
$target = Join-Path $downloadDirectory 'DayFlow-Setup-1.0.0.exe'
Copy-Item -LiteralPath $installer.FullName -Destination $target -Force
Write-Host "Gotowe: $target"
