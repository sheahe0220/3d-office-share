# 3D 사무실 (친구용 배포)

클로드 코드로 작업하는 모든 세션이 브라우저 속 3D 사무실의 직원 캐릭터로 나타납니다.
모든 통신은 내 컴퓨터 안(127.0.0.1)에서만 돕니다.

## 설치

준비물: Windows, 클로드 코드(Claude Code), Node.js LTS (https://nodejs.org)

1. [Releases](https://github.com/sheahe0220/3d-office-share/releases/latest) 에서 `3d-office_<판>.zip` 을 받습니다.
2. 압축을 원하는 곳(예: 문서)에 풉니다. `3D 사무실` 폴더가 생깁니다.
3. 그 안의 `설치.cmd` 를 두 번 클릭합니다. 파란 경고가 뜨면 "추가 정보" 를 누르고 "실행" 을 누릅니다.
4. 이후에는 바탕화면의 "3D 사무실" 바로 가기로 엽니다.

## 자동 업데이트

바로 가기로 켤 때마다 새 판이 있는지 확인하고 바뀐 파일만 받습니다. 따로 할 일은 없습니다.
기록은 `업데이트.log`, 되돌리기는 폴더에서 `node 도구\업데이트.js --rollback`.

이 저장소의 파일은 자동 업데이트가 읽는 배포본입니다. 원본: github.com/SaidislomSaidazimovv/agent-office (MIT)
