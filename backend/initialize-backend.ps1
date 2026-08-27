$dataDir = 'C:\Users\Administrator\Project\saturnity-data'
$configPath = Join-Path $dataDir 'backend.env'
New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
if (Test-Path -LiteralPath $configPath) { throw "Backend configuration already exists: $configPath" }
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$keyBytes = [byte[]]::new(32); $rng.GetBytes($keyBytes)
$tokenBytes = [byte[]]::new(32); $rng.GetBytes($tokenBytes)
$rng.Dispose()
$config = @("SATURNITY_MASTER_KEY=$([Convert]::ToBase64String($keyBytes))", "SATURNITY_SETUP_TOKEN=$([Convert]::ToBase64String($tokenBytes))", 'SATURNITY_PORT=8787', 'SATURNITY_PUBLIC_ORIGIN=https://saturnity.site', "SATURNITY_DATA_DIR=$dataDir")
[System.IO.File]::WriteAllLines($configPath, $config)
$acl = Get-Acl $dataDir; $acl.SetAccessRuleProtection($true, $false); $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow'); $acl.SetAccessRule($rule); Set-Acl -LiteralPath $dataDir -AclObject $acl
Write-Host "Backend secrets were created in your private data folder. Do not share backend.env."
Write-Host "Open $configPath locally and use SATURNITY_SETUP_TOKEN once in Saturnity to create the owner account."
