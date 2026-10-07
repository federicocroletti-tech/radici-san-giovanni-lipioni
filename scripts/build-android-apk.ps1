$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$localAppData = [Environment]::GetFolderPath('LocalApplicationData')
$jdkRoot = Join-Path $localAppData 'Programs\jdk-21'
$sdkRoot = Join-Path $localAppData 'Android\Sdk'
$buildTools = Join-Path $sdkRoot 'build-tools\36.0.0'
$zipalign = Join-Path $buildTools 'zipalign.exe'
$apksigner = Join-Path $buildTools 'apksigner.bat'
$signingPropertiesPath = Join-Path $localAppData 'RadiciSanGiovanniLipioni\play-upload-key.properties'
$unsignedApk = Join-Path $projectRoot 'android\app\build\outputs\apk\release\app-release-unsigned.apk'
$alignedApk = Join-Path $projectRoot 'android\app\build\outputs\apk\release\radici-san-giovanni-lipioni-release-aligned.apk'
$signedApk = Join-Path $projectRoot 'android\app\build\outputs\apk\release\radici-san-giovanni-lipioni-amazon-release-signed.apk'

if (Test-Path (Join-Path $jdkRoot 'bin\java.exe')) {
  $env:JAVA_HOME = $jdkRoot
  $env:Path = "$jdkRoot\bin;$env:Path"
}

foreach ($requiredPath in @($zipalign, $apksigner, $signingPropertiesPath)) {
  if (-not (Test-Path $requiredPath)) {
    throw "Required file not found: $requiredPath"
  }
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
    .\gradlew.bat assembleRelease
  } finally {
    Pop-Location
  }

  Remove-Item -Force $alignedApk, $signedApk -ErrorAction SilentlyContinue
  & $zipalign -p -f 4 $unsignedApk $alignedApk
  & $apksigner sign `
    --ks $signing['storeFile'] `
    --ks-pass ('pass:' + $signing['storePassword']) `
    --ks-key-alias $signing['keyAlias'] `
    --out $signedApk `
    $alignedApk

  & $apksigner verify --verbose $signedApk
  Write-Host "Signed APK created: $signedApk"
} finally {
  Pop-Location
}