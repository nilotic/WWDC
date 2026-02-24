# Get started with Game Center

Get started with Game Center https://developer.apple.com/videos/play/wwdc2025/214/



## ✨ 개요


Game Center로 리더보드 · 도전 (Challenges)· 액티비티 (Activities)· 업적을 붙여 재방문 · 친구 경쟁 · 노 출을 극대화하는 방법과 , Apple Games 앱(iOS/iPadOS/macOS 기본 탑재 ) 에서의 노출 최적화를 다룹

니다 . Xcode 26 의 .gamekit 번들과 Game Progress Manager( 디버그 / 테스트 도구 ) 로 구성 · 테스트 · 배포가 한결 쉬워졌습니다 .

🧭 시작하기 ( 설정 · 초기화 ) Capabilities 에 Game Center 추가 → 앱 실행 초기에 GameKit 초기화 핸들러 등록 (GKLocalPlayer 접근 ).

- Unity 지원: 공식 플러그인으로 C# 바인딩 제공 ( 동일 흐름 ).

- 초기화를 타이틀 화면 등 아주 이른 시점에 두면 Top Played / Friends Are Playing 노출에 유 리 .



## 🧰 Xcode 26: GameKit 번들 & Game Progress Manager


.gamekit 번들로 리더보드 / 업적 / 챌린지 / 액티비티를 로컬 선언 → 버전관리 · 코드리뷰에 포함 , App Store Connect 와 동기화 (Pull/Push) 가능 .

Game Progress Manager로 로컬 디버그 점수 제출 / 초기화 배너 확인 / 딥링크 시험 가능 ( 실제 서 버 반영 아님 ).

🏆 리더보드 & 📣 챌린지 ( 신규 )

- 챌린지는 기존 리더보드 위에서 동작: submitScore() 한 번으로 리더보드와 연관된 챌린지에 자동 반영.

- 기간 / 참여자 / 시도 횟수를 생성 시 커스터마이즈 (1 일 /3 일 /1 주 등 ). 반복 리더보드 ( 예 : 데일리 ) 와 연결 시 챌린지도 그 인스턴스 종료 시점과 동기화 .

- 베스트프랙티스: 시도 끝날 때 1 회 점수 제출, 누적 ( 라이프타임 ) 스코어 제출 지양 .

- 🎮 액티비티 ( 딥링크 & 멀티플레이 ) 액티비티는 게임 내 특정 지점으로의 딥링크. 리더보드 / 업적과 연결해 Games 앱의 Play 버튼 → 바 로 해당 레벨 / 모드로 진입 .

- activity.start()~end() 사이 setScore 버퍼링으로 최신 점수 1 회만 제출( 중복 방지 ).

- 멀티플레이 액티비티: 파티 코드 자동 생성 · 공유 (iMessage/ 웹 미리보기 포함 ) → 게임 내에서 동일 코드 사용자끼리 매칭 . findMatch() 로 현행 매치메이킹과 연계 .



## 🧪 테스트 → 출시 라이프사이클


- Xcode 에서 구현 + .gamekit 번들 설정 → Game Progress Manager로 로컬 테스트 .

- TestFlight로 베타 검증 .

- App Store Connect 제출 시 ‘Not Liveʼ 리소스 포함 → 심사 통과 후 Live 전환.

- 🗂 설정 경로 3 종 ( 상황별 추천 )

- 개발 중: Xcode .gamekit 번들 ( 권장 ) — 로컬 테스트 · 버전관리 이점 .

- 검수 / 출시: App Store Connect — 리뷰 호환성 · 최종 상태 확인 .

- 자동화: App Store Connect API — CI 에서 메타데이터 생성 · 갱신 .



## ✅ 체크리스트


- 프로젝트에 Game Center Capabilities 추가 , 초기화 핸들러를 런치 직후 설정

- .gamekit 번들 도입 → Pull( 기존 설정 ) / Push(ASC 반영 ) 플로우 정착

- 리더보드 설계 : 시도 종료 시 1 회 제출 규칙 확정

- 챌린지 메타데이터 생성 ( 기간 옵션 · 연결 리더보드 지정 ) — 코드 변경 최소

- 액티비티 정의 : 딥링크 ID· 속성 ( 레벨 / 모드 ) 세팅 , 멀티플레이면 파티 코드 지원 체크

- Game Progress Manager 로 점수 / 딥링크 흐름 검증 ( 디버그 배너 확인 )

- 출시 전 ‘Not Liveʼ 리소스 포함해 심사 제출 → Live 전환 계획 수립

- 원하시면 현재 게임에 맞춰 리더보드 / 챌린지 ID 명명 규칙, 액티비티 속성 스키마, Unity·Swift 샘플 코드

- 스니펫을 바로 만들어 드릴게요 .
