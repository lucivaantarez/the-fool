$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
$runScript = Join-Path $PSScriptRoot 'run-backend.ps1'
$healthUrl = 'http://127.0.0.1:8787/api/health'
$logDir = Join-Path $env:LOCALAPPDATA 'Saturnity'
$logPath = Join-Path $logDir 'backend-watchdog.log'
$checkSeconds = 15

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Write-WatchdogLog {
  param([string]$Message)
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Add-Content -LiteralPath $logPath -Value "[$stamp] $Message"
}

function Test-BackendHealth {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 4 -Uri $healthUrl
    return ($response.StatusCode -eq 200 -and $response.Content -match '"ok"\s*:\s*true')
  } catch {
    return $false
  }
}

function Get-BackendProcesses {
  $listeners = @(Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue)
  foreach ($listener in $listeners) {
    if ($listener.OwningProcess -and $listener.OwningProcess -ne 0) {
      Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
    }
  }
}

function Start-Backend {
  $running = @(Get-BackendProcesses)
  if ($running.Count -gt 0 -and (Test-BackendHealth)) {
    return
  }

  if ($running.Count -gt 0) {
    Write-WatchdogLog "Unhealthy listener detected; stopping $($running.Count) backend process(es)."
    foreach ($proc in $running) {
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
  }

  Write-WatchdogLog 'Starting Saturnity backend.'
  Start-Process -FilePath 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' `
    -ArgumentList @('-NoProfile','-WindowStyle','Hidden','-ExecutionPolicy','Bypass','-File',$runScript) `
    -WorkingDirectory $root `
    -WindowStyle Hidden
}

Write-WatchdogLog "Persistent watchdog started; checking every $checkSeconds seconds."
$wasHealthy = $false

while ($true) {
  $healthy = Test-BackendHealth
  if (-not $healthy) {
    Start-Backend
    Start-Sleep -Seconds 4
    $healthy = Test-BackendHealth
    if ($healthy -and -not $wasHealthy) {
      Write-WatchdogLog 'Backend health restored.'
    } elseif (-not $healthy) {
      Write-WatchdogLog 'Backend health still failed after start attempt.'
    }
  } elseif (-not $wasHealthy) {
    Write-WatchdogLog 'Backend health OK.'
  }

  $wasHealthy = $healthy
  Start-Sleep -Seconds $checkSeconds
}
