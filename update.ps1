param(
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$Repo = 'Sakura-Yanxi/sakura-gemini-enhancer'
$ReleaseApi = "https://api.github.com/repos/$Repo/releases/latest"
$Root = Split-Path -Parent $PSCommandPath
$ManifestPath = Join-Path $Root 'manifest.json'

function Write-Step($Message) {
  Write-Host "[Sakura] $Message" -ForegroundColor Cyan
}

function Write-Done($Message) {
  Write-Host "[Sakura] $Message" -ForegroundColor Green
}

function Write-Warn($Message) {
  Write-Host "[Sakura] $Message" -ForegroundColor Yellow
}

function Normalize-Version($Version) {
  return ([string]$Version).Trim() -replace '^[vV]', ''
}

function Test-NewerVersion($Latest, $Current) {
  $latestParts = (Normalize-Version $Latest).Split('.') | ForEach-Object { [int]($_ -replace '[^\d].*$', '') }
  $currentParts = (Normalize-Version $Current).Split('.') | ForEach-Object { [int]($_ -replace '[^\d].*$', '') }
  $length = [Math]::Max($latestParts.Count, $currentParts.Count)

  for ($i = 0; $i -lt $length; $i++) {
    $a = if ($i -lt $latestParts.Count) { $latestParts[$i] } else { 0 }
    $b = if ($i -lt $currentParts.Count) { $currentParts[$i] } else { 0 }
    if ($a -gt $b) { return $true }
    if ($a -lt $b) { return $false }
  }

  return $false
}

function Get-PackageRoot($ExtractPath) {
  $manifest = Get-ChildItem -Path $ExtractPath -Filter 'manifest.json' -Recurse -File |
    Sort-Object { $_.FullName.Length } |
    Select-Object -First 1

  if (-not $manifest) {
    throw 'manifest.json was not found in the downloaded package. Update stopped.'
  }

  return Split-Path -Parent $manifest.FullName
}

function Sync-PackageFiles($SourceRoot, $TargetRoot) {
  $excluded = @('.git', '.github', 'dist', 'node_modules')
  $updaterFiles = @('update.ps1', 'update.bat')
  $sourceNames = @{}

  foreach ($item in Get-ChildItem -Path $SourceRoot -Force) {
    if ($excluded -contains $item.Name) {
      continue
    }

    $sourceNames[$item.Name] = $true
  }

  foreach ($item in Get-ChildItem -Path $TargetRoot -Force) {
    if ($excluded -contains $item.Name) {
      continue
    }

    if ($updaterFiles -contains $item.Name -and -not $sourceNames.ContainsKey($item.Name)) {
      continue
    }

    if (-not $sourceNames.ContainsKey($item.Name)) {
      Remove-Item -LiteralPath $item.FullName -Recurse -Force
    }
  }

  foreach ($item in Get-ChildItem -Path $SourceRoot -Force) {
    if ($excluded -contains $item.Name) {
      continue
    }

    $target = Join-Path $TargetRoot $item.Name

    if (Test-Path -LiteralPath $target -and -not ($updaterFiles -contains $item.Name)) {
      Remove-Item -LiteralPath $target -Recurse -Force
    }

    Copy-Item -LiteralPath $item.FullName -Destination $target -Recurse -Force
  }
}

try {
  if (-not (Test-Path $ManifestPath)) {
    throw "This directory is not a Sakura extension directory: $Root"
  }

  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

  $manifest = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json
  $currentVersion = $manifest.version

  Write-Step "Current version: v$currentVersion"
  Write-Step 'Checking latest GitHub release...'

  $release = Invoke-RestMethod -Uri $ReleaseApi -Headers @{
    Accept = 'application/vnd.github+json'
    'User-Agent' = 'Sakura-Updater'
  }

  $latestVersion = Normalize-Version $release.tag_name
  Write-Step "Latest version: v$latestVersion"

  if (-not $Force -and -not (Test-NewerVersion $latestVersion $currentVersion)) {
    Write-Done 'Already up to date.'
    exit 0
  }

  $asset = @($release.assets) |
    Where-Object { $_.name -like 'sakura-gemini-enhancer-v*.zip' } |
    Select-Object -First 1

  if (-not $asset) {
    $asset = @($release.assets) |
      Where-Object { $_.name -like '*.zip' } |
      Select-Object -First 1
  }

  if (-not $asset) {
    throw 'No downloadable zip asset was found in the latest release.'
  }

  $tempRoot = Join-Path ([IO.Path]::GetTempPath()) ("sakura-update-" + [Guid]::NewGuid().ToString('N'))
  $extractRoot = Join-Path $tempRoot 'extract'
  $zipPath = Join-Path $tempRoot $asset.name

  New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null

  Write-Step "Downloading: $($asset.name)"
  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -Headers @{
    'User-Agent' = 'Sakura-Updater'
  }

  Write-Step 'Extracting update package...'
  Expand-Archive -LiteralPath $zipPath -DestinationPath $extractRoot -Force

  $packageRoot = Get-PackageRoot $extractRoot

  Write-Step 'Syncing local extension files and removing stale files...'
  Sync-PackageFiles $packageRoot $Root

  Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue

  Write-Done "Updated to v$latestVersion."
  Write-Warn 'Final step: open chrome://extensions/, click the refresh button on the Sakura extension card, then refresh the website.'
  Write-Warn 'If you use Edge, open edge://extensions/.'

  try {
    Start-Process 'chrome://extensions/'
  } catch {
    # Some systems do not allow opening chrome:// URLs directly.
  }
} catch {
  Write-Host ''
  Write-Host "[Sakura] Update failed: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host '[Sakura] Manual download page:' -ForegroundColor Yellow
  Write-Host 'https://github.com/Sakura-Yanxi/sakura-gemini-enhancer/releases/latest' -ForegroundColor Yellow
  exit 1
}
