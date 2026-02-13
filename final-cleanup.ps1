$files = @(
    "c:\Users\Aryan\Desktop\TaleGlobal\global\frontend\src\app\pannels\candidate\components\application-status.jsx",
    "c:\Users\Aryan\Desktop\TaleGlobal\global\frontend\src\app\pannels\employer\components\jobs\emp-post-job.jsx",
    "c:\Users\Aryan\Desktop\TaleGlobal\global\frontend\src\app\pannels\employer\components\jobs\emp-posted-jobs.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        $content = Get-Content $file -Raw
        $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleDateString\(([^)]*)\)', 'formatDate($1)'
        Set-Content $file $content -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    }
}

Write-Host "All remaining files updated!" -ForegroundColor Cyan
