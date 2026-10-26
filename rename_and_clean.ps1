$base = "C:\Program Files (x86)\Steam\steamapps\common\War Thunder"
$skinDir = Join-Path $base "UserSkins"
$cacheDir = Join-Path $base "cache"

# 1. Ensure all texture files have lowercase .dds extension
Get-ChildItem -Path $skinDir -Recurse -File -Include "*.DDS" | ForEach-Object {
    $newName = $_.FullName -replace "\.DDS$", ".dds"
    if (-not (Test-Path $newName)) {
        Rename-Item -Path $_.FullName -NewName $newName -Force
        Write-Host "Renamed $($_.Name) → $(Split-Path $newName -Leaf)" -ForegroundColor Green
    }
}

# 2. Delete War Thunder cache to force reload of textures
if (Test-Path $cacheDir) {
    Get-ChildItem -Path $cacheDir -Recurse -Force | Remove-Item -Force -Recurse
    Write-Host "Cache cleared" -ForegroundColor Yellow
} else {
    Write-Host "Cache folder not found" -ForegroundColor Red
}

Write-Host "All done – restart War Thunder now" -ForegroundColor Cyan
