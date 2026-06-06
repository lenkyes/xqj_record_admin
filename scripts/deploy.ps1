<#
.SYNOPSIS
Build the Vite frontend and upload the dist folder to a remote server over SSH.

.EXAMPLE
.\scripts\deploy.ps1

.EXAMPLE
.\scripts\deploy.ps1 -RemoteHost example.com -PrivateKeyPath C:\Users\me\.ssh\xqj.pem -CleanRemoteDist
#>

[CmdletBinding()]
param(
  [Alias("HostName", "Server")]
  [string]$RemoteHost = "47.76.177.125",

  [Alias("User")]
  [string]$RemoteUser = "root",

  [Alias("KeyPath")]
  [string]$PrivateKeyPath = "C:\Users\Administrator\.ssh\lens",

  [int]$Port = 22,

  [string]$RemotePath = "/root/application/nginx-proxy-manager/data/king",

  [switch]$Install,

  [switch]$CleanRemoteDist
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Require-Command {
  param([Parameter(Mandatory = $true)][string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

function Invoke-External {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [Parameter(Mandatory = $true)][string]$Step
  )

  Write-Host ""
  Write-Host "==> $Step"
  & $FilePath @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "$Step failed with exit code $LASTEXITCODE."
  }
}

function Quote-RemotePath {
  param([Parameter(Mandatory = $true)][string]$Path)

  return "'" + $Path.Replace("'", "'\''") + "'"
}

Require-Command "pnpm"
Require-Command "ssh"
Require-Command "scp"

$ScriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $ScriptRoot "..")).Path
$ResolvedKeyPath = (Resolve-Path -LiteralPath $PrivateKeyPath).Path
$DistPath = Join-Path $ProjectRoot "dist"
$Remote = "${RemoteUser}@${RemoteHost}"
$QuotedRemotePath = Quote-RemotePath $RemotePath

Set-Location $ProjectRoot

if ($Install) {
  Invoke-External -FilePath "pnpm" -Arguments @("install", "--frozen-lockfile") -Step "Install dependencies"
}

Invoke-External -FilePath "pnpm" -Arguments @("build") -Step "Build frontend"

if (-not (Test-Path -LiteralPath $DistPath -PathType Container)) {
  throw "Build succeeded but dist folder was not found: $DistPath"
}

$SshArgs = @("-i", $ResolvedKeyPath, "-p", $Port.ToString(), $Remote)
$ScpArgs = @("-i", $ResolvedKeyPath, "-P", $Port.ToString(), "-r", $DistPath, "${Remote}:$RemotePath/")

Invoke-External -FilePath "ssh" -Arguments ($SshArgs + @("mkdir -p $QuotedRemotePath")) -Step "Create remote directory"

if ($CleanRemoteDist) {
  Invoke-External -FilePath "ssh" -Arguments ($SshArgs + @("rm -rf $QuotedRemotePath/dist")) -Step "Remove old remote dist"
}

Invoke-External -FilePath "scp" -Arguments $ScpArgs -Step "Upload dist folder"

Write-Host ""
Write-Host "Deploy complete."
Write-Host "Remote dist path: $RemotePath/dist"
