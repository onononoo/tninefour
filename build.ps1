# Builds the Windows installer and portable exe, then zips each one with README and LICENSE.
# Both exes are self-contained, so the zips work even if run without extracting first.
$ErrorActionPreference = 'Stop'
$v = (Get-Content package.json -Raw | ConvertFrom-Json).version

# App icon: icon.ico is made from "images and webpages/icon.png" on every build.
# Each size fits the image, centered, on a transparent square; the .ico stores each size as a PNG.
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile((Resolve-Path 'images and webpages/icon.png'))
$sizes = 16, 24, 32, 48, 64, 128, 256
$pngs = foreach ($s in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap $s, $s
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $k = $s / [Math]::Max($src.Width, $src.Height)
  $w = $src.Width * $k; $h = $src.Height * $k
  $g.DrawImage($src, ($s - $w) / 2, ($s - $h) / 2, $w, $h)
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  , $ms.ToArray()
}
$src.Dispose()
# .ico layout: 6-byte header, a 16-byte entry per size, then the images.
$ico = New-Object System.IO.MemoryStream
$w = New-Object System.IO.BinaryWriter $ico
$w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
  $w.Write([byte]($sizes[$i] % 256)); $w.Write([byte]($sizes[$i] % 256)) # 256 is stored as 0
  $w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]32)
  $w.Write([UInt32]$pngs[$i].Length); $w.Write([UInt32]$offset)
  $offset += $pngs[$i].Length
}
foreach ($p in $pngs) { $w.Write($p) }
[IO.File]::WriteAllBytes("$PWD/icon.ico", $ico.ToArray())

# Start clean so old versions don't get shipped by mistake. NSIS can't create its output subfolder itself.
if (Test-Path dist) { Remove-Item -Recurse -Force dist }
New-Item -ItemType Directory -Force dist/installer, dist/portable | Out-Null
npx electron-builder --win
if ($LASTEXITCODE) { exit $LASTEXITCODE }

foreach ($exe in "installer/tninefour Setup $v", "portable/tninefour Portable $v") {
  Compress-Archive -Force -Path "dist/$exe.exe", README.md, LICENSE -DestinationPath "dist/$exe.zip"
}
