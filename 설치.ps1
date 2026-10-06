# ============================================================
# 3D 사무실 설치기 (이식용)
# 다른 컴퓨터에 이 폴더를 복사한 뒤 한 번 실행한다.
# 하는 일: (1) Node.js 확인 (2) 클로드 코드 훅 등록 (3) 바탕화면
# "3D 사무실" 바로 가기 생성 (4) 뷰어 실행.
# 다시 실행해도 안전하다(중복 등록 없음).
#
# 실행: 오른쪽 클릭 -> PowerShell 에서 실행, 또는
#   powershell -ExecutionPolicy Bypass -File 설치.ps1
# ============================================================
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node -and (Test-Path "C:\nvm4w\nodejs\node.exe")) { $node = "C:\nvm4w\nodejs\node.exe" }
if (-not $node) {
    Write-Host "Node.js 가 없습니다. https://nodejs.org 에서 LTS 를 설치한 뒤 다시 실행하세요."
    pause
    exit 1
}
Write-Host "Node.js: $node"

# 1) 클로드 코드 훅 등록 (settings.json 이 깨져 있으면 스스로 중단한다)
& $node (Join-Path $PSScriptRoot "도구\훅설치.js")
if ($LASTEXITCODE -ne 0) { Write-Host "훅 설치 실패. 위 메시지를 확인하세요."; pause; exit 1 }

# 1-1) 토큰 최적화 지침을 클로드 코드 전역 지침(%USERPROFILE%\.claude\CLAUDE.md)에 넣는다.
#      기존 내용은 두고 표시한 블록만 더하며, 바꾸기 전에 백업한다. 만든 사람 폴더(.git)에서는 건너뛴다.
& $node (Join-Path $PSScriptRoot "도구\지침설치.js")

# 2) 바탕화면 바로 가기
$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath("Desktop")
$lnk = $ws.CreateShortcut((Join-Path $desktop "3D 사무실.lnk"))
$lnk.TargetPath = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
$lnk.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$(Join-Path $PSScriptRoot '실행.ps1')`""
$lnk.WorkingDirectory = $PSScriptRoot
$lnk.IconLocation = "C:\Windows\System32\shell32.dll,43"
$lnk.Description = "모든 클로드 세션을 3D 사무실로 보기 (한국어/English/日本語, 켤 때 자동 업데이트)"
$lnk.Save()
Write-Host "바로 가기 생성: $desktop\3D 사무실.lnk"

# 3) 실행
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "실행.ps1")
Write-Host "설치 끝. 브라우저에 3D 사무실이 열립니다."
