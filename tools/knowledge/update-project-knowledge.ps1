$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$graphify = Join-Path $env:USERPROFILE ".local\bin\graphify.exe"

if (-not (Test-Path -LiteralPath $graphify)) {
    $command = Get-Command graphify -ErrorAction Stop
    $graphify = $command.Source
}

Push-Location $repoRoot
try {
    & $graphify update .
    if ($LASTEXITCODE -ne 0) { throw "Graphify update failed with exit code $LASTEXITCODE." }

    & $graphify cluster-only . --no-label
    if ($LASTEXITCODE -ne 0) { throw "Graphify clustering failed with exit code $LASTEXITCODE." }

    & $graphify export obsidian --dir knowledge-base/graphify
    if ($LASTEXITCODE -ne 0) { throw "Graphify Obsidian export failed with exit code $LASTEXITCODE." }

    Write-Host "Project graph and Obsidian vault refreshed."
}
finally {
    Pop-Location
}
