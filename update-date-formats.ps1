# PowerShell script to update date formatting in all frontend files
$files = @(
    "frontend\src\app\pannels\admin\components\admin-emp-reject.jsx",
    "frontend\src\app\pannels\admin\components\admin-emp-jobs.jsx",
    "frontend\src\app\pannels\admin\components\admin-excel-uploads.jsx",
    "frontend\src\app\pannels\admin\components\admin-placement-approve.jsx",
    "frontend\src\app\pannels\admin\components\admin-placement-manage.jsx",
    "frontend\src\app\pannels\admin\components\admin-placement-reject.jsx",
    "frontend\src\app\pannels\admin\components\admin-support-tickets.jsx",
    "frontend\src\app\pannels\admin\components\admin-transactions.jsx",
    "frontend\src\app\pannels\admin\components\adminEmployerDetails.jsx",
    "frontend\src\app\pannels\admin\components\jobs\emp-manage-jobs.jsx",
    "frontend\src\app\pannels\admin\components\placement-details.jsx",
    "frontend\src\app\pannels\admin\components\registered-candidates.jsx",
    "frontend\src\app\pannels\admin\components\shortlisted-candidates.jsx",
    "frontend\src\app\pannels\candidate\components\application-status-fixed.jsx",
    "frontend\src\app\pannels\candidate\components\can-applied-jobs.jsx",
    "frontend\src\app\pannels\candidate\components\can-posted-jobs.jsx",
    "frontend\src\app\pannels\candidate\components\can-transactions.jsx",
    "frontend\src\app\pannels\candidate\sections\dashboard\section-notifications.jsx",
    "frontend\src\app\pannels\employer\components\assessments\AssessmentCard.jsx",
    "frontend\src\app\pannels\employer\components\assessments\manage-assessment.jsx",
    "frontend\src\app\pannels\employer\components\emp-candidate-review.jsx",
    "frontend\src\app\pannels\employer\components\emp-candidates.jsx",
    "frontend\src\app\pannels\employer\components\emp-company-profile.jsx",
    "frontend\src\app\pannels\employer\components\emp-dashboard.jsx",
    "frontend\src\app\pannels\employer\components\emp-job-review.jsx",
    "frontend\src\app\pannels\employer\components\emp-transactions.jsx",
    "frontend\src\app\pannels\employer\components\employer-support-tickets.jsx",
    "frontend\src\app\pannels\employer\components\emp-posted-jobs.jsx",
    "frontend\src\app\pannels\employer\components\pages\AssessmentResults.jsx",
    "frontend\src\app\pannels\employer\components\pages\ViewAnswers.jsx",
    "frontend\src\app\pannels\employer\components\recent-job-post.jsx",
    "frontend\src\app\pannels\placement\batch-upload.jsx",
    "frontend\src\app\pannels\placement\placement-dashboard-redesigned.jsx",
    "frontend\src\app\pannels\placement\sections\PlacementNotificationsRedesigned.jsx",
    "frontend\src\app\pannels\public-user\components\employers\emp-detail1.jsx",
    "frontend\src\app\pannels\public-user\components\pages\after-login.jsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file"
        $content = Get-Content $fullPath -Raw
        
        # Replace date formatting patterns
        $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleDateString\(\)', 'formatDate($1)'
        $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleDateString\([^)]+\)', 'formatDate($1)'
        
        Set-Content $fullPath $content -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "All files processed!" -ForegroundColor Cyan
