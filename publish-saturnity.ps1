[CmdletBinding()]
param(
    [ValidateSet('preview', 'production')]
    [string]$Target = 'preview'
)

$sourceFile = Join-Path $PSScriptRoot 'index.html'
$sourceAssets = Join-Path $PSScriptRoot 'assets'
$sourceFavicon = Join-Path $PSScriptRoot 'favicon.ico'
$webRoot = Join-Path (Split-Path $PSScriptRoot -Parent) 'saturnity-web'
$targetFolder = Join-Path $webRoot $Target
$targetFile = Join-Path $targetFolder 'index.html'
$adoptMeFile = Join-Path $PSScriptRoot 'adopt-me.html'
$redfingerFile = Join-Path $PSScriptRoot 'redfinger.html'

if (-not (Test-Path -LiteralPath $sourceFile -PathType Leaf)) {
    throw "Source file was not found: $sourceFile"
}

New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
Copy-Item -LiteralPath $sourceFile -Destination $targetFile -Force
if (Test-Path -LiteralPath $adoptMeFile -PathType Leaf) {
    $adoptMeFolder = Join-Path $targetFolder 'adopt-me'
    New-Item -ItemType Directory -Path $adoptMeFolder -Force | Out-Null
    Copy-Item -LiteralPath $adoptMeFile -Destination (Join-Path $adoptMeFolder 'index.html') -Force
}
if (Test-Path -LiteralPath $redfingerFile -PathType Leaf) {
    $redfingerFolder = Join-Path $targetFolder 'redfinger'
    New-Item -ItemType Directory -Path $redfingerFolder -Force | Out-Null
    Copy-Item -LiteralPath $redfingerFile -Destination (Join-Path $redfingerFolder 'index.html') -Force
    Copy-Item -LiteralPath $redfingerFile -Destination (Join-Path $targetFolder 'redfinger.html') -Force
}
if (Test-Path -LiteralPath $sourceAssets -PathType Container) {
    $targetAssets = Join-Path $targetFolder 'assets'
    New-Item -ItemType Directory -Path $targetAssets -Force | Out-Null
    Get-ChildItem -LiteralPath $sourceAssets -Force | Copy-Item -Destination $targetAssets -Recurse -Force
}
if (Test-Path -LiteralPath $sourceFavicon -PathType Leaf) {
    Copy-Item -LiteralPath $sourceFavicon -Destination (Join-Path $targetFolder 'favicon.ico') -Force
}

Write-Host "Published $sourceFile to $targetFile"
Write-Host "Caddy serves this folder as the $Target site. Refresh the browser to see it."
