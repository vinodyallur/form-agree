# Upload to GitHub
# ----------------
# Run this from inside the form-agree-extension folder after creating an
# empty repo at https://github.com/new (name it `form-agree`, public, no
# README/license/.gitignore — we already have those).
#
# Usage:
#   .\upload.ps1 -Username your-github-username
#   # or
#   .\upload.ps1 -RepoUrl https://github.com/your-user/form-agree.git
#
# The first push will pop a browser window for Git Credential Manager to
# sign you in to GitHub. After that, future pushes just work.

[CmdletBinding(DefaultParameterSetName = "ByUser")]
param(
    [Parameter(ParameterSetName = "ByUser", Mandatory = $true)]
    [string]$Username,

    [Parameter(ParameterSetName = "ByUser")]
    [string]$RepoName = "form-agree",

    [Parameter(ParameterSetName = "ByUrl", Mandatory = $true)]
    [string]$RepoUrl
)

$ErrorActionPreference = "Stop"

if ($PSCmdlet.ParameterSetName -eq "ByUser") {
    $RepoUrl = "https://github.com/$Username/$RepoName.git"
}

Write-Host "Remote: $RepoUrl" -ForegroundColor Cyan

# Add or update the 'origin' remote.
$existing = git remote 2>$null
if ($existing -contains "origin") {
    git remote set-url origin $RepoUrl
} else {
    git remote add origin $RepoUrl
}

# Make sure we're on main.
git branch -M main

# Push. First time will trigger Git Credential Manager browser auth.
git push -u origin main

Write-Host ""
Write-Host "Done. Visit $($RepoUrl -replace '\.git$','') to see your repo." -ForegroundColor Green
