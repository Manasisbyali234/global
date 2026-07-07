$f = 'C:\Users\Aryan\Desktop\TaleGlobal\global\frontend\src\app\pannels\candidate\components\application-status.jsx'
$lines = [System.IO.File]::ReadAllLines($f)
Write-Host "Before - 2607:[$($lines[2607])] 2608:[$($lines[2608])]"
$a = $lines[2607]
$lines[2607] = $lines[2608]
$lines[2608] = $a
$out = 'C:\Users\Aryan\Desktop\TaleGlobal\global\application-status-fixed.jsx'
[System.IO.File]::WriteAllLines($out, $lines, [System.Text.Encoding]::UTF8)
Copy-Item -Force $out $f
Remove-Item $out
$verify = [System.IO.File]::ReadAllLines($f)
Write-Host "After - 2607:[$($verify[2607])] 2608:[$($verify[2608])]"
