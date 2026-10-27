$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

Write-Host 'Installing Capacitor for Android...'
npm install @capacitor/core @capacitor/android
if ($LASTEXITCODE -ne 0) { throw 'Capacitor core/Android installation failed.' }
npm install --save-dev @capacitor/cli
if ($LASTEXITCODE -ne 0) { throw 'Capacitor CLI installation failed.' }

Write-Host 'Building DayFlow web interface...'
npm run build:renderer
if ($LASTEXITCODE -ne 0) { throw 'Vite build failed.' }

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'android'))) {
  npx cap add android
  if ($LASTEXITCODE -ne 0) { throw 'Could not add the Android platform.' }
}

npx cap sync android
if ($LASTEXITCODE -ne 0) { throw 'Android sync failed.' }

$sdkPath = $env:ANDROID_HOME
if (-not $sdkPath) { $sdkPath = $env:ANDROID_SDK_ROOT }
if (-not $sdkPath) {
  $defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
  if (Test-Path -LiteralPath $defaultSdk) { $sdkPath = $defaultSdk }
}
if (-not $sdkPath -or -not (Test-Path -LiteralPath $sdkPath)) {
  throw 'Android SDK not found. Install Android SDK in Android Studio > Tools > SDK Manager, then set ANDROID_HOME to its location.'
}
$sdkProperties = Join-Path $projectRoot 'android\local.properties'
$sdkPathForGradle = $sdkPath -replace '\\', '/'
Set-Content -LiteralPath $sdkProperties -Value "sdk.dir=$sdkPathForGradle" -Encoding ASCII

$gradle = Join-Path $projectRoot 'android\gradlew.bat'
if (-not (Test-Path -LiteralPath $gradle)) { throw 'Gradle Wrapper not found. Install Android Studio and the Android SDK.' }
Push-Location (Join-Path $projectRoot 'android')
try {
  & $gradle assembleDebug
  if ($LASTEXITCODE -ne 0) { throw 'Gradle failed to build the APK. Check the Android Studio and SDK installation.' }
} finally {
  Pop-Location
}

$apk = Join-Path $projectRoot 'android\app\build\outputs\apk\debug\app-debug.apk'
if (-not (Test-Path -LiteralPath $apk)) { throw "Build completed without an APK: $apk" }
$desktop = [Environment]::GetFolderPath('Desktop')
$output = Join-Path $desktop 'DayFlow-debug.apk'
Copy-Item -LiteralPath $apk -Destination $output -Force
Write-Host "APK ready: $output"
