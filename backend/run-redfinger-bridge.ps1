$managerRoot = 'C:\Users\Administrator\Project\redfinger-manager'
$python = 'C:\Windows\py.exe'
if (-not (Test-Path -LiteralPath $python)) { throw 'Python launcher is missing.' }
if (-not $env:REDFINGER_MANAGER_ROOT) { $env:REDFINGER_MANAGER_ROOT = $managerRoot }
& $python (Join-Path $PSScriptRoot 'redfinger-bridge.py')
