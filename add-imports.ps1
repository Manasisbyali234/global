# Add formatDate imports to all files
$files = Get-ChildItem -Path "frontend\src\app\pannels" -Recurse -Filter "*.jsx" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match "formatDate\(" -and $content -notmatch "import.*formatDate.*from"
}

foreach ($file in $files) {
    Write-Host "Adding import to: $($file.Name)"
    $content = Get-Content $file.FullName -Raw
    
    # Determine correct import path based on file location
    $relativePath = $file.FullName -replace [regex]::Escape($PSScriptRoot), ""
    $depth = ($relativePath.Split('\') | Where-Object { $_ -ne "" }).Count - 4
    $importPath = "../" * $depth + "utils/dateFormatter"
    
    # Find the last import statement
    if ($content -match "(?s)(import[^;]+;)(\r?\n)") {
        $lastImport = $matches[0]
        $importStatement = "import { formatDate } from '$importPath';`n"
        $content = $content -replace [regex]::Escape($lastImport), "$lastImport$importStatement"
        
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Added import to: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "Import statements added!" -ForegroundColor Cyan
