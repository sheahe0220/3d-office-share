# ============================================================
# 3D 사무실 v3 실행기
# 이 PC 의 모든 클로드 코드 세션을 브라우저 3D 사무실로 보여 준다.
# v3 추가: 캐릭터 말풍선(마지막 답변), 캐릭터 클릭 -> 대화 패널(실시간),
#          언어 한국어/영어/일본어(기본 한국어).
#
# 다시 실행: 바탕화면 "3D 사무실" 바로 가기 또는
#   powershell -File "이 파일 경로"
# 서버가 이미 떠 있으면 브라우저만 다시 연다.
#
# 열 때마다 먼저 도구\업데이트.js 로 새 판을 확인한다(친구 PC 만. 만든 사람의 폴더는 .git 이
#   있어 업데이트가 아무것도 하지 않는다). 새 판을 받았으면 떠 있던 서버를 새 판으로 다시 켠다.
# 다른 컴퓨터에 설치: 읽어보세요.txt 의 "설치".
# 2026-09-26 클로드 코드 세션이 작성. 2026-09-28 자동 업데이트 추가.
# ============================================================
$port = 3100
$cli  = Join-Path $PSScriptRoot "dist\cli.js"

# node 찾기: PATH 우선, 다음 이 PC 의 알려진 위치
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node -and (Test-Path "C:\nvm4w\nodejs\node.exe")) { $node = "C:\nvm4w\nodejs\node.exe" }
if (-not $node) {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show("Node.js 가 없습니다. https://nodejs.org 에서 설치한 뒤 다시 실행하세요.") | Out-Null
    exit 1
}
if (-not (Test-Path $cli)) {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show("실행 파일이 없습니다: $cli") | Out-Null
    exit 1
}

# 새 판 확인(친구 PC 만). 업데이트.js 는 새 판으로 바꿨을 때 종료 코드 10 을 낸다.
$updated = $false
$upd = Join-Path $PSScriptRoot "도구\업데이트.js"
if (Test-Path $upd) { & $node $upd | Out-Null; $updated = ($LASTEXITCODE -eq 10) }
# 토큰 최적화 지침: 새 판에서 바뀌었으면 클로드 코드 전역 지침의 블록을 맞춘다(같으면 아무것도 안 함).
$guide = Join-Path $PSScriptRoot "도구\지침설치.js"
if (Test-Path $guide) { & $node $guide | Out-Null }

# 서버가 이미 떠 있으면 브라우저만 연다. 새 판을 받았으면 옛 서버(node)를 끄고 새로 켠다.
$up = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
if ($up -and $updated) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
        $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        if ($p -and $p.ProcessName -eq "node") { Stop-Process -Id $p.Id -Force }
    }
    Start-Sleep -Seconds 1
    $up = $false
}
if (-not $up) {
    Start-Process -FilePath $node -ArgumentList "`"$cli`" `"$env:USERPROFILE`" --port $port" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}
Start-Process "http://127.0.0.1:$port"
