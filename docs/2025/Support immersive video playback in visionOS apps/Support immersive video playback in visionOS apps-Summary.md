# Support immersive video playback in visionOS apps

Support immersive video playback in visionOS apps https://developer.apple.com/videos/play/wwdc2025/296/



## ✨ 개요


visionOS 26 에서 ** 몰입형 비디오 재생 (Immersive Video Playback)** 을 본격적으로 지원하기 위해 Quick Look · AVKit · RealityKit 전반이 확장됨

2D/3D/Spatial Video 를 넘어 APMP(180·360·Wide FOV), Apple Immersive Video까지 하나의 일관된 재생 모델로 다룸 🎥 visionOS 26 에서 지원하는 비디오 프로파일

기존 2D Video 3D Video Spatial Video visionOS 26 신규 Apple Projected Media Profile (APMP) 180° 360° Wide Field-of-View

Apple Immersive Video 최고 수준의 몰입형 영상 포맷



## 🧰 어떤 프레임워크를 쓸까 ?


Quick Look 가장 빠른 도입 모든 immersive video 프로파일 자동 지원 미리보기 · 전환 · 스타일링을 시스템이 처리 AVKit 표준 비디오 UI + immersive 전환 제어

커스텀 재생 흐름 필요할 때 적합 RealityKit 게임 · 완전 커스텀 UX 3D 씬과 결합된 비디오 재생 🔍 Quick Look 의 변화 QLPreviewController Spatial Photo / Spatial Video 지원

PreviewApplication APMP + Apple Immersive Video 지원

- 기존 Quick Look 사용 앱은 추가 작업 없이 자동으로 immersive 미디어 지원

- 🧭 AVKit: AVExperienceController 핵심 Experience 개념

- Expanded Window 전체를 사용하는 재생

- visionOS 26 부터 immersive 재생으로 확장 가능 Immersive

- 완전 몰입형 재생 경험 자동 vs 수동 Immersive 전환

- automaticTransitionToImmersive .default → 시스템 판단에 따라 자동 전환

- .none → Portal 스타일 유지, 자동 전환 없음 자동 전환을 끄면

- immersive 콘텐츠도 창 안에서 포털 형태로 재생 명시적 Immersive 전환

- AVExperienceController 에서 Immersive experience 로 직접 전환 가능

- Configuration 으로 immersive 재생이 표시될 Window Scene 위치 지정

- 상태 추적 ( 중요 ) Delegate 메서드

- didChangeAvailableExperiences prepareForTransitionUsing

- didChangeTransitionContext 콘텐츠 타입에 따라

- Immersive experience 가 존재하지 않을 수도 있음 ( 예 : 2D 영상 ) 🧘 Comfort Mitigation ( 멀미 완화 ) APMP 영상은 카메라 움직임이 클 수 있음 visionOS 26 Quick Look / AVKit 에서 고속 모션 감지 → 자동 몰입도 감소 사용자는 설정 앱에서 완화 동작을 직접 제어 가능



## 🧩 RealityKit: VideoPlayerComponent 확장


VideoPlayerComponent 비디오에 맞는 자동 mesh + material 생성 immersive 모드에 최적화 지원 프로파일 APMP Apple Immersive Video

Spatial Video 🎬 RealityKit 의 Immersive Viewing Mode Portal 창 · 포털 형태 재생 Shared Space 또는 Immersive Space 모두 가능

comfort mitigation 없음 Progressive ( 신규 , 권장 ) Digital Crown 으로 몰입도 조절 100% = Full Immersive comfort mitigation 지원

APMP / Apple Immersive Video 의 기본 권장 모드 Full 완전 몰입 Progressive 의 100% 상태와 동일 🌊 Progressive Immersion 설정 포인트

VideoPlayerComponent

- desiredImmersiveViewingMode = .progressive SwiftUI ImmersiveSpace ImmersionStyle.progressive 두 설정은 반드시 함께 맞춰야 함 📽 Spatial Video 처리 방식 Spatial Video 는 별도 경로 desiredSpatialVideoMode .screen ( 기본 ) → 일반 스테레오 화면 .spatial → 진짜 공간 영상 Spatial Video 특징 immersive 모드는 항상 full

- head-locked 아님 → 위치 지정 필요 ImmersiveSpace mixed ImmersionStyle 사용 immersiveEnvironmentBehavior(.coexist) 권장 🚨 Video Comfort Mitigation 이벤트 RealityKit 이벤트 VideoComfortMitigationDidOccur 의미 시스템이 자동으로 몰입 완화 적용 개발자가 처리할 액션은 없음 Progressive 모드에서만 발생 🔄 Video 타입 변화 감지

- ContentTypeDidChange 이벤트 활용 어떤 viewing mode 가능한지 판단 UI/ 컨트롤 상태 업데이트 comfort mitigation 여부 예측 🎛 SwiftUI + RealityKit 통합 팁

- Portal mesh 기본 높이 : 1m Window 가 작으면 clipping 발생 가능 해결 GeometryReader3D로 크기 계산 X/Y 균등 스케일링 필수 동일 평면 UI 와 비디오 겹칠 경우 ModelSortGroupComponent로 정렬 명시 🧠 핵심 정리 visionOS 26 의 비디오는 “ 재생 ” 이 아니라 공간 경험 Quick Look 가장 쉬운 시작점 AVKit 시스템 UX + 제어력 RealityKit 완전 커스텀 몰입형 경험 APMP / Apple Immersive Video

- Progressive Immersion 이 기본 전략 결과 영상은 더 이상 화면이 아니라 사용자를 둘러싼 공간 자체가 됨
