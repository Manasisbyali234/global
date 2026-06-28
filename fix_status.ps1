$file = 'frontend\src\app\pannels\candidate\components\application-status.jsx'
$content = [System.IO.File]::ReadAllText($file)
$old = "const _rawAppStatus = getCanonicalStatusKey(selectedApplication.status || 'pending');" + "`r`n" + "`t`t`t`t`t`t`t`t`t`t" + "const selectedAppDisplayStatus = ['not_advanced_to_next_round','not_advanced_to_next_stage','no_show','session_expired'].includes(_rawAppStatus) ? 'rejected' : _rawAppStatus;"
$new = "const selectedAppDisplayStatus = getApplicationOnlyStatus(selectedApplication);"
$newContent = $content.Replace($old, $new)
if ($newContent -eq $content) { Write-Output 'NO CHANGE' } else { [System.IO.File]::WriteAllText($file, $newContent); Write-Output 'Done' }
