$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$downloadPage = Join-Path $projectRoot 'public\download.html'
$logo = Join-Path $projectRoot 'public\dayflow-mark.svg'
$stagedInstaller = Join-Path $projectRoot 'public\downloads\DayFlow-Setup-1.0.0.exe'

if (-not (Test-Path -LiteralPath $downloadPage)) {
  throw "Nie znaleziono strony pobierania: $downloadPage"
}
if (-not (Test-Path -LiteralPath $logo)) {
  throw "Nie znaleziono logo: $logo"
}

$installer = $null
if (Test-Path -LiteralPath $stagedInstaller) {
  $installer = Get-Item -LiteralPath $stagedInstaller
} else {
  $releaseDirectory = Join-Path $projectRoot 'release'
  if (Test-Path -LiteralPath $releaseDirectory) {
    $installer = Get-ChildItem -LiteralPath $releaseDirectory -Filter 'DayFlow-Setup-*.exe' -File |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
  }
}
if (-not $installer) {
  throw 'Nie znaleziono instalatora. Najpierw uruchom npm run dist:win i sprawdź folder release.'
}

$desktop = [Environment]::GetFolderPath('Desktop')
$zipName = 'DayFlow-Vercel-{0}.zip' -f (Get-Date -Format 'yyyyMMdd-HHmmss')
$zipPath = Join-Path $desktop $zipName
$staging = Join-Path $env:TEMP ('dayflow-vercel-' + [guid]::NewGuid().ToString('N'))
$downloads = Join-Path $staging 'downloads'

try {
  New-Item -ItemType Directory -Path $downloads -Force | Out-Null
  Copy-Item -LiteralPath $downloadPage -Destination (Join-Path $staging 'index.html')
  Copy-Item -LiteralPath $logo -Destination (Join-Path $staging 'dayflow-mark.svg')
  Copy-Item -LiteralPath $installer.FullName -Destination (Join-Path $downloads 'DayFlow-Setup-1.0.0.exe')
  Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $zipPath -CompressionLevel Optimal
  Write-Host "Gotowe: $zipPath"
  Write-Host 'ZIP zawiera index.html, logo i instalator w folderze downloads.'
} finally {
  if (Test-Path -LiteralPath $staging) {
    Remove-Item -LiteralPath $staging -Recurse -Force
  }
}
