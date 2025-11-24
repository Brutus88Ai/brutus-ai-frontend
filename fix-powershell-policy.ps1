<#
Run this in PowerShell (as current user) to set an ExecutionPolicy that allows running npm scripts.
Usage (in PS):
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
#>
Write-Host "To allow npm.ps1 execution you can run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
