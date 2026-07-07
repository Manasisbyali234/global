# Fix can-resume.jsx
$f1 = 'C:\Users\Aryan\Desktop\TaleGlobal\global\frontend\src\app\pannels\candidate\components\can-resume.jsx'
$lines = [System.IO.File]::ReadAllLines($f1)
$newLines = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'resume-page-header-inner') {
        $newLines.Add('				<div className="resume-page-header-inner" style={{ position: "relative" }}>')
        $newLines.Add('					<VideoTutorialButton videoId="gJkZoVHOhCU" />')
        $i++ # skip original line
        # skip the next line which is <div style={{ textAlign: 'center' }}>
        $newLines.Add($lines[$i])
    } else {
        $newLines.Add($lines[$i])
    }
}
[System.IO.File]::WriteAllLines($f1, $newLines, [System.Text.Encoding]::UTF8)
Write-Host "can-resume done"

# Fix emp-support.jsx
$f2 = 'C:\Users\Aryan\Desktop\TaleGlobal\global\frontend\src\app\pannels\employer\components\emp-support.jsx'
$lines2 = [System.IO.File]::ReadAllLines($f2)
$newLines2 = [System.Collections.Generic.List[string]]::new()
$importAdded = $false
for ($i = 0; $i -lt $lines2.Count; $i++) {
    if (-not $importAdded -and $lines2[$i] -match "^import \{ useState") {
        $newLines2.Add("import VideoTutorialButton from '../../../../components/VideoTutorialButton';")
        $importAdded = $true
    }
    # Add button inside the main support header (not the success header)
    if ($lines2[$i] -match 'wt-admin-right-page-header clearfix employer-page-header-card">' -and $lines2[$i] -notmatch 'emp-support-success') {
        $newLines2.Add('                <div className="wt-admin-right-page-header clearfix employer-page-header-card" style={{ position: "relative" }}>')
        $newLines2.Add('                    <VideoTutorialButton videoId="_KTq0lJo-HY" />')
        $i++ # skip original line
        $newLines2.Add($lines2[$i])
    } else {
        $newLines2.Add($lines2[$i])
    }
}
[System.IO.File]::WriteAllLines($f2, $newLines2, [System.Text.Encoding]::UTF8)
Write-Host "emp-support done"
