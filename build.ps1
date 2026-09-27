# Builds the Windows installer and portable exe, then zips each one with README and LICENSE.
# Both exes are self-contained, so the zips work even if run without extracting first.
$ErrorActionPreference = 'Stop'
$v = (Get-Content package.json -Raw | ConvertFrom-Json).version

# Start clean so old versions don't get shipped by mistake. NSIS can't create its output subfolder itself.
if (Test-Path dist) { Remove-Item -Recurse -Force dist }
New-Item -ItemType Directory -Force dist/installer, dist/portable | Out-Null
npx electron-builder --win
if ($LASTEXITCODE) { exit $LASTEXITCODE }

foreach ($exe in "installer/tninefour Setup $v", "portable/tninefour Portable $v") {
  Compress-Archive -Force -Path "dist/$exe.exe", README.md, LICENSE -DestinationPath "dist/$exe.zip"
}
