# Fix import paths for dateFormatter
$replacements = @{
    "frontend\src\app\pannels\admin\components" = "../../../../utils/dateFormatter"
    "frontend\src\app\pannels\admin\components\jobs" = "../../../../../utils/dateFormatter"
    "frontend\src\app\pannels\candidate\components" = "../../../../utils/dateFormatter"
    "frontend\src\app\pannels\candidate\sections\dashboard" = "../../../../../utils/dateFormatter"
    "frontend\src\app\pannels\employer\components" = "../../../../utils/dateFormatter"
    "frontend\src\app\pannels\employer\components\assessments" = "../../../../../utils/dateFormatter"
    "frontend\src\app\pannels\employer\components\jobs" = "../../../../../utils/dateFormatter"
    "frontend\src\app\pannels\employer\components\pages" = "../../../../../utils/dateFormatter"
    "frontend\src\app\pannels\placement" = "../../../utils/dateFormatter"
    "frontend\src\app\pannels\placement\sections" = "../../../../utils/dateFormatter"
    "frontend\src\app\pannels\public-user\components\employers" = "../../../../../utils/dateFormatter"
    "frontend\src\app\pannels\public-user\components\pages" = "../../../../../utils/dateFormatter"
}

foreach ($dir in $replacements.Keys) {
    $correctPath = $replacements[$dir]
    $files = Get-ChildItem -Path $dir -Filter "*.jsx" -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "import.*formatDate.*from") {
            $content = $content -replace "import \{ formatDate \} from '[^']+dateFormatter';", "import { formatDate } from '$correctPath';"
            Set-Content $file.FullName $content -NoNewline
            Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "All import paths fixed!" -ForegroundColor Cyan
