$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$localAppData = [Environment]::GetFolderPath('LocalApplicationData')
$jdkRoot = Join-Path $localAppData 'Programs\jdk-21'
$signingPropertiesPath = Join-Path $localAppData 'RadiciSanGiovanniLipioni\play-upload-key.properties'
$unsignedBundle = Join-Path $projectRoot 'android\app\build\outputs\bundle\release\app-release.aab'
$signedBundle = Join-Path $projectRoot 'android\app\build\outputs\bundle\release\radici-san-giovanni-lipioni-release-signed.aab'

if (Test-Path (Join-Path $jdkRoot 'bin\java.exe')) {
  $env:JAVA_HOME = $jdkRoot
  $env:Path = "$jdkRoot\bin;$env:Path"
}

if (-not (Test-Path $signingPropertiesPath)) {
  throw "Signing properties not found: $signingPropertiesPath"
}

$signing = @{}
Get-Content $signingPropertiesPath | ForEach-Object {
  $parts = $_ -split '=', 2
  if ($parts.Length -eq 2) {
    $signing[$parts[0]] = $parts[1]
  }
}

foreach ($key in @('storeFile', 'storePassword', 'keyAlias')) {
  if (-not $signing.ContainsKey($key) -or -not $signing[$key]) {
    throw "Missing signing property: $key"
  }
}

Push-Location $projectRoot
try {
  npm run mobile:build
  Push-Location android
  try {
    .\gradlew.bat bundleRelease
  } finally {
    Pop-Location
  }

  Remove-Item -Force $signedBundle -ErrorAction SilentlyContinue
  jarsigner `
    -keystore $signing['storeFile'] `
    -storepass $signing['storePassword'] `
    -signedjar $signedBundle `
    $unsignedBundle `
    $signing['keyAlias']

  jarsigner -verify -certs $signedBundle
  Write-Host "Signed bundle created: $signedBundle"
} finally {
  Pop-Location
}