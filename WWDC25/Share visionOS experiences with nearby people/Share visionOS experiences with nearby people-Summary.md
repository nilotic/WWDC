# Share visionOS experiences with nearby people

Share visionOS experiences with nearby people https://developer.apple.com/videos/play/wwdc2025/318/



## ✨ 개요


visionOS 26 에서 도입된 Nearby Sharing( 같은 공간 공유 ) 기능을 중심으로 SharePlay + FaceTime + ARKit(World Anchor) 를 결합해 현실 공간을 공유 컨텍스트로 사

용하는 협업 경험을 만드는 방법을 다루는 세션 핵심 메시지 “ 같은 방에 있는 사람들 ” 을 시스템 차원에서 1 급 개념으로 다루기 시작 창 (Window)· 볼륨 · 몰입 공간 · 미디어 · 공간 앵커까지 공유가 기본 전제가 됨

🧑‍🤝‍🧑 visionOS 26: Nearby Sharing 의 기본 경험 모든 Window 오른쪽 상단에 새 Share 버튼 추가 탭하면 근처에 있는 사람 목록 표시 바로 공유 시작 가능

공유 시 창이 모든 사람에게 동일한 위치 · 크기로 등장 Window bar 가 초록색으로 변경 → “ 공유 중 ” 명확히 표시 누구나 창을 이동 / 리사이즈 가능 이동 결과는 모든 사람에게 동기화

Digital Crown 으로 recenter 시 시스템이 모두에게 좋은 위치로 자동 재배치 🌐 FaceTime 과의 깊은 통합 Nearby Sharing 중 FaceTime 을 바로 시작 가능

원격 참가자 visionOS → Spatial Persona로 공간에 등장 iOS/macOS → 공유 창 옆에 비디오로 표시 시스템이 공유 중인 Window/Volume 타입에 따라

Spatial Persona 의 배치 위치를 자동 최적화 결과 “ 같은 방 + 원격 ” 이 자연스럽게 공존 🔀 View-only 공유 vs Interactive 공유 기본 Nearby Sharing

View-only 상대가 앱을 설치하지 않아도 참여 가능 Interactive 공유가 필요하다면 SharePlay(Group Activities) 채택

- 기존 SharePlay 앱 수정 없이 Nearby Sharing 에서 그대로 동작

- visionOS 26 에서는 “ 같은 공간 ” 을 전제로 한 추가 API 제공



## 🧩 Share Menu 에 SharePlay 노출하기


새로운 Share Menu 를 활용하려면 GroupActivity 를 명시적으로 노출 SwiftUI ShareLink(activity:) 사용 UI 에 보이지 않게 hidden() 가능

공유 시 시스템이 자동으로 GroupSession 생성 앱은 session 을 observe → join 만 하면 됨 Immersive Space 의 특이점 ImmersiveSpace 에는 window bar 가 없음

해결 방법 앱 내부 버튼에서 activity.activate() visionOS 26 부터 FaceTime 없이도 Share Menu 자동 호출 더 좋은 UX 비몰입 (Window) 상태에서 공유 시작

모두 참여 후 ImmersiveSpace 로 전환 📍 “ 같은 공간 ” 을 인식하는 API Nearby Participant 구분 GroupSession.activeParticipants

ParticipantState.isNearbyWithLocalParticipant 활용 예 같은 방에 있는 사람들 → 같은 팀 원격 참가자 → 다른 역할 Participant Pose ( 중요 )

ParticipantState.pose 공유 시작 시 / recenter 후 업데이트 실시간 트래킹 ❌ , 배치 기준 정보 ⭕ 활용 참가자 옆에 UI 배치 사람을 기준으로 콘텐츠 방향 결정

Seat Pose 와의 관계

- Seat Pose: 고정된 좌석 기준

- Participant Pose: 사람이 실제 서 있는 위치

- 기존 Seat Pose 앱이라면 사람 근처 배치가 필요할 때 Participant Pose 로 마이그레이션 권장

- 🎥 Nearby Sharing + 미디어 : AVPlayer 진화 같은 공간에서는

- 아주 작은 오디오 지연도 바로 인지 visionOS 26

- AVPlaybackCoordinator가 오디오 + 비디오를 프레임 단위로 동기화

- SharePlay 세션에 coordinator 연결만 하면 에코 없음

- 지연 없음 “ 모두가 같은 순간을 경험 ”

  - 🪟 여러 Window 가 있을 때 : 어떤 창을 공유할까 ?

- 새로운 API .groupActivityAssociation(.primary)

- 여러 WindowGroup 중 지금 공유의 중심이 될 Window 를 명시

- 예 보드게임 창 ↔ 설명 영상 창

- 상황에 따라 공유 대상 전환 📌 ARKit World Anchors: 공간을 “ 공유 상태 ” 로 고정

- 문제 ImmersiveSpace 는

- recenter 시 전체 좌표가 이동 해결

- World Anchor 물리적 위치에 콘텐츠 고정

- Shared World Anchors (visionOS 26 신규 ) SharePlay 중에만 생성 가능

- sharedWithNearbyParticipants = true 특징 근처 참가자에게만 공유 공유 종료 시 자동 제거 모든 기기에서 동일한 anchor identifier 활용 가구 배치 보드게임 말 벽에 붙는 화이트보드 🔄 Shared World Anchor 생성 흐름

- ARKitSession + WorldTrackingProvider 실행

- newWorldAnchorSharingAvailability 확인

- WorldAnchor(sharedWithNearbyParticipants: true) 생성

- 모든 참가자의 anchorUpdates에서 동일 anchor 수신

- anchor 아래에 콘텐츠 배치 🧠 핵심 정리 visionOS 26 의 공유는 “ 같이 본다 ” → **“ 같은 공간에서 함께 존재한다 ”** 로 진화 Nearby Sharing 발견성 ↑ 설치 장벽 ↓ SharePlay 인터랙션의 기준 인프라 Participant Pose + World Anchor 공간을 UI 의 일부로 승격 결과 게임 , 협업 , 미디어 , 비즈니스 앱 모두에서 현실 공간 자체가 UX 의 일부가 되는 시대
