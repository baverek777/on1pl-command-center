$base = "C:\Program Files (x86)\Steam\steamapps\common\War Thunder\UserSkins"
$folders = @(
    "Modern Green Camo T90 M",
    "Leopard Camo T80 BVM",
    "Modern Green Camo T80 BVM",
    "Worn Gold T80 BVM",
    "Green EMR Camo S1"
)

foreach ($folder in $folders) {
    $dir = Join-Path $base $folder
    if (-not (Test-Path $dir)) { continue }
    
    # 1. Rename .DDS to .dds
    $files = Get-ChildItem -Path $dir -File -Filter "*.DDS"
    foreach ($file in $files) {
        $newName = $file.Name -replace '\.DDS$', '.dds'
        Rename-Item -Path $file.FullName -NewName $newName -Force
        Write-Host "Zmieniono rozszerzenie: $($file.Name) -> $newName"
    }
    
    # 2. Update .blk files
    $blkFiles = Get-ChildItem -Path $dir -File -Filter "*.blk"
    foreach ($blkFile in $blkFiles) {
        $content = Get-Content $blkFile.FullName -Raw
        $content = $content -replace '\.DDS', '.dds'
        Set-Content -Path $blkFile.FullName -Value $content -Encoding UTF8
        Write-Host "Zaktualizowano plik BLK: $($blkFile.Name)"
    }
}

# Clear cache
$cacheDir = "C:\Program Files (x86)\Steam\steamapps\common\War Thunder\cache"
if (Test-Path $cacheDir) {
    Remove-Item -Path "$cacheDir\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Cache wyczyszczony."
}
