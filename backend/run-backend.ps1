$dataDir = 'C:\Users\Administrator\Project\saturnity-data'
$configPath = Join-Path $dataDir 'backend.env'
if (-not (Test-Path -LiteralPath $configPath)) { throw 'Run .\initialize-backend.ps1 once before starting the backend.' }
Get-Content -LiteralPath $configPath | Where-Object { $_ -match '^[A-Z0-9_]+=' } | ForEach-Object { $key,$value=$_.Split('=',2); Set-Item -Path "Env:$key" -Value $value }
& 'C:\Program Files\nodejs\node.exe' (Join-Path $PSScriptRoot 'server.mjs')
