$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'social\instagram\primo-carosello\source\assets\logo-radici-instagram.png'
$branding = Join-Path $root 'public\branding'
$icons = Join-Path $root 'public\icons'
New-Item -ItemType Directory -Force $branding, $icons | Out-Null
$original = [System.Drawing.Image]::FromFile($source)

function New-BrandBitmap([int]$size, [double]$padding = 0) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(250, 247, 240))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $inset = [int][Math]::Round($size * $padding)
    $graphics.DrawImage($original, $inset, $inset, $size - 2 * $inset, $size - 2 * $inset)
  } finally {
    $graphics.Dispose()
  }
  return ,$bitmap
}

try {
  $logo = New-BrandBitmap 192
  try {
    $logo.Save((Join-Path $branding 'logo-radici.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
  } finally {
    $logo.Dispose()
  }

  foreach ($size in @(72, 96, 128, 144, 152, 192, 384, 512)) {
    $bitmap = New-BrandBitmap $size 0.1
    try {
      $bitmap.Save((Join-Path $icons "icon-${size}x${size}.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $bitmap.Dispose()
    }
  }

  $frames = foreach ($size in @(16, 32, 48)) {
    $bitmap = New-BrandBitmap $size
    $stream = New-Object System.IO.MemoryStream
    try {
      $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
      @{ Size = $size; Data = $stream.ToArray() }
    } finally {
      $stream.Dispose()
      $bitmap.Dispose()
    }
  }
  $file = [System.IO.File]::Create((Join-Path $root 'public\favicon.ico'))
  $writer = New-Object System.IO.BinaryWriter $file
  try {
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$frames.Count)
    $offset = 6 + 16 * $frames.Count
    foreach ($frame in $frames) {
      $writer.Write([byte]$frame.Size)
      $writer.Write([byte]$frame.Size)
      $writer.Write([uint16]0)
      $writer.Write([uint16]1)
      $writer.Write([uint16]32)
      $writer.Write([uint32]$frame.Data.Length)
      $writer.Write([uint32]$offset)
      $offset += $frame.Data.Length
    }
    foreach ($frame in $frames) {
      $writer.Write([byte[]]$frame.Data)
    }
  } finally {
    $writer.Dispose()
  }
} finally {
  $original.Dispose()
}
