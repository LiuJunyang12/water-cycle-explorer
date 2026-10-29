# Windows PowerShell 5.1 reads .ps1 files as ANSI unless they carry a BOM, which
# breaks the Chinese comments in process-sprites.ps1. This wrapper reads that
# file as UTF-8 and runs it, so the sprite script works from any shell.
# $PSScriptRoot is empty inside Invoke-Expression, so it is substituted first.
$dir = $PSScriptRoot
$path = Join-Path $dir 'process-sprites.ps1'
$source = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$source = $source.Replace('$PSScriptRoot', "'" + $dir + "'")
Invoke-Expression $source
