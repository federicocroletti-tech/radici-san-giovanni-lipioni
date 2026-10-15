Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')
$carouselRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$outputDir = Join-Path $carouselRoot 'output'
$previewDir = Join-Path $carouselRoot 'preview'
$logoPath = Join-Path $PSScriptRoot 'assets\logo-radici-instagram.png'
$photoPanorama = Join-Path $root 'src\assets\images\san-giovanni-lipioni-panorama.jpg'
$photoBorgo = Join-Path $root 'src\assets\images\san-giovanni-lipioni-borgo.jpg'

New-Item -ItemType Directory -Force $outputDir, $previewDir | Out-Null

$W = 1080
$H = 1350
$cream = [System.Drawing.Color]::FromArgb(250, 247, 240)
$paper = [System.Drawing.Color]::FromArgb(255, 250, 240)
$sand = [System.Drawing.Color]::FromArgb(233, 222, 202)
$ink = [System.Drawing.Color]::FromArgb(31, 41, 51)
$green = [System.Drawing.Color]::FromArgb(38, 59, 42)
$brown = [System.Drawing.Color]::FromArgb(125, 73, 39)
$earth = [System.Drawing.Color]::FromArgb(138, 90, 50)
$ochre = [System.Drawing.Color]::FromArgb(201, 133, 47)
$muted = [System.Drawing.Color]::FromArgb(94, 105, 99)
$agrave = [char]0x00E0
$egrave = [char]0x00E8
$ograve = [char]0x00F2

function New-Canvas {
  $bmp = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @{ Bitmap = $bmp; Graphics = $g }
}

function Font-New($size, $style = [System.Drawing.FontStyle]::Regular) {
  return New-Object System.Drawing.Font 'Aptos', $size, $style, ([System.Drawing.GraphicsUnit]::Pixel)
}

function Brush($color) {
  return New-Object System.Drawing.SolidBrush $color
}

function Pen-New($color, $width = 1) {
  return New-Object System.Drawing.Pen $color, $width
}

function Rect($x, $y, $w, $h) {
  return New-Object System.Drawing.RectangleF ([float]$x), ([float]$y), ([float]$w), ([float]$h)
}

function Draw-Background($g) {
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList (Rect 0 0 $W $H), $paper, $sand, 90
  $g.FillRectangle($brush, 0, 0, $W, $H)
  $brush.Dispose()
  $glow = New-Object System.Drawing.Drawing2D.GraphicsPath
  $glow.AddEllipse(-160, -180, 560, 560)
  $pathBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush $glow
  $pathBrush.CenterColor = [System.Drawing.Color]::FromArgb(42, $ochre)
  $pathBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $ochre))
  $g.FillPath($pathBrush, $glow)
  $pathBrush.Dispose()
  $glow.Dispose()
  $borderPen = Pen-New ([System.Drawing.Color]::FromArgb(34, $brown)) 1
  $g.DrawRectangle($borderPen, 70, 70, 940, 1210)
  $borderPen.Dispose()
}

function Draw-CoverImage($g, $imagePath, $x, $y, $w, $h) {
  $img = [System.Drawing.Image]::FromFile($imagePath)
  $scale = [Math]::Max($w / $img.Width, $h / $img.Height)
  $sw = [int]($w / $scale)
  $sh = [int]($h / $scale)
  $sx = [int](($img.Width - $sw) / 2)
  $sy = [int](($img.Height - $sh) / 2)
  $src = New-Object System.Drawing.Rectangle $sx, $sy, $sw, $sh
  $dst = New-Object System.Drawing.Rectangle $x, $y, $w, $h
  $g.DrawImage($img, $dst, $src, [System.Drawing.GraphicsUnit]::Pixel)
  $img.Dispose()
}

function Draw-CircleImage($g, $imagePath, $x, $y, $size) {
  $img = [System.Drawing.Image]::FromFile($imagePath)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse($x, $y, $size, $size)
  $oldClip = $g.Clip
  $g.SetClip($path)
  $dst = New-Object System.Drawing.Rectangle $x, $y, $size, $size
  $g.DrawImage($img, $dst)
  $g.Clip = $oldClip
  $pen = Pen-New $earth 3
  $g.DrawEllipse($pen, $x, $y, $size, $size)
  $pen.Dispose()
  $path.Dispose()
  $img.Dispose()
}

function Draw-Text($g, $text, $font, $color, $x, $y, $w, $h, $align = 'Near') {
  $brush = Brush $color
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::$align
  $format.LineAlignment = [System.Drawing.StringAlignment]::Near
  $format.Trimming = [System.Drawing.StringTrimming]::None
  $rect = Rect $x $y $w $h
  $g.DrawString($text, $font, $brush, $rect, $format)
  $format.Dispose()
  $brush.Dispose()
}

function Draw-Footer($g, $inverse = $false) {
  $color = if ($inverse) { $paper } else { $brown }
  $font = Font-New 28 ([System.Drawing.FontStyle]::Bold)
  Draw-Text $g 'Il paese, luogo per luogo' $font $color 86 1248 430 42
  Draw-Text $g 'radici-san-giovanni-lipioni.onrender.com' $font $color 455 1248 545 42 'Far'
  $font.Dispose()
}

function Draw-Header($g, $num, $inverse = $false) {
  Draw-CircleImage $g $logoPath 84 76 126
  $color = if ($inverse) { $paper } else { $brown }
  $bg = if ($inverse) { [System.Drawing.Color]::FromArgb(90, 31, 41, 51) } else { [System.Drawing.Color]::FromArgb(190, 255, 250, 240) }
  $pillBrush = Brush $bg
  $g.FillEllipse($pillBrush, 904, 86, 96, 56)
  $pillBrush.Dispose()
  $font = Font-New 26 ([System.Drawing.FontStyle]::Bold)
  Draw-Text $g $num $font $color 904 98 96 42 'Center'
  $font.Dispose()
}

function Draw-PhotoShade($g, $strong = $false) {
  $a = if ($strong) { 172 } else { 146 }
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList (Rect 0 0 760 $H), ([System.Drawing.Color]::FromArgb($a, 31, 41, 51)), ([System.Drawing.Color]::FromArgb(10, 31, 41, 51)), 0
  $g.FillRectangle($brush, 0, 0, 760, $H)
  $brush.Dispose()
  $bottom = New-Object System.Drawing.Drawing2D.LinearGradientBrush -ArgumentList (Rect 0 640 $W 710), ([System.Drawing.Color]::FromArgb(0, 20, 18, 14)), ([System.Drawing.Color]::FromArgb(176, 20, 18, 14)), 90
  $g.FillRectangle($bottom, 0, 640, $W, 710)
  $bottom.Dispose()
}

function Draw-Note($g, $text, $x, $y, $w, $accentColor, $bgColor, $textColor, $noteH = 108, $fontSize = 37) {
  $bg = Brush $bgColor
  $g.FillRectangle($bg, $x, $y, $w, $noteH)
  $bg.Dispose()
  $accent = Brush $accentColor
  $g.FillRectangle($accent, $x, $y, 10, $noteH)
  $accent.Dispose()
  $font = Font-New $fontSize ([System.Drawing.FontStyle]::Bold)
  Draw-Text $g $text $font $textColor ($x + 28) ($y + 22) ($w - 46) ($noteH - 32)
  $font.Dispose()
}

function Draw-List($g, $items, $x, $y, $w, $itemH, $gap, $columns = 1, $numbered = $false, $fontSize = 32) {
  $font = Font-New $fontSize ([System.Drawing.FontStyle]::Bold)
  $numFont = Font-New 24 ([System.Drawing.FontStyle]::Bold)
  $colGap = 24
  $colW = if ($columns -eq 1) { $w } else { [int](($w - $colGap) / 2) }
  for ($i = 0; $i -lt $items.Count; $i++) {
    $col = $i % $columns
    $row = [Math]::Floor($i / $columns)
    $ix = $x + ($col * ($colW + $colGap))
    $iy = $y + ($row * ($itemH + $gap))
    $bg = Brush ([System.Drawing.Color]::FromArgb(202, 255, 253, 247))
    $g.FillRectangle($bg, $ix, $iy, $colW, $itemH)
    $bg.Dispose()
    $pen = Pen-New ([System.Drawing.Color]::FromArgb(40, $earth)) 1
    $g.DrawRectangle($pen, $ix, $iy, $colW, $itemH)
    $pen.Dispose()
    if ($numbered) {
      $label = ('{0:d2}' -f ($i + 1))
      Draw-Text $g $label $numFont $green ($ix + 22) ($iy + 22) 42 34
      Draw-Text $g $items[$i] $font $ink ($ix + 74) ($iy + 18) ($colW - 94) ($itemH - 18)
    } else {
      $dot = Brush $ochre
      $g.FillEllipse($dot, ($ix + 22), ($iy + [int](($itemH - 14) / 2)), 14, 14)
      $dot.Dispose()
      Draw-Text $g $items[$i] $font $ink ($ix + 52) ($iy + 17) ($colW - 70) ($itemH - 16)
    }
  }
  $font.Dispose()
  $numFont.Dispose()
}

function Save-Slide($canvas, $fileName) {
  $path = Join-Path $outputDir $fileName
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

function Slide-1 {
  $c = New-Canvas; $g = $c.Graphics
  Draw-Background $g
  Draw-CircleImage $g $logoPath 235 92 610
  $fontEyebrow = Font-New 27 ([System.Drawing.FontStyle]::Bold)
  $fontTitle = Font-New 78 ([System.Drawing.FontStyle]::Bold)
  $fontBody = Font-New 38
  Draw-Text $g 'Radici San Giovanni Lipioni' $fontEyebrow $ochre 98 754 884 40 'Center'
  Draw-Text $g "San Giovanni Lipioni,`nluogo per luogo." $fontTitle $green 98 812 884 160 'Center'
  Draw-Text $g 'Nasce Radici, un progetto indipendente per osservare, documentare e comprendere i luoghi che formano il paese.' $fontBody $ink 145 1005 790 150 'Center'
  $fontCounter = Font-New 26 ([System.Drawing.FontStyle]::Bold)
  Draw-Text $g '1/7' $fontCounter $brown 904 94 96 42 'Center'
  Draw-Footer $g
  $fontEyebrow.Dispose(); $fontTitle.Dispose(); $fontBody.Dispose(); $fontCounter.Dispose()
  Save-Slide $c '01-presentazione.png'
}

function Slide-2 {
  $c = New-Canvas; $g = $c.Graphics
  Draw-Background $g; Draw-Header $g '2/7'
  $fontEyebrow = Font-New 27 ([System.Drawing.FontStyle]::Bold)
  $fontTitle = Font-New 88 ([System.Drawing.FontStyle]::Bold)
  $fontLead = Font-New 43 ([System.Drawing.FontStyle]::Bold)
  $fontBody = Font-New 38
  Draw-Text $g 'Radici San Giovanni Lipioni' $fontEyebrow $ochre 96 260 820 40
  Draw-Text $g "Che cos'${egrave} Radici?" $fontTitle $brown 96 320 850 104
  Draw-Text $g 'Un progetto indipendente di documentazione territoriale dedicato ai luoghi di San Giovanni Lipioni.' $fontLead $green 96 480 825 150
  Draw-Text $g 'Un luogo alla volta raccoglieremo fotografie, fonti, mappe e tracce delle trasformazioni del paese.' $fontBody $ink 96 650 800 150
  Draw-Note $g "Non ${egrave} una pagina istituzionale." 96 850 760 $ochre ([System.Drawing.Color]::FromArgb(255, 247, 235)) $brown
  Draw-Footer $g
  $fontEyebrow.Dispose(); $fontTitle.Dispose(); $fontLead.Dispose(); $fontBody.Dispose()
  Save-Slide $c '02-cosa-e-radici.png'
}

function Slide-3 {
  $c = New-Canvas; $g = $c.Graphics
  Draw-Background $g; Draw-Header $g '3/7'
  $fontEyebrow = Font-New 27 ([System.Drawing.FontStyle]::Bold)
  $fontTitle = Font-New 68 ([System.Drawing.FontStyle]::Bold)
  Draw-Text $g 'Radici San Giovanni Lipioni' $fontEyebrow $ochre 96 238 820 40
  Draw-Text $g 'Che cosa documenteremo?' $fontTitle $brown 96 298 850 150
  $items = @('Chiese e cappelle', 'Piazze, vie e scalinate', 'Palazzi ed edifici storici', 'Fontane, fonti e lavatoi', 'Paesaggi, sentieri e aree naturali', 'Dettagli architettonici', 'Luoghi trasformati o scomparsi', 'Confronti tra passato e presente')
  Draw-List $g $items 96 475 884 92 20 2 $true 29
  Draw-Footer $g
  $fontEyebrow.Dispose(); $fontTitle.Dispose()
  Save-Slide $c '03-cosa-documenteremo.png'
}

function Slide-4 {
  $c = New-Canvas; $g = $c.Graphics
  Draw-Background $g; Draw-Header $g '4/7'
  $fontEyebrow = Font-New 27 ([System.Drawing.FontStyle]::Bold)
  $fontTitle = Font-New 68 ([System.Drawing.FontStyle]::Bold)
  $fontClosing = Font-New 39 ([System.Drawing.FontStyle]::Bold)
  Draw-Text $g 'Radici San Giovanni Lipioni' $fontEyebrow $ochre 96 238 820 40
  Draw-Text $g 'Cosa non racconteremo?' $fontTitle $brown 96 300 880 150
  $items = @('Cronaca locale', 'Eventi e feste', "Attivit${agrave} turistiche", 'Storie personali', 'Persone riconoscibili', 'Informazioni private')
  Draw-List $g $items 96 455 820 76 18 2 $false 31
  $pen = Pen-New ([System.Drawing.Color]::FromArgb(50, $earth)) 1
  $g.DrawLine($pen, 96, 870, 895, 870); $pen.Dispose()
  Draw-Text $g "Non racconteremo principalmente ci${ograve} che succede nel paese. Racconteremo i luoghi che formano il paese." $fontClosing $brown 96 915 820 180
  Draw-Footer $g
  $fontEyebrow.Dispose(); $fontTitle.Dispose(); $fontClosing.Dispose()
  Save-Slide $c '04-cosa-non-racconteremo.png'
}

function Slide-5 {
  $c = New-Canvas; $g = $c.Graphics
  Draw-Background $g; Draw-Header $g '5/7'
  $fontEyebrow = Font-New 27 ([System.Drawing.FontStyle]::Bold)
  $fontTitle = Font-New 86 ([System.Drawing.FontStyle]::Bold)
  Draw-Text $g 'Radici San Giovanni Lipioni' $fontEyebrow $ochre 96 238 820 40
  Draw-Text $g 'Come lavoreremo?' $fontTitle $brown 96 300 850 106
  $items = @('Fotografie attuali e storiche', 'Ricerca di fonti e documenti', 'Una scheda per ogni luogo', 'Verifica delle informazioni', 'Distinzione tra fatti, ipotesi e tradizioni', 'Aggiornamenti quando emergono nuove fonti')
  Draw-List $g $items 96 460 830 82 18 1 $false 32
  Draw-Note $g 'Con attenzione, chiarezza e rispetto per il territorio.' 96 1045 830 $green ([System.Drawing.Color]::FromArgb(237, 244, 237)) $green
  Draw-Footer $g
  $fontEyebrow.Dispose(); $fontTitle.Dispose()
  Save-Slide $c '05-come-lavoreremo.png'
}

function Slide-6 {
  $c = New-Canvas; $g = $c.Graphics
  Draw-Background $g; Draw-Header $g '6/7'
  $fontEyebrow = Font-New 27 ([System.Drawing.FontStyle]::Bold)
  $fontTitle = Font-New 66 ([System.Drawing.FontStyle]::Bold)
  $fontLead = Font-New 37 ([System.Drawing.FontStyle]::Bold)
  $fontFine = Font-New 31 ([System.Drawing.FontStyle]::Bold)
  Draw-Text $g 'Radici San Giovanni Lipioni' $fontEyebrow $ochre 96 238 820 40
  Draw-Text $g 'Segnalazioni e contributi' $fontTitle $brown 96 298 880 150
  Draw-Text $g 'Cerchiamo contributi documentabili che possano aiutarci a ricostruire la storia materiale dei luoghi.' $fontLead $green 96 445 850 132
  $items = @('Fotografie datate', 'Cartoline utilizzabili con autorizzazione', 'Mappe e documenti', 'Nomi locali e denominazioni', 'Informazioni sulle trasformazioni', "Fonti che possano confermare un'informazione")
  Draw-List $g $items 96 610 884 98 18 2 $false 24
  Draw-Text $g "Ogni contributo sar${agrave} verificato e pubblicato soltanto con autorizzazione." $fontFine $brown 96 1018 850 90
  Draw-Footer $g
  $fontEyebrow.Dispose(); $fontTitle.Dispose(); $fontLead.Dispose(); $fontFine.Dispose()
  Save-Slide $c '06-segnalazioni-contributi.png'
}

function Slide-7 {
  $c = New-Canvas; $g = $c.Graphics
  Draw-CoverImage $g $photoBorgo 0 0 1080 1350
  Draw-PhotoShade $g $true
  Draw-Header $g '7/7' $true
  $fontEyebrow = Font-New 27 ([System.Drawing.FontStyle]::Bold)
  $fontTitle = Font-New 86 ([System.Drawing.FontStyle]::Bold)
  $fontBody = Font-New 40
  Draw-Text $g 'Radici San Giovanni Lipioni' $fontEyebrow ([System.Drawing.Color]::FromArgb(240, 193, 140)) 88 655 820 42
  Draw-Text $g 'Da quale luogo cominciamo?' $fontTitle $paper 88 710 860 190
  Draw-Text $g "San Giovanni Lipioni ${egrave} formato da tanti luoghi, grandi e piccoli. Quale luogo dovremmo documentare per primo?" $fontBody $paper 88 910 820 160
  Draw-Note $g 'Scrivilo nei commenti o inviaci una segnalazione documentata.' 88 1080 850 ([System.Drawing.Color]::FromArgb(240, 193, 140)) ([System.Drawing.Color]::FromArgb(46, 255, 253, 247)) $paper 132 31
  Draw-Footer $g $true
  $fontEyebrow.Dispose(); $fontTitle.Dispose(); $fontBody.Dispose()
  Save-Slide $c '07-da-dove-cominciamo.png'
}

Get-ChildItem $outputDir -Filter 'tmp-*.png' -ErrorAction SilentlyContinue | Remove-Item -Force
Slide-1
Slide-2
Slide-3
Slide-4
Slide-5
Slide-6
Slide-7

$files = Get-ChildItem $outputDir -Filter '*.png' | Sort-Object Name
$thumbW = 270
$thumbH = 338
$gap = 24
$cols = 4
$rows = [Math]::Ceiling($files.Count / $cols)
$canvasW = ($cols * $thumbW) + (($cols + 1) * $gap)
$canvasH = ($rows * $thumbH) + (($rows + 1) * $gap)
$preview = New-Object System.Drawing.Bitmap $canvasW, $canvasH, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$pg = [System.Drawing.Graphics]::FromImage($preview)
$pg.Clear($cream)
$pg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
for ($i = 0; $i -lt $files.Count; $i++) {
  $img = [System.Drawing.Image]::FromFile($files[$i].FullName)
  $x = $gap + (($i % $cols) * ($thumbW + $gap))
  $y = $gap + ([Math]::Floor($i / $cols) * ($thumbH + $gap))
  $pg.DrawImage($img, $x, $y, $thumbW, $thumbH)
  $img.Dispose()
}
$preview.Save((Join-Path $previewDir 'preview-grid.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$pg.Dispose()
$preview.Dispose()

$expected = @(
  '01-presentazione.png',
  '02-cosa-e-radici.png',
  '03-cosa-documenteremo.png',
  '04-cosa-non-racconteremo.png',
  '05-come-lavoreremo.png',
  '06-segnalazioni-contributi.png',
  '07-da-dove-cominciamo.png'
)

Write-Output "PNG count: $($files.Count)"
foreach ($name in $expected) {
  $path = Join-Path $outputDir $name
  $img = [System.Drawing.Image]::FromFile($path)
  Write-Output "$name | $($img.Width)x$($img.Height) | PixelFormat=$($img.PixelFormat)"
  $img.Dispose()
}