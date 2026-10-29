# Builds the station-1 intro video ("Kitaran Air") from the artwork in
# design-assets/video/station-1/assets (build-time only, not shipped in dist).
#
#   powershell -ExecutionPolicy Bypass -File tools\build-video-1.ps1 -Preview   # 720p draft
#   powershell -ExecutionPolicy Bypass -File tools\build-video-1.ps1            # 1080p final
#
# Output: public/videos/khemah-video-preview.mp4 (draft)
#         public/videos/khemah-video-new.mp4     (final, not swapped in yet)
param(
  [switch]$Preview,
  [switch]$SkipAudio,
  [int]$Crf = 20
)

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$assets  = Join-Path $root 'design-assets\video\station-1\assets'
$audio   = Join-Path $root 'public\audio\bgm-cute.mp3'
$work    = Join-Path $root '.video-build'
$textDir = Join-Path $work 'text'
$segDir  = Join-Path $work 'segments'
$outDir  = Join-Path $root 'public\videos'

$ff = 'C:\Program Files (x86)\Youtube Downloader HD\ffmpeg.exe'
if (-not (Test-Path $ff)) { throw "ffmpeg not found at $ff" }

if ($Preview) { $W = 1280; $H = 720 } else { $W = 1920; $H = 1080 }
$FPS = 30
$s = $W / 1920.0

foreach ($d in @($work, $textDir, $segDir, $outDir)) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null }
}

$fontBold = 'D\:/Windows/Fonts/segoeuib.ttf'

function Px([double]$v) { return [int][math]::Round($v * $s) }

function TextFile([string]$name, [string]$content) {
  $p = Join-Path $textDir "$name.txt"
  [IO.File]::WriteAllText($p, $content, (New-Object System.Text.UTF8Encoding($false)))
  return 'D\:/Teknologi Web Site/water-cycle-explorer/.video-build/text/' + $name + '.txt'
}

function RunFfmpeg([string[]]$argv, [string]$label) {
  Write-Host ">> $label"
  & $ff @argv
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed on $label (exit $LASTEXITCODE)" }
}

function Img([string]$file, [double]$dur) {
  return @('-loop', '1', '-t', "$dur", '-i', (Join-Path $assets $file))
}

# ------------------------------------------------------------------ captions
function Line([string]$file, [int]$size, [string]$yExpr, [string]$colour) {
  if (-not $colour) { $colour = 'white' }
  return "drawtext=fontfile='$fontBold':textfile='$file':fontcolor=${colour}:fontsize=" + (Px $size) +
  ":x=(w-text_w)/2:y=${yExpr}:shadowcolor=0x0d2a1f@0.65:shadowx=3:shadowy=4"
}

function Band([int]$height) {
  return "drawbox=x=0:y=ih-" + (Px $height) + ":w=iw:h=" + (Px $height) + ":color=0x123526@0.55:t=fill"
}

# caption strip with one or two lines
function Captions([string[]]$lines, [int]$band) {
  if (-not $band) { $band = 152 }
  $parts = @((Band $band))
  $top = $H - (Px $band)
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $size = if ($i -eq 0) { 50 } else { 38 }
    $colour = if ($i -eq 0) { 'white' } else { '0xd9f2c9' }
    $y = $top + (Px 30) + $i * (Px 68)
    $parts += (Line $lines[$i] $size "$y" $colour)
  }
  return ($parts -join ',')
}

# big term + english + one example sentence
function TermCaption([string]$term, [string]$english, [string]$line, [string]$line2) {
  $band = 238
  $top = $H - (Px $band)
  $parts = @((Band $band))
  $parts += (Line $term 76 ($top + (Px 18)) 'white')
  $parts += (Line $english 34 ($top + (Px 108)) '0xd9f2c9')
  if ($line) { $parts += (Line $line 38 ($top + (Px 158)) 'white') }
  return ($parts -join ',')
}

# ------------------------------------------------------------------- files
$capTitle1 = TextFile 'cap-title-1' 'Kitaran Air'
$capTitle2 = TextFile 'cap-title-2' 'The Water Cycle'
$capSub    = TextFile 'cap-sub'     'Sains Tahun 5   ·   8.0 Jirim'
$capSun    = TextFile 'cap-sun'     'Matahari membekalkan tenaga untuk memanaskan air.'
$capEvap   = TextFile 'cap-evap'    'Air bertukar menjadi wap air.'
$capVapour = TextFile 'cap-vapour'  'Wap air tidak kelihatan, tetapi ia naik ke atas.'
$capCond   = TextFile 'cap-cond'    'Wap air menyejuk lalu menjadi titisan air kecil.'
$capCloud  = TextFile 'cap-cloud'   'Awan terdiri daripada titisan air dan hablur ais.'
$capPrecip = TextFile 'cap-precip'  'Awan terlalu berat, titisan air jatuh sebagai hujan.'
$capColl   = TextFile 'cap-coll'    'Air hujan mengalir ke sungai, tasik dan laut.'
$capLoop   = TextFile 'cap-loop'    'Kitaran air berterusan, lagi dan lagi.'
$capEnd    = TextFile 'cap-end'     'Jom terokai bersama Wally!'
$capQ1     = TextFile 'cap-q1'      'Dari manakah datangnya hujan?'
$capQ2     = TextFile 'cap-q2'      'Ke manakah air pergi selepas hujan turun?'
$capQ3     = TextFile 'cap-q3'      'Bagaimanakah air kembali ke atmosfera?'
$tEvap     = TextFile 'term-evap'   'Penyejatan'
$tEvapEn   = TextFile 'term-evap-en' 'Evaporation'
$tCond     = TextFile 'term-cond'   'Kondensasi'
$tCondEn   = TextFile 'term-cond-en' 'Condensation'
$tPrec     = TextFile 'term-prec'   'Kerpasan'
$tPrecEn   = TextFile 'term-prec-en' 'Precipitation'
$tColl     = TextFile 'term-coll'   'Pengumpulan'
$tCollEn   = TextFile 'term-coll-en' 'Collection'
$arrow     = TextFile 'vapour-arrow' ([string][char]0x2191)

# ------------------------------------------------------------------ sky plate
$skyPng = Join-Path $work "sky-${W}x${H}.png"
if (-not (Test-Path $skyPng)) {
  Add-Type -AssemblyName System.Drawing
  $bmp = New-Object System.Drawing.Bitmap $W, $H
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect,
    [System.Drawing.Color]::FromArgb(255, 126, 200, 232),
    [System.Drawing.Color]::FromArgb(255, 236, 248, 241), 90.0)
  $gfx.FillRectangle($brush, $rect)
  $brush.Dispose(); $gfx.Dispose()
  $bmp.Save($skyPng, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
function SkyIn([double]$dur) { return @('-loop', '1', '-t', "$dur", '-i', $skyPng) }

# the source valley artwork carries a "豆包AI生成" watermark in the bottom-right
# corner, so trim 44 px off the bottom before scaling; the waterline survives
$valley = Join-Path $assets 'valley-bg.png'
function ValleyIn([double]$dur) { return @('-loop', '1', '-t', "$dur", '-i', $valley) }
$valleyCrop = "crop=iw:ih-44:0:0,"

function ValleyBg([string]$speed) {
  if (-not $speed) { $speed = '0.00035' }
  return $valleyCrop + "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},zoompan=z='min(1.0+$speed*on,1.06)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=$FPS[bg]"
}

# overlay a scaled sprite; $yTop is a plain number, $bob adds a slow float
function Place([string]$label, [string]$sprite, [int]$x, [int]$yTop, [int]$bob) {
  return "overlay=x=${x}:y='" + $yTop + "+sin(t*1.3)*" + $bob + "':shortest=0[$label]"
}

$d = @{ s1 = 8.0; s2 = 9.0; s3 = 16.0; s4 = 14.0; s5 = 15.0; s6 = 12.0; s7 = 13.0; s8 = 8.5 }

function RenderScene {
  param([string]$Name, [double]$Duration, [string[]]$InputArgs, [string]$Filter)
  $out = Join-Path $segDir "$Name.mp4"
  $graph = $Filter + ";[vpre]format=yuv420p[vout]"
  $argv = @('-hide_banner', '-loglevel', 'error', '-y') + $InputArgs + @(
    '-filter_complex', $graph, '-map', '[vout]', '-an', '-t', "$Duration",
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', "$Crf",
    '-pix_fmt', 'yuv420p', '-r', "$FPS", $out
  )
  RunFfmpeg $argv $Name
}

$bandTerm = 238
$wallyTerm = (Px 600)
$wallyYTerm = $H - $bandTerm - $wallyTerm + (Px 8)

# ============================================================ 1 · title card
$f = @()
$f += (ValleyBg '0.0005')
$f += "[1:v]scale=" + (Px 340) + ":-1[o1]"
$f += "[2:v]scale=-1:" + (Px 380) + "[o2]"
$f += "[bg][o1]overlay=x=" + (Px 1440) + ":y='" + (Px 430) + "+sin(t*0.6)*" + (Px 6) + "'[v1]"
$f += "[v1][o2]overlay=x=" + (Px 90) + ":y='h-h+" + (Px 150) + "+sin(t*1.2)*" + (Px 5) + "'[v2]"
$f += "[v2]" + (Line $capTitle1 104 (Px 120) 'white') + "," + (Line $capTitle2 44 (Px 256) '0xd9f2c9') + "," + (Line $capSub 32 (Px 322) 'white') + "[vpre]"
RenderScene -Name 's1-title' -Duration $d.s1 -Filter ($f -join ';') -InputArgs ((ValleyIn $d.s1) + (Img 'sun.png' $d.s1) + (Img 'wally-wave.png' $d.s1))

# =============================================================== 2 · sunshine
$f = @()
$f += (ValleyBg '0.0004')
$f += "[1:v]scale=" + (Px 380) + ":-1[o1]"
$f += "[2:v]scale=-1:" + $wallyTerm + "[o2]"
$f += "[bg][o1]overlay=x=" + (Px 1350) + ":y='" + (Px 50) + "+sin(t*0.7)*" + (Px 10) + "'[v1]"
$f += "[v1][o2]" + (Place 'v2' 'o2' (Px 940) $wallyYTerm 6)
$f += "[v2]" + (Captions @($capSun) 152) + "[vpre]"
RenderScene -Name 's2-sun' -Duration $d.s2 -Filter ($f -join ';') -InputArgs ((ValleyIn $d.s2) + (Img 'fg-10-sun-face.png' $d.s2) + (Img 'wally-point-up.png' $d.s2))

# ============================================================= 3 · evaporation
$f = @()
$f += (ValleyBg '0.0003')
$f += "[1:v]scale=" + (Px 330) + ":-1[o1]"
$f += "[2:v]scale=-1:" + $wallyTerm + "[o2]"
$f += "[bg][o1]overlay=x=" + (Px 1470) + ":y='" + (Px 60) + "+sin(t*0.8)*" + (Px 8) + "'[v1]"
$f += "[v1][o2]" + (Place 'v2' 'o2' (Px 60) $wallyYTerm 6)
$last = '[v2]'
for ($i = 0; $i -lt 4; $i++) {
  $x = Px (560 + $i * 190)
  $expr = "h*0.60 - mod((t+" + ($i * 0.7) + ")*" + (Px 95) + ", h*0.40)"
  $f += "$last" + "drawtext=fontfile='$fontBold':textfile='$arrow':fontcolor=0x1f7fb4@0.95:fontsize=" + (Px 76) + ":x=$x`:y='$expr'[a$i]"
  $last = "[a$i]"
}
$f += "$last" + (TermCaption $tEvap $tEvapEn $capEvap $capVapour) + "[vpre]"
RenderScene -Name 's3-evaporation' -Duration $d.s3 -Filter ($f -join ';') -InputArgs ((ValleyIn $d.s3) + (Img 'fg-10-sun-face.png' $d.s3) + (Img 'wally-point-up.png' $d.s3))

# ============================================================ 4 · condensation
$f = @()
$f += "scale=${W}:${H}[bg]"
$f += "[1:v]scale=" + (Px 880) + ":-1,format=rgba[o1]"
$f += "[2:v]scale=-1:" + $wallyTerm + "[o2]"
$f += "[bg][o1]overlay=x='" + (Px 560) + "+sin(t*0.35)*" + (Px 24) + "':y='" + (Px 120) + "+sin(t*0.55)*" + (Px 8) + "'[v1]"
$f += "[v1][o2]" + (Place 'v2' 'o2' (Px 90) $wallyYTerm 6)
$last = '[v2]'
for ($i = 0; $i -lt 2; $i++) {
  $x = Px (1180 + $i * 210)
  $expr = "h*0.52 - mod((t+" + ($i * 1.3) + ")*" + (Px 65) + ", h*0.26)"
  $f += "$last" + "drawtext=fontfile='$fontBold':textfile='$arrow':fontcolor=0x3fa9dd@0.85:fontsize=" + (Px 44) + ":x=$x`:y='$expr'[a$i]"
  $last = "[a$i]"
}
$f += "$last" + (TermCaption $tCond $tCondEn $capCond) + "[vpre]"
RenderScene -Name 's4-condensation' -Duration $d.s4 -Filter ($f -join ';') -InputArgs ((SkyIn $d.s4) + (Img 'fg-02-cloud-white.png' $d.s4) + (Img 'wally-point-right.png' $d.s4))

# =========================================================== 5 · precipitation
$f = @()
$f += "scale=${W}:${H}[bg]"
$f += "[1:v]scale=" + (Px 980) + ":-1,format=rgba[o1]"
$f += "[2:v]scale=-1:" + $wallyTerm + "[o2]"
$f += "[bg][o1]overlay=x='(w-w)/2+sin(t*0.4)*" + (Px 12) + "':y='" + (Px 20) + "+sin(t*0.5)*" + (Px 6) + "'[v1]"
$f += "[v1][o2]" + (Place 'v2' 'o2' (Px 80) $wallyYTerm 5)
for ($i = 0; $i -lt 2; $i++) {
  $f += "[" + (3 + $i) + ":v]scale=" + (Px (300 + $i * 220)) + ":-1,format=rgba[r$i]"
}
for ($i = 0; $i -lt 2; $i++) {
  $expr = "-h*0.55 + mod((t+" + ($i * 0.9) + ")*" + (Px (780 + $i * 160)) + ", h*0.9)"
  $x = Px (300 + $i * 640)
  $f += "[v" + (2 + $i) + "][r$i]overlay=x=$x`:y='$expr'[v" + (3 + $i) + "]"
}
$f += "[v4]" + (TermCaption $tPrec $tPrecEn $capPrecip) + "[vpre]"
RenderScene -Name 's5-precipitation' -Duration $d.s5 -Filter ($f -join ';') -InputArgs ((SkyIn $d.s5) + (Img 'fg-03-cloud-grey.png' $d.s5) + (Img 'wally-umbrella.png' $d.s5) + (Img 'fg-05-rain.png' $d.s5) + (Img 'fg-05-rain.png' $d.s5))

# ============================================================== 6 · collection
$f = @()
$f += (ValleyBg '0.00035')
$f += "[1:v]scale=" + (Px 260) + ":-1,format=rgba[o1]"
$f += "[2:v]scale=-1:" + $wallyTerm + "[o2]"
$f += "[bg][o1]overlay=x=" + (Px 690) + ":y='" + (Px 560) + "+sin(t*2.1)*" + (Px 4) + "':enable='lt(mod(t,3.4),2.0)'[v1]"
$f += "[v1][o2]" + (Place 'v2' 'o2' (Px 80) $wallyYTerm 6)
$f += "[v2]" + (TermCaption $tColl $tCollEn $capColl) + "[vpre]"
RenderScene -Name 's6-collection' -Duration $d.s6 -Filter ($f -join ';') -InputArgs ((ValleyIn $d.s6) + (Img 'fg-12-splash.png' $d.s6) + (Img 'wally-point-up.png' $d.s6))

# =============================================================== 7 · the cycle
$f = @()
$f += (ValleyBg '0.0003')
$f += "[1:v]scale=-1:" + (Px 520) + "[o1]"
$f += "[bg][o1]" + (Place 'v1' 'o1' (Px 110) ($H - $bandTerm - (Px 520) + (Px 8)) 8)
$steps = @('1. Penyejatan', '2. Kondensasi', '3. Kerpasan', '4. Pengumpulan')
$last = '[v1]'
for ($i = 0; $i -lt 4; $i++) {
  $tf = TextFile ("step-" + ($i + 1)) $steps[$i]
  $start = 0.4 + $i * 1.5
  $y = Px (200 + $i * 92)
  $f += "$last" + "drawtext=fontfile='$fontBold':textfile='$tf':fontcolor=0x24452b:fontsize=" + (Px 42) + ":x=" + (Px 780) + ":y=$y`:box=1:boxcolor=0xF6F9E4@0.94:boxborderw=" + (Px 14) + ":enable='gte(t," + $start + ")'[s$i]"
  $last = "[s$i]"
}
$f += "$last" + (Captions @($capLoop) 152) + "[vpre]"
RenderScene -Name 's7-cycle' -Duration $d.s7 -Filter ($f -join ';') -InputArgs ((ValleyIn $d.s7) + (Img '13.png' $d.s7))

# ================================================================ 8 · end card
$f = @()
$f += "scale=${W}:${H}[bg]"
$f += "[1:v]scale=-1:" + (Px 320) + "[o1]"
$f += "[bg][o1]overlay=x=" + (Px 120) + ":y='h-h+" + (Px 110) + "+sin(t*1.2)*" + (Px 7) + "'[v1]"
$f += "[v1]" + (Line $capQ1 44 (Px 110) 'white') + "," + (Line $capQ2 40 (Px 200) 'white') + "," + (Line $capQ3 40 (Px 290) 'white') + "," + (Band 132) + "," + (Line $capEnd 34 ("h-" + (Px 92)) '0xd9f2c9') + "[vpre]"
RenderScene -Name 's8-endcard' -Duration $d.s8 -Filter ($f -join ';') -InputArgs ((SkyIn $d.s8) + (Img 'wally-wave.png' $d.s8))

# ==================================================== join the scenes + music
# this ffmpeg build has neither "xfade" nor "gradients", so the scenes are
# joined with the concat demuxer (clean hard cuts) and only the very start and
# end of the finished video fade against the sky colour.
$names = @('s1-title', 's2-sun', 's3-evaporation', 's4-condensation', 's5-precipitation', 's6-collection', 's7-cycle', 's8-endcard')
$durs  = @($d.s1, $d.s2, $d.s3, $d.s4, $d.s5, $d.s6, $d.s7, $d.s8)
$total = ($durs | Measure-Object -Sum).Sum
$fadeOut = $total - 0.8

$list = Join-Path $work 'segments.txt'
$lines = $names | ForEach-Object { "file '" + (Join-Path $segDir ($_ + '.mp4')).Replace('\', '/') + "'" }
[IO.File]::WriteAllLines($list, $lines, (New-Object System.Text.UTF8Encoding($false)))

$finalName = if ($Preview) { 'khemah-video-preview.mp4' } else { 'khemah-video-new.mp4' }
$final = Join-Path $outDir $finalName
$vfade = "fade=t=in:st=0:d=0.45,fade=t=out:st=$fadeOut`:d=0.8"

if ($SkipAudio -or -not (Test-Path $audio)) {
  $argv = @('-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',$list,
    '-vf',$vfade,'-an','-c:v','libx264','-preset','veryfast','-crf',"$Crf",'-pix_fmt','yuv420p','-r',"$FPS",$final)
  RunFfmpeg $argv 'concat (no audio)'
} else {
  $argv = @('-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',$list,
    '-stream_loop','-1','-i',$audio,
    '-filter_complex',
    "[0:v]$vfade[vout];[1:a]volume=0.16,afade=t=in:st=0:d=1.5,afade=t=out:st=$fadeOut`:d=1.6,atrim=0:$total,asetpts=N/SR/TB[aout]",
    '-map','[vout]','-map','[aout]',
    '-c:v','libx264','-preset','veryfast','-crf',"$Crf",'-pix_fmt','yuv420p','-r',"$FPS",
    '-c:a','aac','-b:a','160k','-ar','44100','-ac','2',
    '-movflags','+faststart','-shortest',$final)
  RunFfmpeg $argv 'concat + audio'
}

$size = [math]::Round((Get-Item $final).Length / 1MB, 2)
Write-Host ("done: {0}  {1} MB  {2}s  {3}x{4}" -f $final, $size, [math]::Round($total, 1), $W, $H)
