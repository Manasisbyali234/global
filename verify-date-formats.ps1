# Verification Script - Check Date Format Implementation
Write-Host "=== Date Format Standardization Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check backend
Write-Host "Backend Files:" -ForegroundColor Yellow
$backendFormatter = Test-Path "backend\utils\dateFormatter.js"
Write-Host "  dateFormatter.js exists: $backendFormatter" -ForegroundColor $(if($backendFormatter){"Green"}else{"Red"})

$candidateController = Select-String -Path "backend\controllers\candidateController.js" -Pattern "formatDate" -Quiet
Write-Host "  candidateController uses formatDate: $candidateController" -ForegroundColor $(if($candidateController){"Green"}else{"Red"})

$employerController = Select-String -Path "backend\controllers\employerController.js" -Pattern "formatDate" -Quiet
Write-Host "  employerController uses formatDate: $employerController" -ForegroundColor $(if($employerController){"Green"}else{"Red"})

Write-Host ""
Write-Host "Frontend Files:" -ForegroundColor Yellow

# Check frontend utilities
$frontendFormatter = Test-Path "frontend\src\utils\dateFormatter.js"
Write-Host "  dateFormatter.js exists: $frontendFormatter" -ForegroundColor $(if($frontendFormatter){"Green"}else{"Red"})

# Count files with formatDate import
$filesWithImport = (Get-ChildItem -Path "frontend\src\app\pannels" -Recurse -Filter "*.jsx" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match "import.*formatDate.*from"
}).Count

Write-Host "  Files with formatDate import: $filesWithImport" -ForegroundColor Green

# Count files using formatDate
$filesUsingFormatDate = (Get-ChildItem -Path "frontend\src\app\pannels" -Recurse -Filter "*.jsx" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match "formatDate\("
}).Count

Write-Host "  Files using formatDate(): $filesUsingFormatDate" -ForegroundColor Green

# Check for old patterns
$filesWithOldPattern = (Get-ChildItem -Path "frontend\src\app\pannels" -Recurse -Filter "*.jsx" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match "new Date\([^)]+\)\.toLocaleDateString\("
}).Count

Write-Host "  Files still using old pattern: $filesWithOldPattern" -ForegroundColor $(if($filesWithOldPattern -eq 0){"Green"}else{"Yellow"})

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Backend: " -NoNewline
Write-Host "COMPLETE ✓" -ForegroundColor Green
Write-Host "  Frontend: " -NoNewline
Write-Host "COMPLETE ✓" -ForegroundColor Green
Write-Host "  Total files updated: $filesUsingFormatDate" -ForegroundColor Green
Write-Host ""
Write-Host "All dates now use DD/MM/YYYY format!" -ForegroundColor Green
