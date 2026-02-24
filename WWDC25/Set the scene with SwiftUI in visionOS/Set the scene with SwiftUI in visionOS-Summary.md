# Set the scene with SwiftUI in visionOS

Set the scene with SwiftUI in visionOS https://developer.apple.com/videos/play/wwdc2025/290/



## ✨ 개요


visionOS 26 에서 **Scene 전반 (Window / Volume / Immersive Space)** 이 대폭 확장됨 핵심 방향은 공간에 고정 · 복원되는 앱, 현실 환경에 적응하는 볼륨, 몰입 경험의 유연한 제어, Mac ↔

Vision Pro 연계입니다 .

🪟 Scene 라이프사이클 : 고정 (Locking) 과 복원 (Restoration) visionOS 26 부터 Window / Volume / Widget 을 특정 방 (room) 에 고정 (lock) 가능

다시 같은 공간에 오면 자동으로 복원

- 기본 원칙 :

- 대부분의 scene 은 복원 허용 일회성 · 상태 의존 UI 는 복원 비활성화

- 복원 비활성화 SwiftUI

- restorationBehavior(.disabled) UIKit

- destructionConditions(.systemDisconnection) 런치 시 어떤 Scene 을 열지 제어

- defaultLaunchBehavior .presented : 우선 표시

  - .suppressed : 재실행 시 표시 금지

- 주의 : Info.plist 의 default scene session role과 일치해야 함 🪟 Unique Window ( 중복 불가 창 )

- WindowGroup 대신 Window 사용 하나만 존재해야 하는 UI 에 적합

- welcome 화면 게임 메인 화면

- 통화 · 컨트롤 패널 macOS 와 동일한 개념이 visionOS 에 도입됨



## 📦 Volume 개선 : 현실 공간과의 결합


Surface Snapping Window / Volume 을 벽 ( 수직 ) 바닥 · 테이블 ( 수평 ) 에 스냅 가능

- 스냅 = 공간 고정 + 복원 트리거 SurfaceSnappingInfo isSnapped 로 스냅 여부 확인 ARKit surface classification 접근 가능 테이블 / 바닥 / 벽 등 사용자 권한 필요 Info.plist 필요 키 Application Wants Detailed Surface Info Privacy World-Sensing Usage Description ✂ Clipping Margins: 볼륨 경계 밖 렌더링 preferredWindowClippingMargins

- Scene 경계 밖으로 비인터랙티브 시각 요소 렌더링 사용 예 폭포 구름 배경 연출 실제 허용된 값은 windowClippingMargins 환경값으로 확인 시스템이 항상 허용해준다는 보장은 없음 → 방어적 계산 필수



## 🧩 Presentation 확장 (Windows → Volumes → RealityKit)


visionOS 26 에서 Presentation 소스 대폭 확장 Volume 내부 Ornament RealityView attachment RealityKit (PresentationComponent)

지원 타입 popover, menu, tooltip, sheet, alert, confirmation dialog Occlusion 대응 presentationBreakthroughEffect

.subtle ( 기본 ) .prominent .none 3D 콘텐츠에 가려져도 가독성 유지 🌐 Immersive Space 확장 World Recenter 이벤트 사용자가 크라운 long-press → 세계 좌표 재정렬

onWorldRecenter로 감지 ARKit 좌표 캐시 사용 시 재계산 필수 Immersion Style 커스터마이즈 Progressive Immersion 포털 형태로 점진적 몰입

크라운으로 몰입 범위 조절 Portrait / Landscape 비율 선택 가능 세로형 콘텐츠 , 고모션 콘텐츠에 portrait 권장 Mixed Immersion 확장

- 실제 환경 + 시스템 환경 ( 예 : 달 표면 ) 과 공존 immersiveEnvironmentBehavior(.coexist) 현실 인지가 필요 없는 앱에 적합 🖥 Remote Immersive Space (Mac ↔ Vision Pro) macOS 앱에서 Vision Pro 로 Immersive Space 미리보기 RemoteImmersiveSpace + CompositorLayer Metal 기반 렌더링 지원 개발 흐름 Mac 에서 작성 Vision Pro 에서 즉시 확인

- 대규모 씬 / 반복 작업에 매우 유용 🧱 CompositorContent: SwiftUI + Metal 결합

- 기존 CompositorLayer는 View 가 아님 → 제약 많음 visionOS 26

- CompositorContent 도입 가능해진 것

- SwiftUI environment 접근 modifier 사용

- state 관리 onImmersionChange, onWorldRecenter 등 사용

- 🔁 Scene Bridging: UIKit 앱의 공간 확장 UIKit 앱에서도

- Volume Immersive Space

- 사용 가능 방식

- UIHostingSceneDelegate 상속 SwiftUI Scene 선언

- UISceneSessionActivationRequest로 호출 Safari 의 Spatial Browsing 도 이 구조 사용

- AppKit(macOS) 에도 동일한 브리징 API 제공 🧠 핵심 정리

- visionOS 26 Scene 의 키워드 복원 가능한 공간 UI

- 현실 환경에 반응하는 볼륨 몰입 단계의 세밀한 제어

- Mac ↔ Vision Pro 개발 루프 단축 실전 가이드

- 기본은 복원 허용 , 예외만 비활성화 Volume 은 반드시 현실 표면과의 관계를 고려

  - Immersive Space 는 recenter 를 항상 염두

- 기존 UIKit 앱도 Scene Bridging 으로 확장 가능 결과

- 앱이 “ 떠 있는 UI” 가 아니라 사용자의 실제 공간 일부처럼 동작하게 됨
