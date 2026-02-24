# Engage players with the Apple Games app

Engage players with the Apple Games app https://developer.apple.com/videos/play/wwdc2025/215/



## ✨ 개요


Apple Games 앱은 iPhone·iPad·Mac 전반에서 게임을 찾고 ( 검색 / 위젯 / 알림 ), 다시 시작하고 (Play 버 튼 ), 친구와 함께 즐기게 하는 허브입니다 . Primary/Secondary 카테고리를 ‘Gamesʼ 로 설정해야 전용

게임 페이지가 노출되며 , 서브카테고리 · 연령 등급 · 컨트롤러 지원 배지(Xcode 에서 Game Controller Capability 추가 시 ) 가 함께 표시됩니다 .

🧭 Games 앱 구성

- Home: 친구 활동 · 진행 중 이벤트 · 큐레이션 · 최근 플레이 재개 .

- Play Together: 친구가 하는 게임 · 점수 비교 · 초대 / 멀티플레이 시작 .

- Library: 설치 / 구매 내역 한곳에 , Play로 즉시 실행 .

- Search: 이름 · 카테고리 · 미리보기 ( 동영상 / 스크린샷 ) 로 탐색 .

- 게임 페이지: 아이콘 · 이름 · 서브타입 · 컨트롤러 배지 · 미리보기 · 설명 , Invite to Play 등 . Pre-order 등록 시 ‘Upcoming Releaseʼ 로 선노출 가능 .

- 🏆 Game Center 통합 포인트

- Achievements: 진행 · 달성 현지화 이미지 / 문구 노출 .

- Leaderboards: 친구 비교 · 재도전 유도 , Description( 신규 필드 )· 접미사 ( 예 : “pts”)· 리셋 주기 표시 .

- Challenges( 신규 ): 리더보드 기반 시간 제한 경쟁을 친구와 생성 · 실시간 점수 · 리매치 .

- Activities( 멀티플레이 ): 참가 인원 범위 · 파티 코드 제공 , 딥링크로 로비 / 레벨로 바로 진입 .

- Xcode·App Store Connect 어디서나 설정 가능 , 많이 넣을수록 Games 앱 전역 노출 면이 늘어 납니다 .

- 📣 In-App Events 운영 시간 한정 콘텐츠 · 시즌 · 프로모션을 카드 / 영상으로 노출하고 , Home/Library/ 검색 / 게임 페이지에 걸쳐 재 참여를 유도합니다 . Publish Start를 실제 시작일 이전으로 잡아 ‘Upcomingʼ 예고 · 알림 예약을 받을 수 있으며 , 딥링크 파라미터로 게임 내 핸들러와 연동하세요 . 우선순위 (high-priority) 로 대표 이벤트를 상 단 고정 가능 .



## ✅ 실무 체크리스트


- Primary Category=Games + Subcategory 지정 , 미리보기 / 키워드 최적화

- Game Controller Capability 추가로 배지 / 필터 참여

- Game Center 활성화(Xcode/ASC) → Achievements·Leaderboards(Description 필

- 수)·Challenges·Activities( 파티 코드 / 인원 범위 / 딥링크 ) 설정

- Deep Link: 리더보드 / 챌린지 / 액티비티 / 이벤트로 바로 진입 경로 일원화

- In-App Events: 영상 / 아트워크 , Publish Start 사전 예고 , high-priority 지정 및 파라미터 전

- 달 설계
